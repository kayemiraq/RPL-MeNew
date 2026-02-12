"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "@/lib/api";

const COLORS = ["#BC5528", "#7192A1", "#C08E66", "#042842", "#EADFCB", "#5a9cb5"];

export default function AnalyticsPage() {
    const [salesData, setSalesData] = useState<any>(null);
    const [affinityData, setAffinityData] = useState<any>(null);
    const [period, setPeriod] = useState("weekly");
    const [storeId, setStoreId] = useState("");
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        api.get("/stores").then(async (res) => {
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                setStores(data.data);
                setStoreId(data.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (!storeId) return;

        api.get(`/reports/sales?storeId=${storeId}&period=${period}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setSalesData(data.data);
        });

        api.get(`/reports/affinity?storeId=${storeId}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setAffinityData(data.data);
        });
    }, [storeId, period]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-menew-navy">Analitik & Laporan</h1>
                    <p className="text-sm text-menew-slate">
                        Insight penjualan dan tren bisnis
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {stores.length > 1 && (
                        <select
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            className="px-3 py-2 bg-white border border-menew-cream rounded-xl text-sm"
                        >
                            {stores.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                    <div className="flex bg-white border border-menew-cream rounded-xl overflow-hidden">
                        {["daily", "weekly", "monthly"].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-2 text-xs font-medium transition-colors ${period === p
                                        ? "bg-menew-terracotta text-white"
                                        : "text-menew-slate hover:text-menew-navy"
                                    }`}
                            >
                                {p === "daily" ? "Harian" : p === "weekly" ? "Mingguan" : "Bulanan"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {salesData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total Pendapatan", value: `Rp${salesData.summary.totalRevenue.toLocaleString("id-ID")}`, icon: "💰" },
                        { label: "Total Pesanan", value: salesData.summary.totalOrders, icon: "📋" },
                        { label: "Rata-rata Pesanan", value: `Rp${Math.round(salesData.summary.averageOrderValue).toLocaleString("id-ID")}`, icon: "📊" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <p className="text-xs text-menew-slate">{stat.label}</p>
                                    <p className="text-xl font-bold text-menew-navy">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream"
                >
                    <h3 className="text-sm font-semibold text-menew-navy mb-4">
                        Tren Penjualan
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={salesData?.salesByDate || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#7192A1" />
                            <YAxis tick={{ fontSize: 11 }} stroke="#7192A1" />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #EADFCB" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#BC5528"
                                strokeWidth={2.5}
                                dot={{ fill: "#BC5528", r: 4 }}
                                name="Pendapatan"
                            />
                            <Line
                                type="monotone"
                                dataKey="orders"
                                stroke="#7192A1"
                                strokeWidth={2}
                                dot={{ fill: "#7192A1", r: 3 }}
                                name="Jumlah Pesanan"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Peak Hours */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream"
                >
                    <h3 className="text-sm font-semibold text-menew-navy mb-4">
                        Jam Sibuk (Peak Hours)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={salesData?.peakHours || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 11 }}
                                stroke="#7192A1"
                                tickFormatter={(h) => `${h}:00`}
                            />
                            <YAxis tick={{ fontSize: 11 }} stroke="#7192A1" />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "1px solid #EADFCB" }}
                                labelFormatter={(h) => `Jam ${h}:00`}
                            />
                            <Bar dataKey="orders" fill="#042842" radius={[6, 6, 0, 0]} name="Pesanan" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream"
                >
                    <h3 className="text-sm font-semibold text-menew-navy mb-4">
                        Produk Terlaris
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={salesData?.topProducts || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="quantity"
                                nameKey="name"
                                label={({ name, percent }) =>
                                    `${name} (${(percent * 100).toFixed(0)}%)`
                                }
                                labelLine={false}
                            >
                                {(salesData?.topProducts || []).map((_: any, i: number) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Product Affinity */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream"
                >
                    <h3 className="text-sm font-semibold text-menew-navy mb-4">
                        Product Affinity (Sering Dibeli Bersama)
                    </h3>
                    {affinityData?.affinityPairs?.length > 0 ? (
                        <div className="space-y-3 max-h-[280px] overflow-y-auto">
                            {affinityData.affinityPairs.map((pair: any, i: number) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 bg-menew-offwhite rounded-xl"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-menew-navy">
                                                {pair.productA}
                                            </span>
                                            <span className="text-menew-slate">+</span>
                                            <span className="font-medium text-menew-navy">
                                                {pair.productB}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-menew-terracotta/10 text-menew-terracotta font-bold text-xs px-2.5 py-1 rounded-lg">
                                        {pair.count}x
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-menew-slate text-sm">
                            <p className="text-3xl mb-2">🔗</p>
                            <p>Belum cukup data untuk analisis</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
