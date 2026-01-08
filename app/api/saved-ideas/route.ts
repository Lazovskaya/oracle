import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await db.execute({
      sql: `
        SELECT * FROM saved_ideas 
        WHERE user_email = ? 
        ORDER BY saved_at DESC
      `,
      args: [userEmail],
    });

    return NextResponse.json({ ideas: result.rows });
  } catch (error: any) {
    console.error('Error fetching saved ideas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const idea = await req.json();

    await db.execute({
      sql: `
        INSERT INTO saved_ideas (
          user_email, oracle_run_id, symbol, entry, stop, targets, 
          rationale, confidence, bias, timeframe, wave_context, risk_note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_email, oracle_run_id, symbol) DO NOTHING
      `,
      args: [
        userEmail,
        idea.oracle_run_id,
        idea.symbol,
        idea.entry || null,
        idea.stop || null,
        idea.targets || null,
        idea.rationale || null,
        idea.confidence || null,
        idea.bias || null,
        idea.timeframe || null,
        idea.wave_context || null,
        idea.risk_note || null,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving idea:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM saved_ideas WHERE id = ? AND user_email = ?',
      args: [id, userEmail],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting saved idea:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
