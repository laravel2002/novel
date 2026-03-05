## ADDED Requirements

### Requirement: Feature-based component colocation

Hệ thống PHẢI tổ chức components theo feature-based structure, trong đó mỗi thư mục feature chứa đầy đủ components và skeleton tương ứng.

#### Scenario: Skeleton nằm cạnh feature component

- **WHEN** developer mở thư mục một feature (vd: `components/chapter/`)
- **THEN** tất cả skeleton components liên quan đến feature đó PHẢI nằm trong cùng thư mục

#### Scenario: Skeletons được phân tán đúng feature

- **WHEN** kiểm tra thư mục `components/skeletons/`
- **THEN** chỉ còn shared skeletons (`BaseSkeleton.tsx`, `SearchSkeleton.tsx`), các skeleton feature-specific PHẢI nằm trong thư mục feature tương ứng

#### Scenario: Gộp leaderboard vào rankings

- **WHEN** kiểm tra thư mục `components/`
- **THEN** KHÔNG tồn tại thư mục `leaderboard/`, tất cả components BXH PHẢI nằm trong `components/rankings/`

### Requirement: Đổi tên list thành story-list

Thư mục `components/list/` PHẢI được đổi tên thành `components/story-list/` để phản ánh rõ nội dung.

#### Scenario: Thư mục list không còn tồn tại

- **WHEN** kiểm tra thư mục `components/`
- **THEN** KHÔNG tồn tại thư mục `list/`, PHẢI có thư mục `story-list/` chứa đầy đủ file gốc

### Requirement: Xóa route group rỗng

Thư mục `app/(main)/` PHẢI được xóa vì không chứa route nào.

#### Scenario: Route group rỗng bị xóa

- **WHEN** kiểm tra thư mục `app/`
- **THEN** KHÔNG tồn tại thư mục `(main)/`
