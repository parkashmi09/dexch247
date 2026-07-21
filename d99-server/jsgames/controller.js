import crypto from 'crypto';
import sequelize from '../config/db.js';
import GameResponseHandler from './gameResposneHandler.js';
import CryptoJS from 'crypto-js';
import NodeCache from 'node-cache';
import { Op } from 'sequelize';

// Sequelize Models
import Wallet from '../model/admin/Wallet.js';
import JSGame from './models/JSGame.js';
import JSGameTransaction from './models/JSGameTransaction.js';
import PrioritizedGame from './models/PrioritizedGame.js';
import JSGameSession from '../model/user/JSGameSession.js';
import CreditsLedger from '../model/user/CreditsLedger.js';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const AGENCY_CONFIG = {
  agency_uid: 'b96581ad0785ff9f86c960def63aee4b',
  aes_key: '8ce9295ab6786ef6e4bd8d07eda4ce81',
  player_prefix: 'h24e9e',
  server_url: 'https://huidu.bet'
};

// --- Crypto Helpers ---

function encryptPayload(payload, key) {
  const keyBuffer = Buffer.from(key, 'utf8');
  const cipher = crypto.createCipheriv('aes-256-ecb', keyBuffer, Buffer.alloc(0));
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decryptPayload(encryptedPayload, key) {
  const keyWordArray = CryptoJS.enc.Utf8.parse(key);
  const decryptedWordArray = CryptoJS.AES.decrypt(encryptedPayload, keyWordArray, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  const decryptedString = decryptedWordArray.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedString);
}

// --- Route Handlers ---

async function getGameLaunchURL(req, res) {
  const {
    game_uid, user_id, credit_amount = '50', currency_code,
    language = 'en', home_url = '', callback_url = ''
  } = req.body;

  const allowedCurrencies = ['INR', 'BDT', 'USDT'];
  if (!allowedCurrencies.includes(currency_code)) {
    return res.status(400).json(
      GameResponseHandler.handleErrorResponse(10009, 'Invalid currency. Allowed currencies are INR, BDT, USDT')
    );
  }

  try {
    const game = await JSGame.findOne({ where: { game_uid, is_active: true } });
    if (!game) {
      return res.status(404).json(GameResponseHandler.handleErrorResponse(10008));
    }

    const payload = {
      agency_uid: AGENCY_CONFIG.agency_uid,
      member_account: `${AGENCY_CONFIG.player_prefix}_${currency_code}_${user_id}`,
      game_uid, timestamp: Date.now().toString(),
      credit_amount, currency_code, language, home_url, callback_url
    };

    const encryptedPayload = encryptPayload(payload, AGENCY_CONFIG.aes_key);

    const apiResponse = await fetch(`${AGENCY_CONFIG.server_url}/game/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_uid: AGENCY_CONFIG.agency_uid,
        timestamp: Date.now().toString(),
        payload: encryptedPayload
      })
    });

    const responseData = await apiResponse.json();
    const processedResponse = GameResponseHandler.processGameServerResponse(responseData);
    if (!processedResponse.success) {
      return res.status(400).json(processedResponse);
    }

    const sessionToken = crypto.randomBytes(16).toString('hex');
    const session = await JSGameSession.create({
      user_id, game_uid, session_token: sessionToken,
      launch_url: processedResponse.payload.game_launch_url
    });

    return res.json(
      GameResponseHandler.handleSuccessResponse(responseData, {
        game_launch_url: processedResponse.payload.game_launch_url,
        session_token: sessionToken,
        session: session.toJSON()
      })
    );
  } catch (err) {
    console.error('Game launch error:', err);
    return res.status(500).json(GameResponseHandler.handleErrorResponse(10000));
  }
}

async function processBetCallback(req, res) {
  const { payload } = req.body;

  try {
    const decryptedData = decryptPayload(payload, AGENCY_CONFIG.aes_key);
    if (!decryptedData || !decryptedData.member_account) {
      throw new Error('invalid decrypted payload');
    }

    const parts = decryptedData.member_account.split('_');
    const userId = parts[2];
    if (!userId) throw new Error('cannot extract user id from member_account');

    const betAmount = Number(decryptedData.bet_amount || 0);
    const winAmount = Number(decryptedData.win_amount || 0);
    const currencyRaw = (decryptedData.currency_code || '').toLowerCase();
    if (!/^[a-z_]+$/.test(currencyRaw)) throw new Error('invalid currency code');

    let transactionType;
    if (betAmount > 0 && winAmount === 0) transactionType = 'bet';
    else if (betAmount === 0 && winAmount > 0) transactionType = 'win';
    else if (betAmount === 0 && winAmount === 0) transactionType = 'loss';
    else transactionType = 'adjustment';

    const result = await sequelize.transaction(async (t) => {
      await JSGameTransaction.create({
        user_id: userId, game_uid: decryptedData.game_uid,
        transaction_type: transactionType,
        amount: transactionType === 'win' ? winAmount : betAmount,
        currency: currencyRaw, transaction_status: 'processed',
        external_transaction_id: decryptedData.game_round,
        serial_number: decryptedData.serial_number,
        additional_data: decryptedData
      }, { transaction: t });

      const wallet = await Wallet.findOne({
        where: { user_id: userId }, transaction: t, lock: t.LOCK.UPDATE,
      });
      if (!wallet) throw new Error('user wallet not found');

      const currentBalance = parseFloat(wallet.cash || 0);
      const newBalance = Number((currentBalance - betAmount + winAmount).toFixed(2));
      await wallet.update({ cash: newBalance }, { transaction: t });

      return { newBalance };
    });

    // Credits Ledger entry — only on win/loss settlement, not on bet placement
    const netChange = -betAmount + winAmount;
    const isSettled = transactionType === 'win' || transactionType === 'loss' || transactionType === 'bet_result';
    if (!isSettled) {
      // Skip ledger for bet placement, adjustments, etc.
    } else try {
      const isWin = netChange > 0;
      const isLoss = netChange < 0;

      // Fetch game details for ledger
      const gameInfo = await JSGame.findOne({
        where: { game_uid: decryptedData.game_uid || '' },
        attributes: ['game_name', 'vendor'],
      });
      const gameName = gameInfo?.game_name || decryptedData.game_uid || 'unknown';
      const providerName = gameInfo?.vendor || 'unknown';

      await CreditsLedger.create({
        user_id: String(userId),
        currency: currencyRaw.toUpperCase(),
        amount: netChange,
        reason: transactionType,
        description: `${providerName} - ${gameName}; ${transactionType}; bet=${betAmount}; win=${winAmount}; round=${decryptedData.game_round || 'unknown'}`,
        eventid: decryptedData.game_round || null,
        match_id: decryptedData.serial_number || null,
        meta: {
          game_uid: decryptedData.game_uid || 'unknown',
          game_name: gameName,
          provider: providerName,
          game_round: decryptedData.game_round || null,
          serial_number: decryptedData.serial_number || null,
          bet_amount: betAmount,
          win_amount: winAmount,
          transaction_type: transactionType,
        },
        sport_id: providerName,
        market_type: 'THIRD_PARTY_CASINO',
        category: 'THIRD_PARTY_CASINO',
        profit: isWin ? netChange : null,
        loss: isLoss ? Math.abs(netChange) : null,
        netamount: isWin ? netChange : null,
        closing: netChange,
        balance: result.newBalance,
      });
    } catch (ledgerErr) {
      console.error('Credits ledger entry failed', ledgerErr);
    }

    const responsePayload = { credit_amount: String(result.newBalance), timestamp: Date.now().toString() };
    const encryptedResponsePayload = encryptPayload(responsePayload, AGENCY_CONFIG.aes_key);

    res.json({ code: 0, msg: '', payload: encryptedResponsePayload });
  } catch (error) {
    console.error('processBetCallback error:', error);
    res.status(500).json(GameResponseHandler.handleErrorResponse(1, 'Bet processing failed'));
  }
}

async function processGameTransfer(req, res) {
  const { user_id, game_uid, credit_amount, transfer_type, currency_code } = req.body;

  try {
    const payload = {
      agency_uid: AGENCY_CONFIG.agency_uid,
      member_account: `${AGENCY_CONFIG.player_prefix}_${currency_code}_${user_id}`,
      game_uid, timestamp: Date.now().toString(),
      credit_amount: transfer_type === 'deposit' ? credit_amount : `-${credit_amount}`,
      transfer_id: crypto.randomBytes(8).toString('hex')
    };

    const encryptedPayload = encryptPayload(payload, AGENCY_CONFIG.aes_key);

    const apiResponse = await fetch(`${AGENCY_CONFIG.server_url}/game/v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_uid: AGENCY_CONFIG.agency_uid, timestamp: Date.now().toString(), payload: encryptedPayload
      })
    });

    const responseData = await apiResponse.json();
    const processedResponse = GameResponseHandler.processGameServerResponse(responseData);

    await JSGameTransaction.create({
      user_id, game_uid, transaction_type: transfer_type, amount: credit_amount,
      currency: 'USD', transaction_status: processedResponse.success ? 'completed' : 'failed',
      external_transaction_id: payload.transfer_id,
    });

    res.json(processedResponse);
  } catch (error) {
    GameResponseHandler.logErrorDetails('processGameTransfer', error, { user_id, game_uid });
    res.status(500).json(GameResponseHandler.handleErrorResponse(10004, 'Transfer processing failed'));
  }
}

async function getTransactionRecords(req, res) {
  const { from_date, to_date, page_no = 1, page_size = 30 } = req.body;

  try {
    const payload = {
      agency_uid: AGENCY_CONFIG.agency_uid, timestamp: Date.now().toString(),
      from_date: new Date(from_date).getTime(), to_date: new Date(to_date).getTime(),
      page_no, page_size
    };

    const encryptedPayload = encryptPayload(payload, AGENCY_CONFIG.aes_key);

    const apiResponse = await fetch(`${AGENCY_CONFIG.server_url}/game/transaction/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_uid: AGENCY_CONFIG.agency_uid, timestamp: Date.now().toString(), payload: encryptedPayload
      })
    });

    const responseData = await apiResponse.json();
    const processedResponse = GameResponseHandler.processGameServerResponse(responseData);

    if (processedResponse.success && processedResponse.payload.records) {
      for (const record of processedResponse.payload.records) {
        await JSGameTransaction.findOrCreate({
          where: { external_transaction_id: record.transaction_id },
          defaults: {
            user_id: record.member_account.split('_')[2], game_uid: record.game_uid,
            transaction_type: 'transaction', amount: record.transfer_amount,
            currency: record.currency,
            transaction_status: record.transfer_status === 1 ? 'completed' : 'failed',
            serial_number: record.serial_number, additional_data: record
          }
        });
      }
    }

    res.json(processedResponse);
  } catch (error) {
    GameResponseHandler.logErrorDetails('getTransactionRecords', error);
    res.status(500).json(GameResponseHandler.handleErrorResponse(10004, 'Error fetching transaction records'));
  }
}

async function getActiveGames(req, res) {
  try {
    const { vendor, page = 1, per_page = 20, game_type } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const perPageNum = Math.min(100, Math.max(1, parseInt(per_page)));
    const offset = (pageNum - 1) * perPageNum;

    const cacheKey = `active_games_${vendor || 'all'}_${game_type || 'all'}_${pageNum}_${perPageNum}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(GameResponseHandler.handleSuccessResponse({ payload: cachedResult, meta: { cached: true } }));
    }

    const where = { is_active: true };
    if (vendor) where.vendor = vendor;
    if (game_type) where.game_type = { [Op.iLike]: `%${game_type}%` };
    const gameTypeFilter = game_type ? { game_type: { [Op.iLike]: `%${game_type}%` } } : {};

    const total = await JSGame.count({ where });
    const totalPages = Math.ceil(total / perPageNum);

    let games = [];
    let prioritizedGameIds = [];

    if (vendor) {
      const prioritized = await PrioritizedGame.findOne({ where: { vendor } });
      if (prioritized && prioritized.game_ids) {
        prioritizedGameIds = prioritized.game_ids.split(',').map(id => parseInt(id.trim()));
      }
    }

    if (vendor && prioritizedGameIds.length > 0) {
      if (pageNum === 1) {
        const prioritizedGames = await JSGame.findAll({
          where: { is_active: true, vendor, ...gameTypeFilter, id: { [Op.in]: prioritizedGameIds } },
          order: sequelize.literal(`CASE ${prioritizedGameIds.map((id, i) => `WHEN id = ${id} THEN ${i}`).join(' ')} ELSE ${prioritizedGameIds.length} END`),
        });
        const remainingSlots = perPageNum - prioritizedGames.length;
        if (remainingSlots > 0) {
          const regularGames = await JSGame.findAll({
            where: { is_active: true, vendor, ...gameTypeFilter, id: { [Op.notIn]: prioritizedGameIds } },
            order: [['id', 'ASC']], limit: remainingSlots,
          });
          games = [...prioritizedGames, ...regularGames];
        } else {
          games = prioritizedGames.slice(0, perPageNum);
        }
      } else {
        const existingPrioritized = await JSGame.findAll({
          where: { is_active: true, vendor, ...gameTypeFilter, id: { [Op.in]: prioritizedGameIds } },
          attributes: ['id'],
        });
        const existingIds = existingPrioritized.map(g => g.id);
        const adjustedOffset = offset + existingIds.length - perPageNum;
        games = await JSGame.findAll({
          where: { is_active: true, vendor, ...gameTypeFilter, id: { [Op.notIn]: existingIds } },
          order: [['id', 'ASC']], limit: perPageNum, offset: Math.max(0, adjustedOffset),
        });
      }
    } else {
      games = await JSGame.findAll({ where, order: [['id', 'ASC']], limit: perPageNum, offset });
    }

    const response = {
      games,
      pagination: { current_page: pageNum, per_page: perPageNum, total, total_pages: totalPages }
    };
    cache.set(cacheKey, response);

    return res.json(GameResponseHandler.handleSuccessResponse({ payload: response, meta: { cached: false } }));
  } catch (error) {
    GameResponseHandler.logErrorDetails('getActiveGames', error);
    res.status(500).json(GameResponseHandler.handleErrorResponse(10004, 'Error fetching game list'));
  }
}

async function searchGames(req, res) {
  try {
    let { keyword = '', page = 1, per_page = 20, vendor = null } = req.query;
    keyword = keyword.trim().toLowerCase();
    const pageNum = Math.max(1, parseInt(page));
    const perPageNum = Math.min(50, Math.max(1, parseInt(per_page)));
    const offset = (pageNum - 1) * perPageNum;

    const cacheKey = `games_search_${keyword}_${vendor || 'all'}_${pageNum}_${perPageNum}`;
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(GameResponseHandler.handleSuccessResponse({ payload: cachedResult, meta: { cached: true } }));
    }

    const where = { is_active: true };
    if (vendor) where.vendor = vendor;
    if (keyword) {
      where[Op.or] = [
        { game_name: { [Op.iLike]: `%${keyword}%` } },
        { vendor: { [Op.iLike]: `%${keyword}%` } },
        { game_type: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    const { count: total, rows: games } = await JSGame.findAndCountAll({
      where, order: [['id', 'ASC']], limit: perPageNum, offset,
    });
    const totalPages = Math.ceil(total / perPageNum);

    const response = {
      games,
      pagination: { current_page: pageNum, per_page: perPageNum, total, total_pages: totalPages },
      meta: { query: keyword, searchFields: ['game_name', 'vendor', 'game_type'] }
    };
    cache.set(cacheKey, response);

    res.json(GameResponseHandler.handleSuccessResponse({ payload: response, meta: { cached: false } }));
  } catch (error) {
    GameResponseHandler.logErrorDetails('searchGames', error);
    res.status(500).json(GameResponseHandler.handleErrorResponse(10005, 'Error searching games'));
  }
}

export default {
  getGameLaunchURL,
  processBetCallback,
  processGameTransfer,
  getTransactionRecords,
  getActiveGames,
  searchGames,
};
