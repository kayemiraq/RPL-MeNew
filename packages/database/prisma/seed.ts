import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
    console.log("🌱 Seeding database...\n");

    // Find the first tenant and user
    const user = await prisma.user.findFirst({
        include: { tenant: true },
    });

    if (!user || !user.tenantId) {
        console.error("❌ Tidak ada user/tenant. Jalankan /api/auth/setup terlebih dahulu.");
        process.exit(1);
    }

    console.log(`👤 User: ${user.name} (${user.role})`);
    console.log(`🏢 Tenant: ${user.tenant?.name}\n`);

    // Create Store
    let store = await prisma.store.findFirst({
        where: { tenantId: user.tenantId },
    });

    if (!store) {
        store = await prisma.store.create({
            data: {
                name: "Kafe Nusantara",
                slug: "kafe-nusantara",
                address: "Jl. Contoh No. 123, Jakarta",
                phone: "08123456789",
                description: "Kafe dengan menu nusantara modern",
                tenantId: user.tenantId,
            },
        });
        console.log(`✅ Store dibuat: ${store.name} (slug: ${store.slug})`);
    } else {
        console.log(`⏩ Store sudah ada: ${store.name}`);
    }

    // Create Categories
    const categoryNames = [
        { name: "Makanan", slug: "makanan", sortOrder: 1 },
        { name: "Minuman", slug: "minuman", sortOrder: 2 },
        { name: "Snack", slug: "snack", sortOrder: 3 },
        { name: "Dessert", slug: "dessert", sortOrder: 4 },
    ];

    for (const cat of categoryNames) {
        const existing = await prisma.category.findFirst({
            where: { storeId: store.id, slug: cat.slug },
        });

        if (!existing) {
            await prisma.category.create({
                data: {
                    name: cat.name,
                    slug: cat.slug,
                    sortOrder: cat.sortOrder,
                    storeId: store.id,
                },
            });
            console.log(`✅ Kategori dibuat: ${cat.name}`);
        } else {
            console.log(`⏩ Kategori sudah ada: ${cat.name}`);
        }
    }

    // Create Tables
    for (let i = 1; i <= 5; i++) {
        const existing = await prisma.table.findFirst({
            where: { storeId: store.id, number: i },
        });

        if (!existing) {
            await prisma.table.create({
                data: {
                    number: i,
                    label: `Meja ${i}`,
                    storeId: store.id,
                },
            });
            console.log(`✅ Meja dibuat: Meja ${i}`);
        } else {
            console.log(`⏩ Meja sudah ada: Meja ${i}`);
        }
    }

    console.log("\n🎉 Seed selesai!");
    console.log(`\n📌 Gunakan URL berikut untuk akses menu:`);
    console.log(`   http://localhost:3000/menu/${store.slug}/T1`);
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
