/**
 * Self-Sustaining Cron Heartbeat
 * Runs once per day via Vercel Cron, then orchestrates all tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMarketAssets } from '@/lib/marketDataService';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

interface CronTask {
  name: string;
  lastRun: Date | null;
  intervalMinutes: number;
  handler: () => Promise<any>;
}

// In-memory state (resets on cold start, but we store in DB)
let isRunning = false;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRunning) {
      return NextResponse.json({ 
        message: 'Cron heartbeat already running',
        status: 'busy'
      });
    }

    isRunning = true;
    console.log('🔄 Cron heartbeat triggered at', new Date().toISOString());

    const results = {
      marketData: null as any,
      oracleRuns: [] as any[],
      timestamp: new Date().toISOString(),
      tasksCompleted: 0
    };

    // Task 1: Update market data immediately
    console.log('📊 Updating market data...');
    try {
      results.marketData = await updateMarketAssets();
      results.tasksCompleted++;
      console.log(`✅ Market data updated: ${results.marketData.total} assets`);
    } catch (error) {
      console.error('❌ Market data update failed:', error);
    }

    // Task 2: Run oracle for all trading styles
    console.log('🔮 Running oracle for all trading styles...');
    const tradingStyles: Array<'conservative' | 'balanced' | 'aggressive'> = ['conservative', 'balanced', 'aggressive'];
    
    for (const style of tradingStyles) {
      try {
        // Import and call oracle generation
        const oracleRunner = await import('../../../lib/oracleRunner');
        const result = await oracleRunner.generateOracleForStyle(style);
        results.oracleRuns.push({ style, success: true, result });
        results.tasksCompleted++;
        console.log(`✅ Oracle generated for ${style} style`);
      } catch (error) {
        console.error(`❌ Oracle failed for ${style}:`, error);
        results.oracleRuns.push({ style, success: false, error: String(error) });
      }
    }

    // Store heartbeat timestamp
    await db.execute({
      sql: `
        CREATE TABLE IF NOT EXISTS cron_heartbeat (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          last_run DATETIME,
          tasks_completed INTEGER,
          status TEXT
        )
      `
    });

    await db.execute({
      sql: `
        INSERT INTO cron_heartbeat (id, last_run, tasks_completed, status)
        VALUES (1, datetime('now'), ?, 'success')
        ON CONFLICT(id) DO UPDATE SET
          last_run = datetime('now'),
          tasks_completed = ?,
          status = 'success'
      `,
      args: [results.tasksCompleted, results.tasksCompleted]
    });

    isRunning = false;
    console.log('✅ Cron heartbeat completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Cron heartbeat completed',
      results
    });

  } catch (error) {
    isRunning = false;
    console.error('❌ Cron heartbeat error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Cron heartbeat failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST for manual admin triggers
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_API_TOKEN;
  
  if (!adminToken || authHeader !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return GET(request);
}
