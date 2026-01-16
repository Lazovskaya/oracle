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
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.execute({
      sql: 'SELECT id, password_hash FROM users WHERE email = ?',
      args: [email],
    });

    if (existing.rows.length > 0) {
      // If user exists but has no password (magic link only), allow setting password
      if (existing.rows[0].password_hash) {
        return NextResponse.json({ 
          error: 'Email already registered. Please login.' 
        }, { status: 400 });
      }
      
      // Update existing user with password
      const hash = await bcrypt.hash(password, 10);
      await db.execute({
        sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
        args: [hash, email],
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Password set successfully. You can now login.' 
      });
    }

    // Create new user with password
    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO users (email, password_hash, subscription_tier) VALUES (?, ?, ?)',
      args: [email, hash, 'free'],
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully' 
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    return NextResponse.json({ 
      error: 'Registration failed' 
    }, { status: 500 });
  }
}
