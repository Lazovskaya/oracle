// Manual cron trigger script for testing
// Usage: node scripts/trigger-cron.js

require('dotenv').config({ path: '.env.local' });

async function triggerCron() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';

  console.log('\n🧪 Manually triggering cron job...\n');
  console.log('URL:', `${baseUrl}/api/cron-heartbeat`);
  console.log('Time:', new Date().toISOString());
  console.log('');

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
      console.log('✅ Cron execution successful!\n');
      console.log('Results:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.error('❌ Cron execution failed:', response.status);
      console.error('Error:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to trigger cron:', error.message);
    process.exit(1);
  }
}

triggerCron();
