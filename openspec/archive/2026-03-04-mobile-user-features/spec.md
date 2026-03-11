# Đặc tả: Chức năng của Người dùng trên Mobile (Mobile User Features)

## 1. Context (Mục tiêu tính năng)

Nhằm mang lại trải nghiệm liền mạch và tối ưu trên thiết bị di động, cần xây dựng/cập nhật hệ thống giao diện và luồng (flow) dành riêng cho người dùng (User) trên Mobile. Thay vì sử dụng các Dropdown Menu phức tạp như trên Desktop, Mobile sẽ có các màn hình hoặc Drawer/Sheet chuyên dụng để thao tác nhanh gọn.

Các chức năng chính bao gồm:

- **Trang Cá Nhân (Profile):** Hiển thị thông tin người dùng (Avatar, Tên, Email) và các thông số (Số truyện đã đăng, Số bình luận, v.v.).
- **Quản lý Tủ Truyện (Library):** Tích hợp sẫn trong Bottom Navigation, giúp truy cập nhanh Lịch sử đọc, Đánh dấu, truyện Đang theo dõi.
- **Cài đặt & Hành động (Settings & Actions):** Giao diện dạng danh sách (List menu) cho các chức năng như Đổi giao diện (Sáng/Tối), Đổi mật khẩu, và Đăng xuất.
- **Luồng Đăng nhập/Đăng ký (Auth Flow):** Tối ưu hóa form đăng nhập/đăng ký cho màn hình cảm ứng, có thể sử dụng Full-screen Modal hoặc trang riêng lẻ thay vì Dialog nhỏ như Desktop.

## 2. Data Schema / TypeScript Interfaces

Chức năng này tập trung vào UI/UX nên chủ yếu tái sử dụng Database Schema hiện tại (bảng `User`). Nếu cần giao diện riêng, có thể bổ sung các Typescript interface:

```typescript
// Định nghĩa Menu Item cho màn hình Cá nhân trên Mobile
interface MobileUserMenuItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isDestructive?: boolean;
}
```

## 3. Task List (Danh sách công việc)

- [x] **Task 1:** Tạo trang/component `MobileProfile`: Xây dựng layout hiển thị thông tin user (Avatar, Tên, Email) tối ưu cho Mobile.
- [x] **Task 2:** Xây dựng danh sách Menu: Tạo component render các tuỳ chọn (Cài đặt tài khoản, Cài đặt giao diện, Đăng xuất) dưới dạng danh sách dễ chạm (touch-friendly list).
- [x] **Task 3:** Cập nhật luồng Navigation: Đảm bảo khi bấm vào mục "Cá Nhân" trên `MobileNavigation.tsx`, người dùng được điều hướng tới đúng trang/modal cấu hình dành riêng cho Mobile.
- [x] **Task 4:** Refactor luồng Đăng nhập/Đăng ký trên Mobile: Nếu phát hiện là Mobile, hiển thị Drawer/Sheet từ dưới lên hoặc chuyển sang trang `/dang-nhap` chuyên biệt thay vì dùng Dialog nhỏ bị bàn phím che lấp.
- [x] **Task 5:** Manual Test: Kiểm tra các hiệu ứng vuốt (swipe), tương tác chạm (tap), và bàn phím ảo (virtual keyboard) có làm vỡ layout không.
