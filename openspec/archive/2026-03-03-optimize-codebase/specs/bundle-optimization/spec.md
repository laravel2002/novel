## ADDED Requirements

### Requirement: Component Lazy Loading

Hệ thống SHALL sử dụng Next.js Dynamic Imports để tải các React Components nặng (như AudioPlayer, Modals, Drawers) chỉ khi người dùng cần thiết.

#### Scenario: User vào giao diện Đọc truyện

- **WHEN** Trang ChapterContent được load lần đầu tiên
- **THEN** Component `AudioPlayer` và `InlineCommentDrawer` sẽ không được gộp chung vào main Javascript bundle mà chỉ tải về khi state mở chúng được bật (isAudioOpen / commentOpen).

### Requirement: Refactoring shared hooks

Hệ thống MUST gom nhóm các hàm dùng chung (như `useMediaQuery`, `useDevice`) vào thư viện tiện ích (lib/hooks) để giảm thiểu duplicate code.

#### Scenario: Môi trường Development biên dịch mã nguồn

- **WHEN** Các màn hình Mobile và Desktop dùng chung logic Device Detection
- **THEN** Chúng sẽ tham chiếu tới cùng một dependency import duy nhất thay vì định nghĩa lại hàm.
