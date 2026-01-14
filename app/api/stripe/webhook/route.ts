import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';

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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.metadata?.email;
        const tier = session.metadata?.tier || 'premium';
        
        if (email && session.payment_status === 'paid' && session.subscription) {
          // Get subscription details
          const subscriptionData = await stripe.subscriptions.retrieve(session.subscription as string);
          const subscription = subscriptionData as any;
          const endDate = new Date(subscription.current_period_end * 1000);
          
          // Update user with subscription info
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
          
          console.log(`✅ Subscription activated for ${email} - Tier: ${tier}, Until: ${endDate.toISOString()}`);
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
          
          await db.execute({
            sql: `UPDATE users 
                  SET subscription_status = ?,
                      subscription_end_date = ?
                  WHERE email = ?`,
            args: [status, endDate.toISOString(), email],
          });
          
          console.log(`🔄 Subscription updated for ${email} - Status: ${status}`);
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
          
          console.log(`❌ Subscription canceled for ${email} - Downgraded to free`);
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
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
