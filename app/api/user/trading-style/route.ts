import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateUserTradingStyle } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { tradingStyle } = await req.json();

    if (!['conservative', 'balanced', 'aggressive'].includes(tradingStyle)) {
      return NextResponse.json({ error: 'Invalid trading style' }, { status: 400 });
    }

    await updateUserTradingStyle(userEmail, tradingStyle);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating trading style:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
