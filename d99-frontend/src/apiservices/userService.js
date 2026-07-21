import api from "./axiosClient.js";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config.js";

// --- Socket management ---------------------------------------------------

let socket = null;
let socketUserId = null; // who the current socket is authenticated as

export const initializeSocket = (token, userId) => {
  // Reuse the existing socket for the same user. Recreating it on every
  // getBalance() call (which fires after every bet) would tear down all the
  // `balanceUpdate` listeners other components registered, so real-time
  // exposure/balance updates would silently stop arriving until a page
  // refresh. Only ensure it is connected + (re)authenticated.
  if (socket && socketUserId === String(userId)) {
    if (!socket.connected) socket.connect();
    else socket.emit("authenticate", { userId, token });
    return socket;
  }

  // Different user (login switch) or first init → start a fresh socket.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socketUserId = String(userId);
  const url = SOCKET_URL || "http://localhost:8000";

  socket = io(url, {
    auth: { token },
    path: "/socket.io",
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Fires on the initial connect AND on every successful reconnect, so the
  // socket always (re)joins its `user_<id>` room after a drop.
  socket.on("connect", () => {
    socket.emit("authenticate", { userId, token });
  });

  socket.on("error", (err) => console.error("Socket error:", err));
  socket.on("connect_error", (err) => console.error("Socket connect_error:", err));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socketUserId = null;
};

export const clearSocket = disconnectSocket;

// --- REST APIs -----------------------------------------------------------

export const loginUser = (credentials) =>
  api.post("/user/login", credentials).then((r) => r.data);

export const getBalance = async (token, userId) => {
  if (userId) initializeSocket(token, userId);
  const res = await api.get("/user/balance");
  return res.data.data;
};

export const getAllExposures = (token, userId) =>
  api.post("/user/exposure", { user_id: userId }).then((r) => r.data);

// --- Socket listeners ----------------------------------------------------

export const subscribeToBalanceUpdates = (userId, callback) => {
  if (!socket) {
    console.warn("Socket not initialized. Call getBalance first.");
    return null;
  }

  const handler = (data) => {
    if (data.error) return console.error("Balance update error:", data.error);
    // Compare loosely as strings — the server may emit a numeric id while the
    // subscriber holds a string (or vice-versa); a strict === would silently
    // drop every update.
    if (String(data.userId) === String(userId)) callback(data.balance);
  };

  socket.on("balanceUpdate", handler);
  return () => socket?.off("balanceUpdate", handler);
};

export const subscribeToTransactionUpdates = (userId, callback) => {
  if (!socket) {
    console.warn("Socket not initialized. Call getBalance first.");
    return null;
  }

  const handler = (data) => {
    if (data.userId === userId) callback(data.transactions);
  };

  socket.on("transactionUpdate", handler);
  return () => socket?.off("transactionUpdate", handler);
};

export const requestBalanceUpdate = (userId) => {
  if (socket) socket.emit("getBalance", { userId });
  else console.warn("Socket not available for balance update request");
};
