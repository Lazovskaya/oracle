export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <a href="/oracle" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2 text-sm">
            ← Back to Oracle
          </a>
          <a href="/account" className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>My Account</span>
          </a>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Effective date: January 9, 2026
          </p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Service Description
              </h2>
              <p className="leading-relaxed">
                The website Market Oracle provides digital market analysis, trading ideas, and educational 
                information related to financial markets (stocks and cryptocurrencies).
              </p>
              <p className="leading-relaxed mt-2">
                The service is informational only and does not constitute financial advice, investment 
                recommendations, or guarantees of profit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Eligibility
              </h2>
              <p className="leading-relaxed">
                By using this service, you confirm that you are at least 18 years old.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Accounts
              </h2>
              <p className="leading-relaxed">
                Access to paid content is granted via email-based authentication (magic link) or third-party 
                authentication providers.
              </p>
              <p className="leading-relaxed mt-2">
                You are responsible for maintaining the confidentiality of your access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Payments
              </h2>
              <p className="leading-relaxed">
                Payments are processed via a third-party payment provider (Stripe).
              </p>
              <p className="leading-relaxed mt-2">
                All prices are shown before purchase.
              </p>
              <p className="leading-relaxed mt-2">
                Access is granted immediately after successful payment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                5. No Refunds
              </h2>
              <p className="leading-relaxed">
                Due to the digital nature of the service, all sales are final and non-refundable, unless 
                required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Disclaimer
              </h2>
              <p className="leading-relaxed">
                All content is provided "as is" for educational and informational purposes only.
              </p>
              <p className="leading-relaxed mt-2">
                We are not responsible for financial losses, trading outcomes, or decisions made based on 
                the content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, Market Oracle shall not be liable for any direct or 
                indirect damages arising from the use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                8. Termination
              </h2>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate access in case of misuse or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                9. Governing Law
              </h2>
              <p className="leading-relaxed">
                These Terms are governed by the laws of the Republic of Lithuania.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                10. Contact
              </h2>
              <p className="leading-relaxed">
                For questions, contact: <a href="mailto:trade.crypto.oracle@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline">trade.crypto.oracle@proton.me</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
