import { DesignFile, AIPrompt, User, SystemConfig } from '../types';

export const DRIVE_DESIGN_FOLDER = 'https://drive.google.com/drive/folders/1adp9EiA1GTNFSaq2g0cz8dJbr1YpDzFd';
export const DRIVE_PROMPT_FOLDER = 'https://drive.google.com/drive/folders/1yWbunO1R99_APiU1FengBtSlyd69zr2_';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-primary',
    email: 'nguyenhuy.thudaumot@gmail.com',
    displayName: 'Nguyễn Huy',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
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
  allowPublicUploads: true,
  maintenanceMode: false,
  defaultAIModel: 'gemini-2.5-flash'
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
    downloadsCount: 1240,
    rating: 4.9,
    createdAt: '2026-07-20',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
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
    downloadsCount: 890,
    rating: 4.8,
    createdAt: '2026-07-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  },
  {
    id: 'des-3',
    title: 'Bộ Giao diện Mobile App Học tập Trực tuyến (Figma UI Kit)',
    description: 'Thiết kế giao diện ứng dụng học tập, ôn thi trực tuyến hiện đại. Gồm hơn 25 màn hình chất lượng cao, đầy đủ các trạng thái, components lồng nhau và Auto-Layout.',
    category: 'UI/UX Kits',
    fileType: 'Figma (.fig)',
    fileSize: '8.5 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1581291518655-9523c932eecf?auto=format&fit=crop&w=800&q=80',
    tags: ['Figma', 'Mobile UI', 'EdTech', 'App Design', 'UX/UI'],
    downloadsCount: 1560,
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
    downloadsCount: 650,
    rating: 4.7,
    createdAt: '2026-08-05',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  },
  {
    id: 'des-5',
    title: 'Mẫu Kế hoạch Nghiên cứu & Thiết kế Bài giảng (Canva Template)',
    description: 'Template Canva thiết kế giáo án, bài giảng trực quan, tương tác cao. Giúp bài học sinh động, thu hút người học với tông màu pastel tinh tế và biểu tượng trực quan.',
    category: 'Canva Templates',
    fileType: 'Canva Link',
    fileSize: 'N/A',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    tags: ['Canva', 'Lesson Plan', 'Education', 'Interative', 'Pastel'],
    downloadsCount: 1980,
    rating: 5.0,
    createdAt: '2026-08-10',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'des-6',
    title: 'Bộ Sưu tập Vector Icons Học tập & Nghiên cứu Công nghệ',
    description: 'Bộ sưu tập hơn 100+ icon học tập, thiết bị nghiên cứu, phòng thí nghiệm định dạng SVG và PNG chất lượng cao, dễ dàng thay đổi màu sắc và kích thước cho thiết kế.',
    category: 'Vector & Assets',
    fileType: 'SVG / PNG',
    fileSize: '3.1 MB',
    driveUrl: DRIVE_DESIGN_FOLDER,
    previewUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    tags: ['Icon', 'Vector', 'Assets', 'SVG', 'Academic Tech'],
    downloadsCount: 1120,
    rating: 4.6,
    createdAt: '2026-08-12',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  }
];

export const INITIAL_AI_PROMPTS: AIPrompt[] = [
  {
    id: 'prm-1',
    title: 'Giao diện Landing Page Website Giáo dục 3D Isometric',
    rawPrompt: 'An elegant 3D isometric mockup of an online school learning platform landing page. Neumorphic elements, soft floating UI cards, laboratory and academic icons, vibrant blue and purple neon gradient glowing accents, dark premium grey background, photorealistic, 8k, ray tracing, Octane Render',
    optimizedPrompt: 'A highly polished 3D isometric presentation of an online education platform web dashboard. Floating neomorphic glass cards with glowing icons of books, atom models, and graduation caps. Elegant dark blue and cyber violet neon lighting casting soft reflections. Ultra-detailed UI elements, minimalist composition, 8k resolution, volumetric lighting, photorealistic rendering style, dramatic studio contrast.',
    category: 'UI/UX Layout',
    toolType: 'Midjourney',
    previewImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['3D', 'Neumorphism', 'Landing Page', 'UI/UX', 'Isometric'],
    likesCount: 342,
    createdAt: '2026-07-22',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'prm-2',
    title: 'Poster Hội thảo Công nghệ Trí tuệ nhân tạo Việt Nam',
    rawPrompt: 'High-tech AI conference poster design, showing a digital brain structure, glowing cyan neural networks, minimalist Vietnamese cultural hints, ultra futuristic, clean white typographic grid, abstract technology layout, high detail, vector illustration style',
    optimizedPrompt: 'An abstract futuristic AI tech conference poster. Central subject is a stylized human head silhouette comprised of glowing light-cyan fiber optic neural networks and translucent geometric sheets. Minimalist lotus blossom abstract motifs subtle in the background. Structured clean typographic Swiss grid, high contrast, elegant corporate teal and deep dark blue color scheme, sleek publication design, sharp vector elements.',
    category: 'Poster Design',
    toolType: 'Stable Diffusion',
    previewImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    tags: ['AI', 'Poster', 'Neural Network', 'Vector', 'Futuristic'],
    likesCount: 289,
    createdAt: '2026-07-28',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  },
  {
    id: 'prm-3',
    title: 'Bộ Sưu tập Avatar Học sinh Chibi 3D dễ thương',
    rawPrompt: 'A collection of cute 3D chibi style school students avatars, diverse genders, wearing school uniforms, holding science equipment, smiling, claymation Pixar style, colorful soft background, 3D render, blender',
    optimizedPrompt: 'A professional character sheet of three distinct 3D chibi-style Vietnamese high school students. Soft, tactile clay texture with polished lighting. One student holds a glowing test tube, another holds a digital tablet. Vibrant pastel uniforms (navy blue and cream), joyful expressions, large warm eyes, Pixar animation film style, studio backdrop, hyper-detailed Blender 3D render.',
    category: '3D Illustration',
    toolType: 'Midjourney',
    previewImageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    tags: ['Chibi', 'Character Design', '3D Render', 'Claymation', 'Cute'],
    likesCount: 456,
    createdAt: '2026-08-02',
    author: 'Huy Designer',
    authorId: 'usr-creator',
    status: 'Approved'
  },
  {
    id: 'prm-4',
    title: 'Vector Icon Học tập Flat-Design Đa sắc',
    rawPrompt: 'Flat vector icon design for scientific discovery, laboratory equipment, graduation, books. Minimalist geometry, harmonious pastel color palette, clean paths, isolated on white background',
    optimizedPrompt: 'An premium flat vector icon set focusing on academic research and laboratory science. Icons include a dual-helix DNA strand, a chemical beaker with rising bubbles, a digital telescope, and an open glowing book. Perfect geometric symmetry, soft pastel green and terracotta coral color scheme, clean vector lines, SVG style, isolated white canvas, material design guidelines.',
    category: 'Icons & Assets',
    toolType: 'DALL-E 3',
    previewImageUrl: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80',
    tags: ['Icon Set', 'Flat Vector', 'Pastel', 'Science', 'Assets'],
    likesCount: 198,
    createdAt: '2026-08-09',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  },
  {
    id: 'prm-5',
    title: 'Mô phỏng Thư viện Hiện đại Công nghệ tương lai',
    rawPrompt: 'An interior concept of a futuristic virtual reality research library, high ceilings, holographic display screens showing interactive molecular structures, students studying with holographic glasses, glowing warm lights, glass and metal, cinematic view, volumetric mist',
    optimizedPrompt: 'A breathtaking cinematic interior visualization of a hyper-modern academic library in 2050. Expansive arches of translucent carbon fiber and glass, multiple levels of book galleries. Floating blue and amber holographic widgets display 3D solar systems and active data charts. Warm golden sunlight shafts piercing through large glass skylights. Volumetric fog, architectural marvel, unreal engine 5 render, highly detailed.',
    category: 'Concept Art',
    toolType: 'Gemini',
    previewImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    tags: ['Concept Art', 'Sci-Fi', 'Architecture', 'Hologram', 'Library'],
    likesCount: 512,
    createdAt: '2026-08-15',
    author: 'Nguyễn Huy (Admin)',
    authorId: 'usr-admin',
    status: 'Approved'
  }
];
