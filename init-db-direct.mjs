/**
 * Direct database schema initialization
 * Run with: node init-db-direct.mjs
 */

import { createClient } from "@libsql/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function initDatabase() {
  console.log('🚀 Initializing market_assets schema...\n');
  
  // Check for environment variables
  const DATABASE_URL = process.env.DATABASE_URL;
  const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment');
    console.log('   Please set DATABASE_URL in .env.local');
    process.exit(1);
  }
  
  // Create database client
  const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });
  
  // Read schema file
  const schemaPath = path.join(__dirname, 'oracle-app', 'db', 'market_assets_schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Execute the entire schema as one batch
  console.log(`📝 Executing schema file...\n`);
  
  // For libsql, we need to execute statements separately
  // Split more carefully - look for semicolons followed by newline
  const statements = [];
  let currentStmt = '';
  
  for (const line of schema.split('\n')) {
    // Skip comment-only lines
    if (line.trim().startsWith('--')) continue;
    
    currentStmt += line + '\n';
    
    // If line ends with semicolon, it's end of statement
    if (line.trim().endsWith(';')) {
      statements.push(currentStmt.trim());
      currentStmt = '';
    }
  }
  
  console.log(`Found ${statements.length} statements to execute\n`);
  
  let created = 0;
  let skipped = 0;
  
  for (const stmt of statements) {
    try {
      // Skip INSERT statements for now (seed data)
      if (stmt.trim().toUpperCase().startsWith('INSERT')) {
        console.log(`⏭️  Skipping seed data (will be populated by market data service)`);
        continue;
      }
      
      await client.execute(stmt);
      const firstLine = stmt.split('\n')[0];
      console.log(`✅ ${firstLine.substring(0, 60)}...`);
      created++;
    } catch (err) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
        console.log(`⏭️  Already exists, skipping`);
        skipped++;
      } else {
        console.error(`❌ Error:`, err.message);
        // Don't throw, continue with other statements
      }
    }
  }
  
  console.log(`\n✨ Schema initialization complete!`);
  console.log(`   Created: ${created} objects`);
  console.log(`   Skipped: ${skipped} objects (already exist)`);
  console.log(`\n📊 Checking market_assets table...`);
  
  try {
    const result = await client.execute('SELECT COUNT(*) as count FROM market_assets');
    const count = result.rows[0].count;
    console.log(`   Current assets in database: ${count}`);
    
    if (count === 0) {
      console.log(`\n🔄 Next step: Populate market data`);
      console.log(`   Run: curl -X POST http://localhost:3001/api/update-market-data`);
      console.log(`        -H "Authorization: Bearer YOUR_ADMIN_TOKEN"`);
    } else {
      console.log(`\n✅ Market data already populated!`);
    }
  } catch (err) {
    console.log(`   ⚠️  Could not query market_assets: ${err.message}`);
  }
  
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('\n❌ Initialization failed:', err);
  process.exit(1);
});
