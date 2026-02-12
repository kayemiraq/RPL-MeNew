"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        label: "Produk",
        href: "/dashboard/products",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
        ),
    },
    {
        label: "Pesanan",
        href: "/dashboard/orders",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
    {
        label: "Analitik",
        href: "/dashboard/analytics",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        label: "Meja",
        href: "/dashboard/tables",
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        ),
    },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <motion.aside
                animate={{ width: sidebarOpen ? 260 : 72 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-menew-navy flex flex-col h-full shadow-xl z-20"
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-menew-terracotta to-menew-camel rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="text-white font-bold text-xl"
                            >
                                MeNew
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive
                                        ? "bg-menew-terracotta text-white shadow-lg shadow-menew-terracotta/30"
                                        : "text-white/60 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -5 }}
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle & Logout */}
                <div className="px-3 py-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all w-full"
                    >
                        <svg className={`w-5 h-5 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                                    Tutup Menu
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">
                                    Keluar
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-menew-offwhite">
                {/* Header */}
                <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-menew-cream px-6 py-4 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-menew-navy">
                            {navItems.find((n) => n.href === pathname)?.label || "Dashboard"}
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-menew-slate to-menew-navy rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">A</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
