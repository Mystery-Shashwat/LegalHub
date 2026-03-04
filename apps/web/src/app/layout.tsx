import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LegalHub - Find and Book Verified Indian Lawyers",
  description: "LegalHub connects you with top verified lawyers in India. Search by specialty, location, and book consultations instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">
            {children}
        </main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
