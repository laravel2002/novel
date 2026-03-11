# Cloudflare R2 Integration cho Chapter Content

## 1. Context (Bối cảnh)

Hiện tại, nội dung `content` của các `Chapter` được lưu trữ trực tiếp vào database PostgreSQL. Việc lưu trữ text HTML/Text dài với số lượng chương lớn sẽ làm database phình to rất nhanh, tốn chi phí và làm chậm quá trình query/backup.
Giải pháp: Sử dụng Cloudflare R2 (Object Storage tương thích S3 API) để lưu trữ nội dung từng chương dưới dạng file `.txt` hoặc `.html`. Database sẽ chỉ đóng vai trò lưu metadata và đường dẫn/Key tới R2. Việc này thay đổi hệ thống cào dữ liệu, schema database và cả luồng lấy nội dung để render ở frontend.

## 2. Data Schema & Types

**Cập nhật Prisma Schema (`prisma/schema.prisma`):**

```prisma
model Chapter {
  // ... (giữ nguyên các trường id, storyId, chapterNum, title, views, createdAt)

  // CẬP NHẬT:
  content        String?   // Chuyển thành optional để hỗ trợ đọc từ R2
  cloudflarer2Key String?  // Đường dẫn/Key của file trên R2 (VD: stories/1/chapters/1.html)

  // ... (giữ nguyên relationships)
}
```

**Cập nhật Environment Variables (`.env`):**

- Thêm những biến cần thiết để kết nối:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=  # Domain Cloudflare CDN đã liên kết với Bucket (để frontend load nhanh)
```

## 3. Task List (Danh sách công việc)

- [x] **Khởi tạo & Cấu hình:**
  - [x] Cài đặt package `aws4fetch`.
  - [x] Cập nhật `.env` và validate env.
  - [x] Tạo file kết nối S3Client tại `lib/cloudflare-r2.ts`.

- [x] **Database (Prisma):**
  - [x] Mở file `prisma/schema.prisma` và sửa `content` thành `String?`, thêm `cloudflarer2Key String?`.
  - [x] Chạy lệnh `bunx prisma db push` và `bunx prisma generate`.

- [x] **Service Layer (`services/storage.ts`):**
  - [x] Viết hàm `uploadChapterContent(key, content)`: Upload nội dung lên R2.
  - [x] Viết hàm `getChapterContent(key)`: Lấy nội dung từ R2 (Dùng thư viện hoặc dùng `fetch` trực tiếp R2_PUBLIC_DOMAIN nếu public).

- [x] **Crawler (Tool cào truyện):**
  - [x] Cập nhật logic khi cào 1 chapter: Gắn key theo cấu trúc `stories/{storySlug}/chapters/{chapterNum}.html`.
  - [x] Upload content html lên R2 thay vì cho thẳng vào biến `content`.
  - [x] Lưu DB với `content: null` và `cloudflarer2Key: "{key}"`.

- [x] **Frontend (Trang đọc truyện):**
  - [x] Cập nhật hàm gọi chapter detail (trong `services/story.ts`).
  - [x] Nếu DB trả về có field `cloudflarer2Key`, sẽ thực hiện fetch lấy dữ liệu text từ R2 và gán vào trường `content` trả về cho UI.
  - [x] (Fallback) Trường hợp chapter cũ chưa migrate, `content` khác null thì vẫn ưu tiên lấy từ DB.
