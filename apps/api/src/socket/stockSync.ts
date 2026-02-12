import { Server as SocketIOServer } from "socket.io";
import { logger } from "../utils/logger";

export function setupSocketHandlers(io: SocketIOServer): void {
    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        // Customer joins a store's menu room (for real-time stock updates)
        socket.on("join:store", (storeId: string) => {
            socket.join(`store:${storeId}`);
            logger.debug(`Socket ${socket.id} joined store:${storeId}`);
        });

        // Staff joins order notification room
        socket.on("join:orders", (storeId: string) => {
            socket.join(`store:${storeId}:orders`);
            logger.debug(`Socket ${socket.id} joined store:${storeId}:orders`);
        });

        // Leave rooms
        socket.on("leave:store", (storeId: string) => {
            socket.leave(`store:${storeId}`);
        });

        socket.on("leave:orders", (storeId: string) => {
            socket.leave(`store:${storeId}:orders`);
        });

        socket.on("disconnect", () => {
            logger.debug(`Socket disconnected: ${socket.id}`);
        });
    });
}
