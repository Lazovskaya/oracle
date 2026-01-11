const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function setAdminRole() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  });

  try {
    // Update admin role
    await client.execute({
      sql: 'UPDATE users SET is_admin = 1 WHERE email = ?',
      args: ['wlazovskaya@gmail.com']
    });

    // Verify the update
    const result = await client.execute({
      sql: 'SELECT email, is_admin, subscription_tier FROM users WHERE email = ?',
      args: ['wlazovskaya@gmail.com']
    });

    console.log('✅ Admin role updated successfully:');
    console.log(result.rows);

    // Check if admin@go.go exists and should be removed
    const oldAdmin = await client.execute({
      sql: 'SELECT email FROM users WHERE email = ?',
      args: ['admin@go.go']
    });

    if (oldAdmin.rows.length > 0) {
      await client.execute({
        sql: 'DELETE FROM users WHERE email = ?',
        args: ['admin@go.go']
      });
      console.log('✅ Removed admin@go.go user');
    }
  } catch (error) {
    console.error('❌ Error updating admin role:', error);
  } finally {
    client.close();
  }
}

setAdminRole();
