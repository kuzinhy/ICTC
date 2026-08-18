import { AIPrompt } from '../types';
import { DRIVE_PROMPT_FOLDER } from './constants';

export interface VietnamPromptData {
  id: string;
  title: string;
  category: string;
  toolType: 'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini';
  aspectRatio: string;
  rawPrompt: string;
  optimizedPrompt: string;
  previewImageUrl: string;
  tags: string[];
  colors: string[];
  likesCount: number;
  createdAt: string;
  author: string;
  authorId?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

// Bộ sưu tập AI Prompts Thiết Kế Chuẩn Văn Hóa & Cơ Quan Việt Nam (Mở rộng không giới hạn)
export const BASE_VIETNAM_PROMPTS: AIPrompt[] = [
  // -------------------------------------------------------------
  // NHÓM 1: PHÔNG HỘI NGHỊ, ĐẠI HỘI ĐẢNG, ĐOÀN THỂ, CƠ QUAN
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-001',
    title: 'Phông nền Đại hội Đảng bộ cơ sở nhiệm kỳ mới',
    category: 'Phông Hội Nghị',
    toolType: 'Midjourney',
    rawPrompt: 'Quy chuẩn Đại hội Đảng bộ: Phông nền đỏ thắm chuyển sắc trang trọng, biểu tượng búa liềm vàng kim 3D ở chính giữa trên cao, cờ Đảng và cờ Tổ quốc bay lượn mềm mại, hoa văn trống đồng Đông Sơn khắc chìm uy nghiêm, hoa sen vàng kim nở ở hai góc dưới, ánh sáng spotlight sân khấu hội trường đại hội.',
    optimizedPrompt: 'Official Vietnamese Communist Party Congress stage backdrop background, solemn red crimson gradient textured backdrop, golden 3D Communist Hammer and Sickle emblem at top center, waving Vietnam national flag with gold star, subtle geometric bronze drum (Trong Dong) motif engraved in background, blooming golden lotus flower pattern at bottom corners, luxurious red velvet curtain drapery on sides, warm majestic stage spotlight lighting, 8k resolution, graphic design layout for stage printing --ar 16:9 --style raw --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    tags: ['Đại Hội Đảng', 'Búa Liềm', 'Trống Đồng', 'Màu Đỏ', 'Phông Sân Khấu'],
    likesCount: 1420,
    createdAt: '2026-08-01',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-002',
    title: 'Phông nền Đại hội Đoàn TNCS Hồ Chí Minh',
    category: 'Phông Hội Nghị',
    toolType: 'Gemini',
    rawPrompt: 'Phông Đại hội Đoàn thanh niên: Màu xanh dương thanh niên chủ đạo, huy hiệu Đoàn TNCS Hồ Chí Minh phát sáng nổi bật ở trung tâm, chim bồ câu trắng tung cánh biểu trưng cho hòa bình, các đường cong sóng 3D hiện đại và dải hạt ánh sáng kỹ thuật số biểu trưng cho thanh niên xung kích thời đại mới.',
    optimizedPrompt: 'Stage backdrop for Ho Chi Minh Communist Youth Union Congress in Vietnam, vibrant royal blue and bright cyan gradient, official Youth Union circular badge emblem with glowing light, dynamic flying white peace doves, futuristic digital network lines symbolizing youth innovation, modern 3D abstract wave curves, high clarity graphic design backdrop --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    tags: ['Đoàn Thanh Niên', 'Xanh Dương', 'Hội Nghị', 'Tuổi Trẻ', '16:9'],
    likesCount: 1250,
    createdAt: '2026-08-02',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-003',
    title: 'Phông nền Hội nghị Tổng kết công tác năm của Cơ quan Nhà nước',
    category: 'Phông Hội Nghị',
    toolType: 'Midjourney',
    rawPrompt: 'Phông hội trường cơ quan nhà nước, UBND, sở ban ngành: Quốc huy Việt Nam nổi khối 3D vàng kim chạm khắc sắc nét, hoa sen ngọc bích, nền đỏ ruby chuyển tiếp sang xanh đậm uy nghiêm, họa tiết mặt trời trống đồng Đông Sơn lan tỏa ánh hào quang.',
    optimizedPrompt: 'Formal Vietnamese government annual review conference backdrop, 3D golden National Emblem of Vietnam at center top, rich dark ruby red background with elegant subtle Dong Son sunburst texture, golden lotus borders at base, professional studio spotlight lighting, cinematic luxury conference room style, ultra clean vector aesthetic --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tổng Kết Năm', 'Cơ Quan Nhà Nước', 'Quốc Huy', 'Hội Nghị', 'Trang Nghiêm'],
    likesCount: 1100,
    createdAt: '2026-08-03',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-004',
    title: 'Phông Hội nghị Công đoàn Cơ sở & Người Lao động',
    category: 'Phông Hội Nghị',
    toolType: 'DALL-E 3',
    rawPrompt: 'Phông Công đoàn Việt Nam: Biểu tượng bánh răng công nghiệp và bông lúa vàng óng ả, sắc xanh công đoàn hòa quyện cùng dải lụa đỏ cờ Tổ quốc, bố cục thông thoáng chừa khoảng trống đặt tiêu đề chữ hội nghị.',
    optimizedPrompt: 'Vietnam General Confederation of Labour conference backdrop design, symbolic golden cogwheel and rice ear emblem, combination of deep royal blue and solemn red banner style, yellow star accents, clean minimalist layout with generous space for text overlay --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    tags: ['Công Đoàn', 'Người Lao Động', 'Bánh Răng', 'Hội Nghị'],
    likesCount: 890,
    createdAt: '2026-08-03',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-005',
    title: 'Phông Lễ Kỷ niệm Ngày Nhà giáo Việt Nam 20/11',
    category: 'Phông Hội Nghị',
    toolType: 'Midjourney',
    rawPrompt: 'Phông tri ân thầy cô giáo 20/11: Trang sách mở ra ánh sáng vàng ấm áp hóa thành những cánh chim tri thức, hoa sen hồng thanh khiết, ngòi bút mực cổ điển và ruy băng đỏ vinh danh trên nền xanh ngọc pastel tao nhã.',
    optimizedPrompt: 'Vietnamese Teachers Day 20/11 celebration stage background, open luminous vintage book with warm golden glowing pages transforming into birds, delicate lotus flowers and pink graduation ribbons, soft teal and ivory cream bokeh gradient, graceful Vietnamese educational typography space --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    tags: ['20/11', 'Nhà Giáo Việt Nam', 'Tri Ân Thầy Cô', 'Trường Học', 'Hoa Sen'],
    likesCount: 1350,
    createdAt: '2026-08-04',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-006',
    title: 'Phông Hội nghị Khoa học & Đổi mới Sáng tạo Chuyển đổi số',
    category: 'Phông Hội Nghị',
    toolType: 'Gemini',
    rawPrompt: 'Phông hội thảo công nghệ cao: Bản đồ 3D Việt Nam phát sáng dạng mạng lưới hạt dữ liệu, sợi quang học neon cyan và xanh dương đậm, ngôi sao vàng số hóa đỉnh đầu, không gian sự kiện đẳng cấp quốc tế.',
    optimizedPrompt: 'Vietnam National Digital Transformation and AI Summit conference backdrop, glowing 3D particle digital map of Vietnam with Ho Chi Minh City and Hanoi highlighted, neon cyan and deep blue cybernetic mesh background, subtle golden star on top, high-tech enterprise event banner --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    tags: ['Chuyển Đổi Số', 'Công Nghệ', 'Hội Thảo', 'Bản Đồ Việt Nam', 'High-Tech'],
    likesCount: 1680,
    createdAt: '2026-08-05',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-007',
    title: 'Phông Lễ Bế giảng & Trao bằng Tốt nghiệp Đại học',
    category: 'Phông Hội Nghị',
    toolType: 'Midjourney',
    rawPrompt: 'Phông tốt nghiệp cử nhân: Mũ cử nhân tung bay trên nền hoàng hôn vàng kim rực rỡ, vòng nguyệt quế vinh quang phát sáng, pháo hoa giấy chúc mừng và cột trụ giảng đường uy nghi.',
    optimizedPrompt: 'Vietnamese University Graduation Commencement ceremony stage backdrop, flying graduation mortarboard caps, glowing golden laurel wreaths, elegant university campus pillars with warm sunset light, celebratory confetti and red golden ribbons, premium graphic background --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    tags: ['Tốt Nghiệp', 'Đại Học', 'Lễ Trao Bằng', 'Cử Nhân', 'Vinh Danh'],
    likesCount: 1120,
    createdAt: '2026-08-05',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-008',
    title: 'Phông Lễ Kỷ niệm Ngày Thầy thuốc Việt Nam 27/2',
    category: 'Phông Hội Nghị',
    toolType: 'Midjourney',
    rawPrompt: 'Phông sự kiện ngành Y tế: Biểu tượng rắn quấn gậy Asklepios và ống nghe y tế phát sáng êm dịu, hoa sen trắng tinh khôi, nền xanh ngọc bích hòa quyện đường sóng điện tim ECG nhân ái.',
    optimizedPrompt: 'Vietnamese Doctors Day 27/2 celebration conference stage backdrop, medical caduceus and stethoscope emblem glowing softly, pure white lotus blossoms, gentle mint green and medical teal background with subtle ECG heartbeat wave line, dignified and compassionate ambiance --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    tags: ['27/2', 'Thầy Thuốc Việt Nam', 'Y Tế', 'Hội Nghị', 'Lương Y'],
    likesCount: 940,
    createdAt: '2026-08-06',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },

  // -------------------------------------------------------------
  // NHÓM 2: BĂNG RÔN & KHẨU HIỆU TUYÊN TRUYỀN (TỶ LỆ 3:1, 4:1)
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-009',
    title: 'Băng rôn Chào mừng Ngày Quốc khánh 2/9',
    category: 'Băng Rôn & Khẩu Hiệu',
    toolType: 'Midjourney',
    rawPrompt: 'Băng rôn ngang treo đường phố kỷ niệm Quốc khánh 2/9: Nền lụa đỏ thắm rực rỡ, ngôi sao vàng năm cánh tỏa sáng lớn bên trái, hình bóng Lăng Chủ tịch Hồ Chí Minh tại Ba Đình lịch sử, đàn chim bồ câu trắng bay lượn dưới ánh bình minh.',
    optimizedPrompt: 'Vietnamese National Independence Day 2/9 street horizontal banner backdrop, bright vibrant red silk background, large five-pointed golden star shining brightly on left, iconic silhouette of President Ho Chi Minh Mausoleum in Hanoi, soaring white peace doves, golden sunbeams, high resolution graphic print layout --ar 3:1 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80',
    tags: ['2/9', 'Quốc Khánh', 'Băng Rôn', 'Cờ Đỏ Sao Vàng', '3:1'],
    likesCount: 1540,
    createdAt: '2026-08-07',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-010',
    title: 'Băng rôn Kỷ niệm Ngày Giải phóng Miền Nam 30/4 & 1/5',
    category: 'Băng Rôn & Khẩu Hiệu',
    toolType: 'Gemini',
    rawPrompt: 'Băng rôn ngày thống nhất non sông: Nền đỏ vàng hào hùng, cành nguyệt quế chiến thắng, bóng dáng địa danh lịch sử Dinh Độc Lập TP.HCM, pháo hoa mừng ngày lễ lớn, dải chữ khẩu hiệu thông thoáng.',
    optimizedPrompt: 'Vietnamese Reunification Day 30/4 and May Day 1/5 horizontal banner design, dynamic red and gold background with victory laurels, silhouette of historic landmarks in Ho Chi Minh City, celebratory festive fireworks in night sky, clean typography area --ar 3:1',
    previewImageUrl: 'https://images.unsplash.com/photo-1498855926480-d98e83099315?auto=format&fit=crop&w=1200&q=80',
    tags: ['30/4', '1/5', 'Giải Phóng', 'Băng Rôn', 'Hào Hùng'],
    likesCount: 1320,
    createdAt: '2026-08-07',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-011',
    title: 'Băng rôn Tuyên truyền An toàn Giao thông Quốc gia',
    category: 'Băng Rôn & Khẩu Hiệu',
    toolType: 'DALL-E 3',
    rawPrompt: 'Băng rôn cổ động trật tự an toàn giao thông đường bộ: Ngã tư giao thông đô thị văn minh, dòng xe lưu thông quy củ, biểu tượng mũ bảo hiểm chuẩn và tín hiệu đèn giao thông xanh, tông màu cam và xanh da trời tươi sáng.',
    optimizedPrompt: 'Vietnamese national road traffic safety awareness horizontal banner, modern urban city street with orderly traffic, green signal light and safety helmet icon, bright cheerful blue and orange gradient background --ar 3:1',
    previewImageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    tags: ['An Toàn Giao Thông', 'Tuyên Truyền', 'Băng Rôn', 'Văn Hóa Giao Thông'],
    likesCount: 870,
    createdAt: '2026-08-08',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-012',
    title: 'Băng rôn Ngày Chuyển đổi số Quốc gia 10/10',
    category: 'Băng Rôn & Khẩu Hiệu',
    toolType: 'Midjourney',
    rawPrompt: 'Khẩu hiệu chuyển đổi số toàn dân: Dải lụa kỹ thuật số 3D uốn lượn qua thành phố thông minh Việt Nam, mạng lưới kết nối dữ liệu 5G, biểu tượng ngôi sao công nghệ vàng kim rực sáng.',
    optimizedPrompt: 'Vietnam National Digital Transformation Day 10/10 banner background, glowing futuristic cybernetic ribbon across deep blue canvas, smart city digital grid, golden star tech symbol, high-tech vectors --ar 3:1 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    tags: ['10/10', 'Chuyển Đổi Số', 'Công Nghệ', 'Băng Rôn', 'Smart City'],
    likesCount: 1460,
    createdAt: '2026-08-09',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },

  // -------------------------------------------------------------
  // NHÓM 3: BANNER SỰ KIỆN & STANDEE TRIỂN LÃM (16:9, 1:2)
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-013',
    title: 'Standee Triển lãm Sản phẩm Nông nghiệp OCOP Việt Nam',
    category: 'Standee Triển Lãm',
    toolType: 'Midjourney',
    rawPrompt: 'Standee đứng 80x200cm quảng bá nông sản OCOP: Ruộng bậc thang Mù Cang Chải lúa chín vàng ươm dưới nắng, cành lá xanh tươi mát, giỏ hoa quả đặc sản sạch ba miền, phong cách hữu cơ mộc mạc cao cấp.',
    optimizedPrompt: 'Vertical roll-up standee banner for Vietnamese OCOP agricultural specialty exhibition, lush green rice terrace fields of Mu Cang Chai in golden harvest sun, organic fresh fruits and green leaves border, modern eco-friendly earthy tones, vertical 80x200cm composition --ar 1:2 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
    tags: ['OCOP', 'Nông Sản', 'Standee', 'Việt Nam', '1:2'],
    likesCount: 1190,
    createdAt: '2026-08-10',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-014',
    title: 'Banner Diễn đàn Khởi nghiệp Đổi mới Sáng tạo Quốc gia Techfest',
    category: 'Banner Sự Kiện',
    toolType: 'Gemini',
    rawPrompt: 'Banner quảng bá Techfest Việt Nam: Tên lửa 3D cất cánh bay vào không gian số, bóng đèn ý tưởng phát sáng trung tâm, dải sáng neon tím và xanh electric hiện đại.',
    optimizedPrompt: 'Techfest Vietnam startup and innovation summit promotional web banner, launching stylized 3D rocket, glowing lightbulb idea nucleus, digital futuristic lines, bright electric purple and neon blue palette --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    tags: ['Startup', 'Đổi Mới Sáng Tạo', 'Techfest', 'Banner', 'Venture'],
    likesCount: 1280,
    createdAt: '2026-08-10',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-015',
    title: 'Standee Hội thảo Hướng nghiệp & Tuyển dụng Sinh viên',
    category: 'Standee Triển Lãm',
    toolType: 'Midjourney',
    rawPrompt: 'Standee ngày hội việc làm đại học: Tòa nhà kính văn phòng hiện đại, sinh viên trẻ trung tự tin trong trang phục công sở, bánh răng kết nối nhân tài và doanh nghiệp trên nền xanh dương chuyên nghiệp.',
    optimizedPrompt: 'Career Fair and Job Expo vertical standee banner for Vietnamese university students, modern glass office architecture, aspiring young Vietnamese professionals, bright vibrant corporate blue and white gradient --ar 1:2 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Hướng Nghiệp', 'Tuyển Dụng', 'Sinh Viên', 'Standee', 'Career Fair'],
    likesCount: 960,
    createdAt: '2026-08-11',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-016',
    title: 'Banner Lễ Hội Văn Hóa Ẩm Thực & Du Lịch 3 Miền',
    category: 'Banner Sự Kiện',
    toolType: 'Midjourney',
    rawPrompt: 'Banner quảng bá du lịch Việt Nam: Tranh màu nước khắc họa Tháp Rùa Hà Nội, Cầu Vàng Đà Nẵng, Chợ Bến Thành Sài Gòn, nón lá truyền thống, hoa sen và ánh nắng ấm áp rực rỡ.',
    optimizedPrompt: 'Vietnamese Culinary and Tourism Festival horizontal banner, watercolor illustration of iconic Vietnamese landmarks: Turtle Tower Hanoi, Golden Bridge Da Nang, and Ben Thanh Market Saigon, traditional conical hat (non la) and lotus motifs, warm festive amber sunlight --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    tags: ['Ẩm Thực', 'Du Lịch', 'Di Sản', 'Banner', 'Văn Hóa'],
    likesCount: 1410,
    createdAt: '2026-08-11',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },

  // -------------------------------------------------------------
  // NHÓM 4: THIỆP MỜI, GIẤY MỜI DANH DỰ & GIẤY KHEN
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-017',
    title: 'Thiệp mời Lễ Kỷ niệm Ngày Thành lập Doanh nghiệp 13/10',
    category: 'Thiệp Mời & Giấy Mời',
    toolType: 'Midjourney',
    rawPrompt: 'Thiệp mời doanh nhân sang trọng: Nền xanh navy thẫm kết hợp viền ép kim vàng 24K, hình tượng cánh buồm vươn ra biển lớn vượt sóng gió, hoa văn geometric tinh tế, phong cách hoàng gia doanh nghiệp.',
    optimizedPrompt: 'Luxury corporate anniversary invitation card design, deep navy blue textured matte paper with 24k gold foil embossed borders, sleek sailing ship reaching ocean motif, subtle geometric gold lines, minimalist luxury layout, top view flat lay --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    tags: ['Thiệp Mời', 'Doanh Nhân', 'Ép Kim Vàng', 'Sang Trọng', '13/10'],
    likesCount: 1080,
    createdAt: '2026-08-12',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-018',
    title: 'Giấy mời Hội thảo Khoa học Quốc tế & Lễ Khai mạc',
    category: 'Thiệp Mời & Giấy Mời',
    toolType: 'Gemini',
    rawPrompt: 'Giấy mời hội thảo học thuật: Hoa văn trống đồng Đông Sơn in chìm ánh kim loại đồng thau, quốc kỳ và hoa sen ngọc bích cách điệu, giấy mỹ thuật gân cao cấp chừa không gian điền tên đại biểu trang trọng.',
    optimizedPrompt: 'Vietnamese official academic conference invitation card template, embossed metallic bronze drum Dong Son watermark, refined gold and ivory border patterns, luxury textured cardstock paper, formal civic presentation --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
    tags: ['Giấy Mời', 'Hội Thảo Khoa Học', 'Trống Đồng', 'Học Thuật', 'Đại Biểu'],
    likesCount: 890,
    createdAt: '2026-08-12',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-019',
    title: 'Khung Bằng Khen & Giấy Khen Thành tích Xuất sắc',
    category: 'Thiệp Mời & Giấy Mời',
    toolType: 'Midjourney',
    rawPrompt: 'Mẫu phôi giấy khen chuẩn cơ quan Việt Nam: Quốc huy ở góc trên, đường viền họa tiết hoa sen và hoa văn dây lá uốn lượn ép kim vàng, nền giấy hoa văn lượn sóng Guilloche bảo mật chống làm giả.',
    optimizedPrompt: 'Vietnamese official Certificate of Merit certificate template border, intricate golden guilloche security vector patterns, golden lotus floral corners, solemn crimson and cream background, high precision print asset --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    tags: ['Giấy Khen', 'Bằng Khen', 'Vinh Danh', 'Guilloche', 'Quốc Huy'],
    likesCount: 1390,
    createdAt: '2026-08-13',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },

  // -------------------------------------------------------------
  // NHÓM 5: POSTER TUYÊN TRUYỀN & INFOGRAPHIC CỔ ĐỘNG
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-020',
    title: 'Poster Tuyên truyền Bảo vệ Chủ quyền Biển Đảo Tổ Quốc',
    category: 'Poster & Infographic',
    toolType: 'Midjourney',
    rawPrompt: 'Poster cổ động bảo vệ biển đảo Hoàng Sa - Trường Sa: Cột mốc chủ quyền sừng sững giữa sóng gió đại dương xanh thẳm, chiến sĩ hải quân nhân dân bồng súng kiên cường, hải âu tung cánh và cờ đỏ sao vàng tung bay.',
    optimizedPrompt: 'Vietnamese patriotic maritime sovereignty propaganda poster, national sovereignty stone marker at Spratly islands, resolute Vietnamese navy soldier standing guard against dramatic ocean waves, soaring seagulls, bright red national flag waving proudly, heroic socialist realism illustration style --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    tags: ['Biển Đảo', 'Hoàng Sa', 'Trường Sa', 'Tuyên Truyền', 'Poster Cổ Động'],
    likesCount: 1750,
    createdAt: '2026-08-14',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-021',
    title: 'Poster Phòng cháy Chữa cháy & Cứu hộ Cứu nạn Toàn dân',
    category: 'Poster & Infographic',
    toolType: 'Gemini',
    rawPrompt: 'Poster tuyên truyền PCCC: Người lính cứu hỏa dũng cảm trong trang phục bảo hộ chuyên dụng cầm vòi phun nước dập tắt biển lửa, bảo vệ an toàn cho người dân, thông điệp an toàn sinh mạng trên hết.',
    optimizedPrompt: 'Fire safety and prevention awareness poster in Vietnam, brave firefighter hero in protective gear holding hose extinguishing flames, saving citizens, dramatic emergency red and orange lighting, high impact civic graphic --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=80',
    tags: ['PCCC', 'Cứu Hỏa', 'An Toàn', 'Tuyên Truyền', 'Poster'],
    likesCount: 920,
    createdAt: '2026-08-14',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-022',
    title: 'Infographic 5 Bước Thực hiện Dịch vụ Công Trực tuyến VNeID',
    category: 'Poster & Infographic',
    toolType: 'Stable Diffusion',
    rawPrompt: 'Infographic hướng dẫn dịch vụ công số: Điện thoại thông minh hiển thị thẻ CCCD gắn chip và tài khoản VNeID, các biểu tượng 5 bước thủ tục hành chính không giấy tờ, giao diện phẳng isometric rõ ràng dễ hiểu.',
    optimizedPrompt: 'Clean modern isometric infographic poster for Vietnamese e-government online public services, smartphone showing national digital ID VNeID, 5 clear numbered step-by-step procedure flowchart cards, friendly civic colors --ar 16:9',
    previewImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    tags: ['Dịch Vụ Công', 'VNeID', 'CCCD', 'Infographic', 'Chính Phủ Số'],
    likesCount: 1140,
    createdAt: '2026-08-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },

  // -------------------------------------------------------------
  // NHÓM 6: BÌA SỔ KỶ YẾU, KỶ NIỆM & TÀI LIỆU ĐẠI HỘI
  // -------------------------------------------------------------
  {
    id: 'vn-prompt-023',
    title: 'Bìa Sổ Tay Đại biểu & Kỷ yếu Đại hội Đảng các cấp',
    category: 'Bìa Sổ & Kỷ Yếu',
    toolType: 'Midjourney',
    rawPrompt: 'Bìa sổ tay bìa da đại biểu: Da thuộc màu đỏ bordeaux dập nổi hoa văn trống đồng Đông Sơn và biểu tượng búa liềm ép kim vàng đồng, đường chỉ may viền thủ công cao cấp.',
    optimizedPrompt: 'Luxury hardcover yearbook book cover design for Vietnamese Party Congress, burgundy red leather texture with debossed gold foil Dong Son drum circular mandala, subtle embossed title placeholder, photorealistic product mockup --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    tags: ['Kỷ Yếu', 'Bìa Sổ', 'Đại Biểu', 'Bìa Da', 'Ép Kim'],
    likesCount: 1030,
    createdAt: '2026-08-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  },
  {
    id: 'vn-prompt-024',
    title: 'Bìa Kỷ yếu 50 Năm Thành lập Trường Đại học / Cao đẳng',
    category: 'Bìa Sổ & Kỷ Yếu',
    toolType: 'Midjourney',
    rawPrompt: 'Bìa kỷ yếu 50 năm trường: Số 50 cách điệu 3D mạ vàng lồng ghép biểu tượng ngọn đuốc tri thức và trang sách, hoa phượng đỏ rực rỡ, tòa nhà trường học cổ kính trên nền xanh ngọc hoàng gia.',
    optimizedPrompt: '50th anniversary commemorative yearbook cover for Vietnamese University, 3D polished golden number 50 entwined with torch of wisdom and open book, blooming red Poinciana flowers, royal sapphire blue background --ar 16:9 --v 6.0',
    previewImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
    tags: ['Kỷ Yếu', '50 Năm', 'Trường Học', 'Kỷ Niệm', 'Vàng Kim'],
    likesCount: 1260,
    createdAt: '2026-08-16',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin-primary',
    status: 'Approved'
  }
];

// Trình sinh dữ liệu mở rộng không giới hạn (Unlimited Extensible Prompt Library)
export const generateFull100VietnamPrompts = (): AIPrompt[] => {
  const fullList: AIPrompt[] = [...BASE_VIETNAM_PROMPTS];
  
  const additionalTemplates = [
    {
      title: 'Phông Lễ Tuyên dương Thanh niên Tiên tiến làm theo lời Bác',
      cat: 'Phông Hội Nghị',
      tool: 'Midjourney' as const,
      raw: 'Phông sân khấu lễ tuyên dương gương mặt trẻ tiêu biểu: Huy hiệu Bác Hồ mạ vàng, dải lụa đỏ vàng bay lượn, ngôi sao vàng tỏa sáng hào quang cùng hoa sen hồng nở rộ.',
      prompt: 'Stage backdrop for Vietnamese Advanced Youth Commendation Ceremony, 3D golden portrait medallion of President Ho Chi Minh, radiant starburst, blooming pink lotus garden, vibrant royal blue and crimson gradient --ar 16:9 --v 6.0',
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Thanh Niên', 'Tuyên Dương', 'Bác Hồ', 'Hội Nghị']
    },
    {
      title: 'Băng rôn Phong trào "Toàn dân Đoàn kết Xây dựng Đời sống Văn hóa"',
      cat: 'Băng Rôn & Khẩu Hiệu',
      tool: 'Gemini' as const,
      raw: 'Băng rôn cổ động nông thôn mới & đô thị văn minh: Mái đình làng Việt Nam rêu phong, cánh đồng lúa xanh ngút ngàn, gia đình ấm no hạnh phúc trên nền đỏ cờ Tổ quốc.',
      prompt: 'Vietnamese national unity and cultural lifestyle movement street banner, traditional communal house roof, golden paddy fields, harmonious happy Vietnamese multi-generation family, festive red header --ar 3:1',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      tags: ['Văn Hóa', 'Nông Thôn Mới', 'Băng Rôn', 'Đoàn Kết']
    },
    {
      title: 'Standee Triển lãm Tranh Thiếu nhi "Em yêu Tổ quốc Việt Nam"',
      cat: 'Standee Triển Lãm',
      tool: 'Midjourney' as const,
      raw: 'Standee triển lãm tranh thiếu nhi: Tranh vẽ nét ngây thơ rực rỡ sắc màu về danh lam thắng cảnh Việt Nam, chim câu trắng bay qua cầu Long Biên và Vịnh Hạ Long.',
      prompt: 'Vertical exhibition standee for Vietnamese Children Art Contest, colorful naive watercolor drawings of Halong Bay and Long Bien Bridge, flying white doves, cheerful rainbow swirls --ar 1:2 --v 6.0',
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
      tags: ['Thiếu Nhi', 'Hội Họa', 'Standee', 'Tổ Quốc']
    },
    {
      title: 'Banner Diễn đàn Kinh tế Xanh & Năng lượng Tái tạo Quốc gia',
      cat: 'Banner Sự Kiện',
      tool: 'Midjourney' as const,
      raw: 'Banner diễn đàn chuyển dịch năng lượng xanh: Cánh đồng điện gió ngoài khơi Bình Thuận, tấm pin năng lượng mặt trời phản chiếu mây trời xanh ngắt, lá cây phát quang công nghệ.',
      prompt: 'Vietnam Green Economy and Offshore Wind Energy Summit banner, offshore wind turbines spinning gracefully over turquoise South China Sea, solar panel grid reflections, modern cyan green palette --ar 16:9 --v 6.0',
      img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
      tags: ['Kinh Tế Xanh', 'Năng Lượng', 'Điện Gió', 'Banner']
    },
    {
      title: 'Thiệp mời Lễ Kỷ niệm Ngày Thương binh Liệt sĩ 27/7',
      cat: 'Thiệp Mời & Giấy Mời',
      tool: 'Midjourney' as const,
      raw: 'Thiệp mời tri ân các anh hùng liệt sĩ: Đài tưởng niệm và ngọn lửa vĩnh cửu thiêng liêng, hoa sen vàng kim trang trọng, nền đỏ đô ruby trầm lắng tỏ lòng biết ơn sâu sắc.',
      prompt: 'Solemn memorial invitation card for Vietnamese War Invalids and Martyrs Day 27/7, eternal flame monument silhouette, sacred golden lotus flowers, dark ruby velvet background --ar 16:9 --v 6.0',
      img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      tags: ['27/7', 'Tri Ân', 'Liệt Sĩ', 'Thiệp Mời', 'Trang Nghiêm']
    },
    {
      title: 'Poster Cổ động Ngày Hội Hiến máu Tình nguyện "Giọt Hồng Tri Ân"',
      cat: 'Poster & Infographic',
      tool: 'DALL-E 3' as const,
      raw: 'Poster hiến máu nhân đạo: Giọt máu đỏ ấm áp hình trái tim nâng niu bởi đôi bàn tay nhân ái, bông sen nở và cánh chim hòa bình biểu trưng cho sự sẻ chia sự sống.',
      prompt: 'Humanitarian voluntary blood donation campaign poster in Vietnam, glowing red blood drop transforming into heart, caring supporting hands, blooming lotus and flying dove --ar 16:9',
      img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80',
      tags: ['Hiến Máu', 'Nhân Đạo', 'Giọt Hồng', 'Poster']
    }
  ];

  // Mở rộng thêm danh sách prompt chất lượng cao
  let idx = BASE_VIETNAM_PROMPTS.length + 1;
  for (let loop = 0; loop < 15; loop++) {
    for (const t of additionalTemplates) {
      const paddedId = `vn-prompt-${String(idx).padStart(3, '0')}`;
      fullList.push({
        id: paddedId,
        title: loop === 0 ? t.title : `${t.title} (Biến thể thiết kế #${loop + 1})`,
        category: t.cat,
        toolType: t.tool,
        rawPrompt: t.raw,
        optimizedPrompt: t.prompt,
        previewImageUrl: t.img,
        tags: [...t.tags, 'Chuẩn Đồ Họa VN', 'Thư Viện Mở'],
        likesCount: 500 + ((idx * 29) % 1100),
        createdAt: '2026-08-16',
        author: 'Nguyễn Huy (Admin)',
        authorId: 'usr-admin-primary',
        status: 'Approved'
      });
      idx++;
    }
  }

  return fullList;
};
