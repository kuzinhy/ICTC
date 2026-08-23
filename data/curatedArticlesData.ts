import { Article } from '../types';

export const CURATED_COMMUNITY_ARTICLES: Article[] = [
  {
    id: 'art-5',
    title: 'Quy tắc 60-30-10 trong phối màu thiết kế Slide và Banner sự kiện',
    slug: 'quy-tac-60-30-10-phoi-mau-thiet-ke-slide-banner',
    summary: 'Công thức kinh điển 60-30-10 từ ngành thiết kế nội thất và đồ họa giúp tạo nên bảng phối màu hài hòa, phân cấp thị giác rõ ràng và nâng cao tính chuyên nghiệp cho mọi ấn phẩm.',
    content: `## Nguồn gốc và định nghĩa quy tắc 60-30-10
Quy tắc 60-30-10 vốn là nguyên lý phối màu bất hủ trong thiết kế nội thất, sau đó được áp dụng rộng rãi vào thiết kế đồ họa, UI/UX và thiết kế bài thuyết trình (Slide). Đây là công thức giúp cân bằng thị giác, giúp người nhìn không bị "ngợp" hay rối mắt bởi quá nhiều màu sắc hỗn loạn.

---

### Tỷ lệ phân bổ chi tiết:
1. **60% - Màu chủ đạo (Dominant Color)**:
   - Thường là màu nền (Background) của slide hoặc ấn phẩm (trắng ngà, xám nhạt, be sáng hoặc xanh đen tối giản).
   - Đóng vai trò làm khung nền tĩnh, giúp làm dịu mắt và tạo không gian thở (White space).

2. **30% - Màu thứ cấp (Secondary Color)**:
   - Chiếm khoảng 1/3 diện tích thị giác, dùng cho các khối thẻ thông tin (Cards), thanh điều hướng, tiêu đề phụ hoặc đường phân cách.
   - Thường là màu tương đồng hoặc có sắc thái đậm hơn màu chủ đạo một tông.

3. **10% - Màu điểm nhấn (Accent Color)**:
   - Màu sắc nổi bật nhất (cam rực rỡ, đỏ son, vàng gold, xanh neon).
   - Chỉ dùng độc quyền cho các nút kêu gọi hành động (CTA), con số dữ liệu quan trọng, icon chính hoặc từ khóa mấu chốt.

---

### Ví dụ thực tế trong thiết kế Slide hội nghị
- **60%**: Nền trắng sáng tinh khiết (#FAFAFA)
- **30%**: Khối chữ và container màu xanh Navy đậm (#0F172A)
- **10%**: Nút bấm và số liệu tăng trưởng màu cam đất (#EA580C)

> *"Một thiết kế đẹp không phải là nơi hội tụ của 10 màu sắc sặc sỡ, mà là nơi 3 màu sắc phối hợp nhịp nhàng theo một tỷ lệ chuẩn mực."* *(Nguồn: Tổng hợp từ tài liệu chia sẻ cộng đồng Designer Việt Nam)*`,
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Cộng đồng Designer Việt',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-18',
    readTimeMinutes: 5,
    viewsCount: 2180,
    likesCount: 435,
    commentsCount: 19,
    tags: ['Phối Màu', 'Quy Tắc 60-30-10', 'Mẹo Thiết Kế', 'Slide', 'Banner'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-6',
    title: 'Cách làm chủ Hierarchy (Phân cấp thị giác) trong Typography tiếng Việt',
    slug: 'cach-lam-chu-hierarchy-typography-tieng-viet',
    summary: 'Hướng dẫn chi tiết cách kết hợp Font Serif và Sans-serif tiếng Việt, căn chỉnh Leading, Kerning tránh lỗi dính dấu thanh và tạo nhịp điệu đọc tự nhiên.',
    content: `## Thách thức đặc thù của Typography tiếng Việt
Tiếng Việt là ngôn ngữ giàu thanh điệu với hệ thống dấu phức tạp (sắc, huyền, hỏi, ngã, nặng, mũ, râu). Khi thiết kế văn bản tiếng Việt, các lỗi phổ biến thường gặp gồm:
- Dấu thanh bị dính vào dòng chữ phía trên do khoảng cách dòng (Line-height/Leading) quá chật.
- Lỗi font nhảy chữ (tofu character) do font gốc không hỗ trợ đầy đủ bảng mã Unicode tiếng Việt.
- Thiếu phân cấp rõ ràng khiến người đọc lướt qua mà không nắm được trọng tâm.

---

### 4 Bước thiết lập phân cấp thị giác chuẩn:
1. **Tiêu đề chính (H1 - Heading 1)**: Kích thước 32-48pt, trọng lượng chữ Bold hoặc ExtraBold, sử dụng font có cá tính mạnh để tạo điểm neo thị giác đầu tiên.
2. **Tiêu đề phụ (H2/H3)**: Kích thước 20-26pt, trọng lượng Medium hoặc SemiBold, phân chia rõ các luận điểm.
3. **Đoạn thân bài (Body Text)**: Kích thước 14-16pt, khoảng cách dòng tối ưu từ **1.5 đến 1.7 lần** cỡ chữ để các dấu tiếng Việt hiển thị thông thoáng.
4. **Chú thích & Trích dẫn (Caption)**: Kích thước 11-12pt, màu chữ xám vừa, kiểu chữ nghiêng (Italic) nhẹ.

---

### Cặp Font kinh điển được cộng đồng khuyên dùng:
- **Tiêu đề**: *Montserrat, Playfair Display, Be Vietnam Pro, SVN-Gilroy*
- **Nội dung**: *Inter, Roboto, Open Sans, Noto Sans*

*(Nguồn: Bài viết chia sẻ từ Diễn đàn Đồ họa & Font Việt hóa)*`,
    coverImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Tạp chí Đồ họa Sáng tạo',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-19',
    readTimeMinutes: 6,
    viewsCount: 1950,
    likesCount: 382,
    commentsCount: 14,
    tags: ['Typography', 'Font Việt Hóa', 'Hierarchy', 'Thiết Kế Chữ'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-7',
    title: 'Kỹ năng thuyết trình Pitching & Báo cáo đồ án: Cấu trúc kim tự tháp Minto',
    slug: 'ky-nang-thuyet-trinh-cau-truc-kim-tu-thap-minto',
    summary: 'Phương pháp tư duy và cấu trúc bài nói kinh điển của tập đoàn tư vấn McKinsey giúp bạn thuyết phục hội đồng và nhà đầu tư chỉ trong 10 phút đầu tiên.',
    content: `## Nguyên lý Kim tự tháp Minto (Minto Pyramid Principle) là gì?
Được phát triển bởi Barbara Minto tại tập đoàn tư vấn chiến lược McKinsey, nguyên lý này khuyến nghị: **Hãy đưa ra câu trả lời / kết luận quan trọng nhất ngay ở đầu bài thuyết trình (Top-down)**, sau đó mới diễn giải các luận cứ bổ trợ bên dưới.

---

### Mô hình triển khai 3 tầng:
1. **Đỉnh kim tự tháp (The Core Message / Resolution)**:
   - Nêu ngay giải pháp đột phá hoặc kết luận then chốt của bạn trong 60 giây mở đầu.
   - *Ví dụ: "Hệ thống AI nhận diện mới giúp giảm 45% thời gian xử lý hồ sơ với độ chính xác 98.6%."*

2. **Tầng giữa (Key Supporting Arguments)**:
   - Chia thành 3 luận điểm chính độc lập và bao quát (Nguyên tắc MECE - Mutually Exclusive, Collectively Exhaustive).
   - Luận điểm 1: Kiến trúc mô hình tối ưu.
   - Luận điểm 2: Bộ dữ liệu kiểm thử thực nghiệm.
   - Luận điểm 3: Khả năng mở rộng quy mô và chi phí vận hành.

3. **Đáy kim tự tháp (Data & Evidence)**:
   - Các bảng số liệu, biểu đồ so sánh, tài liệu trích dẫn khoa học để củng cố cho từng luận điểm trên.

---

### Mẹo giữ bình tĩnh trước hội đồng phản biện:
- Dành 3 giây dừng lại (Pause) để suy nghĩ trước khi trả lời câu hỏi khó.
- Tóm tắt lại câu hỏi của giám khảo để đảm bảo hiểu đúng trọng tâm.

*(Nguồn: Đúc kết kinh nghiệm từ các cựu sinh viên xuất sắc và cố vấn thuyết trình doanh nghiệp)*`,
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    category: 'Kỹ năng thuyết trình',
    author: 'Cố vấn Kỹ năng Mềm',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-19',
    readTimeMinutes: 7,
    viewsCount: 2780,
    likesCount: 590,
    commentsCount: 31,
    tags: ['Thuyết Trình', 'McKinsey', 'Bảo Vệ Đồ Án', 'Kỹ Năng Mềm', 'Minto'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-8',
    title: 'Bộ Checklist 15 bước kiểm tra file thiết kế trước khi gửi nhà in (Pre-flight Check)',
    slug: 'bo-checklist-15-buoc-kiem-tra-file-truoc-khi-in',
    summary: 'Tránh hoàn toàn các tai nạn in ấn tốn kém như tràn lề, sai hệ màu RGB sang CMYK, mất nét chữ nhỏ, hay ảnh bị vỡ hạt pixel.',
    content: `## Những sự cố in ấn "dở khóc dở cười"
Bất kỳ nhà thiết kế nào cũng từng ít nhất một lần nếm trải cảm giác cầm trên tay sản phẩm in bị sai màu trầm trọng, chữ bị cắt phạm vào nội dung, hoặc hình ảnh in ra bị mờ nhòe. Dưới đây là bảng kiểm tra (checklist) bắt buộc trước khi xuất file:

---

### 1. Hệ màu và Độ phân giải
- [ ] Chuyển toàn bộ file sang hệ màu **CMYK** (không để lẫn đối tượng RGB).
- [ ] Độ phân giải hình ảnh đạt tối thiểu **300 DPI** cho ấn phẩm cầm tay (Catalogue, Namecard, Tờ rơi) và từ **150-200 DPI** cho bạt Hiflex khổ lớn.
- [ ] Màu đen của chữ nhỏ phải là **K:100% (Single Black)**, tránh dùng Rich Black (C:40 M:40 Y:40 K:100) gây nhòe nét khi chồng màu.

---

### 2. Kích thước và Tràn lề (Bleed)
- [ ] Bù tràn lề (Bleed) từ **2mm đến 5mm** mỗi cạnh đối với sản phẩm xén mép.
- [ ] Vùng an toàn (Safe Margin): Đặt toàn bộ chữ và logo cách mép cắt ít nhất **4mm - 5mm**.

---

### 3. Xử lý Font và Vector
- [ ] **Convert to Curves / Create Outlines** (Ctrl+Shift+O trong AI hoặc Ctrl+Q trong Corel) toàn bộ font chữ để tránh lỗi thiếu font ở máy tính xưởng in.
- [ ] Khóa (Embed) toàn bộ hình ảnh đính kèm vào file thiết kế.
- [ ] Xuất định dạng chuẩn in ấn: **PDF/X-1a** hoặc file gốc đóng gói (Package).

*(Nguồn: Cẩm nang kỹ thuật xưởng in & Chế bản in ấn Việt Nam)*`,
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Kỹ thuật viên In ấn Sài Gòn',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-20',
    readTimeMinutes: 5,
    viewsCount: 1640,
    likesCount: 310,
    commentsCount: 11,
    tags: ['In Ấn', 'Checklist', 'CMYK', 'Bleed', 'Pre-flight'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-9',
    title: 'Phương pháp viết Tổng quan tài liệu (Literature Review) chuẩn học thuật IEEE & Scopus',
    slug: 'phuong-phap-viet-tong-quan-tai-lieu-chuan-hoc-thuat',
    summary: 'Cách tìm kiếm, phân loại ma trận bài báo khoa học và tổng hợp các khoảng trống nghiên cứu (Research Gap) một cách logic, mạch lạc.',
    content: `## Tổng quan tài liệu là nền móng của bài báo khoa học
Một chương Tổng quan tài liệu (Literature Review) xuất sắc không đơn thuần là bảng liệt kê tóm tắt các bài nghiên cứu cũ, mà phải chỉ ra được bức tranh toàn cảnh, sự phát triển của các trường phái và quan trọng nhất: **Khoảng trống nghiên cứu (Research Gap)** mà đề tài của bạn sẽ giải quyết.

---

### Quy trình 4 bước tổng hợp tài liệu khoa học:
1. **Tìm kiếm từ khóa có hệ thống**:
   - Sử dụng các toán tử logic (AND, OR, NOT) trên các cơ sở dữ liệu uy tín: *Google Scholar, ScienceDirect, IEEE Xplore, ResearchGate*.
   - Ưu tiên các bài báo thuộc nhóm Q1/Q2 công bố trong 3-5 năm gần nhất.

2. **Lập Ma trận tài liệu (Synthesis Matrix)**:
   - Tạo bảng tính Excel gồm các cột: *Tác giả (Năm) | Phương pháp | Bộ dữ liệu thử nghiệm | Kết quả chính | Hạn chế/Nhược điểm*.

3. **Phân tích theo chủ đề (Thematic Analysis)**:
   - Nhóm các công trình có cùng phương pháp tiếp cận để so sánh ưu - nhược điểm trực tiếp.

4. **Trích dẫn chuẩn hóa tự động**:
   - Quản lý tài liệu tham khảo bằng công cụ chuyên dụng như *Mendeley, Zotero, hoặc EndNote* theo chuẩn định dạng IEEE / APA 7th.

*(Nguồn: Chia sẻ kinh nghiệm từ Nhóm Nghiên cứu Sinh & Giảng viên Đại học)*`,
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghiên cứu & Đồ án',
    author: 'Hội đồng Nghiên cứu Khoa học Trẻ',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-20',
    readTimeMinutes: 8,
    viewsCount: 2310,
    likesCount: 512,
    commentsCount: 26,
    tags: ['Nghiên Cứu Khoa Học', 'Literature Review', 'IEEE', 'Scopus', 'Zotero'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-10',
    title: 'Tổng hợp phím tắt quyền năng trong Figma và PowerPoint gia tăng tốc độ làm việc 300%',
    slug: 'tong-hop-phim-tat-figma-powerpoint-tang-toc-do',
    summary: 'Bí kíp thao tác nhanh với phím tắt căn gióng, nhân bản thông minh, đổi màu hàng loạt và xử lý bố cục Auto Layout trong nháy mắt.',
    content: `## Tăng tốc độ thiết kế nhờ thói quen dùng phím tắt
Việc rời tay khỏi chuột để thực hiện các thao tác căn chỉnh lặp đi lặp lại khiến bạn mất hàng giờ đồng hồ mỗi ngày. Dưới đây là những tổ hợp phím tắt "thần thánh" được các chuyên gia thiết kế sử dụng liên tục:

---

### Top phím tắt PowerPoint đắt giá nhất:
- **Ctrl + Shift + C / Ctrl + Shift + V**: Sao chép và dán định dạng (Format Painter) cực nhanh.
- **Ctrl + D**: Nhân bản đối tượng và tự động ghi nhớ khoảng cách di chuyển tiếp theo.
- **Shift + F5**: Bắt đầu trình chiếu ngay tại trang slide hiện tại.
- **B hoặc W (khi đang trình chiếu)**: Làm đen màn hình (Black) hoặc trắng màn hình (White) để thu hút sự tập trung của khán giả về phía diễn giả.
- **Giữ Shift khi vẽ**: Tạo hình vuông hoàn hảo, hình tròn đều hoặc đường thẳng tuyệt đối.

---

### Top phím tắt Figma cho Designer chuyên nghiệp:
- **Shift + A**: Thêm Auto Layout tức thì cho cụm thành phần được chọn.
- **Alt + Kéo chuột**: Đo khoảng cách chính xác theo Pixel giữa 2 đối tượng bất kỳ.
- **Ctrl + Alt + K**: Biến layer thành Component tái sử dụng.
- **Shift + X**: Hoán đổi nhanh giữa màu nền (Fill) và màu viền (Stroke).

*(Nguồn: Tổng hợp từ tài liệu đào tạo nội bộ các Agency Thiết kế & UI/UX)*`,
    coverImage: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Cộng đồng Figma Việt Nam',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-21',
    readTimeMinutes: 4,
    viewsCount: 2950,
    likesCount: 620,
    commentsCount: 22,
    tags: ['Phím Tắt', 'PowerPoint', 'Figma', 'Năng Suất', 'Tips & Tricks'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-11',
    title: 'Cách chọn ảnh minh họa Unsplash & Freepik không bị "phèn" và tránh vi phạm bản quyền',
    slug: 'cach-chon-anh-minh-hoa-unsplash-freepik-chuyen-nghiep',
    summary: 'Kinh nghiệm tìm kiếm từ khóa tiếng Anh chính xác, lọc ảnh theo tone màu, kiểm tra giấy phép bản quyền thương mại (Commercial License) và tinh chỉnh bộ lọc.',
    content: `## Bí quyết tìm kiếm hình ảnh Stock chất lượng cao
Một bức ảnh minh họa gượng gạo, giả tạo (staged photo) với nụ cười công nghiệp sẽ lập tức hạ thấp uy tín của bài thuyết trình hay ấn phẩm truyền thông. 

---

### 1. Kỹ thuật gõ từ khóa tiếng Anh chân thực:
- Thay vì gõ *"business team meeting"*, hãy thử: *"authentic candid workspace", "diverse startup team discussing around laptop", "minimalist desk overhead view"*.
- Thay vì gõ *"happy student"*, hãy thử: *"thoughtful student in modern university library", "focused coding student aesthetic"*.
- Thêm các tính từ chỉ phong cách: *Minimal, Cinematic, Candid, Moody, Aerial, Flat lay*.

---

### 2. Kiểm tra bản quyền sử dụng (License):
- **Unsplash / Pexels**: Miễn phí cho cả mục đích cá nhân và thương mại, không bắt buộc ghi nguồn (tuy nhiên ghi nguồn luôn là văn hóa đẹp).
- **Freepik / Flaticon**: Bản miễn phí yêu cầu kèm dòng trích dẫn nguồn tác giả (Attribution required).
- **Tránh chụp màn hình từ Google Images**: Hầu hết đều dính bản quyền sở hữu trí tuệ của nhiếp ảnh gia hoặc tổ chức tin tức.

*(Nguồn: Kinh nghiệm chia sẻ từ Creative Director & Content Creator)*`,
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Cộng đồng Sáng tạo Nội dung',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-21',
    readTimeMinutes: 5,
    viewsCount: 1720,
    likesCount: 340,
    commentsCount: 15,
    tags: ['Stock Photo', 'Unsplash', 'Bản Quyền', 'Hình Ảnh', 'Freepik'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-12',
    title: 'Tối ưu hóa bảng biểu và đồ thị phức tạp thành Infographic dễ hiểu cho bài báo cáo',
    slug: 'toi-uu-hoa-bang-bieu-do-thi-thanh-infographic',
    summary: 'Biến hàng trăm dòng số liệu khô khan thành trực quan sinh động theo quy tắc kể chuyện bằng dữ liệu (Data Storytelling).',
    content: `## Tại sao bảng số liệu dày đặc làm mất hứng thú người xem?
Não bộ con người xử lý hình ảnh nhanh gấp 60.000 lần so với văn bản thuần túy. Khi đối diện với một slide đầy ắp số liệu Excel, khán giả sẽ rơi vào trạng thái quá tải nhận thức (Cognitive Overload).

---

### 3 Nguyên tắc "Data Storytelling" cần áp dụng:
1. **Làm mờ thông tin nền (De-emphasize the context)**:
   - Đổi các đường kẻ lưới (Grid lines), trục tọa độ và số liệu không trọng tâm sang màu xám nhạt (#CBD5E1).

2. **Chiếu đèn vào dữ liệu đột phá (Highlight the key finding)**:
   - Dùng màu nhấn rực rỡ duy nhất cho cột mốc hoặc số liệu bạn muốn hội đồng chú ý nhất (ví dụ: tháng đạt doanh thu kỷ lục hoặc mức giảm phát thải cao nhất).

3. **Thay thế chú giải bằng nhãn trực tiếp (Direct Labeling)**:
   - Thay vì để ô chú giải (Legend) riêng rẽ ở góc dưới bắt mắt người xem phải đảo qua lại, hãy gắn nhãn tên trực tiếp lên đầu từng đường biểu đồ.

*(Nguồn: Trích lược từ giáo trình Trực quan hóa Dữ liệu & Báo cáo Thông minh)*`,
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghiên cứu & Đồ án',
    author: 'Chuyên gia Phân tích Dữ liệu',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-22',
    readTimeMinutes: 6,
    viewsCount: 2150,
    likesCount: 480,
    commentsCount: 18,
    tags: ['Infographic', 'Data Visualization', 'Biểu Đồ', 'Báo Cáo', 'Excel'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-13',
    title: 'Kỹ thuật định dạng văn bản chuẩn APA 7th Edition trong tiểu luận và luận văn tốt nghiệp',
    slug: 'ky-thuat-dinh-dang-chuan-apa-7th-tieu-luan-luan-van',
    summary: 'Cẩm nang toàn tập về căn lề, khoảng cách dòng, tiêu đề các cấp và cách trích dẫn nguồn sách báo, trang web theo chuẩn quốc tế APA mới nhất.',
    content: `## Chuẩn trích dẫn APA 7th Edition là gì?
APA (American Psychological Association) ấn bản thứ 7 hiện là chuẩn định dạng học thuật phổ biến nhất tại các trường đại học tại Việt Nam và quốc tế trong khối ngành kinh tế, xã hội, giáo dục và công nghệ.

---

### Quy chuẩn định dạng trang văn bản (Page Layout):
- **Căn lề (Margins)**: Đúng 1 inch (2.54 cm) ở cả 4 cạnh (trên, dưới, trái, phải).
- **Font chữ tiêu chuẩn**: Times New Roman 12pt, Arial 11pt, hoặc Calibri 11pt thống nhất xuyên suốt.
- **Giãn dòng (Line Spacing)**: Double-spaced (2.0) cho toàn bộ tài liệu, bao gồm cả trang tài liệu tham khảo.
- **Thụt đầu dòng (Paragraph Indent)**: 0.5 inch (1.27 cm) cho dòng đầu tiên của mỗi đoạn văn.

---

### Quy tắc trích dẫn trong bài (In-text Citation):
- **1 tác giả**: (Nguyễn, 2024) hoặc Nguyễn (2024) chỉ ra rằng...
- **2 tác giả**: (Nguyễn & Trần, 2023).
- **3 tác giả trở lên**: Dùng ngay "et al." từ lần trích dẫn đầu tiên: (Nguyễn et al., 2024).
- **Tài liệu từ Website**: Tên tác giả/Tổ chức, Năm, Tên bài viết, Đường dẫn link (URL).

*(Nguồn: Sổ tay hướng dẫn Phương pháp Nghiên cứu Khoa học Đại học)*`,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghiên cứu & Đồ án',
    author: 'Thư viện Học thuật Đại học',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-22',
    readTimeMinutes: 7,
    viewsCount: 2840,
    likesCount: 670,
    commentsCount: 29,
    tags: ['APA 7th', 'Luận Văn', 'Trích Dẫn', 'Tiểu Luận', 'Word'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-14',
    title: 'Xây dựng Moodboard & Bảng định hướng phong cách (Style Guide) trước khi bắt tay thiết kế',
    slug: 'xay-dung-moodboard-style-guide-truoc-khi-thiet-ke',
    summary: 'Cách gom nhặt cảm hứng, thống nhất bảng màu, phông chữ và cảm xúc thiết kế với khách hàng hoặc nhóm dự án để tránh sửa đi sửa lại nhiều lần.',
    content: `## Tại sao Moodboard giúp bạn tiết kiệm 70% thời gian sửa đổi?
Bắt tay vào thiết kế ngay khi chưa thống nhất về "ngôn ngữ thị giác" là nguyên nhân số 1 dẫn đến việc sản phẩm bị từ chối hoặc phải đập đi làm lại từ đầu. Moodboard (Bảng cảm xúc) đóng vai trò như chiếc la bàn định hướng cho toàn bộ dự án.

---

### 5 Thành phần cốt lõi của một Moodboard chuyên nghiệp:
1. **Bảng màu chủ đạo (Color Palette)**: Từ 4-5 mã màu HEX thể hiện tinh thần của thương hiệu / sự kiện.
2. **Typography mẫu**: Sự kết hợp giữa font tiêu đề (Display) và font thân bài (Body).
3. **Hình ảnh phong cách (Style Imagery)**: 6-8 hình ảnh mẫu thể hiện góc chụp, ánh sáng và không khí mong muốn.
4. **Họa tiết & Chất liệu (Texture & Pattern)**: Chi tiết nền, vân giấy, hạt nhiễu (Noise) hoặc đường nét minh họa vector.
5. **Từ khóa cảm xúc (Keywords / Brand Voice)**: Ví dụ: *Thanh lịch, Đương đại, Thân thiện, Đột phá, Tin cậy*.

---

### Các công cụ tạo Moodboard miễn phí tốt nhất:
- **Pinterest & Milanote**: Gom nhặt cảm hứng trực quan nhanh chóng.
- **Figma / Canva**: Sắp xếp bố cục bảng moodboard sạch sẽ để gửi trình duyệt.
- **Coolors.co**: Tự động gợi ý và xuất bảng phối màu hài hòa.

*(Nguồn: Tài liệu chia sẻ từ các Studio Thiết kế Sáng tạo tại TP.HCM & Hà Nội)*`,
    coverImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Cộng đồng UI/UX Designer',
    authorId: 'usr-community-curator',
    publishedAt: '2026-08-22',
    readTimeMinutes: 5,
    viewsCount: 1890,
    likesCount: 410,
    commentsCount: 16,
    tags: ['Moodboard', 'Style Guide', 'Quy Trình Thiết Kế', 'Sáng Tạo', 'Figma'],
    isPinned: false,
    status: 'Published'
  }
];
