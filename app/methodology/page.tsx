import { Metadata } from "next";
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Our Methodology - How We Analyze Markets",
  description: "Learn about our swing trading approach using Elliott Wave theory, why we focus on 2-6 week horizons, and how we identify high-probability setups.",
  openGraph: {
    title: "Our Methodology - Market Oracle",
    description: "Understanding our swing trading approach and Elliott Wave analysis",
    url: "https://finforesee.com/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Methodology
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Why we focus on swing trading and how Elliott Wave theory guides our analysis.
            </p>
          </div>

          <div className="space-y-12">
            {/* Time Horizon */}
            <section className="pb-12 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    2-6 Week Time Horizon
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    We focus on swing trading with a <strong className="text-blue-600 dark:text-blue-400">2-6 week time horizon</strong>. This timeframe offers the sweet spot between noise reduction and manageable exposure.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Reduced noise</strong> — Longer than intraday, allowing clearer patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Manageable exposure</strong> — Shorter than long-term investing, limiting risks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Better risk/reward</strong> — Captures meaningful moves with defined stops</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Why Not Intraday */}
            <section className="pb-12 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Why Not Intraday Trading?
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Intraday trading requires constant monitoring and creates unnecessary stress:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Constant monitoring</strong> — Full-time attention throughout market hours</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Higher noise</strong> — Random fluctuations trigger false signals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>More stress</strong> — Rapid decisions increase emotional trading</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Higher costs</strong> — More trades mean more commissions</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                    Our swing trading approach allows thoughtful analysis and fits better with most traders lifestyles.
                  </p>
                </div>
              </div>
            </section>

            {/* Elliott Wave */}
            <section className="pb-12 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Elliott Wave Theory
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Elliott Wave theory helps us understand market psychology through price patterns:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Identify market phases</strong> — Recognize trending vs consolidation periods</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Find high-probability entries</strong> — Look for wave completions at key levels</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Set realistic targets</strong> — Use wave projections to estimate move endpoints</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Manage risk</strong> — Know where structures invalidate to place stops</span>
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                    Combined with AI analysis, this framework provides structure and context to our trading ideas.
                  </p>
                </div>
              </div>
            </section>

            {/* 20% Ideas */}
            <section className="pb-12 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Expected Win Distribution
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Not every idea will hit all targets — this is normal and expected in trading:
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-green-200 dark:bg-green-900/30 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 dark:bg-green-500" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm"><strong>~20-30%</strong> hit all targets (big winners)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-blue-200 dark:bg-blue-900/30 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-500" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm"><strong>~40-50%</strong> reach first target (small wins)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-red-200 dark:bg-red-900/30 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 dark:bg-red-500" style={{width: '25%'}}></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm"><strong>~20-30%</strong> hit stops (controlled losses)</span>
                    </div>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">The Key to Success</p>
                        <p className="text-sm text-blue-800 dark:text-blue-400">
                          With proper risk management (1-2% per trade), a 60-70% win rate with good risk/reward ratios leads to consistent profitability.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Setting Expectations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Setting Realistic Expectations
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                We believe in transparency. Trading is challenging, and no system wins 100% of the time. Our goal is to provide:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">High-quality analysis</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Based on proven methodologies</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Clear risk parameters</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Know your exposure upfront</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Honest track records</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Showing winners and losers</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Educational context</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Understand the reasoning</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ready to see our methodology in action?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/oracle" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                View Latest Ideas
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/promo" className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                See Track Record
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <span>•</span>
            <a href="mailto:info@finforesee.com" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
