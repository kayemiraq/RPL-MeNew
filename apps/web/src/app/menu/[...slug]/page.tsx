"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: string;
    image: string | null;
    isAvailable: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    products: Product[];
}

interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
}

export default function MenuPage({
    params,
}: {
    params: { slug: string[] };
}) {
    const [storeSlug] = params.slug;
    const tableParam = params.slug[1]; // e.g., "T5"

    const [store, setStore] = useState<any>(null);
    const [tableInfo, setTableInfo] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [orderNotes, setOrderNotes] = useState("");
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Fetch menu data
    useEffect(() => {
        const tableQuery = tableParam ? `?table=${tableParam}` : "";
        fetch(`${API_URL}/menu/${storeSlug}${tableQuery}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setStore(data.data.store);
                    setTableInfo(data.data.table);
                    setCategories(data.data.categories);
                    if (data.data.categories.length > 0) {
                        setActiveCategory(data.data.categories[0].id);
                    }
                }
            })
            .finally(() => setLoading(false));
    }, [storeSlug, tableParam]);

    // Socket.io for real-time stock updates
    useEffect(() => {
        if (!store?.id) return;

        const newSocket = io("http://localhost:4000");
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join:store", store.id);
        });

        newSocket.on("stock:update", (data: { productId: string; isAvailable: boolean }) => {
            setCategories((prev: Category[]) =>
                prev.map((cat: Category) => ({
                    ...cat,
                    products: cat.products.map((p: Product) =>
                        p.id === data.productId ? { ...p, isAvailable: data.isAvailable } : p
                    ),
                }))
            );
        });

        return () => {
            newSocket.emit("leave:store", store.id);
            newSocket.disconnect();
        };
    }, [store?.id]);

    const addToCart = useCallback((product: Product) => {
        if (!product.isAvailable) return;
        setCart((prev: CartItem[]) => {
            const existing = prev.find((i: CartItem) => i.product.id === product.id);
            if (existing) {
                return prev.map((i: CartItem) =>
                    i.product.id === product.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const updateQuantity = useCallback((productId: string, delta: number) => {
        setCart((prev: CartItem[]) => {
            const updated = prev
                .map((i: CartItem) =>
                    i.product.id === productId
                        ? { ...i, quantity: i.quantity + delta }
                        : i
                )
                .filter((i: CartItem) => i.quantity > 0);
            return updated;
        });
    }, []);

    const totalItems = cart.reduce((s: number, i: CartItem) => s + i.quantity, 0);
    const totalPrice = cart.reduce(
        (s: number, i: CartItem) => s + Number(i.product.price) * i.quantity,
        0
    );

    const placeOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeSlug,
                    tableNumber: tableInfo?.number,
                    guestName: guestName || undefined,
                    notes: orderNotes || undefined,
                    items: cart.map((i: CartItem) => ({
                        productId: i.product.id,
                        quantity: i.quantity,
                    })),
                }),
            });

            const data = await res.json();
            if (data.success) {
                setOrderSuccess(true);
                setCart([]);
                setShowCart(false);
            }
        } catch {
            alert("Gagal mengirim pesanan. Coba lagi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-menew-offwhite">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-3 border-menew-terracotta border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-menew-offwhite px-4">
                <div className="text-center">
                    <p className="text-4xl mb-4">🍽️</p>
                    <h2 className="text-xl font-bold text-menew-navy">Restoran tidak ditemukan</h2>
                    <p className="text-menew-slate text-sm mt-1">Pastikan QR Code masih aktif</p>
                </div>
            </div>
        );
    }

    // Order success screen
    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-menew-offwhite px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-sm"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-menew-navy">Pesanan Terkirim! 🎉</h2>
                    <p className="text-menew-slate mt-2">
                        {tableInfo ? `Meja ${tableInfo.number}` : "Pesanan Anda"} sedang diproses.
                        Silakan tunggu sebentar.
                    </p>
                    <button
                        onClick={() => setOrderSuccess(false)}
                        className="mt-6 px-6 py-3 bg-menew-terracotta text-white font-medium rounded-2xl"
                    >
                        Pesan Lagi
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-menew-offwhite pb-24">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-menew-navy to-menew-slate text-white px-5 pt-8 pb-12 rounded-b-3xl shadow-xl"
            >
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <span className="text-xl font-bold">M</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{store.name}</h1>
                            <p className="text-white/60 text-xs">{store.tenant?.name}</p>
                        </div>
                    </div>
                    {tableInfo && (
                        <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 inline-flex items-center gap-2">
                            <span className="text-white/80 text-sm">📍 Meja {tableInfo.number}</span>
                            {tableInfo.label && (
                                <span className="text-white/50 text-xs">({tableInfo.label})</span>
                            )}
                        </div>
                    )}
                </div>
            </motion.header>

            <div className="max-w-lg mx-auto px-4 -mt-6">
                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-2 shadow-lg mb-6 flex gap-1 overflow-x-auto scrollbar-hide"
                >
                    {categories.map((cat: Category) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? "bg-menew-terracotta text-white shadow-md"
                                : "text-menew-slate hover:bg-menew-offwhite"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </motion.div>

                {/* Products */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                    >
                        {categories
                            .find((c: Category) => c.id === activeCategory)
                            ?.products.map((product: Product, i: number) => {
                                const inCart = cart.find((c: CartItem) => c.product.id === product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-menew-cream/50 hover:shadow-md transition-all ${!product.isAvailable ? "opacity-60" : ""
                                            }`}
                                    >
                                        <div className="flex">
                                            {/* Image */}
                                            <div className="w-28 h-28 flex-shrink-0 relative">
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:4000${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-menew-cream flex items-center justify-center text-3xl">
                                                        🍽️
                                                    </div>
                                                )}
                                                {!product.isAvailable && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute inset-0 bg-menew-navy/70 flex items-center justify-center"
                                                    >
                                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse-badge">
                                                            Habis
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 p-3 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-menew-navy text-sm leading-tight">
                                                        {product.name}
                                                    </h3>
                                                    {product.description && (
                                                        <p className="text-xs text-menew-slate mt-0.5 line-clamp-2">
                                                            {product.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-menew-terracotta font-bold text-sm">
                                                        Rp{Number(product.price).toLocaleString("id-ID")}
                                                    </p>
                                                    {product.isAvailable && (
                                                        <div className="flex items-center gap-1">
                                                            {inCart ? (
                                                                <div className="flex items-center bg-menew-offwhite rounded-xl overflow-hidden">
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() =>
                                                                            updateQuantity(product.id, -1)
                                                                        }
                                                                        className="w-8 h-8 flex items-center justify-center text-menew-terracotta font-bold hover:bg-menew-cream transition-colors"
                                                                    >
                                                                        −
                                                                    </motion.button>
                                                                    <span className="w-6 text-center text-sm font-semibold text-menew-navy">
                                                                        {inCart.quantity}
                                                                    </span>
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() =>
                                                                            updateQuantity(product.id, 1)
                                                                        }
                                                                        className="w-8 h-8 flex items-center justify-center text-menew-terracotta font-bold hover:bg-menew-cream transition-colors"
                                                                    >
                                                                        +
                                                                    </motion.button>
                                                                </div>
                                                            ) : (
                                                                <motion.button
                                                                    whileTap={{ scale: 0.85 }}
                                                                    onClick={() => addToCart(product)}
                                                                    className="w-8 h-8 bg-menew-terracotta text-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                                                                >
                                                                    +
                                                                </motion.button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Cart Floating Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-2"
                    >
                        <div className="max-w-lg mx-auto">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowCart(true)}
                                className="w-full bg-gradient-to-r from-menew-terracotta to-menew-camel text-white rounded-2xl p-4 shadow-xl flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                                        <span className="text-sm font-bold">{totalItems}</span>
                                    </div>
                                    <span className="font-medium">Lihat Keranjang</span>
                                </div>
                                <span className="font-bold">
                                    Rp{totalPrice.toLocaleString("id-ID")}
                                </span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCart(false)}
                            className="fixed inset-0 bg-black/40 z-40"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
                        >
                            <div className="max-w-lg mx-auto px-5 py-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-lg font-bold text-menew-navy">
                                        Keranjang Anda
                                    </h2>
                                    <button
                                        onClick={() => setShowCart(false)}
                                        className="w-8 h-8 bg-menew-offwhite rounded-full flex items-center justify-center text-menew-slate"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Cart Items */}
                                <div className="space-y-3 mb-5">
                                    {cart.map((item: CartItem) => (
                                        <div
                                            key={item.product.id}
                                            className="flex items-center gap-3 bg-menew-offwhite rounded-xl p-3"
                                        >
                                            <div className="w-14 h-14 rounded-xl bg-menew-cream overflow-hidden flex-shrink-0">
                                                {item.product.image ? (
                                                    <img
                                                        src={`http://localhost:4000${item.product.image}`}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">
                                                        🍽️
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-menew-navy truncate">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-xs text-menew-terracotta font-semibold">
                                                    Rp{Number(item.product.price).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                            <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="w-7 h-7 text-menew-terracotta text-sm font-bold"
                                                >
                                                    −
                                                </button>
                                                <span className="w-5 text-center text-xs font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="w-7 h-7 text-menew-terracotta text-sm font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Guest Name */}
                                <input
                                    value={guestName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestName(e.target.value)}
                                    placeholder="Nama Anda (opsional)"
                                    className="w-full px-4 py-3 bg-menew-offwhite border border-menew-cream rounded-xl text-sm mb-3"
                                />

                                {/* Notes */}
                                <textarea
                                    value={orderNotes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderNotes(e.target.value)}
                                    placeholder="Catatan (opsional, misal: tidak pedas)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-menew-offwhite border border-menew-cream rounded-xl text-sm mb-5 resize-none"
                                />

                                {/* Total */}
                                <div className="flex items-center justify-between py-3 border-t border-menew-cream">
                                    <span className="text-menew-slate text-sm">Total</span>
                                    <span className="text-xl font-bold text-menew-navy">
                                        Rp{totalPrice.toLocaleString("id-ID")}
                                    </span>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={placeOrder}
                                    disabled={submitting}
                                    className="w-full mt-3 py-4 bg-gradient-to-r from-menew-terracotta to-menew-camel text-white font-semibold rounded-2xl shadow-xl disabled:opacity-50"
                                >
                                    {submitting ? "Mengirim..." : "Pesan Sekarang 🚀"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
