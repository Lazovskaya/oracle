/**
 * Market Data Update API Route
 * Cron job endpoint to update market_assets table with latest prices
 * Should be called by Vercel Cron or external scheduler
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMarketAssets } from '@/lib/marketDataService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting market data update...');
    const result = await updateMarketAssets();
    
    return NextResponse.json({
      success: true,
      message: 'Market data updated successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating market data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST endpoint for manual triggers (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_API_TOKEN;
    
    if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }

    console.log('Manual market data update triggered...');
    const result = await updateMarketAssets();
    
    return NextResponse.json({
      success: true,
      message: 'Market data updated successfully (manual trigger)',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating market data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update market data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
