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
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Token and password required' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Verify reset token
    const tokenResult = await db.execute({
      sql: `SELECT email, expires_at, used FROM password_reset_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`,
      args: [token],
    });

    if (tokenResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token' 
      }, { status: 400 });
    }

    const resetToken = tokenResult.rows[0];
    const email = resetToken.email as string;

    // Hash new password
    const hash = await bcrypt.hash(password, 10);

    // Update password
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
      args: [hash, email],
    });

    // Mark token as used
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
      args: [token],
    });

    console.log('✅ Password reset successful for:', email);

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully. You can now login with your new password.' 
    });

  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password' 
    }, { status: 500 });
  }
}
