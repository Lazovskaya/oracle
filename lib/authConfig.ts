import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    // Default session max age - will be overridden by tier-specific logic
    maxAge: 30 * 24 * 60 * 60, // 30 days (for Pro users)
  },
  callbacks: {
    async jwt({ token, user, account }: any) {
      // On sign in, set tier-based session duration
      if (account && user?.email) {
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.subscription_tier = dbUser.subscription_tier;
          token.subscription_status = dbUser.subscription_status;
          token.trading_style = dbUser.trading_style;
          token.asset_preference = dbUser.asset_preference;
          token.is_admin = dbUser.is_admin;
          
          // Set tier-based expiration
          const tier = dbUser.subscription_tier || 'free';
          let maxAge: number;
          switch (tier) {
            case 'pro':
              maxAge = 30 * 24 * 60 * 60; // 30 days
              break;
            case 'premium':
              maxAge = 7 * 24 * 60 * 60; // 7 days
              break;
            case 'free':
            default:
              maxAge = 60 * 60; // 1 hour
              break;
          }
          token.exp = Math.floor(Date.now() / 1000) + maxAge;
        }
      }
      return token;
    },
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
      if (token) {
        session.user.subscription_tier = token.subscription_tier;
        session.user.subscription_status = token.subscription_status;
        session.user.trading_style = token.trading_style;
        session.user.asset_preference = token.asset_preference;
        session.user.is_admin = token.is_admin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
