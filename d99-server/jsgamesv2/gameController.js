import fetch from 'node-fetch';
import config from './config.js';
import CryptoUtils from './cryptoUtils.js';
import logger from './logger.js';
import sequelize from '../config/db.js';

import User from '../model/user/User.js';
import Wallet from '../model/admin/Wallet.js';
import GameSession from '../model/GameSession.js';
import JSGameTransaction from './models/JSGameTransaction.js';
import CreditsLedger from '../model/user/CreditsLedger.js';
import JSGame from './models/JSGame.js';
import { emitBalanceUpdate } from '../utils/socketUtils.js';

const BASE_URL = config.gameApi.baseUrl;
const API_KEY = config.gameApi.apiKey;
const API_SECRET = config.gameApi.apiSecret;

// --- Helper ---

function addAuthHeaders(body) {
  const timestamp = Date.now().toString();
  const params = { ...body, timestamp };
  const signature = CryptoUtils.generateSignature(params, API_SECRET);
  return {
    'x-api-key': API_KEY,
    'x-timestamp': timestamp,
    'x-signature': signature,
    'Content-Type': 'application/json'
  };
}

// --- Route Handlers ---

async function getGameLaunchURL(req, res) {
  const { game_uid, user_id, credit_amount, currency_code, language = 'en' } = req.body;

  if (!game_uid || !user_id || !currency_code || !credit_amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const userResult = await User.findOne({
      where: { user_id },
      attributes: ['user_id', 'username']
    });
    if (!userResult) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const wallet = await Wallet.findOne({ where: { user_id } });
    if (!wallet) {
      return res.status(404).json({ success: false, error: 'No "Wallets" record found' });
    }

    // Use actual wallet balance instead of client-provided credit_amount
    const walletBalance = parseFloat(wallet.cash || '0');
    if (walletBalance <= 0) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    const payload = {
      game_uid,
      user_id: String(userResult.user_id),
      credit_amount: String(walletBalance),
      currency_code,
      language,
      name: userResult.username,
    };

    const response = await fetch(`${BASE_URL}launch`, {
      method: 'POST',
      headers: addAuthHeaders(payload),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Launch API returned ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.data?.game_launch_url) {
      return res.status(400).json({ success: false, error: 'Game under maintenance.' });
    }

    const { game_launch_url, session_token } = data.data;

    // Fetch game details for session
    let sessionGameName = game_uid;
    let sessionProvider = '';
    try {
      const gameInfo = await JSGame.findOne({ where: { game_uid }, attributes: ['game_name', 'vendor'] });
      if (gameInfo) { sessionGameName = gameInfo.game_name; sessionProvider = gameInfo.vendor; }
    } catch (_) {}

    await GameSession.create({
      user_id: userResult.user_id,
      game_uid,
      session_token,
      launch_url: game_launch_url,
      entry_balance: walletBalance,
      game_name: sessionGameName,
      provider: sessionProvider,
    });

    logger.info('Game launched', { userId: userResult.user_id, game_uid });

    return res.json({ success: true, data: { game_launch_url, session_token } });
  } catch (err) {
    logger.error('getGameLaunchURL error', { error: err, body: req.body });
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function processBetCallbackV2(req, res) {
  const {
    user_id, game_uid, game_round, serial_number,
    bet_amount, win_amount, currency, timestamp
  } = req.body;

  if (!user_id || !currency || bet_amount === undefined || win_amount === undefined) {
    logger.error('Invalid callback payload', { body: req.body });
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const betAmount = parseFloat(bet_amount || '0');
  const winAmount = parseFloat(win_amount || '0');
  const currencyColumn = 'cash';

  // Determine transaction type
  let transactionType, amount;
  if (betAmount > 0 && winAmount > 0) { transactionType = 'bet_result'; amount = winAmount; }
  else if (betAmount > 0 && winAmount === 0) { transactionType = 'bet'; amount = betAmount; }
  else if (betAmount > 0 && winAmount < 0) { transactionType = 'bet_with_negative_result'; amount = winAmount; }
  else if (betAmount === 0 && winAmount > 0) { transactionType = 'win'; amount = winAmount; }
  else if (betAmount === 0 && winAmount === 0) { transactionType = 'loss'; amount = 0; }
  else if (betAmount === 0 && winAmount < 0) { transactionType = 'negative_result'; amount = winAmount; }
  else if (betAmount < 0 && winAmount > 0) { transactionType = 'negative_bet_with_win'; amount = winAmount; }
  else if (betAmount < 0 && winAmount === 0) { transactionType = 'negative_bet'; amount = Math.abs(betAmount); }
  else if (betAmount < 0 && winAmount < 0) { transactionType = 'negative_bet_with_negative_result'; amount = winAmount; }
  else {
    logger.error('Invalid transaction amounts', { betAmount, winAmount });
    return res.status(400).json({ success: false, error: 'Invalid transaction amounts' });
  }

  const t = await sequelize.transaction();

  try {
    const wallet = await Wallet.findOne({
      where: { user_id },
      attributes: [currencyColumn, 'inr_balance'],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const currentBalance = parseFloat(wallet[currencyColumn] || '0');
    const delta = Number((winAmount - betAmount).toFixed(8));
    const newBalance = Number((currentBalance + delta).toFixed(8));

    if (newBalance < 0) {
      await t.rollback();
      logger.error('Insufficient balance', { user_id, currentBalance, betAmount, winAmount });
      return res.status(400).json({
        success: false, error: 'Insufficient balance', new_balance: currentBalance.toString(),
      });
    }

    // JS games have no exposure concept — move both cash and inr_balance together on every bet/win.
    await Wallet.increment(
      { [currencyColumn]: delta, inr_balance: delta },
      { where: { user_id }, transaction: t }
    );

    await JSGameTransaction.create({
      user_id,
      game_uid: game_uid || 'unknown',
      transaction_type: transactionType,
      amount,
      currency: currency.toLowerCase(),
      transaction_status: 'processed',
      external_transaction_id: game_round || 'unknown',
      additional_data: req.body,
    }, { transaction: t });

    await t.commit();

    // Update session exit_balance (latest balance after this callback)
    try {
      const latestSession = await GameSession.findOne({
        where: { user_id, game_uid: game_uid || '' },
        order: [['createdAt', 'DESC']],
      });
      if (latestSession) {
        await latestSession.update({ exit_balance: newBalance });
      }
    } catch (_) {}

    // Emit real-time balance update to frontend via socket
    const updatedWallet = await Wallet.findOne({ where: { user_id }, attributes: ['cash', 'inr_balance'] });
    if (updatedWallet) {
      emitBalanceUpdate(Number(user_id), {
        cash: parseFloat(updatedWallet.cash || 0),
        inr_balance: parseFloat(updatedWallet.inr_balance || 0),
      });
    }

    // Credits Ledger: one entry per session, updated on each callback
    // Session P&L = exit_balance - entry_balance
    try {
      const session = await GameSession.findOne({
        where: { user_id, game_uid: game_uid || '' },
        order: [['createdAt', 'DESC']],
      });

      if (session && session.entry_balance !== null) {
        const entryBal = parseFloat(session.entry_balance);
        const sessionPnL = Number((newBalance - entryBal).toFixed(2));
        const sessionId = `session-${session.id}`;
        const gameName = session.game_name || game_uid || 'unknown';
        const providerName = session.provider || 'unknown';

        // Find existing ledger entry for this session
        const existingLedger = await CreditsLedger.findOne({
          where: { user_id: String(user_id), eventid: sessionId, category: 'THIRD_PARTY_CASINO' },
        });

        const ledgerData = {
          amount: sessionPnL,
          reason: sessionPnL >= 0 ? 'session_profit' : 'session_loss',
          description: `${providerName} / ${gameName}`,
          profit: sessionPnL > 0 ? sessionPnL : null,
          loss: sessionPnL < 0 ? Math.abs(sessionPnL) : null,
          netamount: sessionPnL,
          closing: newBalance,
          balance: newBalance,
        };

        if (existingLedger) {
          // Update existing session ledger entry
          await existingLedger.update(ledgerData);
        } else {
          // Create new session ledger entry
          await CreditsLedger.create({
            user_id: String(user_id),
            currency: currency.toUpperCase(),
            ...ledgerData,
            eventid: sessionId,
            match_id: null,
            meta: {
              game_uid: game_uid || 'unknown',
              game_name: gameName,
              provider: providerName,
              session_id: session.id,
              entry_balance: entryBal,
            },
            sport_id: providerName,
            market_type: 'THIRD_PARTY_CASINO',
            category: 'THIRD_PARTY_CASINO',
          });
        }
      }
    } catch (ledgerErr) {
      logger.error('Session ledger update failed', { error: ledgerErr, user_id, game_uid });
    }

    logger.info('Bet callback processed', {
      user_id, transactionType, currency, betAmount, winAmount, currentBalance, newBalance,
    });

    return res.json({ success: true, new_balance: newBalance.toString() });
  } catch (err) {
    await t.rollback();
    logger.error('Database error in processBetCallbackV2', { error: err });
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}

// --- Proxy Handlers ---

async function getActiveGames(req, res) {
  const vendor = req.query.vendor;
  const page = req.query.page || '1';
  const per_page = req.query.per_page || '20';

  try {
    const response = await fetch(
      `${BASE_URL}games?vendor=${vendor || ''}&page=${page}&per_page=${per_page}`,
      { method: 'GET', headers: addAuthHeaders({}) }
    );
    const data = await response.json();
    if (!data.success) return res.status(400).json(data);
    res.json({ success: true, data: data.data });
  } catch (error) {
    logger.error('Failed to fetch games', { error });
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function searchGames(req, res) {
  const keyword = req.query.keyword || '';
  const vendor = req.query.vendor;
  const page = req.query.page || '1';
  const per_page = req.query.per_page || '20';

  const url = `${BASE_URL}games/search?keyword=${encodeURIComponent(keyword)}` +
    (vendor ? `&vendor=${vendor}` : '') + `&page=${page}&per_page=${per_page}`;

  try {
    const response = await fetch(url, { method: 'GET', headers: addAuthHeaders({}) });
    const data = await response.json();
    if (!data.success) return res.status(400).json(data);
    res.json({ success: true, data: data.data });
  } catch (error) {
    logger.error('Failed to search games', { error });
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function userhistory(req, res) {
  const userid = req.query.userid || '';
  const url = `https://games.ibitplay.com/api/user/user/history?user_id=${userid}`;

  try {
    const response = await fetch(url, { method: 'GET', headers: addAuthHeaders({}) });
    const data = await response.json();
    if (!data.success) return res.status(400).json(data);
    res.json({ success: true, data: data.data });
  } catch (error) {
    logger.error('Failed to fetch user history', { error });
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

async function userhistoryAdmin(req, res) {
  const url = 'https://games.ibitplay.com/api/user/historyToClient';

  try {
    const response = await fetch(url, { method: 'GET', headers: addAuthHeaders({}) });
    const data = await response.json();
    if (!data.success) return res.status(400).json(data);
    res.json({ success: true, data: data.data });
  } catch (error) {
    logger.error('Failed to fetch admin history', { error });
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

export default {
  getGameLaunchURL,
  processBetCallbackV2,
  getActiveGames,
  searchGames,
  userhistory,
  userhistoryAdmin,
};
