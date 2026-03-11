## ADDED Requirements

### Requirement: User đánh giá truyện theo thang 1-5 sao

Hệ thống SHALL cho phép user đã đăng nhập đánh giá truyện bằng cách chọn điểm từ 1 đến 5 sao. Mỗi user chỉ có 1 rating duy nhất cho mỗi truyện. Nếu user đã đánh giá trước đó, thao tác mới SHALL cập nhật (upsert) rating cũ.

#### Scenario: User đánh giá truyện lần đầu

- **WHEN** user đã đăng nhập click chọn số sao (1-5) trên box đánh giá
- **THEN** hệ thống tạo bản ghi Rating mới với `score` tương ứng, tính lại `story.rating` trung bình, và hiển thị trạng thái "Đã đánh giá" với số sao đã chọn

#### Scenario: User cập nhật đánh giá

- **WHEN** user đã đánh giá trước đó click chọn số sao khác
- **THEN** hệ thống cập nhật `score` trong bản ghi Rating hiện có, tính lại `story.rating` trung bình, và hiển thị số sao mới

#### Scenario: User chưa đăng nhập

- **WHEN** user chưa đăng nhập cố gắng đánh giá
- **THEN** hệ thống MUST hiển thị thông báo yêu cầu đăng nhập (không thực hiện thay đổi dữ liệu)

### Requirement: Tự động tính lại điểm rating trung bình

Sau mỗi lần tạo hoặc cập nhật Rating, hệ thống SHALL tính lại điểm trung bình (`AVG(score)`) của tất cả ratings cho truyện đó và cập nhật field `story.rating`.

#### Scenario: Tính lại rating sau đánh giá mới

- **WHEN** một Rating mới được tạo hoặc cập nhật thành công
- **THEN** `story.rating` MUST được cập nhật bằng giá trị trung bình của tất cả ratings, làm tròn 1 chữ số thập phân

### Requirement: Hiển thị trạng thái đánh giá hiện tại

Khi user đã đăng nhập truy cập trang chi tiết truyện, hệ thống SHALL kiểm tra và hiển thị rating hiện tại (nếu có) của user cho truyện đó.

#### Scenario: User đã từng đánh giá

- **WHEN** user đã đăng nhập mở trang chi tiết truyện mà trước đó đã đánh giá
- **THEN** box đánh giá hiển thị các sao đã tô màu tương ứng với `score` đã đánh giá, kèm label "Đánh giá của bạn"

#### Scenario: User chưa đánh giá

- **WHEN** user đã đăng nhập mở trang chi tiết truyện mà chưa đánh giá
- **THEN** box đánh giá hiển thị các sao mờ (unrated state) với prompt "Chạm để đánh giá"
