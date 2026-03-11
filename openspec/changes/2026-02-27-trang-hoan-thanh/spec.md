# Đặc tả tính năng: Trang Truyện Hoàn Thành (Completed Stories)

## 1. Context (Bối cảnh & Mục tiêu)

Nâng cấp trang danh sách "Truyện Đã Hoàn Thành" (`/hoan-thanh`) lên giao diện Premium, đồng bộ với phong cách thiết kế của trang Bảng Xếp Hạng. Cung cấp trải nghiệm tìm kiếm và lọc truyện đã full tốt hơn cho người đọc thích "cày" truyện liên tục không phải chờ đợi.

**Các tính năng nổi bật:**

- **Premium Header Banner:** Banner sang trọng với hiệu ứng lưới/noise và typography lớn.
- **Bộ lọc đa dạng (Advanced Filters):** Lọc theo Thể loại (Category), Sắp xếp theo (Views, Đánh giá, Lượt xem mới).
- **Giao diện lưới (Grid Layout):** Sử dụng các thẻ truyện `StoryListItem` cao cấp, tối ưu không gian hiển thị.
- **Phân trang (Pagination):** Giữ nguyên Keyset Pagination (Cursor-based) đảm bảo tốc độ tải trang nhanh, kết hợp với giao diện Load More hoặc phân trang Premium.

## 2. Data Schema & Types

- Không yêu cầu thay đổi Prisma Schema (đã có sẵn `status = "COMPLETED"`).
- Định nghĩa lại `FilterOptions` cho trang Hoàn thành trong services (hoặc mở rộng `getStoriesPaginated`).

```typescript
type SortOption = "updatedAt" | "views" | "rating";

interface CompletedStoriesFilter {
  categorySlug?: string;
  sortBy: SortOption;
  cursor?: number;
  limit?: number;
}
```

## 3. Task List

- [x] **1. Services & Logic**
  - [x] Kiểm tra và tái cấu trúc hàm fetch truyện hoàn thành trong `services/discovery.ts` (hoặc tạo file mới `services/completed.ts` nếu cần tách biệt logic).
  - [x] Thêm hỗ trợ lọc kết hợp Thể loại (Category) + Status (`COMPLETED`).

- [x] **2. UI/UX Components**
  - [x] Thiết kế Banner Header Premium cho trang Hoàn Thành (Typography sang trọng, màu xanh/gold gợi sự viên mãn/hoàn hảo).
  - [x] Tạo component `CompletedFilters` cho phép chọn Thể loại và Tiêu chí sắp xếp.
  - [x] Xây dựng Grid Layout hiển thị danh sách truyện dùng `StoryListItem`.

- [x] **3. Integration (App Router)**
  - [x] Cập nhật `app/hoan-thanh/page.tsx` sử dụng cấu trúc giao diện mới.
  - [x] Cập nhật SEO Metadata cho trang.
  - [x] Tối ưu hóa Loading State (Suspense với Skeleton).
  - [x] Đảm bảo tính năng phân trang (Cursor) hoạt động mượt mà với UI mới.
