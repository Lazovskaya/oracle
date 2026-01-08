import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "google") {
        const email = user.email;
        
        // Check if user exists
        let existingUser = await getUserByEmail(email);
        
        // Create user if doesn't exist
        if (!existingUser) {
          await createUser(email);
          console.log(`Created new user via Google: ${email}`);
        }
        
        return true;
      }
      return true;
    },
    async session({ session, token }: any) {
      if (session?.user?.email) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          session.user.subscription_tier = user.subscription_tier;
          session.user.subscription_status = user.subscription_status;
          session.user.trading_style = user.trading_style;
          session.user.asset_preference = user.asset_preference;
          session.user.is_admin = user.is_admin;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
