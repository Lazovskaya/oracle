import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/auth";
import AdminPanelClient from "./AdminPanelClient";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';

export const metadata = {
  title: "Admin Panel | Oracle",
  description: "Administrative controls for Oracle system",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const cookieEmail = cookieStore.get('user_email')?.value;
  
  // Also check NextAuth session for Google login
  const session = await getServerSession(authOptions);
  const sessionEmail = session?.user?.email;
  
  const userEmail = sessionEmail || cookieEmail;

  // Require authentication
  if (!userEmail) {
    redirect("/oracle");
  }

  const user = await getUserByEmail(userEmail);

  // Require user exists and is admin
  if (!user || !user.is_admin) {
    redirect("/oracle");
  }

  return <AdminPanelClient user={user} />;
}
