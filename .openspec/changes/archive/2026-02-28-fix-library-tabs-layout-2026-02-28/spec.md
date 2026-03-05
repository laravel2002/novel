# Spec: Tủ Truyện - Nâng cấp Layout & UX cho Tabs (OpenSpec)

Sửa lỗi hiển thị và nâng cấp giao diện `Tabs` tại trang Tủ Truyện hướng tới phong cách **Editorial Luxury**.

## Context

- `TabsList` hiện tại có thể bị tràn khung hoặc nhảy dòng trên mobile do thiếu cấu hình cuộn ngang.
- Người dùng đã thử thêm `gap-2` và `shrink-0` nhưng giao diện vẫn chưa đạt độ hoàn thiện cao.
- Mục tiêu: Cung cấp trải nghiệm mượt mà, "premium" với hiệu ứng cuộn ngang ẩn thanh cuộn và căn chỉnh chuẩn cho cả mobile/desktop.

## Proposed Changes

### 1. UI Refinement (Tabs)

Sử dụng biến thể `variant="line"` cho `TabsList` để có giao diện thanh lịch hơn (hướng tới phong cách tạp chí/editorial).

#### [MODIFY] [page.tsx](file:///d:/novel/app/tu-truyen/page.tsx)

- Cập nhật `TabsList` và `TabsTrigger`:
  - `TabsList`:
    - Thêm `variant="line"` (nếu `components/ui/tabs.tsx` hỗ trợ tốt).
    - Cấu hình: `flex items-center gap-6 overflow-x-auto scrollbar-none w-full border-b border-border/40 pb-px mb-8`.
  - `TabsTrigger`:
    - Xóa các class `h-10`, `px-4`.
    - Thay bằng: `px-1 pb-4 text-sm md:text-base font-medium transition-all relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform shrink-0`.
    - Lưu ý: Dùng `data-[state=active]` thay vì `data-active` tùy theo implementation của Radix UI trong project. (Dựa vào `tabs.tsx` hiện tại dùng `data-active`).

### 2. CSS Utility

Đảm bảo `.scrollbar-none` hoạt động tốt trên mọi trình duyệt.

## Task List

- [x] [UI] Cấu trúc lại `TabsList` với biến thể `line` tại `app/tu-truyen/page.tsx` <!-- id: 1 -->
- [x] [UI] Tinh chỉnh khoảng cách (`gap`) và border bottom để tạo cảm giác "Editorial" <!-- id: 2 -->
- [x] [UI] Đảm bảo hiệu ứng cuộn ngang hoạt động mà không có thanh cuộn thô cứng <!-- id: 3 -->
- [x] [Verify] Kiểm tra trên Mobile (iPhone/Android simulate) và Desktop <!-- id: 4 -->
