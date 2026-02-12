import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "MeNew — Digital Menu",
    description: "Lihat menu dan pesan langsung dari meja Anda. Tanpa download, tanpa registrasi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="id">
            <body>{children}</body>
        </html>
    );
}
