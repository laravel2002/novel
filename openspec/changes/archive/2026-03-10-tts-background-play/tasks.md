## 1. Chuẩn bị Asset

- [x] 1.1 Tạo file audio im lặng (silent audio) cực nhỏ (tầm 1 giây) và lưu vào `public/silent.mp3`.
- [x] 1.2 Import file vào codebase hoặc load tĩnh qua đường dẫn tuyệt đối trong component.

## 2. Áp dụng Media Session API và Audio Hack

- [x] 2.1 Cập nhật `AudioPlayer.tsx`: Tạo ref cho ẩn `<audio src="/silent.wav" loop>`.
- [x] 2.2 Đăng ký `navigator.mediaSession.metadata` khi mở Player hoặc Play TTS để hiện thông tin truyện/chương lên màn hình khóa.
- [x] 2.3 Gắn các `setActionHandler` (play, pause, previoustrack, nexttrack) vào `navigator.mediaSession`. Các lệnh này phải map tới hàm điều khiển TTS hiện hành (ví dụ: `togglePlay`, `skipForward`, v.v.).

## 3. Đồng bộ State Phát Thanh

- [x] 3.1 Sửa hàm `playParagraph()`: Khi phát sinh Utterance trơn tru, PHẢI gọi lệnh `audioRef.current.play()` cho kênh audio im lặng. Cập nhật state `playbackState` của Media Session API thành `playing`.
- [x] 3.2 Sửa hàm `togglePlay()` (logic Tạm dừng): Khi Pause, PHẢI gọi lệnh `audioRef.current.pause()`. Cập nhật `playbackState` thành `paused`.
- [x] 3.3 Sửa hàm `handleStop()` hoặc khi chuyển chương/kết thúc: PHẢI dừng toàn bộ cấu trúc Audio + TTS. Giải phóng Media Session handler.

## 4. Cập nhật Components Cha
- [x] 4.1 Update `StoryDetailChapterMobile.tsx` thêm biến `storyTitle`.
- [x] 4.2 Update `StoryDetailChapterDesktop.tsx` thêm biến `storyTitle` và `coverUrl`.

## 5. Verification

- [x] 5.1 Test trên trình duyệt (F12 Mobile view): Media control hiện trên thanh công cụ/thông báo.
- [x] 5.2 Play TTS, đổi Tab, kiểm tra xem TTS có tiếp tục đọc hay không.
- [x] 5.3 Nhấn dửng/chạy lại qua Control Center hoặc tai nghe giả lập và xem UI ứng dụng có map đúng state không.
