# Tính năng Bình luận theo Đoạn văn (Paragraph Comments)

## 1. Context

Cập nhật và hoàn thiện tính năng cho phép người dùng bình luận trực tiếp trên từng đoạn văn của một chương truyện. Việc này sẽ giúp người đọc thảo luận chi tiết hơn về từng tình tiết nhỏ trong truyện.

Hiện tại, trong schema Database (`Comment` model), đã có sẵn trường `paragraphId Int?` dùng để lưu vị trí đoạn văn (index). Chúng ta chỉ cần xây dựng các API và giao diện UI để tận dụng trường này.

## 2. Data Schema

**Không cần thay đổi Prisma Schema**, vì model `Comment` đã hỗ trợ sẵn:

```prisma
model Comment {
  // ...
  chapterId   Int?
  paragraphId Int? // Vị trí đoạn văn (index)
  // ...
}
```

**TypeScript Interfaces / API Payloads cần thiết:**

- Giao diện trả về `Comment` có chứa `paragraphId`.
- API lấy danh sách comment của một chương sẽ trả về thêm map dữ liệu biểu thị: đoạn văn số X có bao nhiêu bình luận (để gắn highlight/icon).
- Payload tạo comment mới sẽ nhận thêm tham số `paragraphId`.

## 3. Task List

- [x] **Task 1: Xây dựng Services & API**
  - Cập nhật service lấy bình luận của một chapter (gom nhóm số lượng bình luận theo từng `paragraphId`).
  - Cập nhật API POST `/api/comments` để nhận `paragraphId` khi tạo mới bình luận.
- [x] **Task 2: Tối ưu `ChapterContent` Component**
  - Chuyển nội dung text (content) đang render HTML đơn thuần thành các block `<p>` có gắn `index` tương ứng với `paragraphId`.
  - Có thể sử dụng thư viện `html-react-parser` để bóc tách các tag `<p>` và gắn event listener / action button mở box comment.
  - Hiển thị tooltip hoặc icon đếm số lượng comment bên cạnh lề của mỗi đoạn văn có comment.
- [x] **Task 3: Xây dựng UI Component `ParagraphCommentPanel`**
  - Dùng `Sheet` (Drawer) của shadcn/ui để hiển thị danh sách các comment khi click vào một đoạn văn bất kỳ.
  - Trong Panel này, có form để đăng tải comment mới gắn trực tiếp vào đoạn văn hiện tại.
