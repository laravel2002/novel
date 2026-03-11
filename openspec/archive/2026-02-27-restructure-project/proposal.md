## Why

Dự án đã phát triển nhiều tính năng (trang chủ, BXH, truyện hoàn thành, đọc chapter, tìm kiếm, thư viện...) nhưng cấu trúc thư mục `components/` hiện tại **phẳng và thiếu tổ chức**, gây khó khăn khi tìm file, bảo trì, và mở rộng. Cần tái cấu trúc ngay để tránh tích lũy thêm technical debt khi thêm tính năng mới.

## What Changes

- **Di chuyển 6 file rời** (`AuthProvider`, `BackButton`, `ContinueReadingButton`, `Logo`, `ReadingTracker`, `ThemeProvider`) từ `components/` root vào thư mục chuyên biệt (`providers/`, `shared/`)
- **Gộp `leaderboard/` vào `rankings/`** — hai thư mục hiện cùng phục vụ tính năng Bảng Xếp Hạng, gây nhầm lẫn
- **Phân tán skeletons** — di chuyển skeleton components từ `skeletons/` về thư mục feature tương ứng (colocation), chỉ giữ lại shared skeletons
- **Đổi tên `list/` → `story-list/`** — tên rõ ràng hơn, nhất quán với nội dung
- **Xóa `app/(main)/`** — route group rỗng, không phục vụ mục đích nào
- **Gộp `context/`, `hooks/`, `store/`** — 3 thư mục nhỏ (tổng 5 file) gộp vào `lib/` hoặc đặt cạnh feature liên quan
- **Cập nhật tất cả import paths** cho khớp đường dẫn mới

## Capabilities

### New Capabilities

- `feature-based-components`: Tổ chức components theo feature (colocation) — mỗi feature có thư mục chứa đầy đủ components, skeletons, types
- `shared-components`: Tạo thư mục `providers/` và `shared/` cho components dùng chung toàn app
- `consolidated-state`: Gộp `context/`, `hooks/`, `store/` vào cấu trúc gọn gàng hơn

### Modified Capabilities

_(Không có thay đổi requirements — chỉ tái cấu trúc vật lý, không thay đổi behavior)_

## Impact

- **Components**: ~40+ file trong `components/` sẽ được di chuyển/đổi tên thư mục
- **Import paths**: Tất cả file import từ `components/`, `context/`, `hooks/`, `store/` cần cập nhật alias
- **Pages (app/)**: Các page sử dụng components sẽ cần cập nhật import
- **Services**: Không bị ảnh hưởng (giữ nguyên cấu trúc `services/` trong đợt này)
- **Risk**: Thấp — chỉ di chuyển/đổi tên, không sửa logic. Verify bằng `bun run build`
