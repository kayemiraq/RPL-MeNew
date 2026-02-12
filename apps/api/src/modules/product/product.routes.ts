import { Router } from "express";
import { prisma } from "@menew/database";
import { createProductSchema, updateProductSchema } from "@menew/shared";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { upload } from "../../utils/upload";
import { Server as SocketIOServer } from "socket.io";

export const productRouter = Router();

productRouter.use(authenticate, authorize("OWNER", "MANAGER"));

// GET /api/products?storeId=...
productRouter.get("/", async (req: AuthRequest, res, next) => {
    try {
        const { storeId, categoryId } = req.query;
        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const where: any = { storeId: storeId as string };
        if (categoryId) where.categoryId = categoryId as string;

        const products = await prisma.product.findMany({
            where,
            include: { category: { select: { id: true, name: true } } },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        });

        res.json({ success: true, data: products });
    } catch (err) {
        next(err);
    }
});

// POST /api/products?storeId=... — with image upload
productRouter.post(
    "/",
    upload.single("image"),
    async (req: AuthRequest, res, next) => {
        try {
            const { storeId } = req.query;
            if (!storeId) {
                res.status(400).json({ success: false, error: "storeId diperlukan" });
                return;
            }

            const body = {
                ...req.body,
                price: parseFloat(req.body.price),
                sortOrder: req.body.sortOrder
                    ? parseInt(req.body.sortOrder, 10)
                    : undefined,
                isAvailable:
                    req.body.isAvailable !== undefined
                        ? req.body.isAvailable === "true"
                        : true,
            };

            const data = createProductSchema.parse(body);

            const imagePath = req.file
                ? `/uploads/menu/food/${req.file.filename}`
                : null;

            const product = await prisma.product.create({
                data: {
                    ...data,
                    image: imagePath,
                    storeId: storeId as string,
                },
                include: { category: { select: { id: true, name: true } } },
            });

            res.status(201).json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }
);

// PATCH /api/products/:id
productRouter.patch(
    "/:id",
    upload.single("image"),
    async (req: AuthRequest, res, next) => {
        try {
            const body: any = { ...req.body };
            if (body.price) body.price = parseFloat(body.price);
            if (body.sortOrder) body.sortOrder = parseInt(body.sortOrder, 10);
            if (body.isAvailable !== undefined)
                body.isAvailable = body.isAvailable === "true";

            const data = updateProductSchema.parse(body);
            const updateData: any = { ...data };

            if (req.file) {
                updateData.image = `/uploads/menu/food/${req.file.filename}`;
            }

            const product = await prisma.product.update({
                where: { id: req.params.id },
                data: updateData,
            });

            res.json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }
);

// PATCH /api/products/:id/availability — toggles stock (triggers Socket.io)
productRouter.patch(
    "/:id/availability",
    async (req: AuthRequest, res, next) => {
        try {
            const { isAvailable } = req.body;

            const product = await prisma.product.update({
                where: { id: req.params.id },
                data: { isAvailable },
                include: { category: { select: { name: true } } },
            });

            // Emit real-time stock update via Socket.io
            const io: SocketIOServer = req.app.get("io");
            io.to(`store:${product.storeId}`).emit("stock:update", {
                productId: product.id,
                name: product.name,
                isAvailable: product.isAvailable,
                category: product.category.name,
            });

            res.json({ success: true, data: product });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE /api/products/:id
productRouter.delete("/:id", async (req, res, next) => {
    try {
        await prisma.product.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Produk berhasil dihapus" });
    } catch (err) {
        next(err);
    }
});
