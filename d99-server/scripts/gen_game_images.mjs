// Match js_games rows to the downloaded game images and emit a
// game_uid -> /livecasinoimg/<vendor>/<file> manifest. Images are served by an
// Apache alias straight from d99-frontend/src/assets/livecasinoimg (no copy).
// Re-runnable; unmatched games fall back to their remote game_icon in the UI.
import sequelize from '../config/db.js';
import { QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

const SRC = path.resolve('../d99-frontend/src/assets/livecasinoimg');
const MANIFEST = path.resolve('../d99-frontend/src/data/gameImageMap.json');
const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const folders = fs.readdirSync(SRC).filter(f => {
  try { return fs.statSync(path.join(SRC, f)).isDirectory(); } catch { return false; }
});
const folderSet = new Set(folders);

// folder -> { normName: filename(prefer webp) } ; global -> { normName: {folder,file} }
const idx = {}, global = {};
for (const f of folders) {
  const m = {};
  for (const file of fs.readdirSync(path.join(SRC, f))) {
    if (!/\.(webp|png|jpe?g)$/i.test(file)) continue;
    const b = norm(file.replace(/\.(webp|png|jpe?g)$/i, ''));
    if (!m[b] || /\.webp$/i.test(file)) m[b] = file;
    if (!global[b]) global[b] = { folder: f, file };
  }
  idx[f] = m;
}

// Map a DB vendor string to candidate image folders (regional/suffix variants).
const aliases = {
  ka: 'kagaming', bng: 'booongo', bng3oks: '3oaks', jdbgaming: 'jdb',
  jiligaming: 'jili', jilisweep: 'jili', pgsgaming: 'pgsoft', fachaigaming: 'fachai',
  'sg(spadegaming)': 'spadegaming',
};
function candidates(vendor) {
  const v = String(vendor || '').toLowerCase();
  const s = new Set();
  if (aliases[v]) s.add(aliases[v]);
  s.add(norm(v));
  s.add(norm(v.replace(/\(.*?\)/g, '')));                                   // drop parentheticals
  s.add(norm(v.replace(/[-\s](eu|asia|aisa|latam|world|row|live|h5|nlc)+$/g, ''))); // drop region suffix
  s.add(norm(v.split(/[-\s(]/)[0]));                                        // first token
  const m = v.match(/^evoluti?o?i?n?[-\s](.+)$/);                           // evolution-<provider>
  if (m) s.add(norm(m[1].replace(/\(.*?\)/g, '')));
  if (/^evolution/.test(v)) { s.add('evolution'); s.add('evolutiongaming'); }
  if (/pragmatic/.test(v)) s.add('pragmaticplay');
  return [...s].filter(x => x && folderSet.has(x));
}

const run = async () => {
  const games = await sequelize.query('SELECT game_uid, game_name, vendor FROM js_games', { type: QueryTypes.SELECT });
  const manifest = {};
  let viaVendor = 0, viaGlobal = 0;
  for (const g of games) {
    const nm = norm(g.game_name);
    if (!nm) continue;
    let hit = null;
    for (const c of candidates(g.vendor)) {
      if (idx[c] && idx[c][nm]) { hit = { folder: c, file: idx[c][nm] }; break; }
    }
    if (hit) viaVendor++;
    else if (nm.length >= 4 && global[nm]) { hit = global[nm]; viaGlobal++; } // name fallback, skip ultra-generic
    if (hit) manifest[g.game_uid] = `/livecasinoimg/${hit.folder}/${hit.file}`;
  }
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest));
  const n = Object.keys(manifest).length;
  console.log(`Matched ${n}/${games.length} (${(100 * n / games.length).toFixed(1)}%) — vendor:${viaVendor} global:${viaGlobal}`);
  console.log(`Manifest written: ${MANIFEST}`);
  await sequelize.close();
};
run().catch(e => { console.error('❌', e.message); process.exit(1); });
