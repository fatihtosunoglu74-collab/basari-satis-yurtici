import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://basari-satis-yurtici.vercel.app"),
  title: "Yurtiçi Sevkiyat Takibi — Başarı Otomotiv",
  description: "Satış ekibi için canlı yurtiçi sevkiyat durumu: giden, gitmeyen, toplaması devam eden siparişler.",
  openGraph: {
    title: "Yurtiçi Sevkiyat Takibi — Başarı Otomotiv",
    description: "Satış ekibi için canlı yurtiçi sevkiyat durumu: giden, gitmeyen, toplaması devam eden siparişler.",
    url: "https://basari-satis-yurtici.vercel.app",
    siteName: "Başarı Otomotiv",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yurtiçi Sevkiyat Takibi — Başarı Otomotiv",
    description: "Satış ekibi için canlı yurtiçi sevkiyat durumu.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
