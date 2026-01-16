import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import crypto from 'crypto';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Check if user exists and has password set
    const userResult = await db.execute({
      sql: 'SELECT id, password_hash FROM users WHERE email = ?',
      args: [email],
    });

    if (userResult.rows.length === 0 || !userResult.rows[0].password_hash) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({ 
        success: true,
        message: 'If this email is registered, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await db.execute({
      sql: 'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      args: [email, token, expiresAt.toISOString()],
    });

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    try {
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY not configured');
        throw new Error('Email service not configured');
      }

      await resend.emails.send({
        from: 'FinForesee Market Oracle <no-reply@finforesee.com>',
        to: email,
        replyTo: 'support@finforesee.com',
        subject: 'Reset your password',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #111827;">
                    Reset Your Password
                  </h1>
                  
                  <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.5; color: #374151;">
                    You requested to reset your password for your FinForesee account.
                  </p>
                  
                  <div style="margin: 32px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                      Reset Password
                    </a>
                  </div>
                  
                  <p style="margin: 24px 0 16px 0; font-size: 14px; color: #6b7280;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #2563eb; word-break: break-all;">
                    ${resetLink}
                  </p>
                  
                  <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
                      This link will expire in 1 hour.
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    © 2026 FinForesee Market Oracle. AI-powered trading insights.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('✅ Password reset email sent to:', email);
    } catch (emailError: any) {
      console.error('❌ Failed to send reset email:', {
        email,
        error: emailError.message,
      });
      
      // In production, fail the request if email cannot be sent
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again.' },
          { status: 500 }
        );
      }
      
      // In development, log the token
      console.log('🔗 Development - Reset token:', token);
    }

    return NextResponse.json({ 
      success: true,
      message: 'If this email is registered, you will receive a password reset link.' 
    });

  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
}
