# Đặc tả: Hệ thống Cài đặt (System Settings)

## 1. Context (Bối cảnh)

Người dùng cần một giao diện trung tâm để quản lý hồ sơ cá nhân, bảo mật tài khoản và các tùy chỉnh trải nghiệm đọc truyện. Hiện tại trang `/settings` chưa được triển khai.

## 2. Thiết kế Giao diện (UI Design)

- **Layout:** Sử dụng bố cục Sidebar (bên trái) và Content (bên phải) hoặc Tabs linh hoạt cho mobile.
- **Phong cách:** Editorial Luxury (Glassmorphism, typography hiện đại, spacing rộng rãi).
- **Các phân mục chính:**
  - **Hồ sơ (Profile):** Ảnh đại diện (Avatar), Tên hiển thị (Display Name), Email (Read-only).
  - **Bảo mật (Security):** Thay đổi mật khẩu.
  - **Tùy chỉnh (Preferences):** Cài đặt giao diện (Light/Dark), Ngôn ngữ (mặc định Tiếng Việt).

## 3. Data Schema (Cấu trúc dữ liệu)

- Không thay đổi `User` model hiện tại.
- Sử dụng các API của `next-auth` để lấy thông tin session và `Prisma` để cập nhật database.

## 4. Task List (Danh sách công việc)

- [ ] Thiết lập trang `/app/settings/page.tsx` với cấu trúc Tabs.
- [ ] Tạo `services/user.ts` để xử lý logic cập nhật thông tin User.
- [ ] Tạo Server Actions trong `app/actions/user.ts`.
- [ ] Triển khai Form cập nhật hồ sơ (dùng `shadcn/ui` + `react-hook-form` + `zod`).
- [ ] Triển khai Form đổi mật khẩu với xác thực độ mạnh mật khẩu.
- [ ] Tích hợp thông báo thành công/lỗi (Toast).
