# Đặc tả (Spec): Tính năng Bảng Xếp Hạng

## 1. Context (Bối cảnh & Mục tiêu)

- **Mục tiêu:** Xây dựng tính năng "Bảng xếp hạng" (Leaderboard) để hiển thị danh sách các truyện được đọc nhiều nhất, đánh giá cao nhất, hoặc mới cập nhật nhất.
- **Lợi ích:** Giúp độc giả dễ dàng khám phá các tác phẩm nổi bật, phổ biến, từ đó tăng thời lượng onsite và tỷ lệ tương tác của người dùng với nền tảng truyện.
- **Phạm vi (MVP):** Dựa trên bộ dữ liệu `Story` hiện tại (có các trường `views`, `rating`, `updatedAt`, `chapterCount`), tạo trang hiển thị xếp hạng theo các tiêu chí khác nhau (All-time views, Top Rating, Mới cập nhật).

## 2. Data Schema

_(Do hệ thống hiện tại đã có đủ các trường `views`, `rating`, `updatedAt` trong model `Story`, chúng ta sẽ không sửa `schema.prisma` ở giai đoạn MVP này mà tập trung định nghĩa Type/Interface chặt chẽ cho Data Access Layer)._

**Định nghĩa TypeScript Interfaces (trong `types/leaderboard.ts` hoặc trực tiếp trong file service):**

```typescript
export type LeaderboardCategory = "views" | "rating" | "newest";

export interface GetLeaderboardParams {
  category: LeaderboardCategory;
  limit?: number;
  page?: number;
}

export interface LeaderboardStory {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  author: string | null;
  views: number;
  rating: number;
  chapterCount: number;
  status: "ONGOING" | "COMPLETED" | "PAUSED";
  // Lấy thêm danh mục truyện nếu cần thiết (StoryCategory)
}

export interface LeaderboardResponse {
  stories: LeaderboardStory[];
  total: number;
  page: number;
  totalPages: number;
}
```

## 3. Task List

- [x] **Task 1: Xây dựng Service Data Layer (`services/leaderboard.ts`)**
  - Viết hàm `getLeaderboard(params: GetLeaderboardParams): Promise<LeaderboardResponse>`.
  - Hàm sử dụng `prisma.story.findMany` kèm theo `orderBy` tương ứng với tiêu chí (VD: `views: 'desc'`, `rating: 'desc'`, `updatedAt: 'desc'`).
  - Đảm bảo tuân thủ nguyên tắc "Strict Boundaries": chỉ select những field cần thiết, bỏ các field nặng như nội dung chương.

- [x] **Task 2: Cập nhật UI Components**
  - Cài đặt component `tabs` từ shadcn/ui để làm menu chuyển đổi giữa các bảng xếp hạng (Lượt đọc, Đánh giá, Mới nhất) theo lệnh: `bunx --bun shadcn@latest add tabs`.
  - Tạo `LeaderboardList` component nhận mảng data và render ra danh sách các `StoryListItem` (tận dụng component item hiện có nếu phù hợp, hoặc tạo `LeaderboardItem` có đánh số thứ tự 1, 2, 3 nổi bật).

- [x] **Task 3: Xây dựng Page Bảng xếp hạng (`app/bang-xep-hang/page.tsx`)**
  - Là React Server Component (RSC), đọc `searchParams` (ví dụ `?category=views&page=1`) để fetch server-side cho tối ưu SEO và tốc độ.
  - Sử dụng Suspense kết hợp Skeleton Loading Screens (đạt được nhất quán thẩm mỹ Editorial/Luxury theo chuẩn đã thiết lập).

- [x] **Task 4: Tích hợp Navigation**
  - Bổ sung link "Bảng xếp hạng" vào Header/Navigation chính của layout tổng.
