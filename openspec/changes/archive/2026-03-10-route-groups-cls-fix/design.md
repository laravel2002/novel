## Context

Hiện tại, `app/layout.tsx` (Root Layout) render **Navbar + Footer + MobileNavigation** cho mọi route. Trang đọc chương (`/truyen/[slug]/[chapter]`) kế thừa layout này dẫn đến:

1. Footer render → bị nội dung đẩy xuống → CLS = 0.524 (theo Google Search Console).
2. MobileNavigation cũng render dư thừa (trang đọc có navigation riêng).

**Cấu trúc hiện tại:**
```
app/
├── layout.tsx          ← Chứa Navbar + Footer + MobileNav + Providers
├── page.tsx
├── truyen/[slug]/
│   ├── page.tsx        ← Trang chi tiết truyện (cần Footer)
│   └── [chapter]/
│       ├── layout.tsx  ← Chỉ có ReadingSettingsProvider
│       └── page.tsx    ← Trang đọc chương (KHÔNG cần Footer)
└── ... (các route khác cần Footer)
```

## Goals / Non-Goals

**Goals:**
- Triệt tiêu CLS ≈ 0 tại trang đọc chương bằng cách loại bỏ hoàn toàn Footer khỏi layout.
- Giữ nguyên 100% URL pattern – Route Groups (`(main)`, `(reader)`) không ảnh hưởng URL.
- Tái sử dụng Providers từ Root Layout cho cả 2 group.
- Giữ nguyên behavior hiện tại của tất cả các route khác.

**Non-Goals:**
- Không redesign Footer hoặc Navbar.
- Không thay đổi logic business hay data fetching.
- Không tối ưu các chỉ số Core Web Vitals khác (LCP, INP) trong scope này.

## Decisions

### 1. Dùng Route Groups thay vì CSS `hidden`

**Chọn:** Next.js Route Groups `(main)` và `(reader)`.
**Lý do:** CSS `hidden` (hoặc `min-h-[100dvh]`) chỉ là workaround – Footer vẫn render trên DOM, vẫn tốn tài nguyên, và browser vẫn tính layout shift. Route Groups loại bỏ hoàn toàn Footer khỏi component tree tại trang đọc chương.
**Alternative bị loại:** Conditional rendering trong layout (if/else dựa trên pathname) – phức tạp, khó maintain, và Root Layout là Server Component nên không truy cập được pathname dễ dàng.

### 2. Root Layout chỉ giữ Providers

**Chọn:** `app/layout.tsx` chỉ chứa: fonts, `<html>`, `<body>`, DeviceProvider, AuthProvider, ThemeProvider, BookmarkProvider, ReadingProgressProvider, ReadingSettingsProvider, Toaster, SpeedInsights, Analytics.
**Lý do:** Providers cần wrap toàn bộ app. Navbar/Footer/MobileNav là UI, thuộc về layout cấp Route Group.

### 3. Cấu trúc thư mục mục tiêu

```
app/
├── layout.tsx              ← Providers only (không UI chrome)
├── globals.css
├── (main)/
│   ├── layout.tsx          ← Navbar + Footer + MobileNav + <main>
│   ├── page.tsx            ← Trang chủ
│   ├── truyen/[slug]/
│   │   └── page.tsx        ← Chi tiết truyện
│   └── ... (tất cả route khác)
├── (reader)/
│   ├── layout.tsx          ← Tối giản: chỉ <main> (không Footer)
│   └── truyen/[slug]/[chapter]/
│       ├── layout.tsx      ← ReadingSettingsProvider (giữ nguyên)
│       └── page.tsx
```

### 4. Route `truyen/[slug]` nằm ở `(main)`, `truyen/[slug]/[chapter]` nằm ở `(reader)`

**Lý do:** Trang chi tiết truyện cần Navbar + Footer đầy đủ. Chỉ trang đọc chương là cần layout tối giản. Vì Route Groups cho phép cùng URL segment ở các group khác nhau miễn không trùng route, ta tách `[chapter]` thành route riêng ở `(reader)`.

## Risks / Trade-offs

- **[Risk] Trùng route segment**: Nếu cả `(main)` và `(reader)` có cùng route path → Next.js build error.
  → **Mitigation**: `(main)/truyen/[slug]/page.tsx` (chi tiết) và `(reader)/truyen/[slug]/[chapter]/page.tsx` (đọc chương) – không trùng nhau.

- **[Risk] Import paths cần cập nhật**: Khi di chuyển files vào Route Groups, relative imports có thể bị vỡ.
  → **Mitigation**: Dự án dùng path aliases (`@/`) nên hầu hết import không bị ảnh hưởng. Chỉ cần kiểm tra import nội bộ giữa các file trong `app/`.

- **[Trade-off] Phải duy trì 2 layout files**: Mỗi group có layout riêng, cần đồng bộ khi thay đổi Providers.
  → **Mitigation**: Providers đã centralized ở Root Layout, group layouts chỉ chứa UI chrome đơn giản.
