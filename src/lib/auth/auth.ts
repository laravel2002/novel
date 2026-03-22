import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth/auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // @ts-expect-error: NextAuth beta typings mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as unknown,
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Định nghĩa Provider Đăng nhập bằng Email / Mật khẩu
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        console.log(
          "[Auth Debug] Login attempt for email:",
          credentials?.email,
        );

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth Debug] Missing email or password");
          return null;
        }

        const emailToSearch = (credentials.email as string)
          .trim()
          .toLowerCase();
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: emailToSearch,
              mode: "insensitive",
            },
          },
        });

        if (!user || !user.password) {
          console.log(
            "[Auth Debug] User not found or no password for:",
            emailToSearch,
          );
          return null;
        }

        // Kiểm tra mật khẩu (Sử dụng bcryptjs)
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          console.log("[Auth Debug] Password mismatch for:", emailToSearch);
          return null;
        }

        console.log("[Auth Debug] Login successful for:", emailToSearch);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image, // Lưu ý schema.prisma cũ dùng avatarUrl, giờ dùng image của NextAuth
          role: user.role,
        };
      },
    }),
  ],
});
