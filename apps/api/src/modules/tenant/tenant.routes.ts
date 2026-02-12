import { Router } from "express";
import { prisma } from "@menew/database";
import { createTenantSchema, updateTenantSchema } from "@menew/shared";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const tenantRouter = Router();

// All tenant routes require SuperAdmin
tenantRouter.use(authenticate, authorize("SUPER_ADMIN"));

// GET /api/tenants
tenantRouter.get("/", async (_req, res, next) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                subscription: true,
                _count: { select: { stores: true, users: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: tenants });
    } catch (err) {
        next(err);
    }
});

// POST /api/tenants
tenantRouter.post("/", async (req, res, next) => {
    try {
        const data = createTenantSchema.parse(req.body);

        const tenant = await prisma.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
                subscription: {
                    create: { plan: "FREE", maxStores: 1 },
                },
            },
            include: { subscription: true },
        });

        res.status(201).json({ success: true, data: tenant });
    } catch (err) {
        next(err);
    }
});

// GET /api/tenants/:id
tenantRouter.get("/:id", async (req, res, next) => {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: req.params.id },
            include: {
                subscription: true,
                stores: true,
                users: { select: { id: true, name: true, email: true, role: true } },
            },
        });

        if (!tenant) {
            res.status(404).json({ success: false, error: "Tenant tidak ditemukan" });
            return;
        }

        res.json({ success: true, data: tenant });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/tenants/:id
tenantRouter.patch("/:id", async (req, res, next) => {
    try {
        const data = updateTenantSchema.parse(req.body);

        const tenant = await prisma.tenant.update({
            where: { id: req.params.id },
            data,
        });

        res.json({ success: true, data: tenant });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/tenants/:id
tenantRouter.delete("/:id", async (req, res, next) => {
    try {
        await prisma.tenant.update({
            where: { id: req.params.id },
            data: { status: "DELETED" },
        });

        res.json({ success: true, message: "Tenant berhasil dihapus" });
    } catch (err) {
        next(err);
    }
});
