import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { decode } from "next-auth/jwt";

/**
 * Hàm hỗ trợ xác thực chung cho API đa nền tảng (Web + Mobile App).
 * Hỗ trợ 2 phương thức:
 * 1. Session Cookies (mặc định của Web - NextAuth).
 * 2. Header `Authorization: Bearer <token>` (dành cho Mobile App).
 */
export async function getApiAuthUser(req: NextRequest) {
  // Cách 1: Ưu tiên Auth.js tự động xử lý Cookie (Web) hoặc Header nếu Auth.js phiên bản hỗ trợ.
  try {
    const session = await auth();
    if (session?.user) {
      return session.user;
    }
  } catch (error) {
    // Catch lỗi nếu gọi auth() trên môi trường Edge chưa config đúng
    console.log("[API Auth] Lỗi khi gọi auth():", error);
  }

  // Cách 2: Lấy thủ công từ Header (Dành cho Mobile App gửi JWT NextAuth thẳng qua Bearer)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  
  if (authHeader?.startsWith("Bearer ")) {
    const tokenStr = authHeader.substring(7);
    try {
      // Decode JWT token thủ công với serect của dự án.
      // Lưu ý: NextAuth v5/Auth.js dùng salt "authjs.session-token"
      // NextAuth v4 dùng "next-auth.session-token"
      const decodedUser = await decode({
        token: tokenStr,
        secret: process.env.AUTH_SECRET as string,
        salt: "authjs.session-token" 
      });

      if (decodedUser) {
        return decodedUser;
      }
    } catch (error) {
      console.error("[API Auth] Invalid Bearer token:", error);
    }
  }

  return null;
}
