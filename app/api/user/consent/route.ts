import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { db } from '@/lib/db';

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

    const body = await request.json();
    const { country, termsAccepted, riskAccepted, tier } = body;

    if (!country || !termsAccepted || !riskAccepted) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Save consent to database
    await db.execute({
      sql: `
        INSERT INTO user_consent (user_email, country, terms_accepted, risk_accepted, tier, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `,
      args: [userEmail, country, termsAccepted, riskAccepted, tier],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving consent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save consent' },
      { status: 500 }
    );
  }
}
