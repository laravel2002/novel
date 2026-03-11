## Why

Google Search Console báo lỗi CLS (Cumulative Layout Shift) = **0.524** (mức "Nghèo") tại trang đọc chương (`/truyen/[slug]/[chapter]`). Nguyên nhân gốc: Root Layout (`app/layout.tsx`) render **Footer + Navbar + MobileNavigation** cho TẤT CẢ các route, kể cả trang đọc chương – nơi Footer hoàn toàn không cần thiết. Khi trang load, Footer xuất hiện rồi bị nội dung đẩy xuống, gây layout shift nghiêm trọng.

Giải pháp kiến trúc: Sử dụng **Next.js Route Groups** để tách thành 2 layout riêng biệt – một layout chính có Footer/Navbar cho các trang thông thường, và một layout tối giản (không Footer) cho trang đọc chương.

## What Changes

- **Tạo Route Group `(main)`**: Chứa tất cả các trang hiện tại (trang chủ, thể loại, bảng xếp hạng, tìm kiếm, tủ truyện, cá nhân, đăng nhập/đăng ký, trang chi tiết truyện, v.v.) với layout đầy đủ Navbar + Footer + MobileNavigation.
- **Tạo Route Group `(reader)`**: Chứa riêng trang đọc chương (`/truyen/[slug]/[chapter]`) với layout tối giản – KHÔNG có Footer, KHÔNG có MobileNavigation.
- **Tái cấu trúc Root Layout**: `app/layout.tsx` chỉ giữ lại các Providers toàn cục (ThemeProvider, AuthProvider, DeviceProvider, v.v.), loại bỏ Navbar/Footer/MobileNavigation ra khỏi root.
- **Loại bỏ `min-h-[100dvh]`**: Xóa CSS workaround đã thêm trước đó vì không còn cần thiết khi Footer đã bị tách layout.

## Capabilities

### New Capabilities
- `route-group-layout`: Tách layout thành 2 Route Group (`(main)` có full UI, `(reader)` tối giản) để triệt tiêu CLS từ Footer tại trang đọc chương.

### Modified Capabilities
_(Không có capability hiện tại nào bị thay đổi về mặt requirement – chỉ thay đổi cấu trúc thư mục)_

## Impact

- **Thư mục `app/`**: Tái cấu trúc toàn bộ cây thư mục, di chuyển routes vào các Route Group tương ứng.
- **`app/layout.tsx`**: Giảm vai trò xuống chỉ còn Providers + font loading. Navbar/Footer/MobileNavigation chuyển vào `app/(main)/layout.tsx`.
- **URL không thay đổi**: Route Groups dùng dấu ngoặc đơn `()` nên URL pattern giữ nguyên hoàn toàn, SEO không bị ảnh hưởng.
- **Core Web Vitals**: CLS sẽ giảm từ 0.524 về gần 0 tại trang đọc chương.
