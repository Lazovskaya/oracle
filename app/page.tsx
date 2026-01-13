import OracleIcon from "@/components/OracleIcon";
import { Metadata } from "next";
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Market Oracle - AI-Powered Swing Trading Ideas for Stocks & Crypto",
  description: "Professional swing trading analysis (2-6 weeks) using Elliott Wave theory and AI. Get high-quality trade ideas for stocks and cryptocurrencies with clear entry points, stop losses, and profit targets.",
  keywords: "swing trading, Elliott Wave, trading ideas, stock analysis, crypto trading, market analysis, technical analysis",
  openGraph: {
    title: "Market Oracle - AI-Powered Trading Analysis",
    description: "Professional swing trading ideas using Elliott Wave theory and AI analysis",
    url: "https://finforesee.com",
    siteName: "Market Oracle",
    type: "website",
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('user_email')?.value;
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!(cookieEmail || session?.user?.email);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        <div className="flex justify-end mb-6">
          <Link href={isLoggedIn ? "/account" : "/login"} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{isLoggedIn ? 'My Account' : 'Login'}</span>
          </Link>
        </div>
        <div className="text-center mb-12">
          {/* Company Logo and Tagline */}
          <div className="mb-8">
            <h2 className="text-5xl font-bold italic mb-3 text-transparent tracking-[-0.03em]" style={{ fontFamily: '"PT Sans", "Helvetica Neue", Arial, sans-serif', fontWeight: 700, fontStyle: 'italic', backgroundImage: 'linear-gradient(to right, #1e3a8a, #60a5fa, #cbd5e1)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              FinForesee
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 tracking-[0.25em] uppercase font-medium italic">
              Financial Market Forecasting & Insights
            </p>
          </div>

          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <OracleIcon className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Market Oracle
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered swing trading insights for stocks & crypto. Get high-quality market analysis and trade recommendations powered by advanced language models.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <a href="/methodology" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Market Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Real-time market phase detection and wave structure analysis for informed trading decisions.
            </p>
          </a>

          <a href="/promo" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Trade Ideas</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Swing trading setups (2-6 weeks) with entry points, stop losses, and profit targets.
            </p>
          </a>
        </div>

        <div className="text-center">
          <a
            href="/oracle"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            View Latest Oracle Run →
          </a>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Automated runs once daily at 09:00 UTC
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm">
            <a href="/promo" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              View Track Record
            </a>
            <span className="text-gray-400">•</span>
            <a href="/pricing" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              See Pricing
            </a>
          </div>
        </div>

        <footer className="mt-16 text-center text-xs text-gray-400 dark:text-gray-500">
          <p>Elliott Wave analysis combined with AI-powered market insights</p>
          <p className="mt-1">Educational content • Not financial advice</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <a href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</a>
            <span>•</span>
            <a href="/faq" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">FAQ</a>
            <span>•</span>
            <a href="mailto:info@finforesee.com" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
