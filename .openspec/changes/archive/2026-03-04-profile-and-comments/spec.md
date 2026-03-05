# Đặc tả: Trang Quản Lý Tài Khoản (User Profile) & Cấu Trúc Bình Luận (Comments)

## 1. Context (Tình hình hiện tại)

Dự án cần phát triển 2 tính năng quan trọng:

1. **User Profile (`/ca-nhan`):** Cho phép người dùng cập nhật thông tin cá nhân (Tên hiển thị, Ảnh đại diện, Đổi mật khẩu).
2. **Hệ thống Bình Luận (Comments):** Hiển thị ở cuối mỗi **Chương truyện**, cho phép User bình luận, thảo luận, và báo cáo spoil. Trải nghiệm tương tự các forum truyện truyền thống nhưng giao diện hiện đại hơn.

## 2. Data Schema & Types

### 2.1 Prisma Schema Check

Model `User` và `Comment` đã cơ bản tồn tại trong `schema.prisma`. Ta cần đảm bảo `User` có đủ trường lưu trữ cho profile.

- `User`: Đã có `name`, `email`, `image`, `password`.
- `Comment`: Đã có `userId`, `storyId`, `chapterId`, `content`, `isSpoiler`. (Chưa có tính năng Reply/Nested - tạm thời làm Linear Comments trước cho dễ nhìn trên Mobile).

### 2.2 Client-Side Types

- Profile Update Payload: `{ name?: string; currentPassword?: string; newPassword?: string; image?: string; }`
- Comment Payload: `{ storyId: number; chapterId: number; content: string; isSpoiler: boolean; }`

## 3. Kiến trúc luồng hệ thống

### 3.1 Profile Page (`/ca-nhan`)

- **features/profile/components/ProfileLayout**: Wrapper bọc ngoài cho layout có sidebar `SettingNavigation` (Tài khoản, Bảo mật...).
- **features/profile/components/GeneralSettings**: Form cập nhật Avartar và Tên.
- **features/profile/components/SecuritySettings**: Form đổi Mật khẩu (đòi hỏi Mật khẩu cũ).
- **features/profile/services/profile.ts**: Server Actions gọi DB để Update User.

### 3.2 Comment System (`/truyen/[slug]/[chapter]`)

- **features/comment/components/CommentSection.tsx**: Wrapper load data và render toàn bộ block comment ở cuối chương.
- **features/comment/components/CommentForm.tsx**: Khung input cho phép gõ Comment (+ Checkbox "Có chứa Spoilers"). Nút Submit gọi Server Action.
- **features/comment/components/CommentList.tsx**: List render từng `CommentItem`.
- **features/comment/services/comment.ts**: Server actions `createComment`, `getChapterComments`.

## 4. Task List

- [x] **Task 1: Setup Profile Feature Folders:** Tạo thư mục `features/profile/components`, `features/profile/services`.
- [x] **Task 2: Xây dựng Profile & Security Services:** Tạo các Server Actions cho việc thay đổi tên, avatar, xác nhận và đổi password.
- [x] **Task 3: Build Trang `/ca-nhan`:** Tích hợp `ProfileLayout`, `GeneralSettings`, `SecuritySettings` UI.
- [x] **Task 4: Setup Comment Feature Folders:** Tạo thư mục `features/comment/components`, `features/comment/services`.
- [x] **Task 5: Xây dựng Comment Services:** Tạo Server Actions `createComment` và `getChapterComments`.
- [x] **Task 6: Build UI Bình luận:** Lắp đặt `CommentForm` và `CommentList` vào `CommentSection`.
- [x] **Task 7: Tích hợp vào Chương Truyện:** Nhúng `CommentSection` vào file `StoryDetailChapter.tsx` (ngay dưới nội dung chương và nút điều hướng).
- [x] **Task 8:** Test toàn bộ 2 quy trình trên Desktop và Mobile.
