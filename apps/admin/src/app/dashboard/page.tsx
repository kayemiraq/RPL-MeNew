"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface StoreStats {
    id: string;
    name: string;
    _count: { tables: number; products: number; orders: number };
}

export default function DashboardPage() {
    const [stores, setStores] = useState<StoreStats[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));

        api.get("/stores").then(async (res) => {
            const data = await res.json();
            if (data.success) setStores(data.data);
        });
    }, []);

    const totalProducts = stores.reduce((s, st) => s + st._count.products, 0);
    const totalOrders = stores.reduce((s, st) => s + st._count.orders, 0);
    const totalTables = stores.reduce((s, st) => s + st._count.tables, 0);

    const stats = [
        {
            label: "Total Store",
            value: stores.length,
            icon: "🏪",
            color: "from-menew-terracotta to-menew-camel",
        },
        {
            label: "Total Produk",
            value: totalProducts,
            icon: "📦",
            color: "from-menew-slate to-menew-navy",
        },
        {
            label: "Total Pesanan",
            value: totalOrders,
            icon: "📋",
            color: "from-menew-camel to-menew-terracotta",
        },
        {
            label: "Total Meja",
            value: totalTables,
            icon: "🪑",
            color: "from-menew-navy to-menew-slate",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-menew-navy to-menew-slate rounded-2xl p-6 text-white shadow-xl"
            >
                <h1 className="text-2xl font-bold">
                    Selamat datang, {user?.name || "Admin"} 👋
                </h1>
                <p className="text-white/70 mt-1">
                    Kelola menu digital Anda dari sini. Semua update akan tersinkronisasi secara real-time.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-menew-slate">{stat.label}</p>
                                <p className="text-3xl font-bold text-menew-navy mt-1">
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Store List */}
            <div>
                <h2 className="text-lg font-semibold text-menew-navy mb-4">
                    Store Anda
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map((store, i) => (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream hover:shadow-md hover:border-menew-terracotta/30 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-menew-cream rounded-xl flex items-center justify-center group-hover:bg-menew-terracotta/10 transition-colors">
                                    <span className="text-lg">🏪</span>
                                </div>
                                <h3 className="font-semibold text-menew-navy">{store.name}</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-menew-offwhite rounded-lg py-2">
                                    <p className="text-lg font-bold text-menew-navy">
                                        {store._count.products}
                                    </p>
                                    <p className="text-xs text-menew-slate">Produk</p>
                                </div>
                                <div className="bg-menew-offwhite rounded-lg py-2">
                                    <p className="text-lg font-bold text-menew-navy">
                                        {store._count.orders}
                                    </p>
                                    <p className="text-xs text-menew-slate">Pesanan</p>
                                </div>
                                <div className="bg-menew-offwhite rounded-lg py-2">
                                    <p className="text-lg font-bold text-menew-navy">
                                        {store._count.tables}
                                    </p>
                                    <p className="text-xs text-menew-slate">Meja</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {stores.length === 0 && (
                        <div className="col-span-full text-center py-12 text-menew-slate">
                            <p className="text-4xl mb-3">🏪</p>
                            <p>Belum ada store. Hubungi admin untuk setup.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
