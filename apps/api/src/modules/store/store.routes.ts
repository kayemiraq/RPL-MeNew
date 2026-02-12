import { Router } from "express";
import { prisma } from "@menew/database";
import { createStoreSchema, updateStoreSchema } from "@menew/shared";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { tenantScope } from "../../middleware/tenantScope";

export const storeRouter = Router();

storeRouter.use(authenticate, authorize("SUPER_ADMIN", "OWNER"), tenantScope);

// GET /api/stores
storeRouter.get("/", async (req: AuthRequest, res, next) => {
    try {
        const where =
            req.user!.role === "SUPER_ADMIN"
                ? {}
                : { tenantId: req.user!.tenantId };

        const stores = await prisma.store.findMany({
            where,
            include: {
                _count: { select: { tables: true, products: true, orders: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: stores });
    } catch (err) {
        next(err);
    }
});

// POST /api/stores
storeRouter.post("/", async (req: AuthRequest, res, next) => {
    try {
        const data = createStoreSchema.parse(req.body);

        const tenantId = req.user!.tenantId;
        if (!tenantId) {
            res.status(400).json({ success: false, error: "Tenant ID diperlukan" });
            return;
        }

        // Check subscription limits
        const subscription = await prisma.subscription.findUnique({
            where: { tenantId },
        });
        const storeCount = await prisma.store.count({ where: { tenantId } });

        if (subscription && storeCount >= subscription.maxStores) {
            res.status(403).json({
                success: false,
                error: `Paket Anda hanya mengizinkan ${subscription.maxStores} store`,
            });
            return;
        }

        const store = await prisma.store.create({
            data: { ...data, tenantId },
        });

        res.status(201).json({ success: true, data: store });
    } catch (err) {
        next(err);
    }
});

// GET /api/stores/:id
storeRouter.get("/:id", async (req: AuthRequest, res, next) => {
    try {
        const where: any = { id: req.params.id };
        if (req.user!.role !== "SUPER_ADMIN") {
            where.tenantId = req.user!.tenantId;
        }

        const store = await prisma.store.findFirst({
            where,
            include: {
                categories: { include: { products: true } },
                tables: true,
                _count: { select: { orders: true } },
            },
        });

        if (!store) {
            res.status(404).json({ success: false, error: "Store tidak ditemukan" });
            return;
        }

        res.json({ success: true, data: store });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/stores/:id
storeRouter.patch("/:id", async (req: AuthRequest, res, next) => {
    try {
        const data = updateStoreSchema.parse(req.body);

        const where: any = { id: req.params.id };
        if (req.user!.role !== "SUPER_ADMIN") {
            where.tenantId = req.user!.tenantId;
        }

        const existing = await prisma.store.findFirst({ where });
        if (!existing) {
            res.status(404).json({ success: false, error: "Store tidak ditemukan" });
            return;
        }

        const store = await prisma.store.update({
            where: { id: req.params.id },
            data,
        });

        res.json({ success: true, data: store });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/stores/:id
storeRouter.delete("/:id", async (req: AuthRequest, res, next) => {
    try {
        const where: any = { id: req.params.id };
        if (req.user!.role !== "SUPER_ADMIN") {
            where.tenantId = req.user!.tenantId;
        }

        const existing = await prisma.store.findFirst({ where });
        if (!existing) {
            res.status(404).json({ success: false, error: "Store tidak ditemukan" });
            return;
        }

        await prisma.store.delete({ where: { id: req.params.id } });

        res.json({ success: true, message: "Store berhasil dihapus" });
    } catch (err) {
        next(err);
    }
});
