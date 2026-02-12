import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";

export interface AuthRequest extends Request {
    user?: TokenPayload;
}

export function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Token tidak ditemukan" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch {
        res
            .status(401)
            .json({ success: false, error: "Token tidak valid atau sudah expired" });
    }
}
