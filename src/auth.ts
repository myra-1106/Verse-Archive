import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "微信 ID",
      credentials: {
        wechatId: { label: "微信 ID", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { wechatId: parsed.data.wechatId },
        });

        if (
          !user ||
          user.status !== UserStatus.ACTIVE ||
          !(await verifyPassword(user.passwordHash, parsed.data.password))
        ) {
          return null;
        }

        return {
          id: user.id,
          name: user.displayName,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
};
