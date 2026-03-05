## Context

Trang chi tiết truyện (`app/truyen/[slug]/page.tsx`) hiện có sidebar hiển thị:

- Box **Đánh giá**: Hiển thị `story.rating` tĩnh + nút "Đánh giá truyện" (chưa functional).
- Box **Đề cử**: Hiển thị hardcoded 0 + nút "Tặng đề cử" (chưa functional).

Hệ thống auth đã sẵn sàng (NextAuth + Prisma adapter). Model `Vote` đã tồn tại nhưng chỉ đếm lượt vote (không lưu điểm rating).

**Ràng buộc kỹ thuật:**

- Next.js App Router (RSC) + Server Actions.
- Prisma ORM → PostgreSQL (Neon).
- UI: Tailwind CSS v4 + shadcn/ui.
- Service pattern: mọi Prisma query nằm trong `services/`.

## Goals / Non-Goals

**Goals:**

- User đăng nhập có thể đánh giá truyện 1-5 sao (upsert, chỉ 1 rating/user/truyện).
- Điểm `story.rating` được tính lại tự động (trung bình tất cả ratings) sau mỗi lần đánh giá.
- User đăng nhập có thể đề cử truyện (tối đa 1 lượt/user/truyện/ngày).
- Box đánh giá và đề cử trên sidebar trở thành interactive với optimistic UI.
- Hiển thị trạng thái đã đánh giá/đã đề cử hôm nay khi user quay lại trang.

**Non-Goals:**

- Hệ thống "xu" hoặc tiền ảo để mua thêm lượt đề cử.
- Lịch sử đánh giá chi tiết (chỉ hiển thị rating hiện tại).
- Rating cho từng chapter (chỉ rating cấp story).
- Admin dashboard quản lý đánh giá/đề cử.

## Decisions

### 1. Tạo model `Rating` riêng biệt thay vì mở rộng `Vote`

**Quyết định:** Tạo bảng `Rating` mới, giữ nguyên bảng `Vote` hiện tại.

**Lý do:** `Vote` hiện tại không lưu điểm (chỉ là bản ghi tồn tại = 1 vote). Rating cần lưu `score` (1-5). Tách riêng để không breaking change hệ thống vote/leaderboard hiện tại.

**Phương án loại bỏ:** Thêm field `score` vào `Vote` → rủi ro break leaderboard logic trong `services/leaderboard.ts`.

### 2. Tạo model `Nomination` thay vì tái sử dụng `Vote`

**Quyết định:** Tạo bảng `Nomination` mới.

**Lý do:** Nomination có ràng buộc khác biệt (1 lượt/user/truyện/**ngày**, có thể đề cử nhiều ngày liên tiếp), trong khi `Vote` là 1 lượt duy nhất. Logic business hoàn toàn khác nhau.

### 3. Server Actions thay vì API Route Handlers

**Quyết định:** Sử dụng Server Actions (`app/actions/interaction.ts`) cho cả rating và nomination.

**Lý do:** Server Actions tích hợp tốt hơn với form + revalidation của Next.js RSC. Không cần quản lý endpoint riêng. Auth check đơn giản qua `auth()`.

### 4. Tính toán rating trung bình bằng aggregation query

**Quyết định:** Sau mỗi upsert rating, chạy `prisma.rating.aggregate({ _avg: { score } })` rồi cập nhật `story.rating`.

**Lý do:** Đơn giản, chính xác. Với lượng rating hiện tại (dự kiến vài trăm/truyện), performance chấp nhận được. Nếu scale lớn hơn, có thể chuyển sang incremental calculation sau.

**Phương án loại bỏ:** Database trigger → phức tạp hơn, khó debug với Prisma.

### 5. Prisma Schema cho Nomination: unique constraint `[userId, storyId, date]`

**Quyết định:** Sử dụng field `date` kiểu `DateTime @db.Date` (chỉ ngày, không giờ) + unique constraint `@@unique([userId, storyId, date])`.

**Lý do:** Enforce giới hạn 1 lượt/user/truyện/ngày ở tầng database. Đảm bảo tính toàn vẹn dữ liệu.

## Risks / Trade-offs

- **[Hiệu suất tính rating]** Aggregate query cho mỗi lần đánh giá có thể chậm khi có hàng nghìn ratings/truyện → **Mitigation:** Field `story.rating` đã được denormalize sẵn; chỉ tính lại khi có thay đổi, không tính on-read.
- **[Race condition]** Hai user đánh giá cùng lúc có thể gây inconsistency tạm thời → **Mitigation:** Dùng Prisma transaction cho upsert + aggregate + update story. Eventual consistency chấp nhận được.
- **[Timezone cho nomination]** Field `date` lưu theo UTC, user ở GMT+7 có thể thấy khác biệt → **Mitigation:** Tính ngày theo server time (UTC), accept edge case ở ranh giới ngày. Có thể cải thiện bằng timezone-aware logic sau.
