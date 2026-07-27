import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "作者作品合集",
  description: "发现不同作者的卡片、主题与气泡作品。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
