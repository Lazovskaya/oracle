import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    // Check token
    const result = await db.execute({
      sql: 'SELECT * FROM magic_links WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      args: [token],
    });

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL('/login?error=expired_token', req.url));
    }

    const magicLink = result.rows[0] as any;

    // Mark token as used
    await db.execute({
      sql: 'UPDATE magic_links SET used = 1 WHERE token = ?',
      args: [token],
    });

    // Get user
    const userResult = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [magicLink.email],
    });

    if (userResult.rows.length === 0) {
      return NextResponse.redirect(new URL('/login?error=user_not_found', req.url));
    }

    const user = userResult.rows[0] as any;

    // Determine session lifetime based on subscription tier
    const tier = user.subscription_tier || 'free';
    let sessionMaxAge: number;
    
    switch (tier) {
      case 'pro':
        sessionMaxAge = 30 * 24 * 60 * 60; // 30 days
        break;
      case 'premium':
        sessionMaxAge = 7 * 24 * 60 * 60; // 7 days
        break;
      case 'free':
      default:
        sessionMaxAge = 60 * 60; // 1 hour
        break;
    }

    // Set session cookies with tier-based lifetime
    const cookieStore = await cookies();
    cookieStore.set('user_email', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionMaxAge,
    });

    cookieStore.set('subscription_tier', tier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionMaxAge,
    });

    return NextResponse.redirect(new URL('/oracle', req.url));
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
