# Đặc tả: Trang Khám Phá trên Mobile (Mobile Explore Page)

## 1. Context (Mục tiêu tính năng)

Trên giao diện Mobile, không gian màn hình nhỏ giọt nên không thể chứa hết các link điều hướng (Bảng Xếp Hạng, Thể Loại, Hoàn Thành) trên thanh Navigation như Desktop. Hiện tại, Bottom Navigation có nút "Khám Phá", nhưng cần một trang đích (`/kham-pha`) thực sự tối ưu trải nghiệm chạm (touch-friendly) và cuộn trên điện thoại.

**Yêu cầu thiết kế:**

- **Thanh tìm kiếm trung tâm (Search):** Đặt ngay trên cùng để người dùng dễ dàng tìm truyện. Hỗ trợ hiển thị lịch sử tìm kiếm gần nhất.
- **Lưới Tuỳ Chọn (Grid Menu):** Các nút lớn có icon nổi bật (Bảng Xếp Hạng, Thể Loại, Hoàn Thành, Tủ Truyện) thiết kế dạng thẻ (Card) hoặc lưới (Grid 2 cột) để thao tác bằng ngón tay cái dễ nhất.
- **Khu vực Đề Cử / Mới Cập Nhật:** Hiển thị danh sách truyện vuốt ngang (Horizontal Scroll Snippets) cho cảm giác app native.

## 2. Data Schema / TypeScript Interfaces

Sử dụng lại Data Schema hiện tại (Bảng `Story`, `Category`). Không thay đổi Database.

Có thể thêm file Interface cho Component Khám Phá:

```typescript
interface ExploreGridItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  gradient: string; // Tailwind class cho visual effect
}
```

## 3. Task List (Danh sách công việc)

- [x] **Task 1:** Tạo trang `/app/kham-pha/page.tsx`: Dành riêng cho Mobile (hoặc tự động redirect về trang chủ nếu vào bằng Desktop).
- [x] **Task 2:** Xây dựng Component `ExploreGrid`: Chứa các nút lớn điều hướng tới Bảng Xếp Hạng, Thể Loại, Hoàn Thành.
- [x] **Task 3:** Tích hợp `SearchMobile` trực tiếp vào nửa trên của trang Khám Phá thay vì chỉ là Modal hoặc Sheet.
- [x] **Task 4:** Cập nhật `MobileNavigation.tsx`: Đảm bảo khi bấm vào mục "Khám Phá", người dùng sẽ được chuyển tới `/kham-pha`.
- [x] **Task 5:** Lấy Data (Data Fetching): Bổ sung một List vuốt ngang hiện "Truyện Đang Hot" (Trending) ở nửa dưới trang Khám Phá để tăng tương tác.
- [x] **Task 6:** Manual Test: Kiểm tra kỹ layout và hiệu ứng chạm CSS (active state/ripple effect) trên thiết bị di động.
