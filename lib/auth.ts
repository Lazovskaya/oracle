import { createClient } from '@libsql/client';

const authDb = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export interface User {
  id: number;
  email: string;
  subscription_tier: 'free' | 'premium' | 'pro';
  subscription_status: 'active' | 'canceled' | 'expired' | null;
  stripe_customer_id: string | null;
  created_at: string;
  subscription_end_date: string | null;
  trading_style: 'conservative' | 'balanced' | 'aggressive';
  asset_preference: 'crypto' | 'stocks' | 'both';
  is_admin: boolean;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await authDb.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0] as any;
  return {
    id: row.id,
    email: row.email,
    subscription_tier: row.subscription_tier || 'free',
    subscription_status: row.subscription_status,
    stripe_customer_id: row.stripe_customer_id,
    created_at: row.created_at,
    subscription_end_date: row.subscription_end_date,
    trading_style: row.trading_style || 'balanced',
    asset_preference: row.asset_preference || 'both',
    is_admin: row.is_admin === 1,
  };
}

export async function createUser(email: string): Promise<User> {
  const isAdmin = email === 'admin@go.go';
  const result = await authDb.execute({
    sql: 'INSERT INTO users (email, subscription_tier, is_admin) VALUES (?, ?, ?) RETURNING *',
    args: [email, 'free', isAdmin ? 1 : 0],
  });
  
  const row = result.rows[0] as any;
  return {
    id: row.id,
    email: row.email,
    subscription_tier: 'free',
    subscription_status: null,
    stripe_customer_id: null,
    created_at: row.created_at,
    subscription_end_date: null,
    trading_style: 'balanced',
    asset_preference: 'both',
    is_admin: isAdmin,
  };
}

export async function updateUserSubscription(
  email: string,
  tier: 'free' | 'premium',
  status: 'active' | 'canceled' | 'expired' | null,
  stripeCustomerId?: string,
  endDate?: string
): Promise<void> {
  await authDb.execute({
    sql: `
      UPDATE users 
      SET subscription_tier = ?, 
          subscription_status = ?,
          stripe_customer_id = ?,
          subscription_end_date = ?
      WHERE email = ?
    `,
    args: [tier, status, stripeCustomerId || null, endDate || null, email],
  });
}

/**
 * Check if user's subscription has expired and automatically revoke access
 */
export async function checkAndRevokeExpiredAccess(user: User): Promise<User> {
  // If user has a subscription end date and it's in the past
  if (user.subscription_end_date && user.subscription_tier !== 'free') {
    const endDate = new Date(user.subscription_end_date);
    const now = new Date();
    
    if (now > endDate) {
      // Subscription has expired, downgrade to free
      console.log(`⏰ Revoking expired access for ${user.email} (expired: ${user.subscription_end_date})`);
      
      await updateUserSubscription(
        user.email,
        'free',
        'expired',
        user.stripe_customer_id || undefined,
        user.subscription_end_date
      );
      
      // Return updated user object
      return {
        ...user,
        subscription_tier: 'free',
        subscription_status: 'expired',
      };
    }
  }
  
  return user;
}

/**
 * Update user's trading style preference
 */
export async function updateUserTradingStyle(
  email: string,
  tradingStyle: 'conservative' | 'balanced' | 'aggressive'
): Promise<void> {
  await authDb.execute({
    sql: 'UPDATE users SET trading_style = ? WHERE email = ?',
    args: [tradingStyle, email],
  });
}

/**
 * Update user's asset preference
 */
export async function updateUserAssetPreference(
  email: string,
  assetPreference: 'crypto' | 'stocks' | 'both'
): Promise<void> {
  await authDb.execute({
    sql: 'UPDATE users SET asset_preference = ? WHERE email = ?',
    args: [assetPreference, email],
  });
}
