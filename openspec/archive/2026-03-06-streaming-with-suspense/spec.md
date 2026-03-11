# Kỹ Thuật Streaming với \<Suspense\>

## 1. Context (Bối cảnh & Mục tiêu)

Hiện tại dự án có thể gặp tình trạng load dữ liệu chậm (đặc biệt các query phức tạp như lấy danh sách truyện, số liệu lượt đọc...) làm block toàn bộ giao diện, khiến Time To First Byte (TTFB) cao.
Mục tiêu của tính năng này là áp dụng kỹ thuật Streaming của React 18 & Next.js App Router để tối ưu trải nghiệm người dùng:

- Hiển thị layout trang và các cấu trúc UI ngay lập tức dưới dạng Skeletons (Hiệu ứng khung chờ).
- Chia nhỏ quá trình fetch data bằng cách tách thành các Server Component đan xen.
- Bọc các Server Component cần data bằng `<Suspense>` để stream kết quả khi fetch xong mà không block UI.

## 2. Data Schema & Types

Tính năng này tập trung vào kiến trúc UI và React Node, không thay đổi Prisma Schema.
Các định nghĩa Skeleton Types dự kiến:

```typescript
// Các Component Skeleton cần tạo:
interface SkeletonProps {
  count?: number; // Số lượng phần tử hiển thị trong mảng
  className?: string;
}

// Ví dụ:
// <StoryCardSkeleton />
// <StoryListSkeleton />
// <ChapterListSkeleton />
// <RankingItemSkeleton />
```

## 3. Task List (Danh sách công việc)

- [ ] Tham khảo / Tạo các Component Skeletons dùng chung tại `components/ui/skeleton.tsx` (có thể dùng shadcn/ui skeleton).
- [ ] Thiết kế `StoryCardSkeleton` cho chế độ grid/list, `ChapterListSkeleton` và các placeholder UI tương ứng.
- [ ] Phân tích và cấu trúc lại **Trang Chủ** (`app/(main)/page.tsx`): Tách phần fetch "Truyện Đề Cử", "Truyện Mới", "Truyện Hoàn Thành" thành các Async Server Component độc lập và bọc `<Suspense fallback={<StoryListSkeleton />}>`.
- [ ] Phân tích và cấu trúc lại **Trang Chi Tiết Truyện** (`app/(main)/truyen/[slug]/page.tsx`): Streaming cho phần "Danh sách chương", "Truyện cùng tác giả".
- [ ] Phân tích và cấu trúc lại **Trang Bảng Xếp Hạng** (`app/(main)/bang-xep-hang/page.tsx`): Streaming cho danh sách truyện Top.
- [ ] Cập nhật/thêm các trang `loading.tsx` ở cấp route nếu cần thiết để dự phòng.
- [ ] Test hiệu năng và trải nghiệm loading trên desktop lẫn mobile.
