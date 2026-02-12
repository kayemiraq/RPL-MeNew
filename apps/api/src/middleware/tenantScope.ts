import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

/**
 * Middleware to scope all queries to the authenticated user's tenant.
 * Attaches tenantId to req for use in controllers.
 */
export function tenantScope(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({ success: false, error: "Tidak terautentikasi" });
        return;
    }

    // Super Admin can access all tenants
    if (req.user.role === "SUPER_ADMIN") {
        next();
        return;
    }

    if (!req.user.tenantId) {
        res.status(403).json({
            success: false,
            error: "Akun tidak terkait dengan tenant manapun",
        });
        return;
    }

    next();
}
