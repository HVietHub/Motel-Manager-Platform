import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SkipToContent } from "@/components/shared/skip-to-content";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "HouseSea - Nền Tảng Quản Lý Nhà Trọ Thông Minh",
  description: "Kết nối chủ nhà và người thuê - Quản lý nhà trọ dễ dàng, hiệu quả",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <NextAuthProvider>
          <SkipToContent />
          {children}
          <ChatbotWidget />
          <Toaster position="top-right" richColors />
        </NextAuthProvider>
      </body>
    </html>
  );
}
