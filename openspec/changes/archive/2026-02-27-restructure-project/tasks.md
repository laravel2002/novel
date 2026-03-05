## 1. Tạo thư mục providers và di chuyển Provider components

- [x] 1.1 Tạo thư mục `components/providers/`
- [x] 1.2 Di chuyển `components/AuthProvider.tsx` → `components/providers/AuthProvider.tsx`
- [x] 1.3 Di chuyển `components/ThemeProvider.tsx` → `components/providers/ThemeProvider.tsx`
- [x] 1.4 Cập nhật import trong `app/layout.tsx` và tất cả file reference

## 2. Tạo thư mục shared và di chuyển components rời

- [x] 2.1 Tạo thư mục `components/shared/`
- [x] 2.2 Di chuyển `components/BackButton.tsx` → `components/shared/BackButton.tsx`
- [x] 2.3 Di chuyển `components/ContinueReadingButton.tsx` → `components/shared/ContinueReadingButton.tsx`
- [x] 2.4 Di chuyển `components/Logo.tsx` → `components/shared/Logo.tsx`
- [x] 2.5 Di chuyển `components/ReadingTracker.tsx` → `components/shared/ReadingTracker.tsx`
- [x] 2.6 Cập nhật tất cả import references cho 4 file trên

## 3. Gộp leaderboard/ vào rankings/

- [x] 3.1 Di chuyển `components/leaderboard/StoryRankCard.tsx` → `components/rankings/StoryRankCard.tsx`
- [x] 3.2 Di chuyển `components/leaderboard/LeaderboardFilters.tsx` → `components/rankings/LeaderboardFilters.tsx`
- [x] 3.3 Xóa thư mục `components/leaderboard/`
- [x] 3.4 Cập nhật import trong `app/bang-xep-hang/page.tsx` và các file liên quan

## 4. Phân tán skeletons về feature tương ứng

- [x] 4.1 Di chuyển `skeletons/ChapterListSkeleton.tsx` → `chapter/ChapterListSkeleton.tsx`
- [x] 4.2 Di chuyển `skeletons/RankingItemSkeleton.tsx` → `rankings/RankingItemSkeleton.tsx`
- [x] 4.3 Di chuyển `skeletons/StoryCardSkeleton.tsx` → `rankings/StoryCardSkeleton.tsx`
- [x] 4.4 Di chuyển `skeletons/StoryListItemSkeleton.tsx` → `story-list/StoryListItemSkeleton.tsx`
- [x] 4.5 Di chuyển `skeletons/CompletedStorySkeleton.tsx` → `completed/CompletedStorySkeleton.tsx`
- [x] 4.6 Giữ lại `skeletons/BaseSkeleton.tsx` và `skeletons/SearchSkeleton.tsx`
- [x] 4.7 Cập nhật tất cả import references cho skeleton files

## 5. Đổi tên list/ → story-list/

- [x] 5.1 Đổi tên thư mục `components/list/` → `components/story-list/`
- [x] 5.2 Cập nhật tất cả import references từ `@/components/list/` → `@/components/story-list/`

## 6. Gộp context/, hooks/, store/ vào lib/

- [x] 6.1 Di chuyển `context/` → `lib/contexts/` (3 files)
- [x] 6.2 Di chuyển `hooks/` → `lib/hooks/` (1 file)
- [x] 6.3 Di chuyển `store/` → `lib/store/` (1 file)
- [x] 6.4 Cập nhật import `@/context/` → `@/lib/contexts/`
- [x] 6.5 Cập nhật import `@/hooks/` → `@/lib/hooks/`
- [x] 6.6 Cập nhật import `@/store/` → `@/lib/store/`
- [x] 6.7 Xóa thư mục gốc `context/`, `hooks/`, `store/`

## 7. Dọn dẹp và verify

- [x] 7.1 Xóa thư mục `app/(main)/` rỗng
- [x] 7.2 Verify build thành công (`bun run build`)
- [x] 7.3 Kiểm tra không còn dead imports hoặc references lỗi
