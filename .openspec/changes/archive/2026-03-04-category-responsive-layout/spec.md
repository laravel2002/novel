# Đặc tả: Tách Layout Trang Thể Loại (Desktop, Tablet, Mobile)

## 1. Context (Mục tiêu tính năng)

Hiện tại, trang **Thể Loại** (`/the-loai`) đang dồn chung mã nguồn cho tất cả các thiết bị trong file `page.tsx`. Việc sử dụng chung layout và quản lý Responsive chủ yếu bằng các class Tailwind (`hidden sm:block lg:grid-cols-4`, v.v.) khiến mã nguồn trở nên cồng kềnh, khó bảo trì, đồng thời không tối ưu triệt để trải nghiệm (UX) trên từng thiết bị cụ thể.

**Giải pháp:**
Áp dụng mẫu thiết kế Component Wrapper (`CategoryPageUI`) dựa vào Device Hook (`useDevice`) để tách bạch hoàn toàn giao diện làm 3 bản riêng biệt:

1. **Desktop (`CategoryPageDesktop`):** Màn hình lớn. Có Filter Sidebar hẵn hoi ở bên trái, lưới truyện (Grid) hiển thị 4-5 cột ở bên phải cực kỳ thoáng đãng.
2. **Tablet (`CategoryPageTablet`):** Màn hình vừa (iPad). Có thể giữ Sidebar nhưng thu hẹp lại, hoặc đổi Sidebar thành dạng Sticky Top bar / Dropdown linh hoạt để tối đa không gian lưới (3 cột).
3. **Mobile (`CategoryPageMobile`):** Điện thoại. Diện tích hẹp. Đưa toàn bộ các bộ lọc (Filter) vào một Bottom Sheet / Drawer mở mượt mà từ dưới lên bằng ngón tay cái. Lưới truyện thu gọn còn 2 cột.

## 2. Data Schema / TypeScript Interfaces

Sẽ tái sử dụng data fetching logic hiện có ở `page.tsx` (Server Component). Data sẽ truyền nguyên bản (Props) xuống các Client Components.

```typescript
import { Story, Category } from "@/generated/prisma/client";

interface CategoryPageUIProps {
  categories: Category[];
  stories: (Story & { totalChapters: number; categories: Category[] })[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchParamsProps: Record<string, string | undefined>;
}
```

## 3. Task List (Danh sách công việc)

- [x] **Task 1:** Tạo Component Wrapper `CategoryPageUI`: Đọc `useDevice` từ Context để quyết định render Desktop, Tablet hay Mobile component.
- [x] **Task 2:** Tạo Component `CategoryPageDesktop`: Bê logic hiển thị hiện tại vào đây, gọt dũa lại CSS Tailwind chỉ tập trung cho màn lớn (xoá bỏ các class sm: md: thừa).
- [x] **Task 3:** Tạo Component `CategoryPageTablet`: Copy giao diện từ Desktop nhưng điều chỉnh lưới Grid (3 cột) và thu gọn Sidebar cho vừa vặn không gian màn hình Tablet.
- [x] **Task 4:** Tạo Component `CategoryPageMobile`: Xây dựng layout tối giản, tạo nút "Lọc" nổi bật để mở Drawer chứa các tuỳ chọn Thể Loại, Tình Trạng, Sắp Xếp.
- [x] **Task 5:** Sửa đổi `app/the-loai/page.tsx`: Truyền toàn bộ dữ liệu fetch được (như `categories`, `stories`, `totalPages`) qua Props cho `CategoryPageUI`.
- [x] **Task 6:** Cập nhật lại `FilterSidebar` hoặc tạo phiên bản tương ứng cho Mobile Picker (Bộ lọc Mobile).
- [x] **Task 7:** Manual Test: Chạy thử trên 3 kích thước màn hình để đảm bảo UI không vỡ, form load đúng và các Param filter hoạt động chuẩn.
