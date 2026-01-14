/**
 * Migration script to add stripe_subscription_id column to users table
 * Run this once to update the existing database schema
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const db = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log('🔄 Adding stripe_subscription_id column to users table...');
    
    // Add the column if it doesn't exist
    await db.execute(`
      ALTER TABLE users 
      ADD COLUMN stripe_subscription_id TEXT
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('Column stripe_subscription_id added to users table');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  Column already exists, skipping migration');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    db.close();
  }
}

migrate().catch(console.error);
