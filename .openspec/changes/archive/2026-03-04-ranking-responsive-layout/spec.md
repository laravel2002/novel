# Đặc tả: Tách Layout Trang Bảng Xếp Hạng (Ranking) thành Desktop & Mobile

## 1. Context (Tình hình hiện tại)

Tương tự như vấn đề đã đối mặt ở trang `/the-loai`, trang **Bảng Xếp Hạng (`/bang-xep-hang`)** hiện có logic UI cồng kềnh, lẫn lộn giữa Desktop và Mobile. Bảng xếp hạng trên Mobile đang cố gắng hiển thị Layout Podium khổng lồ (top 3) gây chiếm dụng màn hình.

**Mục tiêu:**

- Tách bạch giao diện: Xây dựng Component `RankingDesktop`, `RankingTablet`, và `RankingMobile` chuyên dụng để tối ưu UX cho từng Device.
- Giữ logic lấy dữ liệu (Data fetching) duy nhất một lần tại Server-Component `page.tsx`, sau đó truyền Data (Props) qua Client-Wrapper (`RankingUI.tsx`).
- Tổ chức lại code đúng chuẩn Feature-Based & Device-Driven (theo spec trước).

## 2. Kế hoạch cấu trúc Folder mới

```
features/ranking/
├── components/
│   ├── desktop/
│   │   └── RankingDesktop.tsx
│   ├── tablet/
│   │   └── RankingTablet.tsx
│   ├── mobile/
│   │   └── RankingMobile.tsx
│   ├── shared/
│   │   └── Podium.tsx / RankListItem.tsx (nếu cần re-use)
│   └── RankingUI.tsx (Client Component: điều hướng layout dựa vào useDevice())
└── services/
    └── ranking.ts (Nếu cần tách logic lấy top Ranking)
```

## 3. UI/UX Thay đổi dự kiến

- **Desktop & Tablet:**
  - Bục vinh quang (Podium) to, rõ ràng với hiệu ứng hoành tráng cho Top 3.
  - Các truyện Top 4-100 được list danh sách hiển thị dạng ngang rõ chữ, rộng rãi.
- **Mobile:**
  - Podium vẫn tồn tại nhưng **nhỏ và dọc/thu gọn hơn** để không ép người dùng cuộn mỏi tay, chỉ hiển thị Icon/Avatar/Top.
  - Component filter/Tabs chọn loại Bảng Xếp Hạng (Top View / Top Vote) dễ bấm trên mobile.
  - Danh sách list truyện Top 4 đổ đi sẽ giống với `StoryListItemMobile` (cột đứng 1 hàng).

## 4. Task List

- [x] **Task 1:** Tạo các thư mục `desktop`, `mobile`, `tablet`, `shared` trong `features/ranking/components/`.
- [x] **Task 2:** Khởi tạo `RankingUI.tsx` nhận các Props (stories, activeTab) và wrapper qua hook `useDevice()`.
- [x] **Task 3:** Di chuyển logic UI trang `/bang-xep-hang/page.tsx` vào `RankingDesktop.tsx` (tái cấu trúc thành client component nhưng nhận initial static data từ server).
- [x] **Task 4:** Xây dựng Component `RankingMobile.tsx` và `RankingTablet.tsx` tối giản hoá list top truyện.
- [x] **Task 5:** Viết component `Podium` dạng Shared để dùng lại cho Desktop/Tablet.
- [x] **Task 6:** Tích hợp `RankingUI` vào trang gốc `/bang-xep-hang/page.tsx`.
- [x] **Task 7:** Dev/Test hiển thị thực tế trên các màn hình và Build check lints.
