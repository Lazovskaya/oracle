// Add model_used column to oracle_runs table
import { createClient } from '@libsql/client';
import 'dotenv/config';

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addModelColumn() {
  try {
    console.log('Adding model_used column to oracle_runs...');

    await db.execute(`
      ALTER TABLE oracle_runs 
      ADD COLUMN model_used TEXT DEFAULT 'gpt-4o-mini'
    `);
    console.log('✅ Added model_used column');

    console.log('🎉 Schema updated successfully!');
  } catch (error) {
    if (error.message?.includes('duplicate column name')) {
      console.log('⚠️  Column already exists, skipping...');
    } else {
      console.error('❌ Error adding column:', error);
      throw error;
    }
  }
}

addModelColumn();
