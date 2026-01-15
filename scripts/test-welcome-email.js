// Test script to manually send welcome email
// Usage: node scripts/test-welcome-email.js

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const email = 'trade.market.oracle@proton.me';
const tier = 'premium'; // or 'pro'

async function testWelcomeEmail() {
  console.log('\n📧 Testing Welcome Email\n');
  console.log('Email:', email);
  console.log('Tier:', tier);
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✓ Set' : '✗ Not set');
  console.log('');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    console.log('\nTo fix:');
    console.log('1. Create a Resend account at https://resend.com');
    console.log('2. Add RESEND_API_KEY to your .env.local file');
    console.log('3. Verify your domain or use onboarding@resend.dev for testing');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const tierName = tier === 'premium' ? 'Premium' : 'Pro';
  const subscriptionEndDate = new Date();
  subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
  const endDate = subscriptionEndDate.toLocaleDateString('en-US', {
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

  try {
    console.log('📤 Sending email via Resend...\n');
    
    const result = await resend.emails.send({
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
              .content { background: #ffffff; border: 1px solid #e5e7eb; padding: 40px 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 class="header-title">🎉 Welcome to ${tierName}!</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">FinForesee Market Oracle</p>
              </div>
              
              <div class="content">
                <p style="font-size: 18px; font-weight: 600;">Hello,</p>
                <p>Thank you for subscribing to FinForesee Market Oracle! Your ${tierName} subscription is now active.</p>
                
                <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 15px 20px; margin: 20px 0;">
                  <div style="font-weight: 600; color: #374151;">Subscription Status</div>
                  <div style="color: #6b7280; margin-top: 5px;">Active until ${endDate}</div>
                </div>
                
                <h3 style="margin-top: 30px;">Your ${tierName} Benefits:</h3>
                <ul>
                  ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://finforesee.com/oracle" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                    View Latest Predictions →
                  </a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.data?.id);
    console.log('\n📊 Check email status at: https://resend.com/emails');
    
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('Error details:', error);
    
    if (error.statusCode === 422) {
      console.log('\n⚠️ Domain not verified:');
      console.log('1. Go to https://resend.com/domains');
      console.log('2. Add and verify finforesee.com');
      console.log('3. Or use: onboarding@resend.dev for testing');
    }
    
    process.exit(1);
  }
}

testWelcomeEmail();
