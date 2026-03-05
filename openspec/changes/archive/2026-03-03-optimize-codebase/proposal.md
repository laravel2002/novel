## Why

Dự án hiện tại đã phát triển khá nhiều tính năng (Reading Experience, Thiết bị Layout, Navigation, Auth). Qua thời gian, một số đoạn code bị lặp lại (duplicate), hiệu suất render (hydration) ở Client Components đôi khi chưa được xử lý triệt để, và các lệnh gọi Database cần thêm lớp Caching thông minh (Redis/Memory) để giảm tải cho DB Server. Việc tối ưu codebase lúc này giúp dự án dễ bảo trì hơn, chạy mượt mà hơn và tăng tốc độ phát triển tính năng mới.

## What Changes

- Refactor các React hooks và utility functions sử dụng nhiều lần vào các thư mục dùng chung (`/lib/utils`, `/hooks`).
- Tối ưu hóa Data Fetching: Bổ sung Next.js cache `unstable_cache` hoặc `revalidate` strategy cho các Service gọi DB (như `getChapter`, `getStory`).
- Giảm thiểu kích thước Bundle: Lazy loading các component nặng (như `AudioPlayer`, `CommentDrawer`) sâu hơn, kiểm soát chặt chẽ các module import.
- Xóa bỏ code thừa, comment rác, file nháp không còn sử dụng.
- Cải thiện System Logging & Error Handling.

## Capabilities

### New Capabilities

- `performance-caching`: Tích hợp Data Caching Layer cho các dịch vụ cốt lõi.
- `bundle-optimization`: Lazy load resources và chia nhỏ chunk components.

### Modified Capabilities

- `story-reading`: Chỉnh sửa requirement để ưu tiên nạp nhanh và phản hồi tức thời thông qua Caching và Prefetching nâng cao.

## Impact

- **UI/UX**: Giảm Loading time đáng kể, ứng dụng nhẹ và mượt hơn. Tăng điểm Lighthouse.
- **Backend/Services**: Giảm áp lực Query tới PostgreSQL nhờ các vòng Cache ở tầng Next Server.
- **Developer Experience**: Thư mục cleanly, source code rõ ràng, dễ đọc dễ debug.
