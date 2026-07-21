
import sequelize from '../config/db.js';
import UserNetExposure from '../model/user/UserNetExposure.js';
import { calculateNetExposure } from '../helper/netExposureHelper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    console.log(`[NetExposureWorker] Created logs directory at ${LOG_DIR}`);
  } catch (err) {
    console.error(`[NetExposureWorker] Failed to create logs directory:`, err);
  }
}

const SLEEP_MS = 1000; // Run every 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function syncNetExposure() {
  try {
    // 1. Get calculated net exposures from helper (returns { user_id: exposure_amount })
    const exposureMap = await calculateNetExposure();

    // 2. Fetch all current UserNetExposure records from DB to minimize writes
    const allStoredExposuresResults = await UserNetExposure.findAll({
       attributes: ['user_id', 'net_exposure'],
       raw: true
    });

    const storedExposureMap = {}; // user_id -> float
    for (const rec of allStoredExposuresResults) {
       storedExposureMap[rec.user_id] = parseFloat(rec.net_exposure) || 0;
    }

    // 3. Prepare list of user IDs to process (Union of current active exposures and stored exposures)
    const activeUserIds = Object.keys(exposureMap).map(id => parseInt(id));
    const storedUserIds = Object.keys(storedExposureMap).map(id => parseInt(id));
    const allUserIds = new Set([...activeUserIds, ...storedUserIds]);

    for (const userId of allUserIds) {
        const calculatedExposure = exposureMap[userId] || 0;
        const storedExposure = storedExposureMap[userId] || 0;
        
        // We only update if there is a significant difference
        if (Math.abs(storedExposure - calculatedExposure) > 0.001) {
            
            // Transaction is good practice even for single record updates if we want to add more later
            const t = await sequelize.transaction();
            try {
                await UserNetExposure.upsert({
                    user_id: userId,
                    net_exposure: calculatedExposure
                }, { transaction: t });

                await t.commit();
                
                // Logging
                // console.log(`[NetExposureWorker] User ${userId}: Exposure updated ${storedExposure} -> ${calculatedExposure}`);
                const logMessage = `[${new Date().toISOString()}] User: ${userId} | NetExposure: ${storedExposure} -> ${calculatedExposure}\n`;
                fs.appendFile(path.join(LOG_DIR, 'net_exposure_update.log'), logMessage, (err) => {
                    if (err) console.error('[NetExposureWorker] Failed to write to log file:', err);
                });

            } catch (error) {
                await t.rollback();
                console.error(`[NetExposureWorker] Failed to update user ${userId}:`, error);
            }
        }
    }

  } catch (err) {
    console.error('[NetExposureWorker] Error in sync loop:', err);
  }
}

async function startWorker() {
  // Sync the model to ensure table exists
  await UserNetExposure.sync(); 
  console.log('[NetExposureWorker] Starting Net Exposure Sync Worker...');
  
  while (true) {
    const start = Date.now();
    await syncNetExposure();
    const duration = Date.now() - start;
    
    // console.log(`[NetExposureWorker] Cycle completed in ${duration}ms`);
    
    await sleep(Math.max(200, SLEEP_MS - duration));
  }
}

startWorker();
