import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateUserAssetPreference } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('user_email')?.value;

    if (!userEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { assetPreference } = await req.json();

    if (!['crypto', 'stocks', 'both'].includes(assetPreference)) {
      return NextResponse.json({ error: 'Invalid asset preference' }, { status: 400 });
    }

    await updateUserAssetPreference(userEmail, assetPreference);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating asset preference:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
