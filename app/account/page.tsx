import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/auth';
import dynamic from 'next/dynamic';
import { AccountPageSkeleton } from '@/components/skeletons/LoadingSkeletons';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account - Trading Preferences & Saved Ideas',
  description: 'Manage your trading account, view saved ideas, track performance, and customize your trading preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

// Dynamic import for account page client component
const AccountPageClient = dynamic(() => import('./AccountPageClient'), {
  loading: () => <AccountPageSkeleton />,
});

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
