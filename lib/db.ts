import { createClient } from "@libsql/client";

// Expect DATABASE_URL and (optionally) DATABASE_AUTH_TOKEN to be set.
// This file is server-only; do NOT expose these env vars to client.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. For Turso set DATABASE_URL and DATABASE_AUTH_TOKEN.");
}

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

// wrapper matching previously used db.execute({ sql, args })
export const db = {
  execute: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
    const res = await client.execute({ sql, args });
    return { rows: res.rows ?? [], info: res };
  },
};

export default db;
