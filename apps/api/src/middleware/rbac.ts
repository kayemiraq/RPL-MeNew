import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export function authorize(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, error: "Tidak terautentikasi" });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                error: "Anda tidak memiliki akses untuk melakukan aksi ini",
            });
            return;
        }

        next();
    };
}
