import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import rateLimit from "express-rate-limit";
import path from "path";

import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { tenantRouter } from "./modules/tenant/tenant.routes";
import { storeRouter } from "./modules/store/store.routes";
import { categoryRouter } from "./modules/category/category.routes";
import { productRouter } from "./modules/product/product.routes";
import { tableRouter } from "./modules/table/table.routes";
import { orderRouter } from "./modules/order/order.routes";
import { menuRouter } from "./modules/menu/menu.routes";
import { reportRouter } from "./modules/report/report.routes";
import { setupSocketHandlers } from "./socket/stockSync";
import { logger } from "./utils/logger";

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || [
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
    },
});

// Make io accessible in routes
app.set("io", io);

// Setup socket handlers
setupSocketHandlers(io);

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || [
            "http://localhost:3000",
            "http://localhost:3001",
        ],
        credentials: true,
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use(
    "/uploads",
    express.static(path.resolve(__dirname, "../../uploads"))
);

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, error: "Terlalu banyak request, coba lagi nanti" },
});

// ============================================================
// ROUTES
// ============================================================

app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "MeNew API is running 🚀" });
});

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/tenants", tenantRouter);
app.use("/api/stores", storeRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/tables", tableRouter);
app.use("/api/orders", orderRouter);
app.use("/api/menu", menuRouter);
app.use("/api/reports", reportRouter);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
    logger.info(`🚀 MeNew API running on http://localhost:${PORT}`);
    logger.info(`📡 Socket.io ready for real-time connections`);
});

export { app, io };
