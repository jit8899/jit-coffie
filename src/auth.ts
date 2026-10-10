import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import argon2 from "argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  pages: { signIn: "/login" },
  providers: [
    Google({ clientId: process.env.AUTH_GOOGLE_ID ?? "", clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "" }),
    Credentials({
      credentials: { email: {}, password: {}, remember: {} },
      authorize: async (credentials) => {
        const parsed = z.object({ email: z.string().email().transform((v) => v.toLowerCase()), password: z.string().min(1).max(128), remember: z.string().optional().transform((v) => v !== "false") }).safeParse(credentials);
        if (!parsed.success || !(await enforceRateLimit("login-ip", 8, 15)) || !(await enforceRateLimit(`login-account:${parsed.data.email}`, 6, 30))) return null;
        const user = await db.user.findUnique({ where: { email: parsed.data.email } });
        if (!user?.passwordHash || !user.emailVerified || !await argon2.verify(user.passwordHash, parsed.data.password)) return null;
        return { id: user.id, email: user.email, name: user.fullName ?? user.name, image: user.profileImage ?? user.image, remember: parsed.data.remember };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.id) {
        const claims = profile as { email_verified?: boolean } | undefined;
        const verifiedAt = (user as typeof user & { emailVerified?: Date | null }).emailVerified ?? (claims?.email_verified ? new Date() : null);
        if (!verifiedAt) return false;
        await db.user.update({ where: { id: user.id }, data: { fullName: user.name ?? "Coffee friend", name: user.name, profileImage: user.image, emailVerified: verifiedAt } });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
        token.sessionVersion = (await db.user.findUnique({ where: { id: user.id }, select: { sessionVersion: true } }))?.sessionVersion ?? 0;
        const remembered = (user as typeof user & { remember?: boolean }).remember !== false;
        token.validUntil = Math.floor(Date.now() / 1000) + (remembered ? 14 : 1) * 24 * 60 * 60;
      }
      if (typeof token.validUntil === "number" && token.validUntil <= Math.floor(Date.now() / 1000)) { delete token.userId; token.invalidated = true; }
      if (token.userId && typeof token.sessionVersion === "number") {
        const current = await db.user.findUnique({ where: { id: token.userId as string }, select: { sessionVersion: true } });
        if (!current || current.sessionVersion !== token.sessionVersion) { delete token.userId; token.invalidated = true; }
      }
      return token;
    },
    async session({ session, token }) { if (session.user && token.userId) session.user.id = token.userId as string; else if (session.user) session.user.id = ""; return session; },
  },
});
