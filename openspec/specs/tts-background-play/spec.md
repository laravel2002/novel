## ADDED Requirements

### Requirement: Tích hợp Silent Audio để chống ngủ đông
Hệ thống PHẢI có cơ chế phát sinh một luồng âm thanh thực sự (silent audio) chạy ngầm để giữ cho thiết bị (iOS/Android) không rơi vào trạng thái ngừng xử lý JavaScript khi màn hình tắt.

#### Scenario: Kích hoạt Silent Audio khi bắt đầu đọc TTS
- **WHEN** người dùng bấm nút Play trên giao diện Audio Player
- **THEN** hệ thống PHẢI ngay lập tức phát một file audio rỗng (`silent.mp3`) ở chế độ lặp lại vô tận (`loop=true`) CÙNG LÚC với việc gọi `speechSynthesis.speak()`.

#### Scenario: Dừng Silent Audio khi ngưng đọc
- **WHEN** người dùng bấm nút Pause/Stop hoặc TTS tự động đọc xong toàn bộ chương
- **THEN** thẻ audio rỗng PHẢI được tạm dừng (`pause()`) để giải phóng tài nguyên.


### Requirement: Tích hợp Media Session API
Hệ thống PHẢI cung cấp thông tin bài đọc hiện tại lên màn hình khóa (Lock Screen) và Control Center của thiết bị di động, đồng thời nhận lệnh điều khiển từ các nguồn này.

#### Scenario: Cập nhật thông tin lên Lock Screen
- **WHEN** người dùng bắt đầu nghe Audio của một chương truyện
- **THEN** hệ thống PHẢI gọi `navigator.mediaSession.metadata` để hiển thị: `title` (Tên chương), `artist` (Tên truyện), và `artwork` (Ảnh bìa truyện).

#### Scenario: Phản hồi lệnh Play/Pause từ tai nghe hoặc Lock Screen
- **WHEN** hệ điều hành phát ra sự kiện Media Action `play` hoặc `pause` (do user bấm nút trên tai nghe hoặc trên màn hình khóa)
- **THEN** hệ thống PHẢI bắt được sự kiện này qua `navigator.mediaSession.setActionHandler`, tự động gọi `speechSynthesis.resume()`/`pause()` cục bộ, và cập nhật trạng thái UI (State) để đồng bộ.

#### Scenario: Phản hồi lệnh Next/Previous từ tai nghe hoặc Lock Screen
- **WHEN** hệ điều hành phát ra sự kiện Media Action `nexttrack` hoặc `previoustrack`
- **THEN** hệ thống PHẢI đổi đoạn văn bản (Paragraph) đang đọc lên đoạn tiếp theo hoặc lùi về đoạn trước đó, dọn dẹp biến utterance cũ, và gọi hàm đọc văn bản mới. Bỏ qua nếu đã ở đoạn đầu/cuối cùng.


### Requirement: Gán Utterance vào Global Object (Workaround cho Chrome Bug)
Hệ thống PHẢI áp dụng workaround để tránh bug "Garbage Collection" kinh điển của Chrome làm cho TTS bị ngắt giữa chừng khi đọc văn bản dài.

#### Scenario: Lưu trữ đối tượng Utterance
- **WHEN** một đối tượng `SpeechSynthesisUtterance` mới được tạo ra để chuẩn bị đọc
- **THEN** nó PHẢI được gán vào một biến toàn cục (ví dụ: `window.currentUtterance`) để ngăn chặn trình dọn rác bộ nhớ của Chrome xóa đối tượng này khi nó vẫn đang phát thanh.
