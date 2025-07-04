import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlassmorphismProvider from "@/components/providers/HeroUIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered SMB Platform",
  description: "The first true AI-powered operating system designed to give small business owners their time back",
  keywords: ["AI", "SMB", "Business", "Automation", "Glassmorphism"],
  authors: [{ name: "AI-Powered SMB Platform Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlassmorphismProvider>
          {children}
        </GlassmorphismProvider>
      </body>
    </html>
  );
}
