import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function createUserConsentTable() {
  try {
    console.log('Creating user_consent table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS user_consent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        country TEXT NOT NULL,
        terms_accepted BOOLEAN NOT NULL DEFAULT 1,
        risk_accepted BOOLEAN NOT NULL DEFAULT 1,
        tier TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✓ user_consent table created');

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_consent_user_email ON user_consent(user_email)
    `);

    console.log('✓ Index on user_email created');

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_consent_created_at ON user_consent(created_at)
    `);

    console.log('✓ Index on created_at created');

    console.log('✅ user_consent table setup complete!');
  } catch (error) {
    console.error('Error creating user_consent table:', error);
    process.exit(1);
  }
}

createUserConsentTable();
