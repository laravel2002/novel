## ADDED Requirements

### Requirement: Thư mục providers cho Context wrappers

Hệ thống PHẢI có thư mục `components/providers/` chứa tất cả Provider/Context wrapper components (`AuthProvider.tsx`, `ThemeProvider.tsx`).

#### Scenario: Providers được tổ chức riêng

- **WHEN** kiểm tra thư mục `components/`
- **THEN** PHẢI tồn tại thư mục `providers/` chứa `AuthProvider.tsx` và `ThemeProvider.tsx`
- **AND** KHÔNG còn file Provider nào nằm trực tiếp trong `components/` root

### Requirement: Thư mục shared cho utility components

Hệ thống PHẢI có thư mục `components/shared/` chứa các UI components dùng chung nhiều nơi.

#### Scenario: Shared components được gom lại

- **WHEN** kiểm tra thư mục `components/shared/`
- **THEN** PHẢI chứa `BackButton.tsx`, `ContinueReadingButton.tsx`, `Logo.tsx`, `ReadingTracker.tsx`
- **AND** KHÔNG còn file nào nằm trực tiếp trong `components/` root (ngoài các thư mục con)

### Requirement: Import paths hoạt động đúng

Tất cả import references đến components đã di chuyển PHẢI được cập nhật cho khớp đường dẫn mới.

#### Scenario: Build thành công sau di chuyển

- **WHEN** chạy `bun run build`
- **THEN** build PHẢI thành công không lỗi import
