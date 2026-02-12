import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error(err.message, { stack: err.stack });

    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: "Validasi gagal",
            details: err.errors.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
        return;
    }

    if (err.name === "MulterError") {
        res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`,
        });
        return;
    }

    res.status(500).json({
        success: false,
        error:
            process.env.NODE_ENV === "production"
                ? "Internal server error"
                : err.message,
    });
}
