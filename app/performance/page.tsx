import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail, checkAndRevokeExpiredAccess } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { Metadata } from "next";
import PerformancePageClient from './PerformancePageClient';

export const metadata: Metadata = {
  title: "My Performance | Market Oracle",
  description: "Track your trading performance, analyze wins and losses, and improve your trading strategy.",
  keywords: "trading performance, trade tracking, win rate, profit loss, trading journal",
};

export default async function PerformancePage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('user_email')?.value;
  
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  
  const userEmail = sessionEmail || cookieEmail;

  let user = userEmail ? await getUserByEmail(userEmail) : null;
  
  if (user) {
    user = await checkAndRevokeExpiredAccess(user);
  }

  if (!user) {
    redirect('/login');
  }

  return <PerformancePageClient userEmail={user.email} />;
}
