## ADDED Requirements

### Requirement: Gộp context vào lib/contexts

Thư mục `context/` PHẢI được di chuyển toàn bộ thành `lib/contexts/` để gom state management vào `lib/`.

#### Scenario: Context files nằm trong lib

- **WHEN** kiểm tra thư mục `lib/`
- **THEN** PHẢI tồn tại thư mục `contexts/` chứa `BookmarkContext.tsx`, `ReadingProgressContext.tsx`, `ReadingSettingsContext.tsx`
- **AND** KHÔNG tồn tại thư mục `context/` ở root project

### Requirement: Gộp hooks vào lib/hooks

Thư mục `hooks/` PHẢI được di chuyển toàn bộ thành `lib/hooks/`.

#### Scenario: Hooks nằm trong lib

- **WHEN** kiểm tra thư mục `lib/`
- **THEN** PHẢI tồn tại thư mục `hooks/` chứa `useDebounce.ts`
- **AND** KHÔNG tồn tại thư mục `hooks/` ở root project

### Requirement: Gộp store vào lib/store

Thư mục `store/` PHẢI được di chuyển toàn bộ thành `lib/store/`.

#### Scenario: Store nằm trong lib

- **WHEN** kiểm tra thư mục `lib/`
- **THEN** PHẢI tồn tại thư mục `store/` chứa `audio-store.ts`
- **AND** KHÔNG tồn tại thư mục `store/` ở root project

### Requirement: Tất cả import paths cập nhật

Mọi import references từ `@/context/`, `@/hooks/`, `@/store/` PHẢI được cập nhật thành `@/lib/contexts/`, `@/lib/hooks/`, `@/lib/store/`.

#### Scenario: Build thành công sau gộp

- **WHEN** chạy `bun run build`
- **THEN** build PHẢI thành công không lỗi import liên quan đến context, hooks, store
