import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailParams {
  email: string;
  tier: 'premium' | 'pro';
  subscriptionEndDate: string;
}

export async function sendWelcomeEmail({ email, tier, subscriptionEndDate }: WelcomeEmailParams) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured - email will not be sent');
      return { success: false, error: 'Email service not configured' };
    }

    console.log(`📧 Sending welcome email to ${email} for ${tier} subscription...`);
    
    const tierName = tier === 'premium' ? 'Premium' : 'Pro';
    const endDate = new Date(subscriptionEndDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const features = tier === 'premium' 
      ? [
          'Full entry, stop-loss, and target levels',
          'Risk management guidance',
          'Crypto & stocks trading ideas',
          'Performance tracking',
        ]
      : [
          'Everything in Premium',
          'Custom ticker analyzer',
          'Performance tracking & statistics',
          'Win rate analytics',
          'Historical idea archive',
          'Priority support',
        ];

    await resend.emails.send({
      from: 'FinForesee Market Oracle <no-reply@finforesee.com>',
      to: email,
      replyTo: 'support@finforesee.com',
      subject: `Welcome to ${tierName} - FinForesee Market Oracle`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0; }
              .header-title { font-size: 28px; font-weight: 700; color: white; margin: 0; }
              .header-subtitle { font-size: 16px; color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; }
              .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 40px 30px; }
              .welcome-text { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 20px 0; }
              .success-badge { display: inline-block; background: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
              .tier-badge { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 8px 16px; border-radius: 6px; font-size: 16px; font-weight: 700; margin: 20px 0; }
              .info-box { background: #f9fafb; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
              .info-label { font-weight: 600; color: #374151; font-size: 14px; }
              .info-value { color: #6b7280; font-size: 14px; margin-top: 5px; }
              .features-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 30px 0 15px 0; }
              .features-list { list-style: none; padding: 0; margin: 0; }
              .features-list li { padding: 10px 0; padding-left: 30px; position: relative; color: #374151; }
              .features-list li:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; font-size: 18px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 30px 0 20px 0; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
              .button:hover { box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4); }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
              .divider { border-top: 1px solid #e5e7eb; margin: 30px 0; }
              .support-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; }
              .support-text { color: #1e40af; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="header-title">🎉 Welcome to ${tierName}!</h1>
                <p class="header-subtitle">FinForesee Market Oracle</p>
              </div>
              
              <div class="content">
                <div class="success-badge">✓ Registration Successful</div>
                
                <p class="welcome-text">Hello,</p>
                <p>Thank you for subscribing to FinForesee Market Oracle! Your ${tierName} subscription is now active.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <span class="tier-badge">${tierName.toUpperCase()} PLAN</span>
                </div>
                
                <div class="info-box">
                  <div class="info-label">Subscription Status</div>
                  <div class="info-value">Active until ${endDate}</div>
                </div>
                
                <h3 class="features-title">Your ${tierName} Benefits:</h3>
                <ul class="features-list">
                  ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div style="text-align: center;">
                  <a href="https://finforesee.com/oracle" class="button">
                    View Latest Predictions →
                  </a>
                </div>
                
                <div class="divider"></div>
                
                <div class="support-box">
                  <p class="support-text">
                    <strong>Need help?</strong> Our support team is ready to assist you.<br>
                    Email us at <a href="mailto:support@finforesee.com" style="color: #2563eb; text-decoration: none;">support@finforesee.com</a>
                  </p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                  You can manage your subscription anytime from your <a href="https://finforesee.com/account" style="color: #2563eb;">account dashboard</a>.
                </p>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">© 2026 FinForesee Market Oracle</p>
                <p style="margin: 10px 0 0 0;">AI-powered swing trading insights for stocks & crypto</p>
                <p style="margin: 10px 0 0 0;">
                  <a href="https://finforesee.com/terms" style="color: #6b7280; text-decoration: none;">Terms</a> · 
                  <a href="https://finforesee.com/privacy" style="color: #6b7280; text-decoration: none;">Privacy</a> · 
                  <a href="https://finforesee.com/faq" style="color: #6b7280; text-decoration: none;">FAQ</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ Welcome email sent to ${email} for ${tierName} subscription`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send welcome email:', {
      email,
      tier,
      error: error.message,
      statusCode: error.statusCode,
      name: error.name,
    });
    // Don't throw - email failure shouldn't break the subscription process
    return { success: false, error: error.message };
  }
}

interface CancellationEmailParams {
  email: string;
  tier: 'premium' | 'pro';
  subscriptionEndDate: string;
}

export async function sendCancellationEmail({ email, tier, subscriptionEndDate }: CancellationEmailParams) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not configured - email will not be sent');
      return { success: false, error: 'Email service not configured' };
    }

    console.log(`📧 Sending cancellation email to ${email}...`);
    
    const tierName = tier === 'premium' ? 'Premium' : 'Pro';
    const endDate = new Date(subscriptionEndDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await resend.emails.send({
      from: 'FinForesee Market Oracle <no-reply@finforesee.com>',
      to: email,
      replyTo: 'support@finforesee.com',
      subject: `Subscription Cancelled - FinForesee Market Oracle`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 30px 0; background: #f3f4f6; border-radius: 8px 8px 0 0; }
              .header-title { font-size: 28px; font-weight: 700; color: #374151; margin: 0; }
              .content { background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; padding: 40px 30px; }
              .info-badge { display: inline-block; background: #ef4444; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: 600; margin-bottom: 20px; }
              .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
              .info-label { font-weight: 600; color: #92400e; font-size: 14px; }
              .info-value { color: #78350f; font-size: 14px; margin-top: 5px; }
              .features-box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .features-title { font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0; }
              .features-list { list-style: none; padding: 0; margin: 0; }
              .features-list li { padding: 8px 0; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
              .button:hover { box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4); }
              .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
              .divider { border-top: 1px solid #e5e7eb; margin: 30px 0; }
              .support-box { background: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; }
              .support-text { color: #1e40af; font-size: 14px; margin: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="header-title">Subscription Cancelled</h1>
              </div>
              
              <div class="content">
                <div class="info-badge">Cancellation Confirmed</div>
                
                <p style="font-size: 16px; font-weight: 600; margin: 0 0 20px 0;">Hello,</p>
                <p>Your ${tierName} subscription has been cancelled as requested.</p>
                
                <div class="info-box">
                  <div class="info-label">Access Remaining Until</div>
                  <div class="info-value">${endDate}</div>
                  <p style="color: #78350f; font-size: 13px; margin: 10px 0 0 0;">
                    You'll continue to have full access to your ${tierName} features until the end of your current billing period.
                  </p>
                </div>
                
                <div class="features-box">
                  <h3 class="features-title">What happens next?</h3>
                  <ul class="features-list">
                    <li>✓ Your ${tierName} features remain active until ${endDate}</li>
                    <li>✓ No further charges will be made</li>
                    <li>✓ After ${endDate}, your account will revert to the Free tier</li>
                    <li>✓ You can resubscribe anytime from your account page</li>
                  </ul>
                </div>
                
                <p style="font-size: 15px; color: #374151; margin: 30px 0 20px 0;">
                  <strong>We're sorry to see you go!</strong> If you cancelled due to any issues or concerns, we'd love to hear your feedback.
                </p>
                
                <div class="support-box">
                  <p class="support-text">
                    <strong>Have feedback or need help?</strong><br>
                    Email us at <a href="mailto:support@finforesee.com" style="color: #2563eb; text-decoration: none;">support@finforesee.com</a>
                  </p>
                </div>
                
                <div class="divider"></div>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center;">
                  Want to continue? You can resubscribe anytime.
                </p>
                
                <div style="text-align: center;">
                  <a href="https://finforesee.com/pricing" class="button">
                    View Pricing Plans →
                  </a>
                </div>
              </div>
              
              <div class="footer">
                <p style="margin: 0;">© 2026 FinForesee Market Oracle</p>
                <p style="margin: 10px 0 0 0;">AI-powered swing trading insights for stocks & crypto</p>
                <p style="margin: 10px 0 0 0;">
                  <a href="https://finforesee.com/terms" style="color: #6b7280; text-decoration: none;">Terms</a> · 
                  <a href="https://finforesee.com/privacy" style="color: #6b7280; text-decoration: none;">Privacy</a> · 
                  <a href="https://finforesee.com/faq" style="color: #6b7280; text-decoration: none;">FAQ</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`✅ Cancellation email sent to ${email}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send cancellation email:', {
      email,
      error: error.message,
      statusCode: error.statusCode,
      name: error.name,
    });
    return { success: false, error: error.message };
  }
}
