import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      mongoId?: string;
    };
  }

  interface User {
    mongoId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    mongoId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  callbacks: {
    // USER SIGN IN
    async signIn({ user }) {
      await connectToDatabase();

      const existingUser = await User.findOne({ email: user.email });

      if (!existingUser) {
        const newUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
        });

        user.mongoId = newUser._id.toString();
      } else {
        user.mongoId = existingUser._id.toString();
      }

      return true;
    },

    // JWT CALLBACK
    async jwt({ token, user }) {
      if (user) {
        token.mongoId = user.mongoId;
      }
      return token;
    },

    // SESSION CALLBACK
    async session({ session, token }) {
      session.user.mongoId = token.mongoId;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
