export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Effective date: January 9, 2026
          </p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                1. Data We Collect
              </h2>
              <p className="leading-relaxed mb-2">
                We collect only the data necessary to provide the service:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Email address</li>
                <li>Payment-related identifiers (via Stripe)</li>
                <li>Usage data related to access to content</li>
              </ul>
              <p className="leading-relaxed mt-2">
                We do not store payment card details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                2. Purpose of Data Processing
              </h2>
              <p className="leading-relaxed mb-2">
                Personal data is used for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Authentication</li>
                <li>Providing access to paid content</li>
                <li>Customer support</li>
                <li>Legal and accounting obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                3. Data Sharing
              </h2>
              <p className="leading-relaxed">
                Payment processing is handled by third-party providers (Stripe).
              </p>
              <p className="leading-relaxed mt-2">
                We do not sell or share personal data for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                4. Data Retention
              </h2>
              <p className="leading-relaxed">
                We retain personal data only as long as required to provide the service or comply with 
                legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                5. Your Rights
              </h2>
              <p className="leading-relaxed mb-2">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Access your data</li>
                <li>Request correction or deletion</li>
                <li>Withdraw consent</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Requests can be sent to: <a href="mailto:trade.crypto.oracle@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline">trade.crypto.oracle@proton.me</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                6. Cookies
              </h2>
              <p className="leading-relaxed">
                The website uses essential cookies required for authentication and functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                7. Contact
              </h2>
              <p className="leading-relaxed">
                Email: <a href="mailto:trade.crypto.oracle@proton.me" className="text-blue-600 dark:text-blue-400 hover:underline">trade.crypto.oracle@proton.me</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
