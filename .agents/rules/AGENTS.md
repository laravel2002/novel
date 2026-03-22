---
trigger: always_on
---

# GIỚI THIỆU DỰ ÁN (PROJECT OVERVIEW)

Đây là dự án "Tủ Truyện / Novel" - Nền tảng đọc truyện online đa nền tảng (Web + API cho Mobile App).

# TECH STACK

- Framework: Next.js 15+ (App Router)
- Language: TypeScript (Strict mode)
- Database: Prisma ORM (PostgreSQL/MySQL)
- Authentication: NextAuth.js (Auth.js v5)
- Storage: Cloudflare R2
- Styling: Tailwind CSS

# KIẾN TRÚC THƯ MỤC (ARCHITECTURE)

- `app/(main)/*`: Chứa các trang có layout tiêu chuẩn (Trang chủ, Tủ truyện, Chi tiết truyện).
- `app/(reader)/*`: Chứa giao diện tối giản để đọc truyện (không có header/footer rườm rà).
- `app/api/v1/*`: Chuyên chứa API dành cho Mobile App (Trả về thuần JSON, không dùng Cookie/Session, tự quản lý Auth).
- `app/api/*` (ngoài v1): API dành cho nền tảng Web (Sử dụng session của NextAuth).
- `src/features/*`: Chứa các component, hooks, và services chia theo từng tính năng (Domain-Driven Design).

# 🚨 QUY TẮC CỐT LÕI (CRITICAL RULES)

## 1. NEXT.JS 15+ APP ROUTER RULES (QUAN TRỌNG NHẤT)

Tất cả các tham số động (`params` và `searchParams`) trong `page.tsx`, `layout.tsx`, và `route.ts` đều là **PROMISE** và bắt buộc phải dùng `await` để giải nén trước khi sử dụng. Không bao giờ được dùng cú pháp của Next 14.

- ❌ SAI (Next 14): `export async function GET(req: Request, { params }: { params: { id: string } }) { const id = params.id; }`
- ✅ ĐÚNG (Next 15): `export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; }`

## 2. TYPE SAFETY & TYPESCRIPT

- TIÊU DIỆT `any`: Tuyệt đối không sử dụng type `any`. Hãy định nghĩa Interface hoặc dùng các Type tự sinh của Prisma (ví dụ: `Prisma.StoryGetPayload<{...}>`).
- Luôn kiểm tra kỹ dữ liệu trả về từ Database có khớp 100% với Type do Frontend yêu cầu hay không.

## 3. API & BACKEND RULES

- Luôn bọc logic API trong `try/catch`.
- API cho Mobile (`v1`) luôn phải trả về object có format: `{ success: boolean, data?: any, error?: string, pagination?: any }`.
- Tất cả các API Route (`route.ts`) bắt buộc phải bọc `corsHeaders()` trong phần `headers` của NextResponse để tránh lỗi CORS trên Mobile.

## 4. FRONTEND & UX

- Ưu tiên chiến lược "Offline-first": Sử dụng `localStorage` kết hợp đồng bộ ngầm (Background Sync) cho các tính năng như Lịch sử đọc truyện (`AG_READING_HISTORY`).
- Component nào có sử dụng hook của React (`useState`, `useEffect`, `useRef`, `window.addEventListener`) thì bắt buộc phải có `"use client"` ở dòng đầu tiên.
