import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://oracle-blond.vercel.app'),
  title: {
    default: "Market Oracle - AI-Powered Trading Analysis for Stocks & Crypto",
    template: "%s | Market Oracle",
  },
  description: "Professional swing trading analysis using Elliott Wave theory and AI. Get high-quality trade ideas for stocks and cryptocurrencies with clear entry points, stop losses, and profit targets.",
  keywords: ["swing trading", "Elliott Wave", "trading ideas", "stock analysis", "crypto trading", "market analysis", "technical analysis", "AI trading"],
  authors: [{ name: "Market Oracle" }],
  creator: "Market Oracle",
  publisher: "Market Oracle",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oracle-blond.vercel.app',
    siteName: 'Market Oracle',
    title: 'Market Oracle - AI-Powered Trading Analysis',
    description: 'Professional swing trading ideas using Elliott Wave theory and AI analysis',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Oracle - AI Trading Analysis',
    description: 'Professional swing trading ideas for stocks & crypto',
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
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
