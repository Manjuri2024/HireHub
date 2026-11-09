import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "./config/env";
import { verifyToken } from "./middleware";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, { cors: { origin: env.clientUrl, credentials: true } });
  io.use((socket, next) => {
    try {
      socket.data.user = verifyToken(String(socket.handshake.auth?.token || ""));
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });
  io.on("connection", (socket) => socket.join(`user:${socket.data.user.id}`));
}

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  io?.to(`user:${userId}`).emit(event, payload);
};
