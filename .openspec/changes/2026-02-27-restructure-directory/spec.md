# Đặc tả: Tái cấu trúc thư mục dự án (Restructure Directory)

## 1. Context (Bối cảnh & Mục tiêu)

Dự án đã phát triển nhiều tính năng (trang chủ, bảng xếp hạng, truyện hoàn thành, đọc chapter, tìm kiếm, thư viện...) nhưng cấu trúc thư mục `components/` hiện tại đang **phẳng và thiếu tổ chức**, gây khó khăn khi mở rộng.

### Các vấn đề hiện tại

| #   | Vấn đề                          | Chi tiết                                                                                                                                                                    |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Components rời ở root**       | 6 file (`AuthProvider`, `BackButton`, `ContinueReadingButton`, `Logo`, `ReadingTracker`, `ThemeProvider`) nằm trực tiếp trong `components/` thay vì trong thư mục chức năng |
| 2   | **Trùng lặp chức năng**         | `components/rankings/` và `components/leaderboard/` đều phục vụ tính năng Bảng Xếp Hạng                                                                                     |
| 3   | **Skeletons tách rời**          | `components/skeletons/` gom tất cả skeleton vào 1 nơi, khiến khi sửa feature phải nhảy qua 2 thư mục                                                                        |
| 4   | **Route group rỗng**            | `app/(main)/` tồn tại nhưng rỗng, không có route nào nằm trong đó                                                                                                           |
| 5   | **Service files quá lớn**       | `services/story.ts` (14KB) và `services/leaderboard.ts` (14KB) chứa quá nhiều logic                                                                                         |
| 6   | **Thiếu nhất quán tên thư mục** | `components/list/`, `components/home/`, `components/chapter/` - không có quy tắc đặt tên rõ ràng                                                                            |

### Mục tiêu

- **Tổ chức theo Feature (Feature-based)**: Mỗi tính năng có thư mục riêng chứa đầy đủ components, skeletons, types.
- **Colocation**: Skeleton, filter, card... nằm cạnh component chính của feature.
- **Dễ tìm file**: Nhìn cấu trúc biết ngay file thuộc tính năng nào.
- **Dễ mở rộng**: Thêm tính năng mới chỉ cần tạo 1 thư mục mới.

---

## 2. Cấu trúc mới được đề xuất

```
components/
├── providers/                    # Tất cả Provider/Context wrappers
│   ├── AuthProvider.tsx
│   └── ThemeProvider.tsx
│
├── shared/                       # Components dùng chung nhiều nơi
│   ├── BackButton.tsx
│   ├── ContinueReadingButton.tsx
│   ├── Logo.tsx
│   └── ReadingTracker.tsx
│
├── layout/                       # Layout chung (giữ nguyên)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Search.tsx
│   ├── BookmarkSheet.tsx
│   └── ScrollToTop.tsx
│
├── auth/                         # Authentication (giữ nguyên)
│   └── LoginModal.tsx
│
├── home/                         # Trang chủ (giữ nguyên)
│   ├── HeroBanner.tsx
│   ├── LatestUpdates.tsx
│   ├── CompletedStories.tsx
│   ├── SidebarRankings.tsx
│   └── ThreeColRankings.tsx
│
├── story/                        # Chi tiết truyện + nút CTA
│   ├── BookmarkButton.tsx
│   └── ReadNowButton.tsx
│
├── chapter/                      # Đọc chapter (giữ nguyên)
│   ├── AudioPlayer.tsx
│   ├── AudioPlayerController.tsx
│   ├── BookmarkButton.tsx
│   ├── ChapterContent.tsx
│   ├── ChapterList.tsx
│   ├── ChapterListSidebar.tsx
│   ├── ChapterNavigation.tsx
│   ├── ChapterReactions.tsx
│   ├── ChapterSettings.tsx
│   ├── InlineCommentDrawer.tsx
│   ├── TrackReadingProgress.tsx
│   └── ChapterListSkeleton.tsx   # ← Di chuyển từ skeletons/
│
├── rankings/                     # BXH (GỘP leaderboard/ vào đây)
│   ├── RankingList.tsx
│   ├── RankingTabs.tsx
│   ├── StoryRankCard.tsx         # ← Từ leaderboard/
│   ├── LeaderboardFilters.tsx    # ← Từ leaderboard/
│   ├── RankingItemSkeleton.tsx   # ← Từ skeletons/
│   └── StoryCardSkeleton.tsx     # ← Từ skeletons/
│
├── story-list/                   # Danh sách truyện dùng chung (đổi tên từ list/)
│   ├── StoryListItem.tsx
│   ├── StoryListItemTop3.tsx
│   ├── FilterSidebar.tsx
│   └── StoryListItemSkeleton.tsx # ← Từ skeletons/
│
├── completed/                    # Trang hoàn thành (giữ nguyên)
│   ├── CompletedFilters.tsx
│   └── CompletedStorySkeleton.tsx # ← Từ skeletons/
│
├── library/                      # Tủ truyện (giữ nguyên)
│   └── GuestLibrary.tsx
│
├── skeletons/                    # CHỈ GIỮ shared skeleton
│   ├── BaseSkeleton.tsx          # Base component dùng chung
│   └── SearchSkeleton.tsx        # Skeleton cho layout Search
│
└── ui/                           # shadcn (BẤT KHẢ XÂM PHẠM)
    └── ... (giữ nguyên)
```

### Thay đổi trong `app/`

```
app/
├── (main)/                       # XÓA thư mục rỗng này
...                               # Còn lại giữ nguyên
```

### Thay đổi trong `services/`

> [!IMPORTANT]
> Giữ nguyên services/ trong đợt này. Việc tách `story.ts` và `leaderboard.ts` là thay đổi lớn hơn, nên thực hiện ở change riêng để tránh rủi ro.

---

## 3. Tổng kết các thao tác

| Thao tác      | File/Thư mục                         | Đích                               |
| ------------- | ------------------------------------ | ---------------------------------- |
| **TẠO**       | `components/providers/`              | Thư mục mới cho providers          |
| **TẠO**       | `components/shared/`                 | Thư mục mới cho shared components  |
| **DI CHUYỂN** | `AuthProvider.tsx`                   | `providers/AuthProvider.tsx`       |
| **DI CHUYỂN** | `ThemeProvider.tsx`                  | `providers/ThemeProvider.tsx`      |
| **DI CHUYỂN** | `BackButton.tsx`                     | `shared/BackButton.tsx`            |
| **DI CHUYỂN** | `ContinueReadingButton.tsx`          | `shared/ContinueReadingButton.tsx` |
| **DI CHUYỂN** | `Logo.tsx`                           | `shared/Logo.tsx`                  |
| **DI CHUYỂN** | `ReadingTracker.tsx`                 | `shared/ReadingTracker.tsx`        |
| **GỘP**       | `leaderboard/StoryRankCard.tsx`      | `rankings/StoryRankCard.tsx`       |
| **GỘP**       | `leaderboard/LeaderboardFilters.tsx` | `rankings/LeaderboardFilters.tsx`  |
| **XÓA**       | `components/leaderboard/`            | Sau khi gộp vào rankings/          |
| **DI CHUYỂN** | Skeletons feature-specific           | Vào thư mục feature tương ứng      |
| **ĐỔI TÊN**   | `components/list/`                   | `components/story-list/`           |
| **XÓA**       | `app/(main)/`                        | Xóa route group rỗng               |
| **CẬP NHẬT**  | Tất cả import paths                  | Cập nhật cho khớp đường dẫn mới    |

---

## 4. Task List

- [ ] **1. Tạo thư mục mới và di chuyển providers**
  - [ ] Tạo `components/providers/`, di chuyển `AuthProvider.tsx` và `ThemeProvider.tsx`
  - [ ] Cập nhật import trong `app/layout.tsx`

- [ ] **2. Tạo thư mục shared và di chuyển components rời**
  - [ ] Tạo `components/shared/`, di chuyển `BackButton.tsx`, `ContinueReadingButton.tsx`, `Logo.tsx`, `ReadingTracker.tsx`
  - [ ] Cập nhật tất cả import references

- [ ] **3. Gộp leaderboard/ vào rankings/**
  - [ ] Di chuyển `StoryRankCard.tsx` và `LeaderboardFilters.tsx` sang `rankings/`
  - [ ] Xóa thư mục `leaderboard/`
  - [ ] Cập nhật import trong `app/bang-xep-hang/page.tsx` và các file liên quan

- [ ] **4. Phân tán skeletons về feature tương ứng**
  - [ ] `ChapterListSkeleton.tsx` → `chapter/`
  - [ ] `RankingItemSkeleton.tsx`, `StoryCardSkeleton.tsx` → `rankings/`
  - [ ] `StoryListItemSkeleton.tsx` → `story-list/`
  - [ ] `CompletedStorySkeleton.tsx` → `completed/`
  - [ ] Giữ lại `BaseSkeleton.tsx` và `SearchSkeleton.tsx` trong `skeletons/`
  - [ ] Cập nhật tất cả import references

- [ ] **5. Đổi tên list/ → story-list/**
  - [ ] Rename thư mục
  - [ ] Cập nhật tất cả import references

- [ ] **6. Dọn dẹp**
  - [ ] Xóa thư mục `app/(main)/` rỗng
  - [ ] Xóa thư mục `components/leaderboard/` (nếu còn)
  - [ ] Verify build thành công (`bun run build`)
