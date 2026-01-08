import { redirect } from 'next/navigation';
import { createClient } from '@libsql/client';
import { cookies } from 'next/headers';

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect('/login?error=invalid_token');
  }

  try {
    // Check token
    const result = await db.execute({
      sql: 'SELECT * FROM magic_links WHERE token = ? AND used = 0 AND expires_at > datetime("now")',
      args: [token],
    });

    if (result.rows.length === 0) {
      redirect('/login?error=expired_token');
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
      redirect('/login?error=user_not_found');
    }

    const user = userResult.rows[0] as any;

    // Set session cookie
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

    redirect('/oracle');
  } catch (error) {
    console.error('Verify error:', error);
    redirect('/login?error=server_error');
  }
}
