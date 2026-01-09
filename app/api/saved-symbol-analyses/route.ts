import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await db.execute({
      sql: `
        SELECT * FROM saved_symbol_analyses 
        WHERE user_email = ? 
        ORDER BY saved_at DESC
      `,
      args: [userEmail],
    });

    return NextResponse.json({ analyses: result.rows });
  } catch (error: any) {
    console.error('Error fetching saved analyses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { analysis } = await req.json();

    await db.execute({
      sql: `
        INSERT INTO saved_symbol_analyses (
          user_email, symbol, current_price, entry, stop_loss, targets,
          market_context, confidence, timeframe, full_analysis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        userEmail,
        analysis.symbol,
        analysis.current_price || null,
        analysis.entry || null,
        analysis.stop_loss || null,
        analysis.targets ? JSON.stringify(analysis.targets) : null,
        analysis.market_context || null,
        analysis.confidence || null,
        analysis.timeframe || null,
        JSON.stringify(analysis),
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving analysis:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookieEmail = cookieStore.get('user_email')?.value;
    
    const session = await getServerSession(authOptions);
    const sessionEmail = session?.user?.email;
    
    const userEmail = sessionEmail || cookieEmail;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM saved_symbol_analyses WHERE id = ? AND user_email = ?',
      args: [id, userEmail],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
