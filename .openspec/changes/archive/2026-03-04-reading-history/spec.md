# Đặc tả: Tính năng Theo dõi Lịch sử Đọc (Reading History)

## 1. Context (Tình hình hiện tại)

Người dùng đang không biết mình đã đọc truyện đến đâu, đặc biệt là khách vãng lai hoặc người có hàng chục bộ truyện đang theo dõi.

**Mục tiêu:**

- Ghi nhận lịch sử đọc tự động mỗi khi người dùng truy cập vào 1 chương truyện.
- **Có tài khoản (Logged-in):** Lưu vào cơ sở dữ liệu (PostgreSQL) để đồng bộ mọi thiết bị.
- **Khách không đăng nhập (Guest):** Lưu tạm vào LocalStorage của trình duyệt.
- Lần đầu Login, tự động Merge (Đồng bộ) LocalStorage lên Database (nếu trùng truyện thì cập nhật chương cũ/mới nhất).
- Xây dựng trang `/lich-su` để liệt kê danh sách các truyện đã đọc.

## 2. Data Schema & Types

### 2.1 Prisma Schema Update

Bổ sung Model `ReadingHistory` tại `prisma/schema.prisma`:

```prisma
model ReadingHistory {
  id        String   @id @default(cuid())
  userId    String
  storyId   Int
  chapterId Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt // Thời gian đọc gần nhất (Upsert lại mỗi lần đọc)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  chapter   Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)

  // Đảm bảo mỗi User chỉ lưu 1 bản ghi lịch sử tương ứng cho 1 Truyện
  @@unique([userId, storyId])
  @@index([userId, updatedAt(sort: Desc)])
}
```

### 2.2 Client-Side LocalStorage Interface

Định dạng lưu vào trình duyệt (Guest):

```typescript
interface LocalReadingHistory {
  storyId: number;
  storySlug: string;
  storyTitle: string;
  coverUrl: string | null;
  chapterId: number;
  chapterNum: number;
  chapterTitle: string;
  updatedAt: number; // Numeric timestamp
}
```

## 3. Kiến trúc luồng hệ thống

- **features/history/hooks/useReadingHistory.ts**: Custom Hook chủ đạo chịu trách nhiệm: (1) Đọc ghi LocalStorage (2) Sync lên API (nếu có NextAuth session) (3) Trả về Danh sách History đã marge giữa Client & Server (Hoặc chỉ Server nếu SSR).
- **features/history/services/history.ts**: Logic thao tác CSDL cho History với user (Upsert, Lấy list 20-50 truyện gần nhất).
- **features/chapter/components/**: (Có thể trong Wrap `ChapterContent` hoặc `ChapterNavigation`) Nhúng Hook `useReadingHistory` vào để khi mount vào /truyen/[slug]/[chapter] sẽ tự động trigger action `recordHistory(story, chapter)`.

## 4. Task List

- [x] **Task 1: Database Setup:** Cập nhật file `prisma/schema.prisma` và chạy `bunx prisma db push` (+ sinh file client).
- [x] **Task 2: API & Services:** Tách service `history.ts` xử lý Database (upsertHistory, getUserHistory, deleteHistory...). Viết API routes/Server Actions để Client có thể call lên.
- [x] **Task 3: History Hook (Local + Sync):** Xây dựng `useReadingHistory` lưu vào LocalStorage và tự động đồng bộ khi detect thấy thông tin User login từ NextAuth.
- [x] **Task 4: Add Tracker:** Cấy logic ghi lịch sử tự động tại Component đọc truyện.
- [x] **Task 5: Xây dựng giao diện Desktop & Mobile (History Layout):** Tạo `/lich-su` page, tái sử dụng các components dạng `StoryListItem` / Table Layout (Tách folder device tương tự Ranking).
- [x] **Task 6: Tích hợp Navbar:** Bổ sung Link đến `Tủ truyện / Lịch sử` tại Navigation Bar và Mobile Sidebar.
- [x] **Task 7:** Dev/Test tính năng và Archive tính năng.
