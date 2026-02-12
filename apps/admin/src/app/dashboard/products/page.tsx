"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@menew/shared";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface Category {
    id: string;
    name: string;
}

export default function ProductsPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [storeId, setStoreId] = useState("");
    const [stores, setStores] = useState<any[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateProductInput>({
        resolver: zodResolver(createProductSchema),
        defaultValues: { isAvailable: true, sortOrder: 0 },
    });

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

        api.get(`/categories?storeId=${storeId}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setCategories(data.data);
        });

        api.get(`/products?storeId=${storeId}`).then(async (res) => {
            const data = await res.json();
            if (data.success) setProducts(data.data);
        });
    }, [storeId]);

    const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: CreateProductInput) => {
        setSubmitLoading(true);
        setSubmitMessage("");

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("slug", data.slug);
            formData.append("price", data.price.toString());
            formData.append("categoryId", data.categoryId);
            if (data.description) formData.append("description", data.description);
            if (data.sortOrder !== undefined) formData.append("sortOrder", data.sortOrder.toString());
            formData.append("isAvailable", String(data.isAvailable));
            if (imageFile) formData.append("image", imageFile);

            const res = await api.post(`/products?storeId=${storeId}`, formData);
            const result = await res.json();

            if (result.success) {
                setSubmitMessage("Produk berhasil ditambahkan! ✅");
                setProducts((prev) => [result.data, ...prev]);
                reset();
                setImageFile(null);
                setImagePreview(null);
                setTimeout(() => setShowForm(false), 1500);
            } else {
                setSubmitMessage(`Error: ${result.error}`);
            }
        } catch {
            setSubmitMessage("Gagal menambahkan produk");
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleAvailability = async (productId: string, isAvailable: boolean) => {
        const res = await api.patch(`/products/${productId}/availability`, {
            isAvailable: !isAvailable,
        });
        const data = await res.json();
        if (data.success) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === productId ? { ...p, isAvailable: !isAvailable } : p
                )
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-menew-navy">Manajemen Produk</h1>
                    <p className="text-sm text-menew-slate">
                        Kelola menu makanan dan minuman
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {stores.length > 1 && (
                        <select
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            className="px-3 py-2 bg-white border border-menew-cream rounded-xl text-sm text-menew-navy focus:ring-2 focus:ring-menew-terracotta/50"
                        >
                            {stores.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2.5 bg-gradient-to-r from-menew-terracotta to-menew-camel text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all text-sm"
                    >
                        {showForm ? "Tutup Form" : "+ Tambah Produk"}
                    </motion.button>
                </div>
            </div>

            {/* Add Product Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-menew-cream"
                >
                    <h3 className="text-lg font-semibold text-menew-navy mb-4">
                        Tambah Produk Baru
                    </h3>

                    {submitMessage && (
                        <div
                            className={`p-3 rounded-lg mb-4 text-sm ${submitMessage.includes("✅")
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                        >
                            {submitMessage}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Nama Produk *
                            </label>
                            <input
                                {...register("name")}
                                className="w-full px-4 py-2.5 bg-menew-offwhite border border-menew-cream rounded-xl text-sm focus:ring-2 focus:ring-menew-terracotta/50 focus:border-menew-terracotta"
                                placeholder="Nasi Goreng Spesial"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Slug *
                            </label>
                            <input
                                {...register("slug")}
                                className="w-full px-4 py-2.5 bg-menew-offwhite border border-menew-cream rounded-xl text-sm focus:ring-2 focus:ring-menew-terracotta/50 focus:border-menew-terracotta"
                                placeholder="nasi-goreng-spesial"
                            />
                            {errors.slug && (
                                <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Harga (Rp) *
                            </label>
                            <input
                                type="number"
                                {...register("price", { valueAsNumber: true })}
                                className="w-full px-4 py-2.5 bg-menew-offwhite border border-menew-cream rounded-xl text-sm focus:ring-2 focus:ring-menew-terracotta/50 focus:border-menew-terracotta"
                                placeholder="25000"
                            />
                            {errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Kategori *
                            </label>
                            <select
                                {...register("categoryId")}
                                className="w-full px-4 py-2.5 bg-menew-offwhite border border-menew-cream rounded-xl text-sm focus:ring-2 focus:ring-menew-terracotta/50"
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                {...register("description")}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-menew-offwhite border border-menew-cream rounded-xl text-sm focus:ring-2 focus:ring-menew-terracotta/50 resize-none"
                                placeholder="Nasi goreng dengan bumbu spesial dan topping telur mata sapi..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1">
                                Gambar Produk
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex-1 flex items-center justify-center px-4 py-6 bg-menew-offwhite border-2 border-dashed border-menew-cream rounded-xl cursor-pointer hover:border-menew-terracotta/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageChange}
                                        className="hidden"
                                    />
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto text-menew-slate mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-xs text-menew-slate">
                                            Klik untuk upload (max 5MB)
                                        </p>
                                    </div>
                                </label>
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-20 h-20 rounded-xl object-cover border border-menew-cream"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isAvailable")}
                                    className="w-4 h-4 rounded border-menew-cream text-menew-terracotta focus:ring-menew-terracotta"
                                />
                                <span className="text-sm text-menew-navy">Tersedia</span>
                            </label>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    reset();
                                }}
                                className="px-5 py-2.5 text-sm text-menew-slate hover:text-menew-navy transition-colors"
                            >
                                Batal
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={submitLoading}
                                className="px-6 py-2.5 bg-gradient-to-r from-menew-terracotta to-menew-camel text-white font-medium rounded-xl shadow-lg text-sm disabled:opacity-50"
                            >
                                {submitLoading ? "Menyimpan..." : "Simpan Produk"}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Product List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-menew-cream hover:shadow-md transition-all group"
                    >
                        <div className="h-40 bg-menew-cream relative overflow-hidden">
                            {product.image ? (
                                <img
                                    src={`http://localhost:4000${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                    🍽️
                                </div>
                            )}
                            {!product.isAvailable && (
                                <div className="absolute inset-0 bg-menew-navy/60 flex items-center justify-center">
                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        Habis
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-menew-navy text-sm">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-menew-slate mt-0.5">
                                        {product.category?.name}
                                    </p>
                                </div>
                                <p className="text-menew-terracotta font-bold text-sm">
                                    Rp{Number(product.price).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={() =>
                                        toggleAvailability(product.id, product.isAvailable)
                                    }
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${product.isAvailable
                                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                                            : "bg-red-50 text-red-700 hover:bg-red-100"
                                        }`}
                                >
                                    {product.isAvailable ? "✓ Tersedia" : "✕ Habis"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {products.length === 0 && (
                    <div className="col-span-full text-center py-16 text-menew-slate">
                        <p className="text-4xl mb-3">📦</p>
                        <p>Belum ada produk. Tambahkan produk pertama Anda!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
