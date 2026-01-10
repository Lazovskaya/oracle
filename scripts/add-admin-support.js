// Migration script to add admin support and Pro tier
/**
 * Adds is_admin column to users table and sets wlazovskaya@gmail.com as Pro admin
 * Usage:
 *   node scripts/add-admin-support.js
 */

(async () => {
  try {
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;

    console.log("Adding is_admin column to users table...");
    
    // Check if column already exists
    try {
      const info = await db.execute({ sql: "PRAGMA table_info('users')" });
      const rows = info.rows ?? [];
      const cols = rows.map((r) => (r.name || r.NAME || r.column_name || "").toString());
      
      if (!cols.includes("is_admin")) {
        // Add the column
        await db.execute({
          sql: `ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`,
          args: [],
        });
        console.log("✅ Added is_admin column");
      } else {
        console.log("✅ Column is_admin already exists");
      }
    } catch (err) {
      console.log("Note: Could not check existing columns, attempting ALTER...");
      try {
        await db.execute({
          sql: `ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0`,
          args: [],
        });
        console.log("✅ Added is_admin column");
      } catch (e) {
        if (e.message && e.message.includes("duplicate column name")) {
          console.log("✅ Column is_admin already exists");
        } else {
          throw e;
        }
      }
    }

    // Create admin@go.go as admin user
    console.log("\nSetting up admin@go.go as administrator...");
    
    const adminCheck = await db.execute({
      sql: `SELECT email FROM users WHERE email = ?`,
      args: ['admin@go.go']
    });

    if (adminCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (email, subscription_tier, subscription_status, is_admin) VALUES (?, ?, ?, ?)`,
        args: ['admin@go.go', 'free', 'active', 1]
      });
      console.log("✅ Created admin@go.go as administrator");
    } else {
      await db.execute({
        sql: `UPDATE users SET is_admin = ? WHERE email = ?`,
        args: [1, 'admin@go.go']
      });
      console.log("✅ Updated admin@go.go to administrator");
    }

    // Update wlazovskaya@gmail.com to Pro tier (not admin)
    console.log("\nUpdating wlazovskaya@gmail.com to Pro tier...");
    
    const userCheck = await db.execute({
      sql: `SELECT email FROM users WHERE email = ?`,
      args: ['wlazovskaya@gmail.com']
    });

    if (userCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (email, subscription_tier, subscription_status, is_admin) VALUES (?, ?, ?, ?)`,
        args: ['wlazovskaya@gmail.com', 'pro', 'active', 0]
      });
      console.log("✅ Created wlazovskaya@gmail.com as Pro user");
    } else {
      await db.execute({
        sql: `UPDATE users SET subscription_tier = ?, subscription_status = ?, is_admin = ? WHERE email = ?`,
        args: ['pro', 'active', 0, 'wlazovskaya@gmail.com']
      });
      console.log("✅ Updated wlazovskaya@gmail.com to Pro user");
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log("\nUser Roles:");
    console.log("  • Admin (admin@go.go): Full system access + Admin panel");
    console.log("\nSubscription Tiers:");
    console.log("  • Free: Basic access");
    console.log("  • Premium: Can see prices, targets, stops, explanations");
    console.log("  • Pro: Premium features + Custom symbol analysis");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
})();
