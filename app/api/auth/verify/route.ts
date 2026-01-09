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

    // Set session cookies
    const cookieStore = await cookies();
    cookieStore.set('user_email', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    cookieStore.set('subscription_tier', user.subscription_tier || 'free', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.redirect(new URL('/oracle', req.url));
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
