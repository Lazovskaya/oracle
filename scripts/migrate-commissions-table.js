/**
 * Migration script to create commissions_taxes table
 * Run with: node scripts/migrate-commissions-table.js
 */

const { createClient } = require("@libsql/client");
require("dotenv").config({ path: ".env.local" });

async function migrate() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log("Creating commissions_taxes table...");

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS commissions_taxes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        
        -- User identification
        user_id TEXT NOT NULL,
        user_email TEXT,
        
        -- Transaction details
        payment_date DATETIME NOT NULL,
        payment_amount DECIMAL(10, 2) NOT NULL,
        payment_currency TEXT DEFAULT 'USD',
        payment_method TEXT,
        transaction_id TEXT UNIQUE,
        
        -- Subscription details
        subscription_type TEXT NOT NULL,
        subscription_start_date DATETIME NOT NULL,
        subscription_end_date DATETIME NOT NULL,
        billing_cycle TEXT,
        
        -- Geographic and tax information
        user_country TEXT NOT NULL,
        user_state TEXT,
        user_city TEXT,
        user_postal_code TEXT,
        user_ip_address TEXT,
        
        -- Tax calculation fields
        tax_rate DECIMAL(5, 4),
        tax_amount DECIMAL(10, 2),
        vat_number TEXT,
        is_reverse_charge BOOLEAN DEFAULT 0,
        
        -- Commission tracking
        gross_amount DECIMAL(10, 2),
        payment_processor_fee DECIMAL(10, 2),
        net_amount DECIMAL(10, 2),
        platform_commission DECIMAL(10, 2),
        
        -- Additional metadata
        invoice_number TEXT,
        receipt_url TEXT,
        refund_status TEXT DEFAULT 'none',
        refund_amount DECIMAL(10, 2) DEFAULT 0,
        refund_date DATETIME,
        
        -- Audit fields
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
      )
    `);

    console.log("✅ Table created successfully");

    // Create indexes
    console.log("Creating indexes...");
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_commissions_user_id 
      ON commissions_taxes(user_id)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_commissions_payment_date 
      ON commissions_taxes(payment_date)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_commissions_country 
      ON commissions_taxes(user_country)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_commissions_transaction_id 
      ON commissions_taxes(transaction_id)
    `);

    console.log("✅ Indexes created successfully");
    console.log("✅ Migration completed!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
