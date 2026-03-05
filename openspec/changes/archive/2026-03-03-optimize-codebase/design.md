## Context

Next.js App Router cung cấp khả năng phân tách Server Component và Client Component mạnh mẽ. Hiện tại, kiến trúc của Novel Web App đang chạy khá tốt nhưng lại gặp phải nút thắt ở một vài Client Component xử lý logic lặp lại (ví dụ như các Device detection, hoặc UI Loading) và việc gọi getChapter/getStory truy vấn liên tục vào cơ sở dữ liệu làm tăng TTFB (Time To First Byte). Để đáp ứng lưu lượng truy cập lớn hơn và độ phản hồi tức thời của trang đọc, cần có một lớp Caching hiệu quả hơn cũng như quy hoạch lại cây component hiện hành.

## Goals / Non-Goals

**Goals:**

- Tích hợp `unstable_cache` / `React cache` hoặc Next.js Data Fetching tags để lưu trữ (cache) các endpoint tĩnh như danh sách truyện, thông tin chương.
- Lazy load các Modal/Drawer phụ trợ bằng `next/dynamic` (ví dụ CommentDrawer) triệt để hơn ở tất cả màn hình.
- Chuẩn hóa React hooks (`useDevice`, `useMediaQuery`) để không bị lặp lại dòng code định nghĩa trạng thái.
- Trải nghiệm chuyển chương 0ms (Mượt hoàn toàn, không nháy).

**Non-Goals:**

- **KHÔNG** làm lại toàn bộ giao diện hay viết lại các component tĩnh đang ổn định.
- **KHÔNG** thay đổi Model Schema của Prisma Database trong pha này.

## Decisions

1. **Sử dụng Next.js Cache API cho DB Query:**
   - _Rationale:_ Không cần cài thêm Redis cho các dự án tầm trung, Next.js File-system / Memory Cache (`unstable_cache`) đủ sức handle việc Caching và Invalidation dựa trên thẻ tag (ví dụ: `[story-slug]`, `[chapter-num]`).

2. **Refactoring thay vì Re-write:**
   - _Rationale:_ Thay vì đập đi xây lại hệ thống Reading Settings hay Audio Player, tôi sẽ tách các logic chung vào thư mục `@/lib/hooks/` và `@/lib/utils/`. Component sẽ được gom gọn, phân tán các hook nặng ra riêng để Next.js compiler thu gọn mã nguồn build-time.

3. **Bypass Suspense Bằng Transition Hook:**
   - _Rationale:_ Để tránh Flicker UI (Chớp nháy giao diện khi NextJS chạy file loading), mọi Link Component dẫn hướng trong trang đọc sẽ được bọc lại hoặc xử lý bằng API `startTransition` thay thế các Router Push tự do.

## Risks / Trade-offs

- **Risk: Dữ liệu (Cache) bị cũ (Stale Data)**
  - _Mitigation:_ Thiết lập revalidate hợp lý (VD 3600s cho chi tiết truyện, 30s cho Top views) và cung cấp các Server Action tự động đánh dấu (revalidateTag) khi có chương mới.
- **Risk: Lỗi Hydration khi chia sẻ Context**
  - _Mitigation:_ Kiểm tra chặt chẽ luồng code của Device Context Provider để loại bỏ mismatch giữa Server Render và Client Rendered DOM.
