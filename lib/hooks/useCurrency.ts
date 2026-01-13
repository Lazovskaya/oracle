'use client';

import { useEffect, useState } from 'react';

export interface GeolocationData {
  country: string | null;
  currency: 'USD' | 'EUR' | 'GBP';
  locale: 'en-US' | 'en-GB';
  isEU: boolean;
  isUK?: boolean;
}

export function useCurrency() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [locale, setLocale] = useState<'en-US' | 'en-GB'>('en-US');
  const [isLoading, setIsLoading] = useState(true);
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    async function detectLocation() {
      try {
        // Check if we have a saved preference
        const savedCurrency = localStorage.getItem('user_currency') as 'USD' | 'EUR' | 'GBP' | null;
        const savedLocale = localStorage.getItem('user_locale') as 'en-US' | 'en-GB' | null;
        
        if (savedCurrency && savedLocale) {
          setCurrency(savedCurrency);
          setLocale(savedLocale);
          setIsLoading(false);
          return;
        }

        // Detect from API
        const response = await fetch('/api/geolocation');
        const data: GeolocationData = await response.json();
        
        setCurrency(data.currency);
        setLocale(data.locale);
        setCountry(data.country);
        
        // Save preferences
        localStorage.setItem('user_currency', data.currency);
        localStorage.setItem('user_locale', data.locale);
        if (data.country) {
          localStorage.setItem('user_country', data.country);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
        // Default to USD
        setCurrency('USD');
        setLocale('en-US');
      } finally {
        setIsLoading(false);
      }
    }

    detectLocation();

    // Listen for currency changes from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      console.log('currencyChange event received:', event.detail);
      setCurrency(event.detail.currency);
      setLocale(event.detail.locale);
    };

    window.addEventListener('currencyChange' as any, handleCurrencyChange);

    return () => {
      window.removeEventListener('currencyChange' as any, handleCurrencyChange);
    };
  }, []);

  const switchCurrency = (newCurrency: 'USD' | 'EUR' | 'GBP') => {
    console.log('switchCurrency called with:', newCurrency);
    setCurrency(newCurrency);
    const newLocale = newCurrency === 'USD' ? 'en-US' : 'en-GB';
    setLocale(newLocale);
    localStorage.setItem('user_currency', newCurrency);
    localStorage.setItem('user_locale', newLocale);
    
    console.log('Dispatching currencyChange event:', { currency: newCurrency, locale: newLocale });
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('currencyChange', {
      detail: { currency: newCurrency, locale: newLocale }
    }));
  };

  return {
    currency,
    locale,
    country,
    isLoading,
    switchCurrency,
  };
}
