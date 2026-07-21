import { io } from "socket.io-client";
import { SOCKET_URL } from "../config.js";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
}
