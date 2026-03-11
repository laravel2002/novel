## 1. Chuẩn bị Root Layout

- [x] 1.1 Refactor `app/layout.tsx`: Chỉ giữ lại Providers (DeviceProvider, AuthProvider, ThemeProvider, ReadingSettingsProvider, BookmarkProvider, ReadingProgressProvider), font loading, `<html>`, `<body>`, Toaster, SpeedInsights, Analytics. Loại bỏ Navbar, Footer, MobileNavigation, và thẻ `<main>` wrapper. Xóa class `min-h-[100dvh]` đã thêm trước đó.

## 2. Tạo Route Group `(main)`

- [x] 2.1 Tạo `app/(main)/layout.tsx`: Chứa Navbar + `<main>` wrapper + Footer + MobileNavigation (nội dung y hệt phần UI chrome cũ từ Root Layout).
- [x] 2.2 Di chuyển `app/page.tsx` → `app/(main)/page.tsx`
- [x] 2.3 Di chuyển các route còn lại vào `app/(main)/`: `bang-xep-hang`, `ca-nhan`, `dang-ky`, `dang-nhap`, `dat-lai-mat-khau`, `hoan-thanh`, `kham-pha`, `lich-su`, `moi-cap-nhat`, `settings`, `the-loai`, `tim-kiem`, `tu-truyen`
- [x] 2.4 Di chuyển `app/truyen/[slug]/page.tsx` và `app/truyen/[slug]/loading.tsx` → `app/(main)/truyen/[slug]/`

## 3. Tạo Route Group `(reader)`

- [x] 3.1 Tạo `app/(reader)/layout.tsx`: Layout tối giản – chỉ có `<main>` wrapper đơn giản (không Navbar, Footer, MobileNavigation).
- [x] 3.2 Di chuyển `app/truyen/[slug]/[chapter]/` → `app/(reader)/truyen/[slug]/[chapter]/` (bao gồm layout.tsx, loading.tsx, page.tsx)

## 4. Cleanup

- [x] 4.1 Xóa thư mục `app/truyen/` cũ (đã trống sau khi di chuyển)
- [x] 4.2 Xóa import Navbar, Footer, MobileNavigation khỏi `app/layout.tsx`
- [x] 4.3 Kiểm tra và fix tất cả relative imports bị vỡ (nếu có)

## 5. Verification

- [x] 5.1 Chạy `bun run build` – đảm bảo build thành công không lỗi
- [x] 5.2 Kiểm tra trang chủ (`/`) hiển thị đầy đủ Navbar + Footer
- [x] 5.3 Kiểm tra trang chi tiết truyện (`/truyen/[slug]`) hiển thị đầy đủ Navbar + Footer
- [x] 5.4 Kiểm tra trang đọc chương (`/truyen/[slug]/chuong-[num]`) KHÔNG có Footer và MobileNavigation
- [x] 5.5 Kiểm tra các trang khác (bảng xếp hạng, thể loại, v.v.) hoạt động bình thường
