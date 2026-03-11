# Đặc tả: Thiết kế lại Giao diện Mobile Cao cấp (Premium Mobile UI)

## 1. Context (Bối cảnh)

Hiện tại, dự án sử dụng Responsive Web Design (RWD) thông qua Tailwind classes (`sm:`, `md:`, `lg:`). Tuy nhiên, cách làm này dẫn đến trải nghiệm trên Mobile đôi khi giống một trang web thu nhỏ hơn là một **Native App thực thụ**.
Để đạt được cảm giác "Premium", "Luxury", và "Editorial", giao diện Mobile cần được tách biệt về mặt UX/UI với Desktop/Tablet. Nó cần tập trung tối đa vào thói quen sử dụng bằng một tay (Bottom navigation, vuốt để back/đóng, thumb-friendly touch targets).

## 2. Thiết kế Cơ bản (Core Design - Mobile Exclusive)

Thay vì chỉ ẩn/hiện các khối theo kích thước màn hình, chúng ta sẽ xây dựng cấu trúc Layout đặc thù cho Mobile:

- **App-like Navigation:**
  - Bỏ Sidebar/Hamburger Menu hoặc giấu sâu hơn.
  - Sử dụng **Bottom Navigation Bar (thanh điều hướng dưới cùng)** cố định, chứa các tab chính: Khám phá, Tủ truyện, Xếp hạng, Cá nhân.
- **Micro-interactions & Gestures:**
  - Thay vì click nút, ưu tiên hỗ trợ tương tác vuốt (swipeable tabs, swipe to dismiss modals/sheets).
  - Phản hồi chạm (touch feedback) mượt mà bằng CSS animations (`active:scale-95`).
- **Typography & Spacing (Editorial Feel):**
  - Tối ưu Font size cho khả năng đọc cực kỳ thoải mái (legibility).
  - Tăng khoảng trắng (whitespace) để giao diện "thở", tránh nhồi nhét thông tin (Ví dụ: danh sách truyện có thể dùng dạng Card lớn thay vì List nén chặt).
- **Smart Headers:**
  - Header tối giản, siêu mỏng, tự động ẩn khi cuộn xuống và hiện khi cuộn lên, hoặc mờ đi (fade out).

## 3. Kiến trúc Cài đặt (Implementation Strategy)

- Không tạo 2 file `page.tsx` riêng biệt để tránh lặp code quá mức.
- Sử dụng **cấu trúc Component tách biệt**:
  - `LayoutDesktop` vs `LayoutMobile`
  - `StoryDetailDesktop` vs `StoryDetailMobile`
- Render có điều kiện dựa trên kích thước cửa sổ (CSS Media Queries `hidden md:block` và `block md:hidden`) ở cấp độ component cha (Container/Wrapper), bên trong là các component chuyên biệt thay vì dùng responsive classes rải rác.
- Có thể dùng thư viện như `react-use` (hoặc custom hook `useMediaQuery`) kết hợp với SSR/Hydration safe pattern (render server là responsive cơ bản, sau hydrate sẽ chuyển qua component chuẩn).

## 4. Task List (Danh sách công việc)

- [ ] Thiết kế Layout tổng thể (Shell) cho Mobile: Bottom Navigation Bar + Minimal Header.
- [ ] Xây dựng bộ UI riêng cho Mobile (Component cấp độ Layout).
- [ ] Refactor Trang Chủ: Tạo `HomeMobile` components (Hero Banner vuốt dọc, danh sách vuốt ngang).
- [ ] Refactor Trang Chi tiết Truyện: Tạo `StoryDetailMobile` (Cover lớn, nút đọc nổi bật ở dưới cùng dính màn hình).
- [ ] Refactor Trang Đọc Truyện: Tối ưu UI cho việc đọc một tay trên màn hình nhỏ.
- [ ] Đồng bộ hóa và kiểm tra hiệu năng (Performance pass).
