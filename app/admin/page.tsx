import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/auth";
import AdminPanelClient from "./AdminPanelClient";

export const metadata = {
  title: "Admin Panel | Oracle",
  description: "Administrative controls for Oracle system",
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("auth_token")?.value;

  if (!userEmail) {
    redirect("/login?redirect=/admin");
  }

  const user = await getUserByEmail(userEmail);

  // Check if user is admin
  if (!user || !user.is_admin) {
    redirect("/oracle");
  }

  return <AdminPanelClient user={user} />;
}
