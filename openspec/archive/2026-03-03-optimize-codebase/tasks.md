## 1. Refactor Components & Hooks

- [x] 1.1 Khơi tạo thư mục `@/lib/hooks` và di chuyển `useDevice`, `useMediaQuery` vào đây nếu chưa có chuẩn xác.
- [x] 1.2 Scan toàn bộ dự án, thay thế các hook khai báo lặp lại phân tán thành Import từ `@/lib/hooks`.
- [x] 1.3 Tạo thư viện Caching Utils trong `@/services/cache` giúp gọi DB an toàn (Dùng Native `unstable_cache`).

## 2. Tối ưu Hiệu suất Bundle (Lazy Load)

- [x] 2.1 Refactor file `StoryDetail.tsx` và `ChapterContent.tsx` chia nhỏ Component import bằng `next/dynamic`.
- [x] 2.2 Tách logic các Context Provider lớn ra thành Client Node nhỏ gọn.

## 3. Database Caching Layer

- [x] 3.1 Bọc API Server `getStory` bằng `unstable_cache` hoặc `React cache()`. Thêm Tag `[story-id]`.
- [x] 3.2 Bọc hàm truy vấn `getChapter` và Pagination ở `/services/story.ts`. Thêm Cache rule 3600s.
- [x] 3.3 Viết file `app/api/revalidate/route.ts` hỗ trợ tự xóa Cache theo Tag bằng API Webhooks (cho Tác giả / Admin).
- [x] 3.4 Bọc API bảng Xếp hạng `Leaderboard/Ranking` với Caching Time thích hợp.
