# Đặc tả: Tách biệt UI/UX Mobile (Separate Mobile UI/UX)

## 1. Context (Mục tiêu tính năng)

Tách biệt rõ ràng UI/UX giữa phiên bản Desktop và Mobile để giải quyết các vấn đề sau:

- Tối ưu hóa hiệu suất (Performance): Tránh load các đoạn code/DOM của Desktop trên thiết bị Mobile và ngược lại (thay vì tải toàn bộ và dùng CSS `hidden` để ẩn đi).
- Tránh xung đột giao diện: Khắc phục triệt để các lỗi đè/chồng chéo layout đã từng xảy ra (ví dụ ở `ChapterNavigation`).
- Dễ bảo trì và mở rộng: Việc code UI độc lập giúp team dễ dàng tinh chỉnh thiết kế cho Mobile mà không sợ ảnh hưởng đến luồng Desktop.

Phương pháp: Sử dụng cơ chế phát hiện thiết bị (Device Detection) ưu tiên ở Server (thông qua `User-Agent`) để quyết định render `<Component>Desktop` hay `<Component>Mobile` ngay từ đầu, kết hợp với Client component khi cần thiết.

## 2. Data Schema / TypeScript Interfaces

Do tính chất công việc tập trung thay đổi cấu trúc UI, không có thay đổi về Prisma Schema. Dưới đây là các định nghĩa TypeScript hỗ trợ việc phân luồng hiển thị:

```typescript
// Định nghĩa kiểu thiết bị
type DeviceType = "desktop" | "mobile" | "tablet";

// Utility helper (dự kiến ở một hook / helper file)
interface IDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
}

// Cấu trúc Props cho component Wrapper nếu cần điều phối UI
interface ResponsiveWrapperProps {
  desktopComponent: React.ReactNode;
  mobileComponent: React.ReactNode;
}
```

## 3. Task List (Danh sách công việc)

- [x] **Task 1:** Xây dựng/Cập nhật cơ chế Device Detection: Tạo utility function kiểm tra `User-Agent` ở Server Component để SSR chính xác UI cho Mobile/Desktop, tránh lỗi hydration mismatch.
- [x] **Task 2:** Tạo/Cập nhật các Hook/Utility kiểm tra kích thước màn hình phía Client (như `useMobile`, `useMediaQuery`) dùng cho Client Component.
- [x] **Task 3:** Rà soát và Refactor cấu trúc Layout/Component cốt lõi (vd: Header, Navigation, Footer, ChapterNavigation): Tách bạch hoàn toàn code logic render UI Desktop và Mobile, loại bỏ lạm dụng CSS `md:hidden`, `hidden md:block` trên các root element chứa DOM lớn.
- [x] **Task 4:** Cập nhật các Component Detail như `SearchDesktop`, `SearchMobile` hay `Ranking` để tuân thủ luật tách biệt UI và gọi qua một component cha (Wrapper) nhận luồng phân phối điều hướng.
- [x] **Task 5:** Manual Test lại trải nghiệm và giao diện trên các kích thước màn hình (Mobile, Tablet, Desktop) để đảm bảo không gãy vỡ layout và tối ưu thời gian phản hồi (TTFB/FCP).
