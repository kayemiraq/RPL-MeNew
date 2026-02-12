import { Router } from "express";
import { prisma } from "@menew/database";
import { createCategorySchema, updateCategorySchema } from "@menew/shared";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const categoryRouter = Router();

categoryRouter.use(authenticate, authorize("OWNER", "MANAGER"));

// GET /api/categories?storeId=...
categoryRouter.get("/", async (req: AuthRequest, res, next) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const categories = await prisma.category.findMany({
            where: { storeId: storeId as string },
            include: { _count: { select: { products: true } } },
            orderBy: { sortOrder: "asc" },
        });

        res.json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
});

// POST /api/categories?storeId=...
categoryRouter.post("/", async (req: AuthRequest, res, next) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const data = createCategorySchema.parse(req.body);

        const category = await prisma.category.create({
            data: { ...data, storeId: storeId as string },
        });

        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
});

// PATCH /api/categories/:id
categoryRouter.patch("/:id", async (req, res, next) => {
    try {
        const data = updateCategorySchema.parse(req.body);
        const category = await prisma.category.update({
            where: { id: req.params.id },
            data,
        });
        res.json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/categories/:id
categoryRouter.delete("/:id", async (req, res, next) => {
    try {
        await prisma.category.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (err) {
        next(err);
    }
});
