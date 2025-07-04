import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@/components/providers/HeroUIProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Powered Operating System for Small Business",
  description: "The first true AI-powered platform designed for small businesses. Unify your operations, automate chaos, and accelerate growth with our intelligent business operating system.",
  keywords: ["AI", "small business", "automation", "CRM", "business intelligence", "SMB platform"],
  authors: [{ name: "AI-Powered SMB Platform Team" }],
  creator: "AI-Powered SMB Platform",
  publisher: "AI-Powered SMB Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f3ff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1625" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
        suppressHydrationWarning
      >
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}
