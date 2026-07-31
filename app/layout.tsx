import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CP TP ATP Planner",
  description: "Aplikasi bantu guru menyusun CP ke TP ke ATP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}