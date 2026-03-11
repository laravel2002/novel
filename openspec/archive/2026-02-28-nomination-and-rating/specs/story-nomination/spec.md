## ADDED Requirements

### Requirement: User đề cử truyện với giới hạn hàng ngày

Hệ thống SHALL cho phép user đã đăng nhập đề cử (tặng phiếu đề cử) cho truyện. Mỗi user được đề cử tối đa 1 lượt cho mỗi truyện mỗi ngày (tính theo UTC date).

#### Scenario: User đề cử truyện thành công

- **WHEN** user đã đăng nhập click nút "Tặng đề cử" và chưa đề cử truyện này trong ngày hôm nay
- **THEN** hệ thống tạo bản ghi Nomination mới, tăng tổng lượt đề cử hiển thị, và nút chuyển sang trạng thái "Đã đề cử hôm nay" (disabled)

#### Scenario: User đã đề cử truyện hôm nay

- **WHEN** user đã đề cử truyện này trong ngày hôm nay và cố gắng đề cử lại
- **THEN** hệ thống MUST từ chối thao tác và hiển thị thông báo "Bạn đã đề cử truyện này hôm nay"

#### Scenario: User chưa đăng nhập

- **WHEN** user chưa đăng nhập cố gắng đề cử
- **THEN** hệ thống MUST hiển thị thông báo yêu cầu đăng nhập

#### Scenario: User quay lại ngày hôm sau

- **WHEN** user đã đề cử truyện ngày hôm qua và truy cập lại trang vào ngày hôm nay
- **THEN** nút "Tặng đề cử" MUST hiển thị trạng thái sẵn sàng (enabled), cho phép đề cử lại

### Requirement: Hiển thị tổng lượt đề cử trên trang chi tiết

Trang chi tiết truyện SHALL hiển thị tổng số lượt đề cử (tổng tất cả từ mọi user, mọi ngày) cho truyện đó.

#### Scenario: Hiển thị tổng đề cử

- **WHEN** user mở trang chi tiết truyện
- **THEN** box đề cử hiển thị tổng số lượt đề cử chính xác (tính từ bảng Nomination)

#### Scenario: Tổng đề cử cập nhật sau khi đề cử

- **WHEN** user đề cử thành công
- **THEN** con số tổng đề cử MUST tăng lên 1 ngay lập tức (optimistic UI)

### Requirement: Hiển thị trạng thái đề cử hiện tại

Khi user đã đăng nhập truy cập trang chi tiết truyện, hệ thống SHALL kiểm tra xem user đã đề cử truyện này hôm nay chưa và hiển thị trạng thái tương ứng.

#### Scenario: User đã đề cử hôm nay

- **WHEN** user đã đăng nhập đã đề cử truyện trong ngày hôm nay (UTC)
- **THEN** nút đề cử hiển thị "Đã đề cử hôm nay" ở trạng thái disabled với visual indicator (ví dụ: icon check, màu xanh)

#### Scenario: User chưa đề cử hôm nay

- **WHEN** user đã đăng nhập chưa đề cử truyện hôm nay
- **THEN** nút đề cử hiển thị "Tặng đề cử" ở trạng thái enabled
