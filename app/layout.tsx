import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import PrivacyBanner from "@/components/PrivacyBanner";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IskoMart",
  description: "A marketplace for PUP students",
  icons: {
    icon: "/logos/logo-removebg-preview.png",
    apple: "/logos/logo-removebg-preview.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}<SiteFooter /><Suspense fallback={null}><PrivacyBanner /></Suspense></body>
    </html>
  );
}
