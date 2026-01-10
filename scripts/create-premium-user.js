// Script to create a premium user
(async () => {
  try {
    const email = 'premium@go.go';
    
    console.log(`\n✨ Creating Premium user: ${email}\n`);
    
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;
    
    // Check if user already exists
    const existingUser = await db.execute({
      sql: `SELECT email, subscription_tier FROM users WHERE email = ?`,
      args: [email]
    });

    if (existingUser.rows.length > 0) {
      console.log('User already exists, updating to Premium tier...');
      await db.execute({
        sql: `UPDATE users SET subscription_tier = ?, subscription_status = ? WHERE email = ?`,
        args: ['premium', 'active', email]
      });
      console.log('✅ Updated to Premium tier');
    } else {
      // Create new user
      await db.execute({
        sql: `INSERT INTO users (email, subscription_tier, subscription_status, is_admin) VALUES (?, ?, ?, ?)`,
        args: [email, 'premium', 'active', 0]
      });
      console.log('✅ Created new Premium user');
    }

    // Generate magic link
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    await db.execute({
      sql: `INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)`,
      args: [email, token, expiresAt]
    });
    
    const magicLink = `http://localhost:3000/api/auth/verify?token=${token}`;
    
    console.log('\n📋 Login link for premium@go.go:');
    console.log('━'.repeat(80));
    console.log(magicLink);
    console.log('━'.repeat(80));
    console.log('\n💎 Premium features:');
    console.log('  • Access to Oracle predictions');
    console.log('  • Can see prices, targets, stops, and explanations');
    console.log('  • Full oracle idea details\n');
    console.log('⏰ Link expires in 15 minutes\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
