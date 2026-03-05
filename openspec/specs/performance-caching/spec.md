## ADDED Requirements

### Requirement: Database Query Caching

Hệ thống SHALL lưu bộ nhớ đệm (cache) cho các truy vấn dữ liệu ít thay đổi như Thông tin truyện (Story) và Nội dung chương (Chapter) để giảm tải cho Database.

#### Scenario: User yêu cầu trang thông tin truyện

- **WHEN** Hệ thống gọi hàm `getStory` hoặc `getChapter` từ database
- **THEN** Dữ liệu trả về sẽ được lấy từ Cache (nếu có và chưa hết hạn) thay vì hit trực tiếp vào PostgreSQL.

### Requirement: Cache Invalidation

Hệ thống MUST hỗ trợ cơ chế xóa cache (revalidate) khi có dữ liệu mới được cập nhật (ví dụ: thêm chương mới, đổi tên truyện).

#### Scenario: Tác giả đăng chương mới

- **WHEN** Quá trình insert chương mới vào Database thành công
- **THEN** Hệ thống sẽ gọi lệnh `revalidateTag` để xóa cache cũ của truyện đó.
