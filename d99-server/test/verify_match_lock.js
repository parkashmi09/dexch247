
import { checkUserBetLock } from './sportsbet/sportbetscontroller.js';
import { lockMatchForUser, unlockMatchForUser } from './controller/admin/betLockController.js';
import sequelize from './config/db.js';

// Mock req, res
const mockReq = (body) => ({ body });
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

const run = async () => {
  try {
    const userId = 1; // Assuming user 1 exists
    const eventId = "888888";
    const gameType = "MO";

    console.log("--- 1. Check lock before locking ---");
    let status = await checkUserBetLock(userId, gameType, eventId);
    console.log("Allowed?", status.allowed);

    console.log("--- 2. Lock match ---");
    const reqLock = mockReq({ user_id: userId, event_id: eventId });
    const resLock = mockRes();
    await lockMatchForUser(reqLock, resLock);
    console.log("Lock response:", resLock.data);

    console.log("--- 3. Check lock after locking ---");
    status = await checkUserBetLock(userId, gameType, eventId);
    console.log("Allowed?", status.allowed);
    console.log("Message:", status.message);

    console.log("--- 4. Unlock match ---");
    const reqUnlock = mockReq({ user_id: userId, event_id: eventId });
    const resUnlock = mockRes();
    await unlockMatchForUser(reqUnlock, resUnlock);
    console.log("Unlock response:", resUnlock.data);

    console.log("--- 5. Check lock after unlocking ---");
    status = await checkUserBetLock(userId, gameType, eventId);
    console.log("Allowed?", status.allowed);

  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
};

run();
