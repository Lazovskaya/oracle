import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      category: 'General',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'What is Crypto Oracle?',
          a: 'Crypto Oracle is an AI-powered trading analysis platform that provides market insights and trade ideas using Elliott Wave theory and advanced technical analysis. We help traders identify potential trading opportunities with clear entry points, stop-loss levels, and profit targets.',
        },
        {
          q: 'How does the Oracle work?',
          a: 'Our Oracle uses AI to analyze market conditions, identify Elliott Wave patterns, and generate trading ideas based on your preferences. It considers multiple factors including trend analysis, volatility, support/resistance levels, and market sentiment to provide actionable trade setups.',
        },
        {
          q: 'What markets do you cover?',
          a: 'We currently focus on cryptocurrencies and stocks. You can set your asset preference in your account settings to receive ideas tailored to your preferred markets.',
        },
      ],
    },
    {
      category: 'Subscription & Billing',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      questions: [
        {
          q: 'What subscription plans are available?',
          a: 'We offer three tiers: Free (market analysis and trade ideas), Premium ($9/month or $79/year - save 27%) with full entry/stop/target levels, and Pro ($19/month or $149/year - save 35%) which includes everything plus custom symbol analysis.',
        },
        {
          q: 'Can I cancel my subscription anytime?',
          a: 'Yes! You can cancel your subscription at any time from your account page. Your access will continue until the end of your current billing period, and you won\'t be charged again.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards through our secure payment processor Stripe. We do not store your payment information on our servers.',
        },
        {
          q: 'Do you offer refunds?',
          a: 'Due to the nature of our service (immediate access to trading information), we generally do not offer refunds. However, if you experience technical issues or have special circumstances, please contact our support team.',
        },
        {
          q: 'Will my subscription auto-renew?',
          a: 'Yes, subscriptions automatically renew at the end of each billing period. You can cancel anytime to prevent future charges.',
        },
      ],
    },
    {
      category: 'Features & Usage',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      questions: [
        {
          q: 'How often are new trading ideas published?',
          a: 'We publish new Oracle predictions regularly based on market conditions. Premium and Pro members receive real-time access to all new ideas as they are generated.',
        },
        {
          q: 'Can I save trading ideas for later?',
          a: 'Yes! Premium and Pro members can save unlimited trading ideas to their account for easy reference and tracking.',
        },
        {
          q: 'What is the Custom Symbol Analyzer?',
          a: 'Available exclusively for Pro members, the Symbol Analyzer allows you to request AI-powered analysis for any specific cryptocurrency or stock symbol. Get detailed entry points, stop-loss levels, and targets tailored to your chosen asset.',
        },
        {
          q: 'What are trading lenses?',
          a: 'Trading lenses let you customize how aggressive or conservative you want your trade recommendations to be. Choose between Capital Protection (conservative), Balanced, or Growth Maximizer (aggressive) to match your risk tolerance.',
        },
        {
          q: 'How do I track my trade performance?',
          a: 'Premium and Pro members can save trading ideas and track their outcomes. We provide statistics on win rates, realized gains/losses, and overall performance metrics in your account dashboard.',
        },
      ],
    },
    {
      category: 'Trading & Risk',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      questions: [
        {
          q: 'Are these guaranteed trading signals?',
          a: 'No. Our analysis and trade ideas are for informational and educational purposes only. They are not financial advice or guaranteed signals. All trading involves risk, and past performance does not guarantee future results.',
        },
        {
          q: 'Should I risk my entire capital on these ideas?',
          a: 'Absolutely not. We strongly recommend proper risk management, including position sizing (typically 1-2% of capital per trade), using stop-losses, and never risking more than you can afford to lose.',
        },
        {
          q: 'What if a trade idea doesn\'t work out?',
          a: 'Not all trades will be profitable - that\'s the nature of trading. We provide stop-loss levels to help limit potential losses. Always follow risk management principles and use stop-losses to protect your capital.',
        },
        {
          q: 'Do you provide financial advice?',
          a: 'No. We provide educational analysis and market insights. We are not financial advisors, and nothing on our platform should be considered personalized investment advice. Always do your own research and consult with qualified financial professionals.',
        },
      ],
    },
    {
      category: 'Technical & Support',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'How do I access my account?',
          a: 'You can log in using email (magic link) or Google authentication. Simply enter your email on the login page, and we\'ll send you a secure link to access your account.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes. We use industry-standard encryption and security practices. We do not sell or share your personal information. See our Privacy Policy for detailed information.',
        },
        {
          q: 'What if I have technical issues?',
          a: 'Contact our support team at trade.crypto.oracle@proton.me. We typically respond within 24 hours on business days.',
        },
        {
          q: 'Can I use this on mobile devices?',
          a: 'Yes! Our platform is fully responsive and works on all devices including smartphones and tablets.',
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Everything you need to know about Crypto Oracle, subscriptions, and trading with AI-powered insights
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {faqs.map((category, idx) => (
            <div key={idx}>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                  {category.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {category.category}
                </h2>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                        Q
                      </span>
                      {faq.q}
                    </h3>
                    <div className="ml-9 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white text-center shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Still Have Questions?</h2>
          <p className="text-lg text-white/90 mb-6">
            Our support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:trade.crypto.oracle@proton.me"
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </a>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/30"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms of Service
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/methodology" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Methodology
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
