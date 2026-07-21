
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import setupAssociations from "./model/associations.js";
setupAssociations();

//cronjob for daily profit loss
import './jobs/dailyProfitLossJob.js';

// Route Imports
import telegram2faRoutes from './routes/user/telegram2faRoutes.js';
import userAuthRoutes from './routes/user/userAuthRoutes.js';
import userActivityLogRoutes from './routes/user/userActivityLogRoutes.js';
import getResultRoute from './routes/user/getResultRoute.js';
import getResultRouteV2 from './routes/user/getResultRouteV2.js';
import userStatementRoutes from './routes/user/userStatementRoutes.js';
import ownerAuthRoutes from './routes/admin/ownerAuthRoutes.js';
import agentAuthRoutes from './routes/admin/agentAuthRoutes.js';
import transactionRoutes from './routes/admin/transactionRoutes.js';
import ownerRoutes from './routes/admin/ownerRoutes.js';
import userRoutes from './routes/admin/userRoutes.js';
import agentRoutes from './routes/admin/agentRoutes.js';
import adminWalletRoutes from './routes/admin/adminWalletRoutes.js';
import userWalletRoutes from './routes/user/userWalletRoutes.js';
import withdrawalRoutes from './routes/admin/withdrawalRoutes.js';
import affiliateRoutes from './routes/admin/affiliateRoutes.js';
import stakeButtonValueRoutes from './routes/user/stakeButtonValueRoutes.js';
import depositRoutes from './routes/admin/depositRoutes.js';
import fileRoutes from './routes/admin/fileRoutes.js';
import bankRoutes from './routes/admin/bankRoutes.js';
import casinoRoutes from './routes/user/casinoRoutes.js';
import systemTrackerRoutes from './systemTracker/router.js';
import gamesRoutes from './routes/user/gamesRoutes.js';
import betLockRoutes from './routes/admin/betLockRoutes.js';
import creditLedgerRoutes from './routes/admin/creditLedgerRoutes.js';
import platformGamesLockRoute from './routes/admin/platformGamesLockRoute.js';
import riskManagementRoutes from './routes/admin/riskManagementRoutes.js';
import profitLossRoutes from './routes/admin/profitLossRoutes.js';
import activityLogRoutes from './routes/admin/activityLogRoutes.js';
import reportsRoutes from './routes/admin/reportsRoutes.js';
import tableCasinoRoutes from './routes/admin/tableCasinoRoutes.js';
import executiveAuthRoutes from "./routes/executive/executiveAuthRoutes.js";
import executiveRoutes from "./routes/executive/executiveRoutes.js";
import sportsLockRoutes from './routes/admin/sportsLockRoutes.js';


import staffRoutes from './routes/admin/staffRoutes.js';

import staffAuthRoutes from './routes/admin/staffAuthRoutes.js'
import transactionPasswordRoutes from './routes/admin/transactionPasswordRoutes.js';

// d99 routes
import d99BetListRoutes from './d99/routes/betList.routes.js';

import sportsbetRoutes from './sportsbet/routes.js';
import sportsapiRoutes from './sportsapi/sportsapiroutes.js';

import jsGamesRoutes from './jsgames/routes.js';
import jsGamesv2 from './jsgamesv2/gameRoutes.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import { startSocketBridge } from './utils/socketUtils.js';
import mannualSettleRoutes from './mannualSettle/routes.js';

// Import Telegram Bot
import startBot from './2FA_telegram_bot/index.js';


dotenv.config();


// platform  domain only  
const allowedOrigins = [

  'https://diamond99.codefactory.games',
  'https://www.diamond99.codefactory.games',
  'https://admindiamond99.codefactory.games',
  'https://jmdexchange3.com',
  'https://www.jmdexchange3.com',
  'https://admin.jmdexchange3.com',
  'https://api.jmdexchange3.com',
  'https://dexch247.com',
  'https://www.dexch247.com',
  'https://admin.dexch247.com',
  'https://api.dexch247.com'
];

const checkOrigin = (origin, callback) => {
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin) ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    origin.startsWith('http://82.180.146.91:') ||
    origin.startsWith('http://217.216.78.106:') ||
    origin.startsWith('http://66.116.246.140:')
  ) {
    callback(null, true);
  } else {
    console.log("Blocked by CORS:", origin);
    callback(new Error('Not allowed by CORS'));
  }
};

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: checkOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  path: '/socket.io',
  allowEIO3: true,
  transports: ['websocket', 'polling'],
});

const PORT = process.env.PORT || 5000;

// ======================
// Socket.IO Setup
// ======================
// Register connection/authenticate/getBalance handlers so authenticated
// sockets join their `user_<id>` room. Without this, every
// io.to(`user_<id>`).emit('balanceUpdate', ...) reaches nobody and real-time
// balance/exposure updates silently never arrive (client must refresh).
setupSocketHandlers(io);

// Settlement workers run as separate PM2 processes and have no `io` of their
// own, so they publish balance/exposure updates over Redis. Relay them here.
// Without this the header only corrects itself on a page refresh.
startSocketBridge(io);

export { io };

// ======================
// Middleware
// ======================
app.use(cors({
  origin: checkOrigin,
  credentials: true
}));
app.use(express.json());
// app.options("*", cors());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`, req.body);
  next();
});



// ======================
// Health Check Route
// ======================
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: `Server is healthy for ${process.env.PROJECT_NAME}` });
});

// =============================================
// Routes
// =============================================

//user management
app.use("/api/executive", executiveAuthRoutes);
app.use("/api/executive", executiveRoutes);

app.use('/api/admin', ownerRoutes);            // modified : owner management
app.use('/api/admin', userRoutes);             // modified : user management
app.use('/api/admin', staffRoutes);            // new      : staff management
app.use('/api/admin', affiliateRoutes);        // not implemented yet 

//authentification
app.use('/api/2fa/telegram', telegram2faRoutes); // new: telegram 2fa
app.use('/api/user', userAuthRoutes);          // modified
app.use('/api/admin', ownerAuthRoutes);        // modified
app.use('/api/admin', staffAuthRoutes);        //agent  replaced with  staff concept
app.use('/api/admin', transactionPasswordRoutes);  // new: transaction password management


// platform
app.use('/api/admin', betLockRoutes);          //  new : lock individual user to place bet 
app.use('/api/admin', platformGamesLockRoute); // new : lock platform selected games  for all users
app.use('/api/admin', riskManagementRoutes); // new: risk management
app.use('/api/admin', fileRoutes);             // need to figure it out 
app.use('/api/admin', bankRoutes);             // platform bank account table:  CRUD   

//wallet & transactions
app.use('/api/admin', adminWalletRoutes);      //modified :  cash /credit transactions (only done by owner/staff)  
app.use('/api/user', userWalletRoutes);        // need to modify : user fetch their wallets
app.use('/api/admin', transactionRoutes);      // new:  transactions: between every type of user(owner/staff/user)
app.use('/api/admin', creditLedgerRoutes);     //  new : all the sports bet settlement transactions record 
app.use('/api/user', withdrawalRoutes);        //for users making withdraw request 
app.use('/api/admin', withdrawalRoutes);       // for admin settling withdrawals manualy
app.use('/api/admin', profitLossRoutes);
app.use('/api/admin', activityLogRoutes);      // new: user activity logs
app.use('/api/admin/reports', reportsRoutes);  // new: reports
app.use('/api/admin/table-casino', tableCasinoRoutes); // new: table casino locks
app.use('/api/admin/sports-lock', sportsLockRoutes);   // new: dynamic sports locks


// System Tracker — mother-admin (Owner) wallet/settlement integrity tool (read-only)
app.use('/api/system-tracker', systemTrackerRoutes);

//sports and casino
app.use('/api/casino', casinoRoutes);            //  CASINO:  related data: 50 games
app.use('/api/user', gamesRoutes);             // SPORTS: particular game
app.use('/api/user', getResultRoute);          // SPORTS:  result (Diamond/old)
app.use('/api/result', getResultRoute);        // SPORTS: result for internal use (Diamond/old)
app.use('/api/user', getResultRouteV2);        // SPORTS:  result v2 (AVRKHUB)
app.use('/api/result', getResultRouteV2);      // SPORTS: result v2 for internal use (AVRKHUB)
app.use('/api/user', sportsbetRoutes);         // 
app.use('/api/user', userActivityLogRoutes);   // new: user activity logs for frontend
app.use('/api/user', userStatementRoutes);     // new: dedicated user statement
app.use('/api/user', stakeButtonValueRoutes);
app.use('/api', sportsapiRoutes);              // need to figure it out 

app.use('/api/jsGames', jsGamesRoutes);        // live casino
app.use('/api/jsGamesv2', jsGamesv2);          // live casino
// Provider posts bet-callback without /api prefix — alias mount.
app.use('/jsGamesv2', jsGamesv2);

// d99 sub-module routes
app.use('/api/d99', d99BetListRoutes);


// manual settle 

app.use('/api/internalsettle', mannualSettleRoutes)

// ======================
// ✅ Start Server
// ======================
import { initializeDatabase } from './config/dbInit.js';

const startServer = async () => {
  try {
    // Initialize Database (Sync & Seed)
    await initializeDatabase();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`⚡ Socket.IO server ready for real-time connections`);

      // Start Telegram Bot
      startBot();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// ======================
// Graceful Shutdown
// ======================
const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });
  // Force exit if server hasn't closed in 5 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Only start HTTP listener when NOT imported as a module by workers.
// Workers set WORKER_MODE env or their argv[1] won't be server.js.
if (!process.env.WORKER_MODE) {
  startServer();
}