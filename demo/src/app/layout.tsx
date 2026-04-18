import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: `${site.product} — career intelligence workspace`,
  description:
    "ForgeWind turns repository context and profile signal into momentum: narratives, matches, and a calmer career operating system.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body>{children}</body>
    </html>
  );
}
