import type { Metadata } from "next";
import "./globals.css";
import { PlannerProvider } from "@/context/planner-context";

export const metadata: Metadata = {
  title: "CP → TP → ATP Planner",
  description: "Aplikasi bantu guru menyusun CP ke TP ke ATP",
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
      <body className="antialiased bg-gray-50 min-h-screen">
        <PlannerProvider>{children}</PlannerProvider>
      </body>
    </html>
  );
}