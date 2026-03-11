## Context

Tính năng đọc truyện bằng giọng nói (Text-to-Speech) đang được triển khai qua component `AudioPlayer.tsx` sử dụng Native Web Speech API (`window.speechSynthesis`). Tuy nhiên, trình duyệt di động (Safari iOS, Chrome Android) mặc định **dừng mọi xử lý JavaScript và Web API không phải là media thực sự** khi màn hình thiết bị tắt hoặc ứng dụng bị đẩy xuống chạy ngầm.

Hậu quả: Giọng đọc TTS bị ngắt ngang khi user tắt màn hình nghe truyện (một use-case rất phổ biến).

## Goals / Non-Goals

**Goals:**
- Đảm bảo TTS tiếp tục phát ngay cả khi màn hình tắt hoặc tắt trình duyệt (background play).
- Tích hợp thanh điều khiển Media (Play/Pause/Next/Prev) và thông tin truyện lên màn hình khóa (Lock Screen).
- Giải quyết triệt để trên cả iOS và Android.

**Non-Goals:**
- Tải file MP3 thực sự cho truyện. (Hệ thống vẫn dùng TTS tổng hợp giọng nói trực tiếp để tiết kiệm chi phí/băng thông).
- Xây dựng hệ thống TTS qua Server. (Vẫn dùng Client-side Web Speech API).

## Decisions

### 1. Kĩ thuật "Silent Audio Hack"
**Vấn đề:** Trình duyệt chỉ cho phép máy tiếp tục chạy ngầm nếu có một phần tử `<audio>` hoặc `<video>` thực sự đang phát.
**Giải pháp:** 
- Thêm một thẻ `<audio>` ẩn vào DOM, trỏ đến một file âm thanh cực nhỏ, rỗng (silent_audio.mp3 - khoảng 1KB).
- Cấu hình thẻ audio này đọc liên tục (`loop={true}`).
- Khi user bấm nút Play TTS, ta sẽ kích hoạt thẻ `<audio>` ẩn này chạy đồng thời. Hệ điều hành sẽ tưởng ứng dụng đang phát nhạc và cấp quyền chạy ngầm (wakelock cho audio).

### 2. Tích hợp Media Session API
**Vấn đề:** User muốn ấn Pause từ tai nghe Bluetooth hoặc từ màn hình khóa. Nhưng Web Speech API không tự động đăng ký với Media Control của OS.
**Giải pháp:**
- Gọi `navigator.mediaSession.metadata` để set thông tin bài hát ảo (Tên Story, Chương đang đọc, Ảnh bìa truyện).
- Đăng ký `navigator.mediaSession.setActionHandler` cho các sự kiện: `play`, `pause`, `previoustrack`, `nexttrack`.
- Khi OS nhận lệnh pause từ tai nghe, sự kiện `pause` sẽ được trigger. Tại đây, ta gọi `window.speechSynthesis.pause()` và đồng thời pause thẻ `<audio>` ẩn.

### 3. Đồng bộ State giữa React, SpeechSynthesis, và thẻ Audio
Thiết kế luồng đồng bộ trạng thái:
- Play Click → Phát `silent_audio` → Gọi `speechSynthesis.speak()` → Update Zustand.
- Pause Click → Dừng `silent_audio` → Gọi `speechSynthesis.pause()` → Update Zustand.
- Next Click → Chuyển đoạn → `speechSynthesis.cancel()` → Update Zustand.
- OS Pause (Tai nghe) → `MediaSession.setActionHandler('pause')` → Flow như Pause Click.

## Risks / Trade-offs

- **[Risk] Bị OS kill app nếu ngốn RAM**: Dù có audio ngầm, nếu iOS hết RAM, nó vẫn kill tab.
  → **Mitigation**: Optimize memory khi đọc sách, dọn dẹp biến rác. Web Speech API có memory leak nhẹ trên Chrome, cần fix bằng cách gán `utterance` vào global variable (đã làm trong phiên bản hiện tại).
- **[Risk] Browser chặn Autoplay Audio**: Hành động auto-play file `silent_audio.mp3` nếu không có tương tác người dùng sẽ bị chặn.
  → **Mitigation**: Gắn lệnh `audio.play()` trực tiếp vào trong function onClick của nút Play do User bấm.
- **[Trade-off] Biểu tượng đang phát nhạc**: Trên status bar của điện thoại sẽ có icon đang phát nhạc kể cả khi giọng TTS đang nghỉ giữa các câu.
  → **Mitigation**: Đây là trade-off chấp nhận được để đổi lấy Background Play.
