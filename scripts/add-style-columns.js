// Add trading_style and asset_preference columns to oracle_runs table
import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addStyleColumns() {
  try {
    console.log('Adding trading_style and asset_preference columns to oracle_runs...');

    // Add trading_style column
    await db.execute(`
      ALTER TABLE oracle_runs 
      ADD COLUMN trading_style TEXT DEFAULT 'balanced'
    `);
    console.log('✅ Added trading_style column');

    // Add asset_preference column
    await db.execute(`
      ALTER TABLE oracle_runs 
      ADD COLUMN asset_preference TEXT DEFAULT 'both'
    `);
    console.log('✅ Added asset_preference column');

    console.log('🎉 Schema updated successfully!');
    console.log('📊 Oracle runs can now store style and asset preference');
  } catch (error) {
    if (error.message?.includes('duplicate column name')) {
      console.log('⚠️  Columns already exist, skipping...');
    } else {
      console.error('❌ Error adding columns:', error);
      throw error;
    }
  }
}

addStyleColumns();
