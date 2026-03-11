# Đặc tả: Tối ưu hóa Navbar (Mobile, Tablet, Desktop)

## 1. Context (Bối cảnh)

Navbar hiện tại khá tốt nhưng chưa thực sự "Premium" trên Mobile và Tablet. Cần tối ưu để mang lại cảm giác mượt mà (Luxury/Editorial feel) và tận dụng không gian màn hình tốt hơn.

## 2. Thiết kế Cơ bản (Core Design)

- **Aesthetics:** Glassmorphism (`bg-background/80`, `backdrop-blur`), subtle borders, smooth transitions.
- **Behavior:** Smart Header (Hide on scroll down, Show on scroll up).

## 3. Responsive Breakpoints

- **Mobile (< 768px):**
  - `[Logo]` `[Search Icon]` `[Action Icons]` `[Menu Toggle]`
  - Mobile Menu (Sheet) chứa: User Info (nếu logged in), Nav Links, Social Links (tùy chọn).
- **Tablet (768px - 1024px):**
  - `[Logo]` `[Nav Links (compact)]` `[Search Bar (min-width)]` `[User Profile]`
- **Desktop (> 1024px):**
  - `[Logo]` `[Full Nav Links]` `[Large Search Bar]` `[User Profile]`

## 4. Task List (Danh sách công việc)

- [x] Cập nhật CSS/Motion cho hiệu ứng Smart Header.
- [x] Tái cấu trúc `Navbar.tsx` để hỗ trợ đa thiết bị tốt hơn.
- [x] Nâng cấp `Mobile Menu` (Sheet Content) với UI cao cấp hơn.
- [x] Tinh chỉnh `Search.tsx` để hỗ trợ chế độ Expandable trên mobile.
- [x] Kiểm tra khả năng tương thích với Dark/Light mode.
