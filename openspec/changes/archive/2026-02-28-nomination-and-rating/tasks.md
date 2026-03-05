## 1. Database Schema

- [x] 1.1 Thêm model `Rating` vào `prisma/schema.prisma` (fields: id, userId, storyId, score Int, createdAt, updatedAt; unique constraint `[userId, storyId]`; relations tới User và Story)
- [x] 1.2 Thêm model `Nomination` vào `prisma/schema.prisma` (fields: id, userId, storyId, date DateTime @db.Date, createdAt; unique constraint `[userId, storyId, date]`; relations tới User và Story)
- [x] 1.3 Cập nhật model `User` thêm relations `Rating[]` và `Nomination[]`
- [x] 1.4 Cập nhật model `Story` thêm relations `Rating[]` và `Nomination[]`
- [x] 1.5 Chạy `bunx prisma migrate dev --name add-rating-nomination` để tạo migration

## 2. Service Layer

- [x] 2.1 Tạo file `services/interaction.ts` với các hàm:
  - `upsertRating(userId, storyId, score)`: Upsert rating + tính lại story.rating trong transaction
  - `getUserRating(userId, storyId)`: Lấy rating hiện tại của user cho truyện
  - `createNomination(userId, storyId)`: Tạo nomination mới (kiểm tra giới hạn ngày)
  - `hasNominatedToday(userId, storyId)`: Kiểm tra user đã đề cử hôm nay chưa
  - `getNominationCount(storyId)`: Đếm tổng lượt đề cử cho truyện

## 3. Server Actions

- [x] 3.1 Tạo file `app/actions/interaction.ts` với 2 Server Actions:
  - `rateStoryAction(storyId, score)`: Validate input, check auth, gọi service `upsertRating`, revalidate path
  - `nominateStoryAction(storyId)`: Check auth, gọi service `createNomination`, revalidate path

## 4. Client Components

- [x] 4.1 Tạo component `components/story/RatingBox.tsx`:
  - Interactive star rating (hover + click)
  - Hiển thị trạng thái đã đánh giá / chưa đánh giá
  - Optimistic UI khi submit
  - Toast thông báo kết quả / yêu cầu đăng nhập
- [x] 4.2 Tạo component `components/story/NominationBox.tsx`:
  - Nút "Tặng đề cử" / "Đã đề cử hôm nay"
  - Hiển thị tổng lượt đề cử
  - Optimistic UI khi submit
  - Toast thông báo kết quả / yêu cầu đăng nhập

## 5. Tích hợp vào trang chi tiết

- [x] 5.1 Cập nhật `app/truyen/[slug]/page.tsx`:
  - Thay thế box đánh giá tĩnh bằng component `RatingBox` (truyền props: storyId, currentRating, userRating, isLoggedIn)
  - Thay thế box đề cử tĩnh bằng component `NominationBox` (truyền props: storyId, totalNominations, hasNominatedToday, isLoggedIn)
  - Fetch dữ liệu trạng thái đánh giá/đề cử trong Server Component

## 6. Kiểm thử

- [ ] 6.1 Test thủ công: Đánh giá truyện khi chưa đăng nhập → hiển thị thông báo login
- [ ] 6.2 Test thủ công: Đánh giá truyện khi đã đăng nhập → rating cập nhật, điểm trung bình thay đổi
- [ ] 6.3 Test thủ công: Đề cử truyện lần đầu trong ngày → thành công, nút disabled
- [ ] 6.4 Test thủ công: Đề cử truyện lần 2 trong ngày → từ chối, hiển thị thông báo
