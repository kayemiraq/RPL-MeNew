"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Menunggu", color: "text-yellow-700", bg: "bg-yellow-50" },
    CONFIRMED: { label: "Dikonfirmasi", color: "text-blue-700", bg: "bg-blue-50" },
    PREPARING: { label: "Diproses", color: "text-orange-700", bg: "bg-orange-50" },
    READY: { label: "Siap", color: "text-green-700", bg: "bg-green-50" },
    SERVED: { label: "Disajikan", color: "text-gray-700", bg: "bg-gray-50" },
    CANCELLED: { label: "Dibatalkan", color: "text-red-700", bg: "bg-red-50" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [storeId, setStoreId] = useState("");
    const [stores, setStores] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState("");

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
        const statusParam = filterStatus ? `&status=${filterStatus}` : "";
        api.get(`/orders?storeId=${storeId}${statusParam}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setOrders(data.data);
        });
    }, [storeId, filterStatus]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        const res = await api.patch(`/orders/${orderId}/status`, {
            status: newStatus,
        });
        const data = await res.json();
        if (data.success) {
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
        }
    };

    const nextStatus: Record<string, string> = {
        PENDING: "CONFIRMED",
        CONFIRMED: "PREPARING",
        PREPARING: "READY",
        READY: "SERVED",
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-menew-navy">Pesanan</h1>
                    <p className="text-sm text-menew-slate">
                        Kelola pesanan masuk secara real-time
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
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-menew-cream rounded-xl text-sm"
                    >
                        <option value="">Semua Status</option>
                        {Object.entries(statusConfig).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {orders.map((order, i) => {
                    const sc = statusConfig[order.status] || statusConfig.PENDING;
                    return (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between flex-wrap gap-3">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-menew-navy">
                                            {order.orderNumber}
                                        </h3>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${sc.color} ${sc.bg}`}>
                                            {sc.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-menew-slate mt-1">
                                        {order.table ? `Meja ${order.table.number}` : "Tanpa meja"}
                                        {order.guestName && ` • ${order.guestName}`}
                                        {" • "}
                                        {new Date(order.createdAt).toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-menew-terracotta">
                                        Rp{Number(order.totalAmount).toLocaleString("id-ID")}
                                    </p>
                                    {nextStatus[order.status] && (
                                        <button
                                            onClick={() => updateStatus(order.id, nextStatus[order.status])}
                                            className="mt-1 px-3 py-1.5 bg-menew-navy text-white text-xs font-medium rounded-lg hover:bg-menew-slate transition-colors"
                                        >
                                            → {statusConfig[nextStatus[order.status]]?.label}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                {order.items?.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between text-sm py-1 px-3 bg-menew-offwhite rounded-lg"
                                    >
                                        <span className="text-menew-navy">
                                            {item.quantity}x {item.product?.name}
                                        </span>
                                        <span className="text-menew-slate">
                                            Rp{(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}

                {orders.length === 0 && (
                    <div className="text-center py-16 text-menew-slate">
                        <p className="text-4xl mb-3">📋</p>
                        <p>Belum ada pesanan{filterStatus ? " dengan status ini" : ""}.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
