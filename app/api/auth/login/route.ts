import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Get user with password hash
    const result = await db.execute({
      sql: 'SELECT id, email, password_hash, subscription_tier, subscription_status FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    const user = result.rows[0];

    // Check if user has password set
    if (!user.password_hash) {
      return NextResponse.json({ 
        error: 'No password set. Please use magic link to login or register first.' 
      }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash as string);
    
    if (!isValid) {
      return NextResponse.json({ 
        error: 'Invalid email or password' 
      }, { status: 401 });
    }

    // Check if user has active paid subscription (Pro or Premium)
    const isPaidUser = user.subscription_tier !== 'free' && 
                       user.subscription_status === 'active';

    // Set session duration: 30 days for paid users, 7 days for free users
    const sessionDuration = isPaidUser ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const sessionExpiresAt = new Date(Date.now() + sessionDuration);

    // Update session expiration in database
    await db.execute({
      sql: 'UPDATE users SET session_expires_at = ? WHERE email = ?',
      args: [sessionExpiresAt.toISOString(), email],
    });

    // Create response with session cookie
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        tier: user.subscription_tier,
        status: user.subscription_status,
      },
      sessionDuration: isPaidUser ? '30 days' : '7 days',
    });

    // Set HTTP-only cookie for authentication
    response.cookies.set('user_email', email as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionDuration / 1000, // in seconds
      path: '/',
    });

    response.cookies.set('auth_method', 'password', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: sessionDuration / 1000,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('❌ Login error:', error);
    return NextResponse.json({ 
      error: 'Login failed' 
    }, { status: 500 });
  }
}
