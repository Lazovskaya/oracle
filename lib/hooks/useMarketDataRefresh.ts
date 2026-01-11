/**
 * Market Data Refresh Hook
 * Triggers background market data updates when users are active
 * This keeps data fresh between daily cron runs without needing multiple cron jobs
 */

import { useEffect, useRef } from 'react';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ENDPOINT = '/api/update-market-data-bg';

let lastRefresh = 0;
let isRefreshing = false;

export function useMarketDataRefresh(enabled: boolean = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const refreshMarketData = async () => {
      // Prevent concurrent refreshes
      if (isRefreshing) return;
      
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefresh;

      // Only refresh if 30 minutes have passed
      if (timeSinceLastRefresh < REFRESH_INTERVAL) return;

      isRefreshing = true;
      
      try {
        console.log('🔄 Background market data refresh triggered');
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          lastRefresh = now;
          const data = await response.json();
          console.log('✅ Market data refreshed:', data);
        }
      } catch (error) {
        console.error('❌ Market data refresh failed:', error);
      } finally {
        isRefreshing = false;
      }
    };

    // Initial refresh check
    refreshMarketData();

    // Set up periodic refresh
    intervalRef.current = setInterval(refreshMarketData, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}
