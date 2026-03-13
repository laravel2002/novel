import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  providers: [], // Cấu hình providers (Google, Github, Credentials) ở file auth.ts sau để tránh lỗi Edge runtime
  pages: {
    signIn: "/", // Sẽ gọi SignIn modal thay vì chuyển request sang trang mặc định của NextAuth
  },
  callbacks: {
    authorized() {
      // Cấu hình các route yêu cầu đăng nhập ở đây nếu cần thiết
      // Ví dụ: const isOnProfile = nextUrl.pathname.startsWith('/profile');
      // if (isOnProfile) return isLoggedIn;
      return true;
    },
    async jwt({ token, user }) {
      // Khi user vừa đăng nhập, nạp user ID và Role vào token
      if (user) {
        token.id = user.id;
        token.role = user.role; // Prisma model support
      }
      return token;
    },
    async session({ session, token }) {
      // Đổ data từ JWT Token sang Session Client
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-expect-error: Bypass NextAuth internal Role enum mismatch
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Dùng JWT thay vì Database Session (Giữ lợi thế cache tĩnh cho Nextjs)
  },
} satisfies NextAuthConfig;
