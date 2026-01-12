import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Market Oracle",
  description: "Terms and conditions for using Market Oracle trading analysis service. Educational market information and trading ideas.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
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
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center border border-blue-200 dark:border-blue-800/30">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Terms of Service
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Effective date: January 9, 2026
              </p>
            </div>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Service Description
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  The website Market Oracle provides digital market analysis, trading ideas, and educational 
                  information related to financial markets (stocks and cryptocurrencies).
                </p>
                <p className="leading-relaxed">
                  The service is informational only and does not constitute financial advice, investment 
                  recommendations, or guarantees of profit.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Eligibility
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  By using this service, you confirm that you are at least 18 years old.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Accounts
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  Access to paid content is granted via email-based authentication (magic link) or third-party 
                  authentication providers.
                </p>
                <p className="leading-relaxed">
                  You are responsible for maintaining the confidentiality of your access.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">4</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Payments
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  Payments are processed via a third-party payment provider (Stripe).
                </p>
                <p className="leading-relaxed">
                  All prices are shown before purchase.
                </p>
                <p className="leading-relaxed">
                  Access is granted immediately after successful payment.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 border border-red-200 dark:border-red-800/30">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">5</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  No Refunds
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  Due to the digital nature of the service, all sales are final and non-refundable, unless 
                  required by applicable law.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800/30">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">6</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Disclaimer
                </h2>
              </div>
              <div className="ml-11 space-y-3">
                <p className="leading-relaxed">
                  All content is provided "as is" for educational and informational purposes only.
                </p>
                <p className="leading-relaxed">
                  We are not responsible for financial losses, trading outcomes, or decisions made based on 
                  the content.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">7</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Limitation of Liability
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, Market Oracle shall not be liable for any direct or 
                  indirect damages arising from the use of the service.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">8</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Termination
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate access in case of misuse or violation of these terms.
                </p>
              </div>
            </section>

            <section className="pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">9</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Governing Law
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  These Terms are governed by the laws of the Republic of Lithuania.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800/30">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Contact
                </h2>
              </div>
              <div className="ml-11">
                <p className="leading-relaxed">
                  For questions, contact: <a href="mailto:trade.crypto.oracle@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">trade.crypto.oracle@proton.me</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-4">
            <a href="/pricing" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Pricing</a>
            <span>•</span>
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</a>
            <span>•</span>
            <a href="/methodology" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Methodology</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
