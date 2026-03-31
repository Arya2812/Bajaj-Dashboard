import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Find My Retailer — Bajaj Electricals",
  description: "Retailer classification and potential scoring tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen" style={{ background: "#EBEFF5" }}>
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
