## Why

Tính năng Đọc Truyện (Text-to-Speech) hiện tại sử dụng Web Speech API (`SpeechSynthesis`) tuy tốt nhưng có nhược điểm nghiêm trọng trên trình duyệt di động: **Âm thanh sẽ dừng ngay lập tức khi người dùng tắt màn hình (ngủ đông) hoặc chuyển sang ứng dụng khác.** Điều này đi ngược lại thói quen nghe audio/podcast thông thường, gây gián đoạn trải nghiệm nghe truyện của người dùng.

Để giải quyết triệt để, hệ thống cần áp dụng kĩ thuật **"Silent Audio Hack"** kết hợp với **Media Session API** để đánh lừa OS rằng trình duyệt đang phát media liên tục, từ đó giữ cho quá trình đọc TTS (vốn không được xem là media thông thường) chạy ngầm không bị ngắt quãng.

## What Changes

- **Tích hợp Silent Audio Hack**: Thêm một thẻ `<audio>` ẩn, loop liên tục một file âm thanh rỗng (im lặng) dung lượng siêu nhỏ. Audio này sẽ bật cùng lúc khi User nhấn nút Play TTS.
- **Tích hợp Media Session API**: Đăng ký thông tin media (Tên truyện, Tác giả, Ảnh bìa) hiển thị lên Lock Screen / Notification của hệ điều hành di động.
- **Xử lý Hardware Media Keys**: Bắt chéo các sự kiện từ tai nghe/Lock Screen (Play, Pause, NextTrack, PreviousTrack) để điều khiển trình đọc TTS (Web Speech API).
- **Cải tiến AudioPlayer hiện tại**: Sửa đổi luồng logic Play/Pause của `AudioPlayer.tsx` để đồng bộ trạng thái giữa TTS, Silent Audio và Media Session.

## Capabilities

### New Capabilities
- `tts-background-play`: Cơ chế chống ngủ đông và tích hợp Lock Screen Controls cho tính năng đọc giọng nói trên mobile.

### Modified Capabilities
- `story-reading`: Nâng cấp giao diện/chức năng đọc truyện hiện tại để hỗ trợ điều khiển TTS mượt mà hơn.

## Impact

- **`features/chapter/components/AudioPlayer.tsx`**: File chịu ảnh hưởng chính, logic phức tạp hơn do phải quản lý đa luồng (TTS + Audio element + Media Session).
- **Assets**: Cần bổ sung file `silent.mp3` (vài KB) vào thư mục `public/`.
- **Trải nghiệm thiết bị di động**: Đột phá về UX do người dùng có thể tắt màn hình nghe truyện thay vì phải mở sáng màn hình liên tục gây tốn pin.
