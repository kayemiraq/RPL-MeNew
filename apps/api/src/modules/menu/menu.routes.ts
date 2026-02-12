import { Router } from "express";
import { prisma } from "@menew/database";

export const menuRouter = Router();

// GET /api/menu/:storeSlug — Public endpoint for customers
menuRouter.get("/:storeSlug", async (req, res, next) => {
    try {
        const { storeSlug } = req.params;
        const { table } = req.query; // e.g., ?table=T5

        const store = await prisma.store.findFirst({
            where: { slug: storeSlug, isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                tenant: { select: { name: true, logo: true } },
            },
        });

        if (!store) {
            res.status(404).json({ success: false, error: "Restoran tidak ditemukan" });
            return;
        }

        // Resolve table number from QR parameter (e.g., "T5" → 5)
        let tableInfo = null;
        if (table) {
            const tableNum = parseInt((table as string).replace(/^T/i, ""), 10);
            if (!isNaN(tableNum)) {
                const tableRecord = await prisma.table.findFirst({
                    where: { storeId: store.id, number: tableNum },
                });
                tableInfo = tableRecord
                    ? { id: tableRecord.id, number: tableRecord.number, label: tableRecord.label }
                    : null;
            }
        }

        // Get categories with products
        const categories = await prisma.category.findMany({
            where: { storeId: store.id, isActive: true },
            include: {
                products: {
                    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        price: true,
                        image: true,
                        isAvailable: true,
                    },
                },
            },
            orderBy: { sortOrder: "asc" },
        });

        res.json({
            success: true,
            data: {
                store,
                table: tableInfo,
                categories,
            },
        });
    } catch (err) {
        next(err);
    }
});
