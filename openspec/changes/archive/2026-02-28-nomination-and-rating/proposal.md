## Why

Hiện tại trang chi tiết truyện chỉ hiển thị điểm rating tĩnh và lượt đề cử (hardcoded = 0), chưa có logic thực tế cho phép user tương tác. Cần xây dựng hệ thống **đề cử (nomination)** và **đánh giá (rating)** để:

- User đăng nhập có thể **đánh giá truyện** theo thang 1-5 sao, điểm rating trung bình được tính tự động.
- User đăng nhập có thể **đề cử truyện** (mỗi ngày được tặng 1 lượt đề cử miễn phí, tối đa 1 lượt/truyện/ngày). Tổng lượt đề cử được hiển thị trên trang chi tiết.
- Cung cấp feedback trực quan tức thì (optimistic UI) khi thao tác.

## What Changes

- **[NEW]** Tạo model `Rating` trong Prisma schema: cho phép mỗi user đánh giá 1 lần/truyện (upsert), lưu điểm 1-5. Tự động tính lại `story.rating` trung bình.
- **[NEW]** Tạo model `Nomination` trong Prisma schema: lưu lịch sử đề cử, giới hạn 1 lượt/user/truyện/ngày. Cập nhật tổng `story.votes` (hoặc field mới `nominations`).
- **[NEW]** Service layer `services/interaction.ts`: chứa logic tạo/cập nhật rating, tạo nomination, kiểm tra trạng thái hiện tại.
- **[NEW]** API routes cho rating và nomination (Server Actions hoặc API Route Handlers).
- **[MOD]** Cập nhật UI sidebar trang chi tiết truyện (`app/truyen/[slug]/page.tsx`): Box Đánh giá → interactive star rating; Box Đề cử → nút đề cử thực tế với số lượt đã đề cử.
- **[NEW]** Client components: `RatingBox` (chọn sao, hiển thị trạng thái đã đánh giá), `NominationBox` (nút đề cử, hiển thị tổng đề cử hôm nay).

## Capabilities

### New Capabilities

- `story-rating`: Cho phép user đánh giá truyện theo thang 1-5 sao. Tự động tính lại điểm trung bình của truyện. Mỗi user chỉ đánh giá 1 lần/truyện (có thể cập nhật).
- `story-nomination`: Cho phép user đề cử (tặng phiếu) cho truyện. Giới hạn 1 lượt/user/truyện/ngày. Hiển thị tổng lượt đề cử trên trang chi tiết.

### Modified Capabilities

_(Không có capability cũ nào bị thay đổi requirement)_

## Impact

- **Database**: Thêm 2 bảng mới (`Rating`, `Nomination`). Cần chạy `prisma migrate`.
- **Prisma Schema**: Thêm relation từ `User` và `Story` tới `Rating` và `Nomination`.
- **Service Layer**: Thêm file `services/interaction.ts`.
- **API**: Thêm Server Actions trong `app/actions/` hoặc API routes trong `app/api/`.
- **UI**: Cập nhật sidebar trang chi tiết truyện, thêm 2 client components mới.
- **Auth**: Yêu cầu user đăng nhập (sử dụng `auth()` session hiện có).
