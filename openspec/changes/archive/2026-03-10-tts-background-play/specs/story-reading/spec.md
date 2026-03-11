## MODIFIED Requirements

### Requirement: Điều khiển Audio Player
Hệ thống cho phép người dùng khởi động, tạm dừng, hoặc bỏ qua văn bản đang đọc trong quá trình TTS.

#### Scenario: Bắt đầu đọc (Play)
- **WHEN** nút Play được nhấn trên Audio Player
- **THEN** hệ thống PHẢI bắt đầu đọc văn bản từ đoạn (paragraph) hiện tại được chọn và ĐỒNG THỜI phát file audio ẩn (silent audio) để lấy quyền chạy ngầm từ hệ điều hành. Đồng thời, thông tin tác phẩm PHẢI được đăng ký với Media Session API.

#### Scenario: Tạm dừng đọc (Pause)
- **WHEN** nút Pause được nhấn hoặc hệ điều hành gửi lệnh pause thông qua Media Session API
- **THEN** hệ thống PHẢI tạm dừng trình đọc (`speechSynthesis.pause()`) và ĐỒNG THỜI tạm dừng file audio ẩn để tiết kiệm pin.

#### Scenario: Chuyển đoạn (Next/Prev)
- **WHEN** người dùng nhấn nút Next/Prev trên giao diện hoặc qua Media Session API
- **THEN** hệ thống PHẢI hủy (`cancel()`) tiến trình đọc hiện hành, tính toán lại vị trí thẻ đoạn mới, và bắt đầu đọc lại từ đoạn đó.
