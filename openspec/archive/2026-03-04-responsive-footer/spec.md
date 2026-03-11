# Đặc tả: Tối ưu hiển thị Footer theo thiết bị (Responsive Footer)

## 1. Context (Mục tiêu tính năng)

Hiện tại component `Footer` (chân trang) đang hiển thị trên mọi kích thước màn hình. Tuy nhiên, trên màn hình di động (Mobile), giao diện đã có thanh Bottom Navigation (`MobileNavigation`) để điều hướng. Việc hiển thị thêm một Footer quá dài ở cuối trang không chỉ gây tốn diện tích, lặp lại thông tin mà còn làm trải nghiệm cuộn (scroll) trở nên nặng nề hơn.

**Giải pháp:**

- Giữ nguyên hiển thị Footer sang trọng, phong cách "Luxury Magazine" cho các thiết bị từ Tablet trở lên (Desktop, Tablet).
- Xóa hoàn toàn Footer trên thiết bị di động (Mobile) để tối ưu không gian hiển thị và nhường chỗ cho Bottom Navigation.

## 2. Data Schema / TypeScript Interfaces

Tính năng này hoàn toàn xử lý ở tầng UI/CSS, không có thay đổi nào về Database Schema, API hay luồng dữ liệu.

## 3. Task List (Danh sách công việc)

- [x] **Task 1:** Cập nhật CSS component `Footer`: Thêm lớp tiện ích Tailwind (`hidden md:block` hoặc `hidden md:flex`) vào thẻ bọc ngoài cùng của file `Footer.tsx` để ẩn Footer trên màn hình nhỏ và chỉ hiện từ breakpoint `md` trở lên.
- [x] **Task 2:** Rà soát lại Layout tổng thể: Kiểm tra xem việc ẩn Footer trên Mobile có để lại khoảng trống trắng (padding/margin) thừa ở cuối trang hay không, đảm bảo không gian sát với mép dưới màn hình / thanh Mobile Navigation.
- [x] **Task 3:** Manual Test: Chạy thử trên Desktop và giả lập Mobile (Chrome DevTools) để xác nhận Footer biến mất hoàn toàn trên Mobile và hiển thị bình thường trên màn hình lớn.
