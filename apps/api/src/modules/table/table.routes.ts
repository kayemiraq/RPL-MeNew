import { Router } from "express";
import { prisma } from "@menew/database";
import { createTableSchema } from "@menew/shared";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const tableRouter = Router();

tableRouter.use(authenticate, authorize("OWNER", "MANAGER"));

// GET /api/tables?storeId=...
tableRouter.get("/", async (req, res, next) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const tables = await prisma.table.findMany({
            where: { storeId: storeId as string },
            orderBy: { number: "asc" },
        });

        // Generate QR Code URLs
        const store = await prisma.store.findUnique({
            where: { id: storeId as string },
            select: { slug: true, tenant: { select: { slug: true } } },
        });

        const tablesWithQR = tables.map((table: any) => ({
            ...table,
            qrUrl: `/menu/${store?.slug}/T${table.number}`,
        }));

        res.json({ success: true, data: tablesWithQR });
    } catch (err) {
        next(err);
    }
});

// POST /api/tables?storeId=...
tableRouter.post("/", async (req, res, next) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const data = createTableSchema.parse(req.body);

        const table = await prisma.table.create({
            data: { ...data, storeId: storeId as string },
        });

        res.status(201).json({ success: true, data: table });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/tables/:id
tableRouter.delete("/:id", async (req, res, next) => {
    try {
        await prisma.table.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Meja berhasil dihapus" });
    } catch (err) {
        next(err);
    }
});
