import SubscribeButton from './SubscribeButton';

export default function PricingPage() {
  const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID || '';
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID || '';
  // Use existing price IDs as fallback until yearly prices are created in Stripe
  const basicYearlyPriceId = process.env.STRIPE_BASIC_YEARLY_PRICE_ID || basicPriceId;
  const proYearlyPriceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID || proPriceId;

  return (
    <main className="min-h-screen px-6 py-12 bg-gray-50 dark:bg-[#0d1117]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Choose Your Plan
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Professional trading intelligence without the hype. No "signals", no "100% accuracy" — just clear decision support.
          </p>
        </div>

        {/* Special Discount Banner */}
        <div className="max-w-3xl mx-auto mb-8 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 text-center">
          <p className="text-sm font-semibold text-orange-900 dark:text-orange-300">
            🎉 Special Launch Discount — Limited Time Only!
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
            Get massive savings on yearly subscriptions
          </p>
        </div>

        {/* Monthly Plans */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Subscriptions</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* Free Tier */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Free</h2>
            <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">€0<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span></p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Market phase analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Wave structure overview</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Trade idea summaries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span className="text-sm text-gray-500">Entry/stop/target levels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span className="text-sm text-gray-500">Performance tracking</span>
              </li>
            </ul>

            <a href="/login" className="block w-full text-center px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 font-bold hover:scale-105 transition-all">
              Get Started
            </a>
          </div>

          {/* Basic Tier */}
          <div className="rounded-lg border-2 border-blue-600 dark:border-blue-500 p-6 bg-white dark:bg-gray-900 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md">
              POPULAR
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Basic</h2>
            <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">€9<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span></p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Full entry/stop/target levels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Risk management guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Crypto & stocks ideas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span className="text-sm text-gray-500">Performance statistics</span>
              </li>
            </ul>

            <SubscribeButton tier="basic" priceId={basicPriceId} />
          </div>

          {/* Pro Tier */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Pro</h2>
            <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">€29<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span></p>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Everything in Basic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Performance tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Win rate statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Historical idea archive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Priority support</span>
              </li>
            </ul>

            <div className="w-full">
              <SubscribeButton tier="pro" priceId={proPriceId} />
            </div>
          </div>
        </div>

        {/* Yearly Plans with Discount */}
        <div className="text-center mb-4 mt-16">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yearly Subscriptions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pay once, save big 🎯</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free Tier - Spacer */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900 opacity-50">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Free</h2>
            <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">€0<span className="text-base font-normal text-gray-500 dark:text-gray-400">/always</span></p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Free tier is always free
            </p>
          </div>

          {/* Basic Yearly */}
          <div className="rounded-lg border-2 border-green-600 dark:border-green-500 p-6 bg-white dark:bg-gray-900 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md">
              94% OFF
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Basic Yearly</h2>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">€0.50</p>
                <span className="text-sm line-through text-gray-400">€108</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">One-time payment for 1 year</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Everything in Free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Full entry/stop/target levels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Risk management guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">12 months access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500">✗</span>
                <span className="text-sm text-gray-500">Performance statistics</span>
              </li>
            </ul>

            <SubscribeButton tier="basic-yearly" priceId={basicYearlyPriceId} />
          </div>

          {/* Pro Yearly */}
          <div className="rounded-lg border-2 border-purple-600 dark:border-purple-500 p-6 bg-white dark:bg-gray-900 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-md">
              97% OFF
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Pro Yearly</h2>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">€1.00</p>
                <span className="text-sm line-through text-gray-400">€348</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">One-time payment for 1 year</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Everything in Basic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Performance tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Win rate statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">Historical idea archive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium">12 months access + Priority support</span>
              </li>
            </ul>

            <div className="w-full">
              <SubscribeButton tier="pro-yearly" priceId={proYearlyPriceId} />
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="max-w-3xl mx-auto mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-center">
          <p className="text-xs text-blue-900 dark:text-blue-300">
            ⚠️ Launch discount pricing is temporary. Prices will return to normal rates after the promotional period. Lock in your discount now!
          </p>
        </div>

        {/* Why Premium Section */}
        <div className="mt-20 max-w-3xl mx-auto rounded-3xl border border-blue-200/50 dark:border-blue-800/50 p-10 bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-900/90 dark:to-blue-950/90 backdrop-blur-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Entry/Stop/Target Levels are Premium
          </h2>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              <strong className="text-blue-600 dark:text-blue-400">Market analysis is free</strong> because education should be accessible. You can see market phase, wave structure, and trade rationales without paying.
            </p>
            
            <p className="leading-relaxed">
              <strong className="text-purple-600 dark:text-purple-400">Precise entry/stop/target levels are premium</strong> because they represent actionable trading decisions with specific risk management. This is the difference between analysis and execution-ready information.
            </p>
            
            <p className="leading-relaxed">
              We're not selling "signals" or promising "100% accuracy". We provide a <strong>Decision Engine</strong> that combines AI analysis with Elliott Wave theory, giving you clear risk maps to make informed trading decisions.
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-500 italic text-center mt-8">
              Think of it like reading a portfolio manager's letter: headlines are public, detailed positions are for subscribers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
