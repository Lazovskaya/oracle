/**
 * Next.js Instrumentation - runs once when the server starts
 * This ensures the cron scheduler starts automatically on every cold start
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCronScheduler } = await import('./lib/cronScheduler');
    
    // Auto-start the cron scheduler if enabled
    if (process.env.ENABLE_INTERNAL_CRON === 'true') {
      console.log('🚀 Auto-starting cron scheduler on server startup...');
      startCronScheduler();
    }
  }
}
