import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone Number", type: "text", placeholder: "john@example.com or 09123456789" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const identifier = credentials.identifier;

        // 1. Check Rate Limit
        const rateLimitCheck = checkRateLimit(identifier);
        if (!rateLimitCheck.allowed) {
          throw new Error(rateLimitCheck.message);
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier }
            ]
          }
        });

        if (!user || !user.password) {
          // Record failed attempt even if user doesn't exist to prevent user enumeration via rate limits
          const failResult = recordFailedAttempt(identifier);
          if (!failResult.allowed) throw new Error(failResult.message);
          return null;
        }

        if (user.isBanned) {
          if (!user.bannedUntil || new Date(user.bannedUntil) > new Date()) {
            throw new Error("Your account has been suspended.");
          }
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          // Record failed attempt for invalid password
          const failResult = recordFailedAttempt(identifier);
          if (!failResult.allowed) throw new Error(failResult.message);
          return null;
        }

        // Successful login: clear rate limit
        clearRateLimit(identifier);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "USER";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            image: true, 
            name: true, 
            isBanned: true, 
            bannedUntil: true, 
            role: true,
            phone: true,
            address: true,
            city: true,
            province: true,
            zipCode: true
          }
        });

        if (dbUser) {
          if (dbUser.isBanned) {
            if (!dbUser.bannedUntil || new Date(dbUser.bannedUntil) > new Date()) {
              // Invalidate session
              return {} as any;
            }
          }
          session.user.image = dbUser.image;
          session.user.name = dbUser.name;
          (session.user as any).role = dbUser.role; // ALWAYS use fresh role from DB
          
          const isProfileComplete = Boolean(dbUser.phone && dbUser.address);
          (session.user as any).isProfileComplete = isProfileComplete;
        }
      }
      return session;
    }
  }
};
