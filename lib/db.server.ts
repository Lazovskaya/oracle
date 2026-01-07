import path from "path";
import { createClient } from "@libsql/client";

/**
 * Server-only Turso libsql wrapper.
 * - Lazy-inits client so importing this module never throws.
 * - Requires DATABASE_URL at runtime; throws when execute is called without it.
 */
let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      // Do not throw at import time; throw when a DB op is attempted.
      return null;
    }
    client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }
  return client;
}

export const db = {
  /**
   * Execute SQL. Returns { rows, info } similar shape for both libSQL and sqlite.
   * No top-level throws — if env missing we fall back to sqlite.
   */
  execute: async ({ sql, args = [] }: { sql: string; args?: any[] }) => {
    const c = getClient();
    if (!c) {
      throw new Error("DATABASE_URL is not set. Set DATABASE_URL to your Turso libsql endpoint.");
    }
    const res = await c.execute({ sql, args });
    return { rows: res.rows ?? [], info: res };
  },
};

export default db;