import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/auth.config";

/**
 * Cấu hình NextAuth v5 (Auth.js) đầy đủ.
 * File này KHÔNG chạy trên Edge Runtime vì phụ thuộc Prisma và bcrypt.
 * Nó được import bởi:
 *   - app/api/auth/[...nextauth]/route.ts (handlers)
 *   - Các Server Components/Actions cần auth(), signIn(), signOut()
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // Adapter kết nối NextAuth với Database qua Prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  // ==================== PROVIDERS ====================
  providers: [
    // --- Google OAuth ---
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Cho phép liên kết tài khoản Google vào user đã đăng ký bằng Email/Mật khẩu
      allowDangerousEmailAccountLinking: true,
    }),

    // --- Email + Mật khẩu ---
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        // Trả về user object. NextAuth sẽ truyền vào jwt callback.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // ==================== DEBUG (chỉ bật trong development) ====================
  debug: process.env.NODE_ENV === "development",
});
