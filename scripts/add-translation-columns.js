// Migration script to add translation columns to existing database
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function migrate() {
  try {
    console.log('Starting migration...');
    
    try {
      await db.execute('ALTER TABLE oracle_runs ADD COLUMN result_ru TEXT;');
      console.log('✓ Added result_ru column');
    } catch (e) {
      console.log('result_ru column already exists');
    }
    
    try {
      await db.execute('ALTER TABLE oracle_runs ADD COLUMN result_es TEXT;');
      console.log('✓ Added result_es column');
    } catch (e) {
      console.log('result_es column already exists');
    }
    
    try {
      await db.execute('ALTER TABLE oracle_runs ADD COLUMN result_zh TEXT;');
      console.log('✓ Added result_zh column');
    } catch (e) {
      console.log('result_zh column already exists');
    }
    
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
