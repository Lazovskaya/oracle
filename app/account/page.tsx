import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/auth';
import AccountPageClient from './AccountPageClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('user_email')?.value;
  
  // Also check NextAuth session for Google login
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  
  const userEmail = sessionEmail || cookieEmail;

  if (!userEmail) {
    redirect('/login');
  }

  const user = await getUserByEmail(userEmail);

  if (!user) {
    redirect('/login');
  }

  return <AccountPageClient user={user} />;
}
