import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/auth';
import AccountPageClient from './AccountPageClient';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('user_email')?.value;

  if (!userEmail) {
    redirect('/login');
  }

  const user = await getUserByEmail(userEmail);

  if (!user) {
    redirect('/login');
  }

  return <AccountPageClient user={user} />;
}
