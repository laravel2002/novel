## ADDED Requirements

### Requirement: Route Group Layout Separation
Hệ thống PHẢI tách cấu trúc `app/` thành 2 Route Groups: `(main)` (layout đầy đủ với Navbar + Footer + MobileNavigation) và `(reader)` (layout tối giản không có Footer/MobileNavigation). URL pattern hiện tại PHẢI được giữ nguyên hoàn toàn.

#### Scenario: Trang đọc chương không render Footer
- **WHEN** người dùng truy cập URL `/truyen/[slug]/chuong-[num]`
- **THEN** trang PHẢI render trong `(reader)` layout – KHÔNG có Footer, KHÔNG có MobileNavigation. Navbar có thể ẩn hoặc tối giản tùy component đọc chương tự xử lý.

#### Scenario: Trang chi tiết truyện vẫn render Footer
- **WHEN** người dùng truy cập URL `/truyen/[slug]`
- **THEN** trang PHẢI render trong `(main)` layout – có đầy đủ Navbar + Footer + MobileNavigation.

#### Scenario: Trang chủ và các trang khác không bị ảnh hưởng
- **WHEN** người dùng truy cập bất kỳ trang nào ngoài trang đọc chương (trang chủ, thể loại, bảng xếp hạng, tìm kiếm, tủ truyện, cá nhân, v.v.)
- **THEN** trang PHẢI render trong `(main)` layout với đầy đủ Navbar + Footer + MobileNavigation, behavior giữ nguyên như hiện tại.

#### Scenario: Providers toàn cục vẫn hoạt động ở cả 2 groups
- **WHEN** bất kỳ trang nào render (dù ở `(main)` hay `(reader)`)
- **THEN** tất cả Providers (ThemeProvider, AuthProvider, DeviceProvider, BookmarkProvider, ReadingProgressProvider, ReadingSettingsProvider) PHẢI hoạt động bình thường.

#### Scenario: CLS tại trang đọc chương giảm về ≈ 0
- **WHEN** Google Search Console / Lighthouse đo CLS tại trang đọc chương
- **THEN** điểm CLS PHẢI dưới 0.1 (mức "Tốt") do Footer không còn gây layout shift.
