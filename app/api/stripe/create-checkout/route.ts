import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;

    const { priceId, tier, currency = 'USD', email } = await req.json();

    // Use email from request body if provided, otherwise use cookie email
    const userEmail = email || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Creating checkout session:', { priceId, tier, currency, userEmail });

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Check if user has an existing active subscription
    const userResult = await db.execute({
      sql: 'SELECT stripe_subscription_id, stripe_customer_id, subscription_tier FROM users WHERE email = ?',
      args: [userEmail],
    });

    const userData = userResult.rows[0] as any;
    
    // If user has an active subscription, cancel it first to prevent double billing
    if (userData?.stripe_subscription_id) {
      try {
        console.log(`🔄 Canceling existing subscription ${userData.stripe_subscription_id} for ${userEmail}`);
        await stripe.subscriptions.cancel(userData.stripe_subscription_id);
        
        // Clear the subscription ID in database
        await db.execute({
          sql: 'UPDATE users SET stripe_subscription_id = NULL WHERE email = ?',
          args: [userEmail],
        });
        
        console.log(`✅ Old subscription canceled successfully`);
      } catch (cancelError: any) {
        console.error('Error canceling old subscription:', cancelError);
        // Continue anyway - maybe subscription was already canceled
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/oracle?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pricing?payment=canceled`,
      metadata: {
        email: userEmail,
        tier: tier, // 'basic' or 'pro'
        currency: currency, // 'USD', 'EUR', or 'GBP'
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    console.error('Error details:', error.message, error.type, error.code);
    return NextResponse.json({ error: error.message || 'Failed to create checkout session' }, { status: 500 });
  }
}
