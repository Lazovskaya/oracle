import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { sendWelcomeEmail, sendCancellationEmail } from '@/lib/emailService';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  try {
    console.log('📥 Webhook received:', event.type, 'ID:', event.id);
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.metadata?.email;
        const tierRaw = session.metadata?.tier || 'premium';
        
        // Map tier names: premium-yearly -> premium, pro-yearly -> pro
        const tier = tierRaw.replace('-yearly', '') as 'premium' | 'pro';
        
        console.log('🔍 Processing checkout:', { 
          email, 
          tier_raw: tierRaw,
          tier_final: tier,
          payment_status: session.payment_status,
          has_subscription: !!session.subscription,
          customer: session.customer 
        });
        
        if (email && session.payment_status === 'paid' && session.subscription) {
          try {
            // Get subscription details
            console.log('📡 Retrieving subscription from Stripe...');
            const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string);
            const subscription = subscriptionData as any;
            
            console.log('✓ Subscription retrieved:', subscription.id);
            console.log('📅 Subscription period_end:', subscription.current_period_end, typeof subscription.current_period_end);
            
            // Validate and convert end date
            let endDate: Date;
            if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
              endDate = new Date(subscription.current_period_end * 1000);
            } else {
              // Fallback: 30 days from now
              console.log('⚠️ No valid current_period_end, using 30 days default');
              endDate = new Date();
              endDate.setDate(endDate.getDate() + 30);
            }
            
            console.log('📆 End date calculated:', endDate.toISOString());
            
            // Check if user exists
            const userCheck = await db.execute({
              sql: 'SELECT id FROM users WHERE email = ?',
              args: [email],
            });
            
            if (userCheck.rows.length === 0) {
              // Create user if doesn't exist
              console.log('👤 Creating new user:', email);
              await db.execute({
                sql: 'INSERT INTO users (email, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_end_date) VALUES (?, ?, ?, ?, ?, ?)',
                args: [email, tier, 'active', session.customer, subscription.id, endDate.toISOString()],
              });
              console.log('✅ New user created with subscription');
              
              // Send welcome email
              await sendWelcomeEmail({
                email,
                tier: tier as 'premium' | 'pro',
                subscriptionEndDate: endDate.toISOString(),
              });
            } else {
              // Update existing user
              console.log('💾 Updating existing user:', email);
              await db.execute({
                sql: `UPDATE users 
                      SET subscription_tier = ?, 
                          subscription_status = 'active',
                          stripe_customer_id = ?,
                          stripe_subscription_id = ?,
                          subscription_end_date = ?
                      WHERE email = ?`,
                args: [tier, session.customer, subscription.id, endDate.toISOString(), email],
              });
              console.log('✅ User subscription updated');
              
              // Send welcome email
              await sendWelcomeEmail({
                email,
                tier: tier as 'premium' | 'pro',
                subscriptionEndDate: endDate.toISOString(),
              });
            }
            
            console.log(`✅ Subscription activated for ${email} - Tier: ${tier}, Until: ${endDate.toISOString()}`);
          } catch (subError: any) {
            console.error('❌ Error processing subscription:', {
              message: subError.message,
              stack: subError.stack,
              email,
            });
            throw subError;
          }
        } else {
          console.log('⚠️ Skipping - conditions not met:', { 
            hasEmail: !!email, 
            isPaid: session.payment_status === 'paid',
            hasSubscription: !!session.subscription 
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerData = await stripe.customers.retrieve(subscription.customer as string);
        const customer = customerData as any;
        const email = customer.email;
        
        if (email) {
          const endDate = new Date(subscription.current_period_end * 1000);
          const status = subscription.cancel_at_period_end ? 'canceled' : 'active';
          
          // Get current tier before updating
          const userResult = await db.execute({
            sql: 'SELECT subscription_tier FROM users WHERE email = ?',
            args: [email],
          });
          
          const currentTier = userResult.rows[0]?.subscription_tier as string;
          
          await db.execute({
            sql: `UPDATE users 
                  SET subscription_status = ?,
                      subscription_end_date = ?
                  WHERE email = ?`,
            args: [status, endDate.toISOString(), email],
          });
          
          console.log(`🔄 Subscription updated for ${email} - Status: ${status}`);
          
          // Send cancellation email if subscription was just cancelled
          if (subscription.cancel_at_period_end && (currentTier === 'premium' || currentTier === 'pro')) {
            await sendCancellationEmail({
              email,
              tier: currentTier as 'premium' | 'pro',
              subscriptionEndDate: endDate.toISOString(),
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerData = await stripe.customers.retrieve(subscription.customer as string);
        const customer = customerData as any;
        const email = customer.email;
        
        if (email) {
          await db.execute({
            sql: `UPDATE users 
                  SET subscription_tier = 'free',
                      subscription_status = 'expired',
                      stripe_subscription_id = NULL
                  WHERE email = ?`,
            args: [email],
          });
          
          console.log(`❌ Subscription expired for ${email} - Downgraded to free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerData = await stripe.customers.retrieve(invoice.customer as string);
        const customer = customerData as any;
        const email = customer.email;
        
        if (email) {
          console.log(`⚠️ Payment failed for ${email}`);
          // Optionally send email notification
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook handler error:', {
      message: error.message,
      stack: error.stack,
      event_type: event?.type,
      event_id: event?.id,
    });
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      message: error.message 
    }, { status: 500 });
  }
}
