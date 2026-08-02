import type { Metadata } from "next";
import "./globals.css";
import { PlannerProvider } from "@/context/planner-context";
import TopBar from "@/components/TopBar";
import BrandBar from "@/components/BrandBar";

export const metadata: Metadata = {
  title: "CP → TP → ATP Planner — PKBM Al Umm Barabai",
  description:
    "Aplikasi bantu guru menyusun CP ke TP ke ATP — PKBM Al Umm Barabai, Program Qira'atul Qur'an (Paket A Setara SD)",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50 min-h-screen flex flex-col">
        <PlannerProvider>
          <BrandBar />
          <TopBar />
          <div className="flex-1">{children}</div>
        </PlannerProvider>
      </body>
    </html>
  );
}