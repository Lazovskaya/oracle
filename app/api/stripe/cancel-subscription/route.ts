import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    
    // Also check NextAuth session for Google login
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe subscription ID from database
    const result = await db.execute({
      sql: 'SELECT stripe_subscription_id FROM users WHERE email = ?',
      args: [userEmail],
    });

    const user = result.rows[0] as any;
    
    if (!user?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription at period end (user keeps access until then)
    await stripe.subscriptions.update(
      user.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    // Update user status in database
    await db.execute({
      sql: 'UPDATE users SET subscription_status = ? WHERE email = ?',
      args: ['canceled', userEmail],
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of your billing period',
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
