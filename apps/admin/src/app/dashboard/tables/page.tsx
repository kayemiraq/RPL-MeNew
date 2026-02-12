"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function TablesPage() {
    const [tables, setTables] = useState<any[]>([]);
    const [storeId, setStoreId] = useState("");
    const [stores, setStores] = useState<any[]>([]);
    const [newTableNumber, setNewTableNumber] = useState("");
    const [newTableLabel, setNewTableLabel] = useState("");

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
        api.get(`/tables?storeId=${storeId}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setTables(data.data);
        });
    }, [storeId]);

    const addTable = async () => {
        if (!newTableNumber) return;
        const res = await api.post(`/tables?storeId=${storeId}`, {
            number: parseInt(newTableNumber),
            label: newTableLabel || undefined,
        });
        const data = await res.json();
        if (data.success) {
            setTables((prev) => [...prev, data.data]);
            setNewTableNumber("");
            setNewTableLabel("");
        }
    };

    const deleteTable = async (tableId: string) => {
        const res = await api.delete(`/tables/${tableId}`);
        const data = await res.json();
        if (data.success) {
            setTables((prev) => prev.filter((t) => t.id !== tableId));
        }
    };

    const store = stores.find((s) => s.id === storeId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-menew-navy">Manajemen Meja</h1>
                    <p className="text-sm text-menew-slate">Atur meja dan generate QR Code</p>
                </div>
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
            </div>

            {/* Add Table */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-menew-cream">
                <h3 className="text-sm font-semibold text-menew-navy mb-3">Tambah Meja</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        placeholder="No. Meja"
                        className="w-28 px-3 py-2 bg-menew-offwhite border border-menew-cream rounded-xl text-sm"
                    />
                    <input
                        value={newTableLabel}
                        onChange={(e) => setNewTableLabel(e.target.value)}
                        placeholder="Label (opsional)"
                        className="flex-1 px-3 py-2 bg-menew-offwhite border border-menew-cream rounded-xl text-sm"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={addTable}
                        className="px-4 py-2 bg-menew-terracotta text-white rounded-xl text-sm font-medium"
                    >
                        + Tambah
                    </motion.button>
                </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {tables.map((table, i) => (
                    <motion.div
                        key={table.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-menew-cream text-center group relative hover:shadow-md transition-all"
                    >
                        <button
                            onClick={() => deleteTable(table.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                        >
                            ✕
                        </button>
                        <div className="w-12 h-12 bg-menew-cream rounded-xl flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-menew-navy">
                                {table.number}
                            </span>
                        </div>
                        <p className="text-xs font-medium text-menew-navy">
                            Meja {table.number}
                        </p>
                        {table.label && (
                            <p className="text-xs text-menew-slate">{table.label}</p>
                        )}
                        <p className="text-[10px] text-menew-slate mt-2 bg-menew-offwhite rounded-lg py-1 px-2">
                            /menu/{store?.slug}/T{table.number}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
