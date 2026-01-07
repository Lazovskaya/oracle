require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });
const { createClient } = require('@libsql/client');

(async () => {
  try {
    const url = process.env.DATABASE_URL;
    const token = process.env.DATABASE_AUTH_TOKEN;
    if (!url) {
      console.error('DATABASE_URL not set');
      process.exit(2);
    }
    const client = createClient({ url, authToken: token });
    const r = await client.execute({ sql: 'SELECT 1 as ok' });
    console.log('Turso OK:', r.rows ?? r);
    process.exit(0);
  } catch (e) {
    console.error('Turso error:', e);
    process.exit(1);
  }
})();