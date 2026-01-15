/**
 * Cron Initialization Endpoint
 * Call this once to start the internal cron scheduler
 * Can be triggered on app startup or manually
 */

import { NextResponse } from 'next/server';
import { startCronScheduler } from '@/lib/cronScheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    startCronScheduler();
    
    return NextResponse.json({
      success: true,
      message: 'Cron scheduler initialized',
      config: {
        enabled: process.env.ENABLE_INTERNAL_CRON === 'true',
        schedule: process.env.CRON_SCHEDULE || '0 9 * * *',
      }
    });
  } catch (error: any) {
    console.error('Failed to initialize cron:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
