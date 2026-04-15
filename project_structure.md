# 📂 Cấu Trúc Dự Án Tủ Truyện / Novel

Tài liệu này tổng hợp cấu trúc thư mục, kiến trúc và các quy tắc phát triển trong dự án `Tủ Truyện / Novel` dựa trên nền tảng **Next.js 15+ (App Router)**.

## 1. 🏗️ High-Level Architecture (Tổng quan)

- **Framework**: Next.js 15+ (App Router)
- **Kiến trúc phân chia**: Theo các lớp (Layered) kết hợp Domain-Driven Design (chia theo tính năng trong `src/features`).
- **Database**: Prisma ORM (`prisma/schema.prisma`).
- **Lưu trữ**: Cloudflare R2, Redis Cache (`src/lib`).

## 2. 📁 Cây Thư Mục Cốt Lõi (Core Directory Tree)

```text
d:\novel
├── .agent/ / .agents/      # (Internal) Hệ thống Workflow và Skills cho AI
├── app/                    # 🚀 Tính năng Routing chính của Next.js (App Router)
│   ├── (main)/             # Layout chính có Header/Footer (Trang chủ, Khám phá, Tủ truyện...)
│   ├── (reader)/           # Layout tối giản chuyên dụng cho trang đọc truyện
│   ├── api/                # Các Next.js API Routes (Backend logic)
│   │   ├── v1/             # API cung cấp riêng cho Mobile App (Thuần JSON, No-session)
│   │   └── ...             # Các API cung cấp cho nền tảng Web (NextAuth session)
│   └── globals.css         # CSS gốc của toàn dự án (Tailwind)
├── prisma/                 # 🗄️ Cấu hình Database
│   ├── migrations/         # Lưu trữ lịch sử di chuyển schema
│   └── schema.prisma       # Định nghĩa Schema cho Prisma ORM
├── openspec/               # 📝 Quản lý đặc tả kỹ thuật (Spec) bằng OpenSpec
│   ├── changes/            # Các tính năng mới được tạo theo quy trình OpenSpec
│   └── specs/              # Nơi lưu trữ tài liệu đã hoàn thiện
├── scripts/                # 🛠️ Các script chạy độc lập (Crawler, Backfill, Sync)
│   ├── crawl.ts            # Crawler dữ liệu truyện
│   └── ...                 
└── src/                    # 🧠 Mã nguồn chính chứa Logic & UI
    ├── components/         # Các UI component dùng chung toàn dự án
    │   ├── layout/         # Header, Footer, Thanh điều hướng
    │   ├── providers/      # Các Context Provider bọc ngoài ứng dụng
    │   ├── settings/       # Component liên quan đến tính năng cài đặt
    │   ├── shared/         # Các khối UI nhỏ gọn dùng chung (Nút, Input, Modal, ...)
    │   ├── skeletons/      # Các giao diện tải trang (Loading Skeletons)
    │   └── ui/             # Các UI base components (ví dụ: shadcn/ui)
    ├── features/           # Các module độc lập chia theo Domain-Driven Design (DDD)
    │   ├── auth/           # Domain về xác thực
    │   ├── chapter/        # Domain về chương truyện
    │   ├── comment/        # Domain về bình luận
    │   ├── explore/        # Domain gợi ý, khám phá
    │   ├── history/        # Domain lịch sử đọc
    │   ├── library/        # Domain tủ truyện (Đang đọc, Hoàn thành, Đánh dấu, ...)
    │   ├── search/         # Tính năng tìm kiếm
    │   ├── story/          # Domain về hiển thị chi tiết và danh sách truyện
    │   └── user/           # Quản lý người dùng, hồ sơ
    └── lib/                # 🧱 Core Services và Utility functions
        ├── utils.ts        # Các hàm helper dùng chung
        ├── prisma.ts       # Singleton kế nối Database Prisma
        ├── redis.ts        # Singleton kết nối Redis
        ├── cloudflare-r2.ts# Cấu hình lưu trữ R2
        ├── api-response.ts # Formatter chuẩn hóa HTTP Response (Web + Mobile)
        ├── api-auth.ts     # Helper logic xác thực đa nền tảng
        ├── cors.ts         # Cấu hình CORS chung cho API
        └── ...
```

## 3. 🔍 Trách Nhiệm Từng Thư Mục (Directory Responsibilities)

### 3.1. `app/` - The Router Layer
- Chỉ làm nhiệm vụ điều hướng (Routing), bắt tham số trên URL (`params`, `searchParams`), kiểm tra Auth Layout và khai báo Metadata chuẩn SEO.
- **Quy tắc Next 15+**: Mọi biến truy cập vào params hay searchParams trong page, layout, route bắt buộc phải là **`Promise`** và phải `.await` trước khi dùng.

### 3.2. `src/features/` - The Domain Layer
- Ứng dụng tuân theo kiến trúc **Domain-Driven Design (DDD)**. 
- Mỗi thư mục tính năng (ví dụ `src/features/story`) hoạt động như một module độc lập, chứa các:
  - `components`: Giao diện đặc thù chuyên biệt cho tính năng Story.
  - `services` / `actions`: Data Fetching logic hoặc Server Actions thực thi việc Create/Update/Delete liên quan đến DB.
  - `hooks`: Các custom React Hooks chỉ dùng riêng cho Story.

### 3.3. `app/api/v1/` - Mobile Backend
- Đây là khoang API giao tiếp độc lập với ứng dụng ngoại vi (Expo React Native mobile app).
- **Quy định nghiêm ngặt**: 
  - Trả về JSON theo đúng chuẩn `{ success, data, error, pagination }`.
  - Không dựa dẫm vào Cookie.
  - Phải có header CORS (`corsHeaders()`) do Mobile chạy khác Domain/Origin.

### 3.4. `scripts/` - Hệ Thống Tooling Nội Bộ 
- Chuyên dùng để thao tác bảo trì dữ liệu cục bộ (crawling, backfilling empty fields, normalize text). Quá trình chạy crawler đã được tối ưu hóa bằng file locks để hỗ trợ multiple instances.

## 4. 📝 Quy Tắc Phát Triển Cốt Lõi (Cheatsheet)
1. **Separation of Concerns**: Lớp hiển thị UI (`app/..`, `src/components/..`) TUYỆT ĐỐI không được query trực tiếp Prisma. Phải gọi qua hệ thống Server Actions hoặc Functions nắm trong `src/features/.../services`.
2. **Type-Safety**: Xóa sổ từ khóa `any`. Ưu tiên sử dụng utility types của Prisma như `Prisma.StoryGetPayload<{}>`.
3. **Offline-first UX**: Frontend sử dụng triệt để `localStorage` cho lịch sử đọc (`AG_READING_HISTORY`) và sync về server trong background.
4. **Client Directive**: Các components thao tác `window` (LocalStorage, Events) hay `useState`/`useEffect` bắt buộc có `"use client"` ở ngọn file. Mặc định tất cả các file còn lại là React Server Components.
