import redis from '../config/redisClient.js';

// Settlement runs in its own PM2 process (WORKER_MODE=1), which has NO Socket.IO
// server — the sockets live only in `dexch247-server`. So a worker can never
// `io.to(...)` a browser directly: getIO() returns null there and the emit used
// to be dropped on the floor, which is why balance/exposure only corrected
// themselves on a page refresh after a bet settled.
//
// Fix: workers PUBLISH the payload on a Redis channel; the main server process
// SUBSCRIBES (startSocketBridge) and relays it into the `user_<id>` room.
export const BALANCE_CHANNEL = 'socket:balanceUpdate';

// Lazy-import io only when running as the main server (not in worker processes).
// Importing server.js from workers causes the HTTP listener to start on the same port,
// leading to EADDRINUSE crash loops.
let _io = null;

async function getIO() {
  if (_io) return _io;
  if (process.env.WORKER_MODE) return null;
  try {
    const mod = await import('../server.js');
    _io = mod.io;
  } catch {
    _io = null;
  }
  return _io;
}

const buildPayload = (userId, balanceData) => ({
  userId,
  balance: {
    inr_balance: balanceData.inr_balance,
    // Always emit raw exposure value (negative = liability)
    exposure: balanceData.exposure != null ? parseFloat(balanceData.exposure) : null,
  },
  timestamp: new Date().toISOString(),
});

/**
 * Emit balance update to a specific user.
 *
 * In the main server process this emits directly. In a worker process (any
 * settlement worker) there is no io, so it publishes to Redis and the main
 * process relays it — see startSocketBridge below.
 *
 * @param {number} userId - The user ID to emit to
 * @param {Object} balanceData - The balance data to emit
 * @param {number} balanceData.inr_balance - INR balance
 * @param {number} balanceData.exposure - Net exposure (negative = liability)
 */
export const emitBalanceUpdate = async (userId, balanceData) => {
  const payload = buildPayload(userId, balanceData);

  const io = await getIO();
  if (io) {
    io.to(`user_${userId}`).emit('balanceUpdate', payload);
    return;
  }

  try {
    await redis.publish(BALANCE_CHANNEL, JSON.stringify(payload));
  } catch (err) {
    console.error('emitBalanceUpdate: redis publish failed:', err.message);
  }
};

/**
 * Relay worker-published balance updates into Socket.IO rooms.
 * Call ONCE from server.js, right after setupSocketHandlers(io).
 *
 * Uses a duplicated connection because an ioredis client in subscriber mode
 * can no longer run normal commands (the shared client is used for GET/SET
 * everywhere else).
 */
export const startSocketBridge = (io) => {
  const sub = redis.duplicate();

  sub.on('error', (err) =>
    console.error('❌ Socket bridge Redis error:', err.message)
  );

  sub.subscribe(BALANCE_CHANNEL, (err) => {
    if (err) {
      console.error('❌ Socket bridge failed to subscribe:', err.message);
      return;
    }
    console.log(`✅ Socket bridge listening on "${BALANCE_CHANNEL}"`);
  });

  sub.on('message', (channel, message) => {
    if (channel !== BALANCE_CHANNEL) return;
    try {
      const payload = JSON.parse(message);
      if (payload?.userId == null) return;
      io.to(`user_${payload.userId}`).emit('balanceUpdate', payload);
    } catch (err) {
      console.error('Socket bridge: bad payload', err.message);
    }
  });

  return sub;
};
