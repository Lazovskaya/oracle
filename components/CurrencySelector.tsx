'use client';

import { useCurrency } from '@/lib/hooks/useCurrency';

export default function CurrencySelector() {
  const { currency, switchCurrency, isLoading } = useCurrency();

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative inline-flex rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
      <button
        onClick={() => switchCurrency('USD')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          currency === 'USD'
            ? 'bg-blue-600 text-white rounded-l-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        $ USD
      </button>
      <button
        onClick={() => switchCurrency('GBP')}
        className={`px-3 py-2 text-sm font-medium transition-colors border-l border-r border-gray-300 dark:border-gray-700 ${
          currency === 'GBP'
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        £ GBP
      </button>
      <button
        onClick={() => switchCurrency('EUR')}
        className={`px-3 py-2 text-sm font-medium transition-colors ${
          currency === 'EUR'
            ? 'bg-blue-600 text-white rounded-r-md'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        € EUR
      </button>
    </div>
  );
}
