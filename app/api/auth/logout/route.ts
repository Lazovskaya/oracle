import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Delete the auth token cookie
  cookieStore.delete('auth_token');
  cookieStore.delete('user_email');
  
  // Get the origin from the request
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Redirect to login page
  return NextResponse.redirect(new URL('/login', baseUrl));
}
