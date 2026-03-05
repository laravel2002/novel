import { DefaultSession } from "next-auth"
import { Role } from "@/generated/prisma/client"

// Mở rộng NextAuth Types để hỗ trợ trường `role`
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}
