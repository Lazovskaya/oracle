const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function addAdminColumn() {
  try {
    console.log('Checking if is_admin column exists...');
    
    // Check if column already exists
    const tableInfo = await db.execute('PRAGMA table_info(users)');
    const hasAdminColumn = tableInfo.rows.some(row => row.name === 'is_admin');
    
    if (!hasAdminColumn) {
      console.log('Adding is_admin column to users table...');
      
      // Add is_admin column (defaults to 0/false)
      await db.execute(`
        ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0
      `);
      
      console.log('✅ Added is_admin column');
    } else {
      console.log('✅ Column is_admin already exists');
    }
    
    // Set wlazovskaya@gmail.com as admin
    console.log('Setting wlazovskaya@gmail.com as admin...');
    await db.execute({
      sql: 'UPDATE users SET is_admin = 1 WHERE email = ?',
      args: ['wlazovskaya@gmail.com']
    });
    
    console.log('✅ Admin user set successfully');
    
    // Verify
    const result = await db.execute({
      sql: 'SELECT email, is_admin FROM users WHERE email = ?',
      args: ['wlazovskaya@gmail.com']
    });
    
    if (result.rows.length > 0) {
      console.log('✅ Verification:', result.rows[0]);
    } else {
      console.log('⚠️ User wlazovskaya@gmail.com not found in database yet. Admin flag will be set on first login.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addAdminColumn();
