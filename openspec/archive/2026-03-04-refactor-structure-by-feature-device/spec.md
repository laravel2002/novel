# Đặc tả: Tái cấu trúc thư mục theo Tính năng (Feature-based) và Thiết bị (Device-driven)

## 1. Context (Nhữ cảnh & Mục tiêu)

Dự án hiện tại đang phình to nhanh chóng với nhiều tính năng mới (Khám Phá, Thể Loại, Chi Tiết Truyện) và thiết kế đa giao diện (Desktop, Tablet, Mobile).
Cấu trúc hiện tại có dấu hiệu "lộn xộn":

- Các components (Desktop, Mobile, Tablet) đang nằm chung một cấp ngang hàng trong `features/story/components/`, gây khó khăn cho việc tìm kiếm.
- Đôi khi ranh giới giữa Shared Components (`/components`) và Feature Components (`/features`) chưa được thống nhất chặt chẽ.
- Các API/Services (ví dụ `services/story.ts`) nằm rời rạc ngoài root thay vì gom vào đúng feature của nó.

**Mục tiêu cấu trúc mới (Feature-Sliced Design kết hợp Device-driven):**
Tất cả code liên quan đến một module (VD: `story`, `explore`, `auth`) sẽ được nhóm vào chung một folder trong `/features`. Sẽ phân cấp rạch ròi các UI components theo thiết bị.

## 2. Dự kiến cấu trúc thư mục mới (Proposed Architecture)

```
/src (hoặc thư mục gốc hiện tại)
├── app/                  # Nơi CHỈ chứa file Route (page.tsx, layout.tsx, loading.tsx...)
│   ├── (auth)/
│   ├── kham-pha/
│   ├── the-loai/
│   └── truyen/
│
├── features/             # Business Logic & Giao diện ứng dụng
│   ├── story/            # Tính năng liên quan đến Truyện
│   │   ├── components/
│   │   │   ├── desktop/  # Chứa các component đuôi *Desktop.tsx
│   │   │   ├── mobile/   # Chứa các component đuôi *Mobile.tsx
│   │   │   ├── tablet/   # Chứa các component đuôi *Tablet.tsx
│   │   │   └── shared/   # Chứa các component dùng chung mọi nền tảng (StoryListItem.tsx)
│   │   ├── hooks/        # Custom hook của riêng module
│   │   ├── services/     # Tách services/story.ts vào đây (hoặc đổi thành actions/fetchers)
│   │   └── types/        # Định nghĩa interface riêng biệt
│   │
│   ├── explore/          # Tính năng Khám phá
│   │   └── components/
│   │       ├── mobile/   # (ExploreMobileUI.tsx, ...)
│   │       └── desktop/
│   │
│   └── user/             # Tính năng Cá nhân (Tủ truyện, Đăng nhập)
│       └── components/
│
├── components/           # CHỈ chứa Core/Dumb UI Components
│   ├── ui/               # (shadcn components: button, sheet, dialog...)
│   └── layout/           # (Navbar, Footer, Providers chung...)
│
└── lib/                  # Utilities, Prisma instance, Helper functions không dính dáng UI
```

## 3. Task List (Danh sách công việc refactor)

- [x] **Task 1:** Tạo các folder con `desktop`, `tablet`, `mobile`, `shared` bên trong thư mục `features/story/components/`.
- [x] **Task 2:** Di chuyển tất cả các file component của Category Layout (`CategoryPageDesktop`, `CategoryPageMobile`, `CategoryPageTablet`) xuống đúng thư mục thiết bị tương ứng.
- [x] **Task 3:** Di chuyển hệ thống Story Detail (`StoryDetailDesktop`, `StoryDetailMobile`) vào folder thiết bị tương ứng. Đưa `StoryListItem`, `StoryListItemMobile` vào folder `shared` (hoặc cấu trúc lại thêm xíu tuỳ độ phức tạp).
- [x] **Task 4:** Refactor cấu trúc import bị vỡ: Cập nhật lại đường dẫn import trong các file `page.tsx` và `CategoryPageUI.tsx`, `StoryDetail.tsx`.
- [x] **Task 5:** (Tuỳ chọn) Đưa `services/story.ts` vào `features/story/services/story.ts` và cập nhật lại toàn bộ `import "@/services/story"` trên toàn project.
- [x] **Task 6:** Lặp lại với các features khác (ví dụ: `explore`) để gom các file rải rác.
- [x] **Task 7:** Kiểm tra Next.js Build (`bun run build`) để đảm bảo không ai bị lạc import.
