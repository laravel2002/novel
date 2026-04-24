import type { NextAuthConfig } from "next-auth";

/**
 * Cấu hình nền tảng của NextAuth v5.
 * File này được tách riêng để có thể import trong Middleware (Edge Runtime)
 * mà không kéo theo các dependency nặng như Prisma, bcrypt.
 */
export const authConfig = {
  // Bảo mật: Secret dùng để mã hóa JWT và Cookie
  secret: process.env.AUTH_SECRET,

  // Cho phép chạy trên mọi host (localhost, custom domain, Vercel preview...)
  trustHost: true,

  // Providers rỗng ở đây, sẽ được merge từ auth.ts
  providers: [],

  // Tùy chỉnh các trang xác thực
  pages: {
    signIn: "/dang-nhap",
    error: "/dang-nhap", // Redirect về trang đăng nhập khi có lỗi Auth
  },

  // Chiến lược Session: JWT (stateless, không cần bảng Session trong DB cho mỗi request)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * Middleware Authorization
     * Trả về true = cho phép truy cập, false = redirect về signIn page
     */
    authorized({ auth }) {
      // Hiện tại cho phép tất cả. Thêm logic bảo vệ route ở đây nếu cần.
      // Ví dụ:
      // const isOnProfile = nextUrl.pathname.startsWith('/ca-nhan');
      // if (isOnProfile && !auth?.user) return false;
      return true;
    },

    /**
     * JWT Callback: Được gọi mỗi khi JWT token được tạo hoặc cập nhật.
     * Đây là nơi ta nạp thông tin user (id, role) vào JWT payload.
     */
    async jwt({ token, user }) {
      // `user` chỉ tồn tại khi user vừa đăng nhập lần đầu (sign-in event)
      if (user) {
        token.id = user.id as string;
        // Lấy role từ user object (Prisma model có trường role)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role || "USER";
      }
      return token;
    },

    /**
     * Session Callback: Được gọi mỗi khi client đọc session.
     * Chuyển dữ liệu từ JWT token sang session object cho client sử dụng.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
