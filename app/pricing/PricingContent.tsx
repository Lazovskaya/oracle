'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';
import SubscribeButton from './SubscribeButton';

interface PricingContentProps {
  priceIds: {
    basicUSD: string;
    proUSD: string;
    basicYearlyUSD: string;
    proYearlyUSD: string;
    basicEUR: string;
    proEUR: string;
    basicYearlyEUR: string;
    proYearlyEUR: string;
    basicGBP: string;
    proGBP: string;
    basicYearlyGBP: string;
    proYearlyGBP: string;
  };
}

export default function PricingContent({ priceIds }: PricingContentProps) {
  const { currency, isLoading, switchCurrency } = useCurrency();

  // Prices (same across all currencies, no conversion)
  const prices = {
    USD: {
      basic: 9,
      pro: 19,
      basicYearly: 79,
      basicYearlyOriginal: 108,
      proYearly: 149,
      proYearlyOriginal: 228,
      symbol: '$',
    },
    EUR: {
      basic: 9,
      pro: 19,
      basicYearly: 79,
      basicYearlyOriginal: 108,
      proYearly: 149,
      proYearlyOriginal: 228,
      symbol: '€',
    },
    GBP: {
      basic: 9,
      pro: 19,
      basicYearly: 79,
      basicYearlyOriginal: 108,
      proYearly: 149,
      proYearlyOriginal: 228,
      symbol: '£',
    },
  };

  const currentPrices = prices[currency];
  const currentPriceIds = {
    basic: currency === 'EUR' ? priceIds.basicEUR : currency === 'GBP' ? priceIds.basicGBP : priceIds.basicUSD,
    pro: currency === 'EUR' ? priceIds.proEUR : currency === 'GBP' ? priceIds.proGBP : priceIds.proUSD,
    basicYearly: currency === 'EUR' ? priceIds.basicYearlyEUR : currency === 'GBP' ? priceIds.basicYearlyGBP : priceIds.basicYearlyUSD,
    proYearly: currency === 'EUR' ? priceIds.proYearlyEUR : currency === 'GBP' ? priceIds.proYearlyGBP : priceIds.proYearlyUSD,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Monthly Plans */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Subscriptions</h3>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {/* Free Tier */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Free</h2>
          <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {currentPrices.symbol}0<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span>
          </p>
          
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
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Premium</h2>
          <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {currentPrices.symbol}{currentPrices.basic}<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span>
          </p>
          
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

          <SubscribeButton tier="basic" priceId={currentPriceIds.basic} currency={currency} />
        </div>

        {/* Pro Tier */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Pro</h2>
          <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {currentPrices.symbol}{currentPrices.pro}<span className="text-base font-normal text-gray-500 dark:text-gray-400">/month</span>
          </p>
          
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
            <SubscribeButton tier="pro" priceId={currentPriceIds.pro} currency={currency} />
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
          <p className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {currentPrices.symbol}0<span className="text-base font-normal text-gray-500 dark:text-gray-400">/always</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Free tier is always free
          </p>
        </div>

        {/* Basic Yearly */}
        <div className="rounded-lg border-2 border-green-600 dark:border-green-500 p-6 bg-white dark:bg-gray-900 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md">
            SAVE 27%
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Premium Yearly</h2>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentPrices.symbol}{currentPrices.basicYearly}
              </p>
              <span className="text-sm line-through text-gray-400">
                {currentPrices.symbol}{currentPrices.basicYearlyOriginal}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto-renews yearly · Cancel anytime</p>
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

          <SubscribeButton tier="basic-yearly" priceId={currentPriceIds.basicYearly} currency={currency} />
        </div>

        {/* Pro Yearly */}
        <div className="rounded-lg border-2 border-purple-600 dark:border-purple-500 p-6 bg-white dark:bg-gray-900 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-md">
            SAVE 35%
          </div>
          
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Pro Yearly</h2>
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentPrices.symbol}{currentPrices.proYearly}
              </p>
              <span className="text-sm line-through text-gray-400">
                {currentPrices.symbol}{currentPrices.proYearlyOriginal}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto-renews yearly · Cancel anytime</p>
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
            <SubscribeButton tier="pro-yearly" priceId={currentPriceIds.proYearly} currency={currency} />
          </div>
        </div>
      </div>
    </>
  );
}
