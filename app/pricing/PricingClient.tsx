'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PricingClient() {
  const searchParams = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (paymentStatus === 'canceled') {
      setShowMessage(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  if (!showMessage || paymentStatus !== 'canceled') {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto mb-8 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-1">
            Payment Canceled
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-400">
            Your payment was canceled. No charges were made. Feel free to try again when you're ready, or contact us if you need any help.
          </p>
        </div>
        <button
          onClick={() => setShowMessage(false)}
          className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-800 dark:hover:text-yellow-300"
          aria-label="Close message"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
