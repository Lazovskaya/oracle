import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateUserSubscription } from '@/lib/auth';

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
        const tier = (session.metadata?.tier || 'premium') as 'free' | 'premium';
        
        if (email && session.payment_status === 'paid') {
          // Grant access for 30 days from payment
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          
          await updateUserSubscription(
            email,
            tier,
            'active',
            session.customer as string,
            endDate.toISOString()
          );
          
          console.log(`✅ One-time payment completed for ${email} - Access until ${endDate.toISOString()}`);
        }
        break;
      }

      // You can add custom logic to revoke access after expiry
      // For example, run a cron job to check subscription_end_date and update status
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
