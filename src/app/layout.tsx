import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI-CHHE 2026 — NIT Patna",
    template: "%s | AI-CHHE 2026",
  },
  description:
    "AI-CHHE 2026 at the Department of Civil Engineering, National Institute of Technology Patna — from conventional hydraulics to intelligent water systems.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
  >
    <body className="flex min-h-full flex-col bg-canvas text-navy">
      <AppProviders>{children}</AppProviders>
    </body>
  </html>
);

export default RootLayout;
