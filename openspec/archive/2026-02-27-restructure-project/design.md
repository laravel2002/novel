## Context

Dự án Next.js (App Router) với cấu trúc hiện tại:

```
components/           # 18 mục: 12 thư mục + 6 file rời
├── AuthProvider.tsx, BackButton.tsx, ContinueReadingButton.tsx,
│   Logo.tsx, ReadingTracker.tsx, ThemeProvider.tsx    ← 6 file rời ở root
├── leaderboard/      # StoryRankCard, LeaderboardFilters
├── rankings/         # RankingList, RankingTabs         ← TRÙNG với leaderboard/
├── skeletons/        # 7 skeleton files                 ← TÁCH RỜI khỏi feature
├── list/             # StoryListItem, FilterSidebar     ← TÊN MƠ HỒ
├── ui/               # shadcn (BẤT KHẢ XÂM PHẠM)
└── auth/, chapter/, completed/, home/, layout/, library/, story/

context/              # 3 file: BookmarkContext, ReadingProgressContext, ReadingSettingsContext
hooks/                # 1 file: useDebounce
store/                # 1 file: audio-store
app/(main)/           # Route group RỖNG
```

**Constraints:** Không sửa logic/behavior, chỉ di chuyển file. `components/ui/` và `generated/prisma/` bất khả xâm phạm.

## Goals / Non-Goals

**Goals:**

- Tổ chức `components/` theo feature (colocation) — file liên quan nằm cạnh nhau
- Loại bỏ sự trùng lặp `leaderboard/` vs `rankings/`
- Đưa skeleton về đúng feature để không phải nhảy qua 2 thư mục khi sửa
- Gom `context/`, `hooks/`, `store/` vào thư mục hợp lý hơn
- Xóa thư mục rỗng `app/(main)/`
- Đảm bảo build thành công sau thay đổi

**Non-Goals:**

- Tách nhỏ `services/story.ts` và `services/leaderboard.ts` (change riêng)
- Thay đổi logic, behavior, hoặc UI
- Sửa `components/ui/` hoặc `generated/`
- Thay đổi routing paths trong `app/`
- Thêm hoặc xóa tính năng

## Decisions

### 1. Feature-based organization cho components

**Quyết định:** Di chuyển skeleton vào thư mục feature thay vì giữ centralized.

**Lý do:** Colocation giúp developer tìm file nhanh hơn. Khi sửa feature `chapter/`, tất cả file liên quan (component + skeleton) đều trong 1 thư mục.

**Alternative xem xét:** Giữ `skeletons/` centralized nhưng đặt re-export files — phức tạp hơn mà không giải quyết gốc vấn đề.

### 2. Gộp leaderboard/ vào rankings/ (không tạo tên mới)

**Quyết định:** Di chuyển cả 2 file từ `leaderboard/` sang `rankings/`, xóa `leaderboard/`.

**Lý do:** `rankings/` đã có `RankingList.tsx` và `RankingTabs.tsx` — là các component "cha". `leaderboard/` chỉ chứa component con. Gộp về 1 nơi là hợp lý nhất.

### 3. Tạo `providers/` và `shared/` cho components dùng chung

**Quyết định:** Tách providers (Context wrappers) ra `providers/`, các utility components ra `shared/`.

**Lý do:** Providers chỉ dùng ở `layout.tsx` nên cần phân biệt rõ với shared UI components dùng nhiều nơi.

### 4. Gộp context/, hooks/, store/ vào lib/

**Quyết định:** Di chuyển `context/` → `lib/contexts/`, `hooks/` → `lib/hooks/`, `store/` → `lib/store/`.

**Lý do:** Giảm số thư mục root-level, gom các utility/state management vào `lib/` (đã có `utils.ts`, `prisma.ts`). Giữ alias `@/lib/` hoạt động.

**Alternative:** Để `context/` thành `components/providers/contexts/` — nhưng context không phải component, nên `lib/` phù hợp hơn.

### 5. Đổi tên list/ → story-list/

**Quyết định:** Rename vì `list` quá generic. `story-list` rõ ràng hơn về nội dung.

### 6. Thứ tự thực hiện

**Quyết định:** Thực hiện từ trong ra ngoài — di chuyển file trước, cập nhật import sau, verify build cuối cùng. Mỗi task là atomic.

## Risks / Trade-offs

| Risk                                | Mitigation                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Import paths bị sót** → build lỗi | Dùng grep toàn project để tìm tất cả import liên quan trước khi di chuyển. Verify bằng `bun run build` |
| **Git history bị mất** khi rename   | Dùng `git mv` để giữ history. Nếu dùng file system move thì git vẫn detect rename với similarity > 80% |
| **Barrel exports bị vỡ**            | Kiểm tra có barrel files (index.ts) không. Hiện không có → không bị ảnh hưởng                          |
| **Dynamic imports bị lỗi**          | Scan toàn project tìm `dynamic(import(...))` references và cập nhật                                    |
