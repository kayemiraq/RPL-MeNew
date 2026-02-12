import { Router } from "express";
import { prisma } from "@menew/database";
import { createOrderSchema, updateOrderStatusSchema } from "@menew/shared";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";
import { Server as SocketIOServer } from "socket.io";

export const orderRouter = Router();

// POST /api/orders — Public (guest ordering)
orderRouter.post("/", async (req, res, next) => {
    try {
        const data = createOrderSchema.parse(req.body);

        // Resolve store from slug
        const store = await prisma.store.findFirst({
            where: { slug: data.storeSlug, isActive: true },
        });

        if (!store) {
            res.status(404).json({ success: false, error: "Store tidak ditemukan" });
            return;
        }

        // Resolve table
        let tableId = null;
        if (data.tableNumber) {
            const table = await prisma.table.findFirst({
                where: { storeId: store.id, number: data.tableNumber },
            });
            tableId = table?.id || null;
        }

        // Fetch product prices & validate availability
        const productIds = data.items.map((i) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, storeId: store.id },
        });

        if (products.length !== productIds.length) {
            res.status(400).json({
                success: false,
                error: "Beberapa produk tidak ditemukan di store ini",
            });
            return;
        }

        const unavailable = products.filter((p: any) => !p.isAvailable);
        if (unavailable.length > 0) {
            res.status(400).json({
                success: false,
                error: `Produk berikut sedang habis: ${unavailable.map((p: any) => p.name).join(", ")}`,
            });
            return;
        }

        // Calculate total
        const priceMap = new Map<string, number>(
            products.map((p: any) => [p.id, Number(p.price)])
        );
        const totalAmount = data.items.reduce(
            (sum: number, item) => {
                const price = priceMap.get(item.productId) || 0;
                return sum + price * item.quantity;
            },
            0
        );

        // Generate order number
        const orderCount = await prisma.order.count({ where: { storeId: store.id } });
        const orderNumber = `ORD-${store.slug.toUpperCase().slice(0, 4)}-${String(orderCount + 1).padStart(5, "0")}`;

        const order = await prisma.order.create({
            data: {
                orderNumber,
                storeId: store.id,
                tableId,
                totalAmount,
                guestName: data.guestName,
                notes: data.notes,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: priceMap.get(item.productId) || 0,
                        notes: item.notes,
                    })),
                },
            },
            include: {
                items: { include: { product: { select: { name: true, image: true } } } },
                table: { select: { number: true, label: true } },
            },
        });

        // Emit new order to store dashboard via Socket.io
        const io: SocketIOServer = req.app.get("io");
        io.to(`store:${store.id}:orders`).emit("order:new", order);

        res.status(201).json({ success: true, data: order });
    } catch (err) {
        next(err);
    }
});

// GET /api/orders?storeId=... — Authenticated
orderRouter.get(
    "/",
    authenticate,
    authorize("OWNER", "MANAGER"),
    async (req: AuthRequest, res, next) => {
        try {
            const { storeId, status, page = "1", limit = "20" } = req.query;

            if (!storeId) {
                res.status(400).json({ success: false, error: "storeId diperlukan" });
                return;
            }

            const where: any = { storeId: storeId as string };
            if (status) where.status = status as string;

            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
            const take = parseInt(limit as string);

            const [orders, total] = await Promise.all([
                prisma.order.findMany({
                    where,
                    include: {
                        items: { include: { product: { select: { name: true, image: true } } } },
                        table: { select: { number: true, label: true } },
                    },
                    orderBy: { createdAt: "desc" },
                    skip,
                    take,
                }),
                prisma.order.count({ where }),
            ]);

            res.json({
                success: true,
                data: orders,
                pagination: {
                    page: parseInt(page as string),
                    limit: take,
                    total,
                    totalPages: Math.ceil(total / take),
                },
            });
        } catch (err) {
            next(err);
        }
    }
);

// PATCH /api/orders/:id/status
orderRouter.patch(
    "/:id/status",
    authenticate,
    authorize("OWNER", "MANAGER"),
    async (req: AuthRequest, res, next) => {
        try {
            const { status } = updateOrderStatusSchema.parse(req.body);

            const order = await prisma.order.update({
                where: { id: req.params.id },
                data: { status },
                include: {
                    items: { include: { product: { select: { name: true } } } },
                    table: { select: { number: true } },
                },
            });

            // Emit order status update
            const io: SocketIOServer = req.app.get("io");
            io.to(`store:${order.storeId}:orders`).emit("order:update", order);

            res.json({ success: true, data: order });
        } catch (err) {
            next(err);
        }
    }
);
