import { DesignFile, AIPrompt, User, SystemConfig, Article } from '../types';
import { DRIVE_DESIGN_FOLDER, DRIVE_PROMPT_FOLDER } from './constants';

export { DRIVE_DESIGN_FOLDER, DRIVE_PROMPT_FOLDER };

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-primary',
    email: 'nguyenhuy.thudaumot@gmail.com',
    displayName: 'Nguyễn Huy',
    role: 'Admin',
    status: 'Active',
    avatarUrl: '',
    joinedDate: '2026-01-01',
    department: 'Ban Quản Trị Hệ Thống',
    bio: 'Quản trị viên trưởng hệ thống ICTC Share & Design'
  }
];

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  siteName: 'ICTC Share & Design',
  siteDescription: 'Nơi chia sẻ và xây dựng mô hình học tập, nghiên cứu toàn quốc',
  driveDesignFolder: DRIVE_DESIGN_FOLDER,
  drivePromptFolder: DRIVE_PROMPT_FOLDER,
  driveFontFolder: DRIVE_DESIGN_FOLDER,
  sharedUploadDriveUrl: DRIVE_DESIGN_FOLDER,
  sharedUploadInstructions: 'Tải trực tiếp tệp tin (.pptx, .ai, .psd, .canva, .ttf, .otf, .zip) lên thư mục Google Drive tiếp nhận của ICTC hoặc đính kèm trực tiếp tại form này để Ban quản trị kiểm duyệt.',
  autoApproveCreators: true,
  allowPublicUploads: true,
  maintenanceMode: false,
  defaultAIModel: 'gemini-2.5-flash',
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbys4E1WKIm9r21tZ1CiwAcB91x6ruZfPf4bl5jsJbj9DPCcdpG-U9ANDNJhR6wxGEPpsg/exec'
};

export const INITIAL_DESIGN_FILES: DesignFile[] = [
  {
    id: 'des-1',
    title: 'Mẫu Slide Thuyết trình Nghiên cứu Khoa học & Đồ án',
    description: 'Thiết kế slide chuyên nghiệp, hiện đại, tối giản dành cho các bạn sinh viên, giảng viên thuyết trình nghiên cứu khoa học, đồ án tốt nghiệp hoặc seminar học thuật.',
    category: 'PowerPoint Templates',
    fileType: 'PPTX',
    fileSize: '14.2 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    tags: ['Slide', 'Academic', 'Presentation', 'Minimalist', 'Research'],
    downloadsCount: 1420,
    rating: 4.9,
    createdAt: '2026-07-20',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-2',
    title: 'Báo cáo Thống kê & Phân tích Mô hình Giáo dục số',
    description: 'File mẫu tài liệu báo cáo nghiên cứu, phân tích mô hình chuyển đổi số trong giáo dục đại học. Trình bày trực quan với các biểu đồ và biểu mẫu số liệu chuẩn hóa.',
    category: 'Tài liệu Nghiên cứu',
    fileType: 'PDF / DOCX',
    fileSize: '4.8 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    tags: ['Research', 'E-learning', 'Report', 'Data Analysis'],
    downloadsCount: 930,
    rating: 4.8,
    createdAt: '2026-07-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-3',
    title: 'Bộ Giao diện Mobile App Học tập Trực tuyến (Figma UI Kit)',
    description: 'Thiết kế giao diện ứng dụng học tập, ôn thi trực tuyến hiện đại. Gồm hơn 30 màn hình chất lượng cao, đầy đủ trạng thái, components lồng nhau và Auto-Layout.',
    category: 'UI/UX Kits',
    fileType: 'Figma (.fig)',
    fileSize: '8.5 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1581291518655-9523c932eecf?auto=format&fit=crop&w=800&q=80',
    tags: ['Figma', 'Mobile UI', 'EdTech', 'App Design', 'UX/UI'],
    downloadsCount: 1680,
    rating: 4.9,
    createdAt: '2026-08-01',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-4',
    title: 'Mẫu Poster Khoa học & Infographics Seminar Học thuật',
    description: 'Mẫu thiết kế poster khổ lớn (A0) dành cho báo cáo seminar, hội thảo khoa học toàn quốc. Dễ dàng chỉnh sửa nội dung, biểu đồ và bố cục hình ảnh linh hoạt.',
    category: 'Poster & Infographics',
    fileType: 'PSD / AI',
    fileSize: '45.1 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80',
    tags: ['Poster', 'Infographic', 'Seminar', 'Academic', 'PSD'],
    downloadsCount: 780,
    rating: 4.7,
    createdAt: '2026-08-05',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-5',
    title: 'Mẫu Kế hoạch Nghiên cứu & Thiết kế Bài giảng (Canva Template)',
    description: 'Template Canva thiết kế giáo án, bài giảng trực quan, tương tác cao. Giúp bài học sinh động, thu hút người học với tông màu pastel tinh tế và biểu tượng trực quan.',
    category: 'Canva Templates',
    fileType: 'Canva Link',
    fileSize: '12 Pages',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tags: ['Canva', 'Lesson Plan', 'Education', 'Interactive', 'Pastel'],
    downloadsCount: 2140,
    rating: 5.0,
    createdAt: '2026-08-10',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-6',
    title: 'Bộ Sưu tập Vector Icons Học tập & Nghiên cứu Công nghệ',
    description: 'Bộ sưu tập hơn 150+ icon học tập, thiết bị nghiên cứu, phòng thí nghiệm định dạng SVG và PNG chất lượng cao, dễ dàng thay đổi màu sắc và kích thước cho thiết kế.',
    category: 'Vector & Assets',
    fileType: 'SVG / PNG',
    fileSize: '3.1 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    tags: ['Icon', 'Vector', 'Assets', 'SVG', 'Academic Tech'],
    downloadsCount: 1290,
    rating: 4.8,
    createdAt: '2026-08-12',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-7',
    title: 'Phông nền Sân khấu (Backdrop) Đại hội Đảng bộ & Hội nghị Cán bộ',
    description: 'Mẫu thiết kế phông nền sân khấu Đại hội Đảng bộ các cấp, Hội nghị Ban Chấp hành. Định dạng Photoshop PSD nhiều layer phân tách riêng: Trống đồng Đông Sơn, Búa liềm vàng kim, Cờ đỏ sao vàng, dải lụa 3D sắc nét.',
    category: 'Phông Nền & Backdrop',
    fileType: 'PSD (Layered)',
    fileSize: '185.4 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    tags: ['Đại Hội Đảng', 'Backdrop', 'Sân Khấu', 'Trống Đồng', 'Búa Liềm', 'PSD Layered'],
    downloadsCount: 3120,
    rating: 5.0,
    createdAt: '2026-08-13',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-8',
    title: 'Trọn bộ Nhận diện Đại hội Đoàn TNCS Hồ Chí Minh & Hội Sinh viên',
    description: 'Trọn bộ ấn phẩm thiết kế phục vụ Đại hội Đoàn Thanh niên và Hội Sinh viên: Slide báo cáo chính trị PPTX, Phông Led sân khấu, Standee chào mừng (0.8x2m), Thẻ đại biểu, Bìa tài liệu A4 và Băng rôn tuyên truyền.',
    category: 'Bộ Nhận Diện & Sự Kiện',
    fileType: 'AI / CDR / PPTX',
    fileSize: '240.8 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    tags: ['Đoàn Thanh Niên', 'Hội Sinh Viên', 'Bộ Nhận Diện', 'Đại Hội', 'Vector', 'Thẻ Đại Biểu'],
    downloadsCount: 2890,
    rating: 4.9,
    createdAt: '2026-08-14',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-9',
    title: 'Bộ Vector Quốc huy, Búa Liềm, Hoa Sen, Trống Đồng Đông Sơn',
    description: 'Bộ tài nguyên vector chuẩn in ấn khổ lớn (AI, EPS, SVG) bao gồm: Quốc huy Nước CHXHCN Việt Nam, Biểu tượng Búa Liềm, Họa tiết Trống đồng Ngọc Lũ - Đông Sơn, Hoa sen Việt Nam và Bản đồ hành chính Việt Nam đầy đủ Hoàng Sa - Trường Sa.',
    category: 'Vector & Assets',
    fileType: 'AI / EPS / SVG',
    fileSize: '28.5 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    tags: ['Quốc Huy', 'Búa Liềm', 'Trống Đồng', 'Hoa Sen', 'Vector Chuẩn', 'Hoàng Sa Trường Sa'],
    downloadsCount: 4500,
    rating: 5.0,
    createdAt: '2026-08-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-10',
    title: 'Backdrop & Poster Kỷ niệm Ngày Giải phóng Miền Nam 30/4 & 1/5',
    description: 'Thiết kế phông sân khấu kỷ niệm 30/4 & 1/5 với hình tượng lá cờ tung bay, tượng đài chiến thắng, hoa sen và chim bồ câu hòa bình. File PSD độ phân giải 300 DPI, hệ màu CMYK chuẩn xuất xưởng in bạt Hiflex và Decal PP.',
    category: 'Phông Nền & Backdrop',
    fileType: 'PSD / AI',
    fileSize: '92.1 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    tags: ['30-4', '1-5', 'Giải Phóng Miền Nam', 'Kỷ Niệm', 'Backdrop', 'Poster'],
    downloadsCount: 1850,
    rating: 4.9,
    createdAt: '2026-08-15',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-11',
    title: 'Bộ Ấn phẩm Tuyên truyền & Chào mừng Quốc khánh Nước CHXHCN Việt Nam 2/9',
    description: 'Mẫu thiết kế chào mừng ngày Tết Độc lập 2/9: Phông màn hình Led 16:9 sân khấu mít-tinh, Băng rôn ngang đường phố khẩu hiệu (1x6m) và Poster cổ động trực quan.',
    category: 'Băng Rôn & Khẩu Hiệu',
    fileType: 'PSD / TIF / CDR',
    fileSize: '145.2 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1569974498991-d3c12a524f6f?auto=format&fit=crop&w=800&q=80',
    tags: ['Quốc Khánh 2-9', 'Tết Độc Lập', 'Băng Rôn', 'Poster Cổ Động', 'Khẩu Hiệu'],
    downloadsCount: 2260,
    rating: 5.0,
    createdAt: '2026-08-16',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-12',
    title: 'Backdrop Sân khấu Ngày Nhà giáo Việt Nam 20/11 Tri Ân Thầy Cô',
    description: 'Mẫu thiết kế phông sân khấu kỷ niệm 20/11 với tông màu vàng gold và đỏ son sang trọng, hình ảnh trang sách mở, đóa sen hồng và hoa văn thư pháp "Tôn Sư Trọng Đạo".',
    category: 'Phông Nền & Backdrop',
    fileType: 'PSD / CDR',
    fileSize: '68.4 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    tags: ['20-11', 'Nhà Giáo Việt Nam', 'Tri Ân Thầy Cô', 'Tôn Sư Trọng Đạo', 'Backdrop'],
    downloadsCount: 1980,
    rating: 4.9,
    createdAt: '2026-08-16',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-13',
    title: 'Trọn bộ Thiết kế Tết Cổ Truyền Việt Nam - Xuân Bính Ngọ',
    description: 'Gói đồ họa Tết Nguyên Đán cao cấp hơn 25 layers: Cành mai vàng, đào bích, bánh chưng xanh, bao lì xì đỏ, câu đối Tết và font chữ thư pháp chúc mừng năm mới.',
    category: 'Bộ Nhận Diện & Sự Kiện',
    fileType: 'PSD (25+ Layers)',
    fileSize: '310.0 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=800&q=80',
    tags: ['Tết Cổ Truyền', 'Xuân Bính Ngọ', 'Chúc Mừng Năm Mới', 'Mai Đào', 'Bánh Chưng', 'PSD'],
    downloadsCount: 3750,
    rating: 5.0,
    createdAt: '2026-08-16',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-14',
    title: 'Phông Sân khấu Đêm hội Trăng rằm - Tết Trung thu Thiếu nhi',
    description: 'Mẫu thiết kế phông sân khấu Tết Trung thu sinh động dành cho thiếu nhi, trường học và địa phương: Trăng rằm tròn sáng, cây đa, Chị Hằng, Chú Cuội, đèn ông sao và múa lân sư rồng.',
    category: 'Phông Nền & Backdrop',
    fileType: 'PSD / AI',
    fileSize: '115.6 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80',
    tags: ['Trung Thu', 'Đêm Hội Trăng Rằm', 'Thiếu Nhi', 'Chị Hằng', 'Chú Cuội', 'Đèn Ông Sao'],
    downloadsCount: 1470,
    rating: 4.8,
    createdAt: '2026-08-17',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-15',
    title: 'Mẫu Slide Bảo vệ Luận văn Thạc sĩ & Đồ án Kỹ sư (45 Layouts)',
    description: 'Bộ slide thuyết trình học thuật cao cấp gồm 45 layout mẫu: Giới thiệu đề tài, Khảo cứu tổng quan, Mô hình phương pháp, Bảng biểu kết quả thực nghiệm, Sơ đồ thuật toán và Kết luận kiến nghị.',
    category: 'PowerPoint Templates',
    fileType: 'PPTX (16:9 HD)',
    fileSize: '18.6 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    tags: ['Luận Văn', 'Đồ Án Kỹ Sư', 'Thạc Sĩ', 'Học Thuật', 'PowerPoint', 'Research'],
    downloadsCount: 2640,
    rating: 5.0,
    createdAt: '2026-08-17',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'des-16',
    title: 'Standee Đứng Hội thảo Khoa học & Diễn đàn Đổi mới Sáng tạo',
    description: 'Mẫu Standee cuốn (0.8x2.0m) thiết kế hiện đại, tinh gọn phong cách Thụy Sĩ (Swiss Style). Bố cục phân cấp thông tin rõ ràng gồm: Tiêu đề diễn đàn, dàn diễn giả chuyên gia, lịch trình và mã QR check-in.',
    category: 'Poster & Infographics',
    fileType: 'AI / PSD',
    fileSize: '54.2 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    tags: ['Standee', 'Hội Thảo', 'Diễn Đàn', 'Đổi Mới Sáng Tạo', 'QR Code', 'AI'],
    downloadsCount: 1320,
    rating: 4.8,
    createdAt: '2026-08-17',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: '10 Nguyên tắc Vàng thiết kế Slide Đồ án & Bảo vệ Luận văn đạt điểm tối đa',
    slug: '10-nguyen-tac-thiet-ke-slide-do-an-luan-van',
    summary: 'Bí quyết sắp xếp cấu trúc thông tin, phân bổ màu sắc và typographic hierarchy giúp hội đồng chấm thi dễ nắm bắt cốt lõi nghiên cứu trong 15 phút.',
    content: `## Giới thiệu
Khi bước vào hội đồng bảo vệ đồ án hay báo cáo khoa học, slide không chỉ là công cụ hỗ trợ mà chính là bộ mặt đại diện cho toàn bộ công trình của bạn. Một bài thuyết trình xuất sắc kết hợp giữa tư duy mạch lạc và thiết kế trực quan.

---

### 1. Quy tắc "1 Slide - 1 Thông điệp chính"
Đừng biến slide thành một cuốn sách để đọc. Mỗi slide chỉ nên truyền tải một luận điểm cốt lõi nhất. Hội đồng muốn lắng nghe phân tích từ bạn chứ không phải đọc phụ đề trên màn hình chiếu.

### 2. Tỷ lệ tương phản và khả năng đọc từ cự ly xa
* **Kích thước chữ tối thiểu**: Tiêu đề từ 28-36pt, nội dung từ 16-20pt.
* **Độ tương phản**: Sử dụng nền sáng với chữ tối đậm (hoặc ngược lại) để máy chiếu trong giảng đường không bị lóa mờ.

### 3. Trực quan hóa số liệu bằng biểu đồ chuẩn hóa
Thay vì chụp bảng Excel đầy chữ số, hãy sử dụng biểu đồ cột, biểu đồ đường hoặc Infographic với điểm nhấn màu sắc rõ ràng tại số liệu bạn muốn nhấn mạnh.

### 4. Sử dụng hình ảnh và mockup có độ phân giải cao
Một sơ đồ kiến trúc hệ thống hoặc mockup ứng dụng sắc nét sẽ lập tức tạo ấn tượng về sự chuyên nghiệp và đầu tư nghiêm túc của bạn.

> *"Thiết kế tốt không phải là thêm vào cho đến khi không còn gì để thêm, mà là lược bỏ cho đến khi không thể bớt được gì nữa."*

---

### Tóm tắt hành động
1. Rà soát lại slide trước 48h.
2. Thử nghiệm trên máy chiếu thực tế.
3. Luôn chuẩn bị bản sao PDF dự phòng.`,
    coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    category: 'Mẹo thiết kế',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    publishedAt: '2026-08-16',
    readTimeMinutes: 5,
    viewsCount: 1842,
    likesCount: 326,
    commentsCount: 18,
    tags: ['Slide Đồ Án', 'PowerPoint', 'Thuyết Trình', 'Học Thuật', 'Design Tips'],
    isPinned: true,
    status: 'Published'
  },
  {
    id: 'art-2',
    title: 'Ứng dụng Generative AI và Prompting chuyên sâu trong thiết kế UI/UX & Đồ họa',
    slug: 'ung-dung-generative-ai-prompting-thiet-ke-uiux',
    summary: 'Cách tạo ra concept art, bộ icon vector và moodboard chuyên nghiệp chỉ trong vài phút với Midjourney v6 và Gemini 2.5.',
    content: `## Kỷ nguyên mới của thiết kế được tăng tốc bởi AI
AI không thay thế nhà thiết kế, nhưng nhà thiết kế biết ứng dụng AI hiệu quả sẽ bứt phá năng suất gấp nhiều lần.

### Cấu trúc một Prompt chuẩn trong đồ họa
Một prompt chất lượng cao luôn bao gồm 5 thành phần cốt lõi:
1. **Chủ thể chính (Subject)**: Mô tả rõ nhân vật, vật thể hoặc bố cục giao diện.
2. **Phong cách nghệ thuật (Style)**: Ví dụ: *Isometric 3D, Claymation, Flat Vector, Swiss Typography, Neumorphism*.
3. **Màu sắc & Ánh sáng (Lighting & Palette)**: *Soft volumetric lighting, pastel duotone, cyber neon glow*.
4. **Môi trường & Chi tiết (Environment & Details)**: *Floating glass cards, dramatic studio backdrop, clean paths*.
5. **Thông số kỹ thuật (Parameters)**: *--ar 16:9, --v 6.0, 8k resolution, ray tracing*.

---

### Mẹo tinh chỉnh trên Midjourney & Stable Diffusion
* Sử dụng từ khóa âm (Negative Prompt) để loại bỏ các chi tiết thừa như méo mó ngón tay, chữ nhòe.
* Lưu lại các từ khóa về góc máy: *Bird's eye view, Close-up macro, Isometric perspective*.`,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'Thủ thuật AI',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    publishedAt: '2026-08-14',
    readTimeMinutes: 6,
    viewsCount: 2450,
    likesCount: 512,
    commentsCount: 24,
    tags: ['AI Prompting', 'Midjourney', 'Gemini', 'UI/UX', 'Generative AI'],
    isPinned: true,
    status: 'Published'
  },
  {
    id: 'art-3',
    title: 'Chuẩn hóa Poster Nghiên cứu Khoa học khổ lớn (A0) cho Hội thảo Quốc tế',
    slug: 'chuan-hoa-poster-nghien-cuu-khoa-hoc-a0',
    summary: 'Hướng dẫn cấu trúc 3 cột truyền thống, lựa chọn kích thước font chuẩn in ấn (300 DPI) và tối ưu không gian hiển thị.',
    content: `## Tầm quan trọng của Poster Khoa học
Tại các hội thảo khoa học, người tham dự chỉ dừng lại ở poster của bạn từ 30 đến 60 giây. Làm thế nào để poster thu hút ánh nhìn ngay từ cự ly 3 mét?

### Cấu trúc 3 cột chuẩn mực
* **Cột 1: Đặt vấn đề & Mục tiêu nghiên cứu**: Tóm tắt ngắn gọn động lực và câu hỏi nghiên cứu then chốt.
* **Cột 2: Phương pháp & Mô hình thực nghiệm**: Dùng sơ đồ khối hoặc hình minh họa lưu trình thay vì văn bản dài dòng.
* **Cột 3: Kết quả thực nghiệm & Kết luận**: Đặt các biểu đồ quan trọng nhất ở độ cao ngang tầm mắt người xem.

### Thông số kỹ thuật in ấn cần nhớ
* Thiết lập hệ màu **CMYK** ngay từ đầu file thiết kế.
* Độ phân giải ảnh tối thiểu **300 DPI** ở kích thước thật 841 x 1189 mm.`,
    coverImage: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=1200&q=80',
    category: 'Nghiên cứu & Đồ án',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    publishedAt: '2026-08-10',
    readTimeMinutes: 4,
    viewsCount: 1120,
    likesCount: 198,
    commentsCount: 12,
    tags: ['Poster Khoa Học', 'In Ấn', 'Hội Thảo', 'A0', 'Photoshop'],
    isPinned: false,
    status: 'Published'
  },
  {
    id: 'art-4',
    title: 'Thông báo: Ra mắt Nền tảng ICTC Share & Design phiên bản đồng bộ đám mây 2026',
    slug: 'thong-bao-ra-mat-ictc-share-design-2026',
    summary: 'Cập nhật hệ sinh thái chia sẻ học thuật, tích hợp xác thực tài khoản Google an toàn và kho tài liệu lưu trữ Google Drive tốc độ cao.',
    content: `## Chào mừng cộng đồng sinh viên & nghiên cứu viên Việt Nam!
Ban Quản trị ICTC trân trọng thông báo phiên bản nâng cấp toàn diện của cổng thông tin **ICTC Share & Design**.

### Các tính năng mới nổi bật:
1. **Kho thiết kế Slide & UI Kit đa dạng**: Truy cập và tải về miễn phí các mẫu PowerPoint, Figma, Canva được tuyển chọn kỹ lưỡng.
2. **Thư viện AI Prompts tối ưu**: Hàng trăm câu lệnh AI tạo hình ảnh và ý tưởng đã được kiểm thử thực tế.
3. **Mục Bài viết & Tin tức di chuyển**: Cập nhật liên tục các kinh nghiệm, kỹ năng mềm và hướng dẫn nghiên cứu thực chiến.
4. **Bảo mật và Hồ sơ cá nhân**: Tùy chỉnh ảnh đại diện, theo dõi điểm đóng góp và lưu trữ tài nguyên yêu thích.

Hãy tham gia đóng góp những mẫu thiết kế xuất sắc của bạn để cùng xây dựng cộng đồng học thuật ngày một lớn mạnh!`,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: 'Thông báo & Sự kiện',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    publishedAt: '2026-08-17',
    readTimeMinutes: 3,
    viewsCount: 3100,
    likesCount: 680,
    commentsCount: 35,
    tags: ['Thông Báo', 'ICTC', 'Cộng Đồng', 'Tính Năng Mới'],
    isPinned: true,
    status: 'Published'
  }
];

export { INITIAL_AI_PROMPTS, PROMPT_CATEGORIES } from './promptsData';


