/**
 * Internal Cron Scheduler
 * Runs independently of hosting platform (works everywhere)
 * Configured via environment variables
 */

import cron from 'node-cron';

let cronJob: cron.ScheduledTask | null = null;
let isInitialized = false;

/**
 * Start the internal cron scheduler
 * Call this once when the app starts
 */
export function startCronScheduler() {
  // Check if cron is enabled
  const cronEnabled = process.env.ENABLE_INTERNAL_CRON === 'true';
  
  if (!cronEnabled) {
    console.log('⏸️ Internal cron disabled (ENABLE_INTERNAL_CRON not set to "true")');
    return;
  }

  if (isInitialized) {
    console.log('⚠️ Cron scheduler already initialized');
    return;
  }

  // Get schedule from env or default to 9 AM UTC daily
  const schedule = process.env.CRON_SCHEDULE || '0 9 * * *';
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';

  console.log('🕐 Starting internal cron scheduler...');
  console.log('   Schedule:', schedule);
  console.log('   Endpoint:', `${baseUrl}/api/cron-heartbeat`);

  // Validate cron expression
  if (!cron.validate(schedule)) {
    console.error('❌ Invalid cron schedule:', schedule);
    console.log('   Examples:');
    console.log('   - "0 9 * * *" = Daily at 9:00 AM UTC');
    console.log('   - "*/15 * * * *" = Every 15 minutes');
    console.log('   - "0 */6 * * *" = Every 6 hours');
    return;
  }

  // Create cron job
  cronJob = cron.schedule(schedule, async () => {
    console.log(`\n🔔 Cron triggered at ${new Date().toISOString()}`);
    console.log('   Calling /api/cron-heartbeat...');

    try {
      const response = await fetch(`${baseUrl}/api/cron-heartbeat`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cron heartbeat successful:', data);
      } else {
        const error = await response.text();
        console.error('❌ Cron heartbeat failed:', response.status, error);
      }
    } catch (error: any) {
      console.error('❌ Cron execution error:', error.message);
    }
  });

  isInitialized = true;
  console.log('✅ Internal cron scheduler started');
  console.log(`   Next run: ${getNextRunTime(schedule)}\n`);
}

/**
 * Stop the cron scheduler
 */
export function stopCronScheduler() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    isInitialized = false;
    console.log('⏹️ Cron scheduler stopped');
  }
}

/**
 * Get human-readable next run time
 */
function getNextRunTime(schedule: string): string {
  try {
    const now = new Date();
    const parts = schedule.split(' ');
    
    // Simple parser for common patterns
    if (schedule === '0 9 * * *') {
      return 'Daily at 09:00 UTC';
    } else if (schedule.startsWith('*/')) {
      const minutes = schedule.split('/')[1].split(' ')[0];
      return `Every ${minutes} minutes`;
    } else if (schedule.startsWith('0 */')) {
      const hours = schedule.split('*/')[1].split(' ')[0];
      return `Every ${hours} hours`;
    }
    
    return schedule;
  } catch {
    return schedule;
  }
}

/**
 * Trigger cron manually (for testing)
 */
export async function triggerCronManually() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';

  console.log('🧪 Manual cron trigger...');
  
  try {
    const response = await fetch(`${baseUrl}/api/cron-heartbeat`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Manual trigger successful:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('❌ Manual trigger failed:', response.status, error);
      throw new Error(`Cron failed: ${response.status}`);
    }
  } catch (error: any) {
    console.error('❌ Manual trigger error:', error.message);
    throw error;
  }
}
