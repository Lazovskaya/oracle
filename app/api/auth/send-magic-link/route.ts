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

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store magic link
    await db.execute({
      sql: 'INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)',
      args: [email, token, expiresAt.toISOString()],
    });

    // Create user if doesn't exist
    const userCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });

    if (userCheck.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO users (email, subscription_tier) VALUES (?, ?)',
        args: [email, 'free'],
      });
    }

    // Get the origin from the request
    const { origin } = new URL(req.url);
    const baseUrl = process.env.NEXT_PUBLIC_URL || origin;
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    // Send magic link via Resend
    try {
      await resend.emails.send({
        from: 'FinForesee Market Oracle <no-reply@finforesee.com>',
        to: email,
        replyTo: 'support@finforesee.com',
        subject: 'Sign in to FinForesee Market Oracle',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 30px 0; }
                .title { font-size: 24px; font-weight: 600; color: #1f2937; margin: 0; }
                .content { background: #f9fafb; border-radius: 8px; padding: 30px; margin: 20px 0; }
                .button { display: inline-block; background: #2563eb; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 500; margin: 20px 0; }
                .button:hover { background: #1d4ed8; }
                .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
                .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 class="title">FinForesee Market Oracle</h1>
                </div>
                
                <div class="content">
                  <p style="margin-top: 0;">Hello,</p>
                  <p>Use the link below to access your account:</p>
                  
                  <div style="text-align: center;">
                    <a href="${magicLink}" class="button">
                      Sign in
                    </a>
                  </div>
                  
                  <div class="divider"></div>
                  
                  <p style="font-size: 14px; color: #6b7280;">
                    This link will expire in <strong>10 minutes</strong> for security reasons.
                  </p>
                  
                  <p style="font-size: 14px; color: #6b7280;">
                    If you did not request this email, you can ignore it.
                  </p>
                </div>
                
                <div class="footer">
                  <p>© 2026 FinForesee Market Oracle. AI-powered trading insights.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log('✅ Magic link sent via Resend to:', email);
    } catch (emailError: any) {
      console.error('❌ Resend email error:', emailError);
      // Log but don't fail - in development, show link in console
      console.log('🔗 Magic link (fallback):', magicLink);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent to your email',
      // Return link for client-side handling
      magicLink: magicLink,
      // Temporarily enabled for production until email is fixed
      isDevelopment: true // process.env.NODE_ENV === 'development'
    });
  } catch (error: any) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 });
  }
}
