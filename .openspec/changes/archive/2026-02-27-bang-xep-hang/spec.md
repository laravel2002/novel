# Đặc tả tính năng: Bảng Xếp Hạng (Leaderboard)

## 1. Context (Bối cảnh & Mục tiêu)

Thêm trang Bảng Xếp Hạng nhằm cung cấp các danh sách xếp hạng theo nhiều tiêu chí đa dạng, giúp độc giả nhanh chóng khám phá truyện hay dựa trên số liệu thực tế.

**Các tiêu chí xếp hạng:**

- Lượt đọc (Top Views)
- Lượt đề cử/Bình chọn (Top Votes)
- Tặng thưởng (Top Donate/Gifts)
- Thịnh hành (Trending)
- Lượt cất chứa (Top Bookmarks)
- Lượt bình luận (Top Comments)

**Bộ lọc hỗ trợ:**

- Khung thời gian: Ngày (Daily), Tuần (Weekly), Tháng (Monthly), Toàn thời gian (All-time).
- Thể loại & Phân luồng giới tính mạng (Nam/Nữ).
- Trạng thái truyện (Đang ra / Hoàn thành).

## 2. Data Schema (Định nghĩa Dữ liệu)

Để hỗ trợ truy xuất thống kê theo thời gian (Ngày/Tuần/Tháng) hiệu quả, chúng ta cần bổ sung các trường số liệu và model mới vào `schema.prisma`.

```prisma
// 1. Thêm các trường tổng quát vào model Story hiện tại
model Story {
  // ... (giữ nguyên các trường cũ)

  votes         Int       @default(0) // Tổng Hạng mục: Lượt đề cử/bình chọn
  donations     Float     @default(0) // Tổng Hạng mục: Tặng thưởng
  trendingScore Float     @default(0) // Hạng mục: Điểm thịnh hành

  StoryStat     StoryStat[]
  Vote          Vote[]
  // ...
}

// 2. Model theo dõi số liệu theo Từng Ngày (Daily Stats)
// Dùng để tổng hợp cho xếp hạng Daily, Weekly, Monthly
model StoryStat {
  id        Int      @id @default(autoincrement())
  storyId   Int
  date      DateTime @db.Date  // Ngày ghi nhận số liệu (bỏ giờ, phút)
  views     Int      @default(0)
  votes     Int      @default(0)
  donations Float    @default(0)
  comments  Int      @default(0)
  bookmarks Int      @default(0)

  Story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)

  @@unique([storyId, date])
  @@index([date])
}

// 3. Model Ghi log hành động Vote (để tính giới hạn vote mỗi ngày/user)
model Vote {
  id        Int      @id @default(autoincrement())
  userId    String
  storyId   Int
  createdAt DateTime @default(now())

  User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  Story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)

  @@index([storyId, createdAt])
}
```

_Lưu ý: Hạng mục Cất chứa (Bookmarks) và Bình luận (Comments) All-time có thể Count trực tiếp từ record, nhưng số liệu Daily/Weekly nên được rollup vào `StoryStat` để tăng tốc độ query xếp hạng._

## 3. Task List (Danh sách công việc)

- [x] **1. Database & Prisma**
  - [x] Cập nhật file `schema.prisma` thêm các trường `votes, donations, trendingScore` cho bảng `Story` và bổ sung 2 model `StoryStat`, `Vote`.
  - [x] Chạy `bunx prisma db push` để cập nhật Database.
  - [x] Chạy `bunx prisma generate` để cập nhật Prisma Client.

- [x] **2. Services (Logic Xử lý Dữ liệu)**
  - [x] Khởi tạo file `services/leaderboard.ts`.
  - [x] Định nghĩa interface `LeaderboardFilter` với các tham số: `category, timeframe, gender, genre, status, limit, offset`.
  - [x] Viết hàm `getLeaderboardStories(filter)` sử dụng Prisma để truy xuất, aggregate thống kê từ `StoryStat` hoặc truy vấn trực tiếp bảng `Story` tùy khung thời gian.
  - [x] Viết logic phụ trợ (cron-job hoặc update hook) để tính toán điểm `trendingScore`.

- [x] **3. Giao diện (UI/UX - App Router)**
  - [x] **Component:** Xây dựng `StoryRankCard` hiển thị: Rank (Thứ hạng), Cover Image, Title, Author, Primary Stat, Genres, Trạng thái truyện.
  - [x] **Component:** Tạo hệ thống Icon/Huy hiệu cho Top 3 (Vàng, Bạc, Đồng) và Trend Indicators (Tăng, Giảm, Giữ nguyên).
  - [x] **Page:** Xây dựng trang `app/bang-xep-hang/page.tsx` với thiết kế Premium Layout.
  - [x] **Thanh lọc (Filters):** Dựng UI các bộ lọc dạng Select/Tabs phân loại theo thời gian, thể loại và tiêu chí.
  - [x] **Phân trang:** Triển khai Load More hoặc trang qua nút Next/Prev trên giao diện.
