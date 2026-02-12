import { Router } from "express";
import { prisma } from "@menew/database";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { authorize } from "../../middleware/rbac";

export const reportRouter = Router();

reportRouter.use(authenticate, authorize("OWNER", "MANAGER"));

// GET /api/reports/sales?storeId=...&period=weekly
reportRouter.get("/sales", async (req: AuthRequest, res, next) => {
    try {
        const { storeId, period = "weekly" } = req.query;

        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case "daily":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case "monthly":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "weekly":
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
        }

        const orders = await prisma.order.findMany({
            where: {
                storeId: storeId as string,
                createdAt: { gte: startDate },
                status: { not: "CANCELLED" },
            },
            include: {
                items: {
                    include: { product: { select: { name: true, categoryId: true } } },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        // Aggregate sales by date
        const salesByDate: Record<string, { date: string; revenue: number; orders: number }> = {};
        orders.forEach((order: any) => {
            const dateKey = order.createdAt.toISOString().split("T")[0];
            if (!salesByDate[dateKey]) {
                salesByDate[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
            }
            salesByDate[dateKey].revenue += Number(order.totalAmount);
            salesByDate[dateKey].orders += 1;
        });

        // Peak hours analysis
        const hourlyData: Record<number, { hour: number; orders: number; revenue: number }> = {};
        orders.forEach((order: any) => {
            const hour = order.createdAt.getHours();
            if (!hourlyData[hour]) {
                hourlyData[hour] = { hour, orders: 0, revenue: 0 };
            }
            hourlyData[hour].orders += 1;
            hourlyData[hour].revenue += Number(order.totalAmount);
        });

        // Top products
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        orders.forEach((order: any) => {
            order.items.forEach((item: any) => {
                const key = item.productId;
                if (!productSales[key]) {
                    productSales[key] = { name: item.product.name, quantity: 0, revenue: 0 };
                }
                productSales[key].quantity += item.quantity;
                productSales[key].revenue += Number(item.price) * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        res.json({
            success: true,
            data: {
                summary: {
                    totalRevenue: orders.reduce((s: number, o: any) => s + Number(o.totalAmount), 0),
                    totalOrders: orders.length,
                    averageOrderValue:
                        orders.length > 0
                            ? orders.reduce((s: number, o: any) => s + Number(o.totalAmount), 0) / orders.length
                            : 0,
                },
                salesByDate: Object.values(salesByDate),
                peakHours: Object.values(hourlyData).sort((a, b) => a.hour - b.hour),
                topProducts,
            },
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/reports/affinity?storeId=...
reportRouter.get("/affinity", async (req: AuthRequest, res, next) => {
    try {
        const { storeId } = req.query;

        if (!storeId) {
            res.status(400).json({ success: false, error: "storeId diperlukan" });
            return;
        }

        // Get orders with items to calculate co-purchase patterns
        const orders = await prisma.order.findMany({
            where: { storeId: storeId as string, status: { not: "CANCELLED" } },
            include: {
                items: {
                    include: { product: { select: { id: true, name: true } } },
                },
            },
        });

        // Calculate product pair frequency
        const pairCount: Record<string, { productA: string; productB: string; count: number }> = {};

        orders.forEach((order: any) => {
            const items = order.items;
            for (let i = 0; i < items.length; i++) {
                for (let j = i + 1; j < items.length; j++) {
                    const [a, b] = [items[i].product, items[j].product].sort((x, y) =>
                        x.name.localeCompare(y.name)
                    );
                    const key = `${a.id}:${b.id}`;
                    if (!pairCount[key]) {
                        pairCount[key] = { productA: a.name, productB: b.name, count: 0 };
                    }
                    pairCount[key].count += 1;
                }
            }
        });

        const affinityPairs = Object.values(pairCount)
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        res.json({
            success: true,
            data: { affinityPairs, totalOrdersAnalyzed: orders.length },
        });
    } catch (err) {
        next(err);
    }
});
