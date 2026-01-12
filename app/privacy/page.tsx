import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Market Oracle",
  description: "Privacy policy for Market Oracle. How we collect, use, and protect your personal data.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-2 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Oracle
          </a>
          <a href="/account" className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Account</span>
          </a>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/30">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Effective date: January 9, 2026
              </p>
            </div>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">1</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Data We Collect
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  We collect only the data necessary to provide the service:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Payment-related identifiers (via Stripe)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Usage data related to access to content</span>
                  </li>
                </ul>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 mt-3">
                  <p className="text-sm text-emerald-900 dark:text-emerald-300 font-medium">
                    We do not store payment card details.
                  </p>
                </div>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Purpose of Data Processing
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  Personal data is used for:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Providing access to paid content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Legal and accounting obligations</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">3</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Data Sharing
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  Payment processing is handled by third-party providers (Stripe).
                </p>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-sm text-emerald-900 dark:text-emerald-300 font-medium">
                    We do not sell or share personal data for marketing purposes.
                  </p>
                </div>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">4</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Data Retention
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  We retain personal data only as long as required to provide the service or comply with 
                  legal obligations.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">5</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Your Rights
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  You have the right to:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Access your data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Request correction or deletion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Withdraw consent</span>
                  </li>
                </ul>
                <p className="leading-relaxed text-sm">
                  Requests can be sent to: <a href="mailto:trade.crypto.oracle@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">trade.crypto.oracle@proton.me</a>
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Cookies
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  The website uses essential cookies required for authentication and functionality.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800/30">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Contact
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  Email: <a href="mailto:trade.crypto.oracle@proton.me" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">trade.crypto.oracle@proton.me</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-4">
            <a href="/pricing" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Pricing</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</a>
            <span>•</span>
            <a href="/methodology" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Methodology</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
