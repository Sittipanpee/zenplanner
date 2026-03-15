/**
 * Root Layout
 * Includes Zen design tokens, fonts, and LIFF provider
 */

import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LIFFProvider } from "@/components/liff/liff-provider";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-thai",
  subsets: ["thai"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZenPlanner — Your Personalized Planner",
  description: "Discover your spirit animal and create a personalized planner that fits your lifestyle",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`
          ${cormorant.variable} ${nunito.variable} ${notoSansThai.variable} ${jetbrainsMono.variable}
          font-body bg-zen-bg text-zen-text
          min-h-screen
          pt-safe-top pb-safe-bottom
        `}
      >
        <LIFFProvider>
          {children}
        </LIFFProvider>
      </body>
    </html>
  );
}