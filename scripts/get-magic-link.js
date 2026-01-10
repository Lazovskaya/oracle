// Script to generate magic link for admin login
(async () => {
  try {
    const email = process.argv[2] || 'admin@go.go';
    const crypto = require('crypto');
    
    console.log(`\n🔗 Generating magic link for: ${email}\n`);
    
    const dbModule = require("../lib/db");
    const db = dbModule.db ?? dbModule;
    
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Insert magic link
    await db.execute({
      sql: `INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)`,
      args: [email, token, expiresAt]
    });
    
    const magicLink = `http://localhost:3000/api/auth/verify?token=${token}`;
    
    console.log('✅ Magic link generated!\n');
    console.log('📋 Your magic link:');
    console.log('━'.repeat(80));
    console.log(magicLink);
    console.log('━'.repeat(80));
    console.log('\n💡 Copy and paste this link in your browser to log in');
    console.log(`⏰ Link expires in 15 minutes\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
