/**
 * Background Market Data Update API
 * Lightweight endpoint for client-side triggered updates
 * No auth required since it's just updating public market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMarketAssets } from '@/lib/marketDataService';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Rate limiting in memory (resets on cold start, but that's fine)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const lastCall = rateLimitMap.get(ip);
  if (!lastCall) return false;
  
  const timeSinceLastCall = Date.now() - lastCall;
  return timeSinceLastCall < RATE_LIMIT_WINDOW;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit (max once per 15 minutes per IP)
    if (isRateLimited(ip)) {
      return NextResponse.json({
        success: false,
        message: 'Rate limited - market data updates available every 15 minutes',
        nextUpdateAvailable: new Date(rateLimitMap.get(ip)! + RATE_LIMIT_WINDOW).toISOString()
      }, { status: 429 });
    }

    // Check if data was recently updated (by anyone)
    const lastUpdate = await db.execute({
      sql: `
        SELECT MAX(last_updated) as last_update
        FROM market_assets
      `
    });

    const lastUpdateTime = lastUpdate.rows[0]?.last_update;
    if (lastUpdateTime) {
      const updateAge = Date.now() - new Date(lastUpdateTime as string).getTime();
      
      // If data was updated in last 10 minutes, skip
      if (updateAge < 10 * 60 * 1000) {
        return NextResponse.json({
          success: true,
          cached: true,
          message: 'Market data is already fresh',
          lastUpdate: lastUpdateTime,
          ageMinutes: Math.floor(updateAge / 60000)
        });
      }
    }

    console.log(`Background market data update triggered by ${ip}`);
    const result = await updateMarketAssets();
    
    // Update rate limit
    rateLimitMap.set(ip, Date.now());

    return NextResponse.json({
      success: true,
      message: 'Market data updated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Background market data update failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
