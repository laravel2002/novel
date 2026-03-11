# OpenSpec: Fix Dynamic Server Error on Chapter Page

## 1. Context

Next.js App Router (v14/v15) throws a `DynamicServerError` during Static Generation (SSG) or Initial Server Rendering because `getChapter` in `features/story/services/story.ts` contains database side-effects (incrementing views via Prisma) and Redis side-effects (`recordStoryView`). The Upstash Redis client uses `fetch` with `cache: 'no-store'`, which Next.js flags as dynamic usage inside a static route.

Mục tiêu (Goal): Loại bỏ hoàn toàn side-effects (tăng view) ra khỏi Server Component render phase (khi gọi `getChapter`), và chuyển logic này thành một Server Action được gọi từ Client Component (`useEffect`). Cách này giải quyết triệt để lỗi `Dynamic server usage` và đảm bảo an toàn cho SSG.

## 2. Data Schema

Không thay đổi Database Schema. Sẽ tạo thêm các files mới:

- `features/chapter/actions/track-view.ts`: Chứa Server Action để tăng lượt xem (chạy trên Server nhưng được trigger từ Client).
- `features/chapter/components/ViewTracker.tsx`: Client Component ẩn chứa `useEffect` để gọi Server Action khi người dùng thực sự đọc chương truyện.

## 3. Task List

- [x] Chỉnh sửa `features/story/services/story.ts`: Xóa logic `prisma.update` (tăng view) và `recordStoryView` ra khỏi hàm `getChapter`.
- [x] Tạo file mới `features/chapter/actions/track-view.ts`: Phơi bày một Server Action `trackChapterView(storyId, chapterId)` để thực hiện việc tăng view (gồm cả thao tác Prisma và Redis).
- [x] Tạo file mới `features/chapter/components/ViewTracker.tsx`: Là một `use client` component, nhận props `storyId` và `chapterId`, gọi `trackChapterView` đúng 1 lần khi mount (sử dụng useRef hoặc setTimeout debounce để tránh StrictMode gọi 2 lần ở Dev).
- [x] Chỉnh sửa `features/chapter/components/StoryDetailChapter.tsx`: Thêm component `<ViewTracker />` vào cuối DOM để nó tự động track view khi component render trên trình duyệt.
