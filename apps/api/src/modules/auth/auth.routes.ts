import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@menew/database";
import { loginSchema, registerSchema } from "@menew/shared";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    TokenPayload,
} from "../../utils/jwt";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const authRouter = Router();

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
        });

        if (!user) {
            res.status(401).json({ success: false, error: "Email atau password salah" });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ success: false, error: "Email atau password salah" });
            return;
        }

        if (user.tenant && user.tenant.status !== "ACTIVE") {
            res.status(403).json({ success: false, error: "Akun tenant Anda sedang di-suspend" });
            return;
        }

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Store refresh token
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/register (Owner or Manager accounts, created by SuperAdmin/Owner)
authRouter.post(
    "/register",
    authenticate,
    authorize("SUPER_ADMIN", "OWNER"),
    async (req: AuthRequest, res, next) => {
        try {
            const data = registerSchema.parse(req.body);

            const existing = await prisma.user.findUnique({
                where: { email: data.email },
            });
            if (existing) {
                res.status(409).json({ success: false, error: "Email sudah terdaftar" });
                return;
            }

            const hashedPassword = await bcrypt.hash(data.password, 12);

            // Owner can only create Managers in their tenant
            const tenantId =
                req.user?.role === "SUPER_ADMIN"
                    ? data.tenantId
                    : req.user?.tenantId;

            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role,
                    tenantId: tenantId || null,
                },
            });

            res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

// POST /api/auth/refresh
authRouter.post("/refresh", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, error: "Refresh token required" });
            return;
        }

        const decoded = verifyRefreshToken(refreshToken);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user || user.refreshToken !== refreshToken) {
            res.status(401).json({ success: false, error: "Refresh token tidak valid" });
            return;
        }

        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
        };

        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });

        res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
authRouter.get("/me", authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                tenant: { select: { name: true, slug: true } },
                stores: {
                    include: { store: { select: { id: true, name: true, slug: true } } },
                },
            },
        });

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});
