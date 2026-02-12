"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Login gagal");
                return;
            }

            localStorage.setItem("accessToken", data.data.accessToken);
            localStorage.setItem("refreshToken", data.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            router.push("/dashboard");
        } catch {
            setError("Gagal menghubungi server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-menew-navy via-menew-navy to-menew-slate">
            {/* Decorative shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-menew-terracotta/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-menew-slate/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-menew-camel/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative w-full max-w-md mx-4"
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-menew-terracotta to-menew-camel rounded-2xl mb-4 shadow-lg"
                        >
                            <span className="text-white font-bold text-2xl">M</span>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-menew-navy">MeNew</h1>
                        <p className="text-menew-slate mt-1 text-sm">
                            Masuk ke Dashboard Admin
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 bg-menew-offwhite border border-menew-cream rounded-xl text-menew-navy placeholder:text-menew-slate/50 focus:outline-none focus:ring-2 focus:ring-menew-terracotta/50 focus:border-menew-terracotta transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-menew-navy mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-menew-offwhite border border-menew-cream rounded-xl text-menew-navy placeholder:text-menew-slate/50 focus:outline-none focus:ring-2 focus:ring-menew-terracotta/50 focus:border-menew-terracotta transition-all"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-menew-terracotta to-menew-camel text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Memproses...
                                </span>
                            ) : (
                                "Masuk"
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-xs text-menew-slate mt-6">
                        © 2026 MeNew — Digital Menu Platform
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
