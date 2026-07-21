import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// JSGames V1 Models
import JSGame from '../models/JSGame.js';
import JSGameTransaction from '../models/JSGameTransaction.js';
import PrioritizedGame from '../models/PrioritizedGame.js';
import ExchangeRate from '../models/ExchangeRate.js';

// JSGames V2 Models (same tables, import ensures registration with sequelize)
import JSGameV2 from '../../jsgamesv2/models/JSGame.js';
import JSGameTransactionV2 from '../../jsgamesv2/models/JSGameTransaction.js';
import ExchangeRateV2 from '../../jsgamesv2/models/ExchangeRate.js';

// Shared models
import GameSession from '../../model/GameSession.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_SQL_PATH = join(__dirname, 'js_seed.sql');

// =============================
// SQL Parser — reads pg_dump js_seed.sql
// Supports both formats:
//   INSERT INTO public.js_games (...) VALUES (...);
//   INSERT INTO "js_games" (...) VALUES (...)
// =============================

function parseSQLValues(valuesStr) {
  const values = [];
  let i = 0;
  const s = valuesStr;

  while (i < s.length) {
    while (i < s.length && (s[i] === ' ' || s[i] === '\t')) i++;
    if (i >= s.length) break;

    if (s[i] === "'") {
      i++;
      let val = '';
      while (i < s.length) {
        if (s[i] === "'" && s[i + 1] === "'") { val += "'"; i += 2; }
        else if (s[i] === "'") { i++; break; }
        else { val += s[i]; i++; }
      }
      values.push(val);
    } else if (s.substring(i, i + 4) === 'NULL') {
      values.push(null);
      i += 4;
    } else if (s.substring(i, i + 4) === 'true') {
      values.push('t');
      i += 4;
    } else if (s.substring(i, i + 5) === 'false') {
      values.push('f');
      i += 5;
    } else {
      let val = '';
      while (i < s.length && s[i] !== ',' && s[i] !== ')') { val += s[i]; i++; }
      values.push(val.trim());
    }
    // skip comma
    while (i < s.length && (s[i] === ',' || s[i] === ' ' || s[i] === '\t')) {
      if (s[i] === ',') { i++; break; }
      i++;
    }
  }
  return values;
}

function parseSeedSQL() {
  const raw = readFileSync(SEED_SQL_PATH, 'utf8');
  const lines = raw.split('\n');

  const games = [];
  const prioritized = [];
  let currentTable = null; // tracks which INSERT block we're inside

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect INSERT INTO header line (Adminer multi-line format)
    if (trimmed.startsWith('INSERT INTO')) {
      if (trimmed.includes('prioritized_games')) currentTable = 'prioritized';
      else if (trimmed.includes('js_games')) currentTable = 'js_games';
      else currentTable = null;

      // pg_dump single-line format: INSERT INTO ... VALUES (...);
      const valuesMatch = trimmed.match(/VALUES\s*\((.+)\);?\s*$/);
      if (valuesMatch) {
        const vals = parseSQLValues(valuesMatch[1]);
        if (currentTable === 'prioritized' && vals.length >= 2) {
          prioritized.push({ vendor: vals[0], game_ids: vals[1] });
        }
        if (currentTable === 'js_games' && vals.length >= 9) {
          games.push({
            id: parseInt(vals[0]), game_name: vals[1], game_uid: vals[2],
            game_type: vals[3], game_icon: vals[4],
            is_active: vals[5] === 't' || vals[5] === 'true',
            vendor: vals[8], description: vals[9] || null,
          });
        }
        currentTable = null;
      }
      continue;
    }

    // Adminer multi-line: value rows start with (
    if (currentTable && trimmed.startsWith('(')) {
      // Strip leading ( and trailing ), or );
      let rowStr = trimmed;
      if (rowStr.endsWith(');')) { rowStr = rowStr.slice(1, -2); currentTable = currentTable; }
      else if (rowStr.endsWith(',')) { rowStr = rowStr.slice(1, -2); }
      else { rowStr = rowStr.slice(1, -1); }

      const vals = parseSQLValues(rowStr);

      if (currentTable === 'prioritized' && vals.length >= 2) {
        prioritized.push({ vendor: vals[0], game_ids: vals[1] });
      }
      if (currentTable === 'js_games' && vals.length >= 9) {
        games.push({
          id: parseInt(vals[0]), game_name: vals[1], game_uid: vals[2],
          game_type: vals[3], game_icon: vals[4],
          is_active: vals[5] === 't' || vals[5] === 'true',
          vendor: vals[8], description: vals[9] || null,
        });
      }

      // If line ends with ; this INSERT block is done
      if (trimmed.endsWith(';')) currentTable = null;
      continue;
    }

    // Any non-data line resets the block
    if (trimmed.startsWith('--') || trimmed.startsWith('DROP') || trimmed.startsWith('CREATE') || trimmed === '') {
      currentTable = null;
    }
  }

  return { games, prioritized };
}

// =============================
// Exchange rates (defaults)
// =============================

const exchangeRatesSeed = [
  { currency: 'INR', usd_rate: 0.01190 },
  { currency: 'USD', usd_rate: 1.00000 },
  { currency: 'USDT', usd_rate: 1.00000 },
  { currency: 'BDT', usd_rate: 0.00830 },
];

// =============================
// Initialize JSGames Tables & Seed
// =============================
// Usage:
//   - Tables are auto-created/altered on every server start
//   - To update games: replace jsgames/db/js_seed.sql with a new pg_dump and restart
//     pg_dump command:
//     PGPASSWORD="diamond" pg_dump -U diamond -h 127.0.0.1 diamond \
//       -t prioritized_games -t js_games --data-only --column-inserts --no-owner > jsgames/db/js_seed.sql
// =============================

export const initializeJSGames = async () => {
  try {
    // Step 1: Sync all jsgames tables
    await JSGame.sync({ alter: true });
    await JSGameTransaction.sync({ alter: true });
    await PrioritizedGame.sync({ alter: true });
    await ExchangeRate.sync({ alter: true });
    await GameSession.sync({ alter: true });
    console.log('✅ JSGames tables synced (js_games, js_game_transactions, prioritized_games, exchangerate, game_sessions)');

    // Step 2: Seed exchange rates
    for (const rate of exchangeRatesSeed) {
      await ExchangeRate.findOrCreate({
        where: { currency: rate.currency },
        defaults: rate,
      });
    }
    console.log('✅ Exchange rates seeded');

    // Step 3: Seed from js_seed.sql if it exists
    if (!existsSync(SEED_SQL_PATH)) {
      console.log('⚠️  No js_seed.sql found — skipping game seed. Place your dump at jsgames/db/js_seed.sql');
      return;
    }

    // Only seed an empty catalog. Once js_games is populated (e.g. a manual
    // 14k import), skip seeding so we never re-add the smaller bootstrap set.
    const existingGames = await JSGame.count();
    if (existingGames > 0) {
      console.log(`ℹ️  js_games already has ${existingGames} games — skipping seed to preserve existing catalog.`);
      return;
    }

    const { games, prioritized } = parseSeedSQL();

    // Seed prioritized games (upsert)
    if (prioritized.length > 0) {
      for (const pg of prioritized) {
        const [record, created] = await PrioritizedGame.findOrCreate({
          where: { vendor: pg.vendor },
          defaults: pg,
        });
        if (!created && record.game_ids !== pg.game_ids) {
          await record.update({ game_ids: pg.game_ids });
        }
      }
      console.log(`✅ Prioritized games seeded (${prioritized.length} vendors)`);
    }

    // Seed js_games (upsert by game_uid — adds new, updates existing)
    if (games.length > 0) {
      const BATCH_SIZE = 200;
      let total = 0;
      for (let i = 0; i < games.length; i += BATCH_SIZE) {
        const batch = games.slice(i, i + BATCH_SIZE);
        const result = await JSGame.bulkCreate(batch, {
          updateOnDuplicate: ['game_name', 'game_type', 'game_icon', 'is_active', 'vendor', 'description'],
        });
        total += result.length;
      }
      console.log(`✅ js_games synced from js_seed.sql (${total} games)`);
    }

  } catch (error) {
    console.error('❌ JSGames DB init failed:', error.message);
  }
};
