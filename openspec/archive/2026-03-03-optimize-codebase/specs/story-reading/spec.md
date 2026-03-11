## ADDED Requirements

### Requirement: Seamless Chapter Transition

Hệ thống Đọc Truyện SHALL mang lại trải nghiệm 0ms delay (không chớp màn hình Loading) khi độc giả chuyển tiếp giữa các chương.

#### Scenario: User cuộn đến cuối chương và bấm "Chương Sau"

- **WHEN** Nút "Chương Sau" (hoặc ArrowRight) được kích hoạt
- **THEN** Hệ thống sử dụng React `useTransition` kết hợp với `router.prefetch` để giữ nguyên DOM hiện tại cho đến khi Payload của chương sau tải xong 100%.

### Requirement: Prefetching lân cận

Hệ thống MUST âm thầm tải sẵn dữ liệu (Prefetch) cho chương trước và chương sau ngay trong quá trình người dùng đang đọc hiện tại.

#### Scenario: Render giao diện chương thành công

- **WHEN** Component ChapterContent vừa được Hydration xong trên Client
- **THEN** Hook useEffect sẽ ngay lập tức trigger `router.prefetch` cho `nextChapterUrl` và `prevChapterUrl`.
