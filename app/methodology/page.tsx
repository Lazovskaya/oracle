import { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Our Methodology - How We Analyze Markets",
  description: "Learn about our swing trading approach using Elliott Wave theory, why we focus on 2-6 week horizons, and how we identify high-probability setups.",
  openGraph: {
    title: "Our Methodology - Market Oracle",
    description: "Understanding our swing trading approach and Elliott Wave analysis",
    url: "https://oracle-trade.vercel.app/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <Link href="/account" className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Account</span>
          </Link>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How We Think
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
            Our methodology explained: why we focus on swing trading and how Elliott Wave theory guides our analysis.
          </p>

          <div className="space-y-10">
            {/* Time Horizon */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  2-6 Week Time Horizon
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-15">
                We focus on swing trading with a <strong>2-6 week time horizon</strong>. This timeframe offers the sweet spot between:
              </p>
              <ul className="mt-4 ml-15 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Reduced noise:</strong> Longer than intraday trading, allowing clearer patterns to emerge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Manageable exposure:</strong> Shorter than long-term investing, limiting overnight and weekend risks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Better risk/reward:</strong> Captures meaningful price moves while maintaining defined stop losses</span>
                </li>
              </ul>
            </section>

            {/* Why Not Intraday */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Why Not Intraday Trading?
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-15">
                Intraday trading (day trading) requires:
              </p>
              <ul className="mt-4 ml-15 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-400 mt-1">×</span>
                  <span><strong>Constant monitoring:</strong> Full-time attention to screens throughout market hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-400 mt-1">×</span>
                  <span><strong>Higher noise:</strong> Random price fluctuations can trigger false signals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-400 mt-1">×</span>
                  <span><strong>More stress:</strong> Rapid decisions under pressure increase emotional trading</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 dark:text-red-400 mt-1">×</span>
                  <span><strong>Higher costs:</strong> More trades mean more commissions and slippage</span>
                </li>
              </ul>
              <p className="mt-4 ml-15 text-gray-700 dark:text-gray-300 leading-relaxed">
                Our swing trading approach allows for thoughtful analysis and fits better with most traders' lifestyles.
              </p>
            </section>

            {/* Elliott Wave */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-2xl">🌊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How We Use Elliott Wave Theory
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-15">
                Elliott Wave theory helps us understand market psychology through price patterns. We use it to:
              </p>
              <ul className="mt-4 ml-15 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>Identify market phases:</strong> Recognize whether we're in an impulse (trending) or corrective (consolidation) phase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>Find high-probability entries:</strong> Look for wave completions and reversals at key levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>Set realistic targets:</strong> Use wave projections to estimate where moves might end</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span><strong>Manage risk:</strong> Know where wave structures invalidate to place stops</span>
                </li>
              </ul>
              <p className="mt-4 ml-15 text-gray-700 dark:text-gray-300 leading-relaxed">
                Combined with AI analysis, this framework provides structure and context to our trading ideas.
              </p>
            </section>

            {/* 20% Ideas */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Why Only ~20% of Ideas Win Big
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed ml-15">
                In trading, not every idea will hit all targets. This is normal and expected:
              </p>
              <ul className="mt-4 ml-15 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                  <span><strong>~20-30% of ideas</strong> will hit all profit targets (big winners)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                  <span><strong>~40-50% of ideas</strong> will reach first target or break even (small wins)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                  <span><strong>~20-30% of ideas</strong> will hit stops (controlled losses)</span>
                </li>
              </ul>
              <div className="mt-6 ml-15 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-gray-800 dark:text-gray-200 font-semibold mb-2">
                  💡 The Key to Success
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  With proper risk management (risking 1-2% per trade), a 60-70% win rate with good risk/reward ratios leads to consistent profitability. The few big winners more than compensate for the small losses.
                </p>
              </div>
            </section>

            {/* Setting Expectations */}
            <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Setting Realistic Expectations
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We believe in transparency. Trading is challenging, and no system wins 100% of the time. Our goal is to provide:
              </p>
              <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>High-quality analysis</strong> based on proven methodologies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Clear risk parameters</strong> so you know your exposure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Honest track records</strong> showing both winners and losers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">✓</span>
                  <span><strong>Educational context</strong> to help you understand the reasoning</span>
                </li>
              </ul>
              <p className="mt-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                By managing expectations upfront, we aim to build trust and help you make informed decisions about using our analysis.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ready to see our methodology in action?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/oracle" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                View Latest Oracle Run →
              </Link>
              <Link href="/promo" className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                See Track Record
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <span>•</span>
            <a href="mailto:trade.crypto.oracle@proton.me" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
