import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserByEmail } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import SymbolAnalyzerPage from './SymbolAnalyzerPage';

export default async function SymbolAnalyzer() {
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

  const isPro = user.subscription_tier === 'premium';

  return <SymbolAnalyzerPage isPro={isPro} userEmail={user.email} />;
}
