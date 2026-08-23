import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, SlidersHorizontal, Layers, Copy, Check, Download, 
  ArrowRight, BookOpen, Presentation, Palette, FileText, ChevronRight, 
  Lightbulb, RefreshCw, Eye, CheckCircle2, Share2, HelpCircle
} from 'lucide-react';
import { DesignFile, AIPrompt, VietnameseFont } from '../types';

interface AISlideGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDesign?: () => void;
  onNavigateToPrompt?: () => void;
  onShowToast: (msg: string) => void;
}

interface SlideStructure {
  slideNumber: number;
  title: string;
  subtitle: string;
  layoutType: 'title' | 'two-column' | 'three-cards' | 'timeline' | 'stats' | 'conclusion';
  keyPoints: string[];
  visualSuggestion: string;
  speakerNotes: string;
}

interface GeneratedDeck {
  topic: string;
  domain: string;
  audience: string;
  slidesCount: number;
  colorTheme: { name: string; primary: string; secondary: string; accent: string };
  recommendedFonts: { heading: string; body: string };
  slides: SlideStructure[];
}

export const AISlideGeneratorModal: React.FC<AISlideGeneratorModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDesign,
  onNavigateToPrompt,
  onShowToast,
}) => {
  if (!isOpen) return null;

  // Form parameters
  const [topic, setTopic] = useState('Nghiên cứu ứng dụng Trí tuệ nhân tạo (AI) trong Tối ưu hóa Quy trình Học tập');
  const [domain, setDomain] = useState<'nckh' | 'cntt' | 'kinhte' | 'doan_hoi' | 'marketing'>('nckh');
  const [slidesCount, setSlidesCount] = useState<number>(10);
  const [audience, setAudience] = useState<'hoi_dong' | 'giang_vien' | 'sinh_vien' | 'doanh_nghiep'>('hoi_dong');
  const [tone, setTone] = useState<'academic' | 'modern_tech' | 'inspiring_youth' | 'minimalist'>('academic');

  // Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generatedDeck, setGeneratedDeck] = useState<GeneratedDeck | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [copiedSlideIndex, setCopiedSlideIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const domainOptions = [
    { id: 'nckh', label: 'Nghiên cứu Khoa học', icon: BookOpen, desc: 'Chuẩn Hội đồng chấm thi, ĐHQG & Bộ GD&ĐT' },
    { id: 'cntt', label: 'Công nghệ Thông tin / AI', icon: Sparkles, desc: 'Bố cục kiến trúc hệ thống, code và sơ đồ' },
    { id: 'kinhte', label: 'Kinh tế & Quản trị', icon: Presentation, desc: 'Biểu đồ tăng trưởng, ma trận SWOT & ROI' },
    { id: 'doan_hoi', label: 'Công tác Đoàn - Hội', icon: Layers, desc: 'Chuẩn màu cờ, biểu trưng & sơ đồ nhân sự' },
    { id: 'marketing', label: 'Marketing & Sáng tạo', icon: Lightbulb, desc: 'Storytelling trực quan, chân dung khách hàng' }
  ];

  const handleGenerate = () => {
    if (!topic.trim()) {
      onShowToast('Vui lòng nhập chủ đề bài thuyết trình!');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 500);
    setTimeout(() => setGenerationStep(3), 1100);

    setTimeout(() => {
      // Build smart outline according to domain and slide count
      let slides: SlideStructure[] = [];

      if (domain === 'nckh') {
        slides = [
          {
            slideNumber: 1,
            title: topic,
            subtitle: 'Báo cáo Khóa luận / Đề tài Nghiên cứu Khoa học',
            layoutType: 'title',
            keyPoints: [
              'Sinh viên thực hiện: [Họ và tên]',
              'Người hướng dẫn khoa học: [Học hàm, Học vị, Tên GVHD]',
              'Hội đồng chuyên môn: [Tên Khoa / Viện / Trường Đại học]',
              'Năm học & Khóa đào tạo: 2025 - 2026'
            ],
            visualSuggestion: 'Logo trường góc trên trái, tiêu đề căn giữa font serif hoặc sans-serif đậm, nền sáng tối giản.',
            speakerNotes: 'Kính thưa quý thầy cô trong Hội đồng, sau đây em xin phép được trình bày đề tài...'
          },
          {
            slideNumber: 2,
            title: '1. Tính cấp thiết & Đặt vấn đề',
            subtitle: 'Bối cảnh thực tiễn và khoảng trống nghiên cứu',
            layoutType: 'two-column',
            keyPoints: [
              'Thực trạng: Nhu cầu ứng dụng công nghệ số đang gia tăng mạnh mẽ trong giáo dục đại học.',
              'Khoảng trống nghiên cứu: Chưa có mô hình chuẩn hóa quy trình học tập cá nhân hóa kết hợp AI tại Việt Nam.',
              'Ý nghĩa thực tiễn: Giúp giảm 40% thời gian tìm kiếm tài liệu và nâng cao hiệu quả tự học.'
            ],
            visualSuggestion: 'Cột trái biểu đồ thống kê xu hướng (3 chỉ số chính), cột phải 3 gạch đầu dòng nhấn mạnh.',
            speakerNotes: 'Lý do em lựa chọn đề tài này xuất phát từ 2 thực trạng nổi bật...'
          },
          {
            slideNumber: 3,
            title: '2. Mục tiêu & Câu hỏi Nghiên cứu',
            subtitle: 'Định hướng giải quyết vấn đề của đề tài',
            layoutType: 'three-cards',
            keyPoints: [
              'Mục tiêu tổng quát: Xây dựng khung phương pháp và bộ công cụ tự động hóa học tập.',
              'Mục tiêu cụ thể 1: Đánh giá thực trạng thói quen tự học của 500+ sinh viên.',
              'Mục tiêu cụ thể 2: Thử nghiệm giải pháp và đo lường sự cải thiện về điểm số và độ hài lòng.'
            ],
            visualSuggestion: '3 hộp thẻ (Bento Cards) bo góc, mỗi thẻ có icon định danh rõ ràng.',
            speakerNotes: 'Để đạt được mục tiêu tổng quát, đề tài tập trung giải quyết 3 câu hỏi nghiên cứu cốt lõi...'
          },
          {
            slideNumber: 4,
            title: '3. Phương pháp & Khung Nghiên cứu',
            subtitle: 'Mô hình nghiên cứu kết hợp Định tính & Định lượng',
            layoutType: 'two-column',
            keyPoints: [
              'Nghiên cứu định lượng: Khảo sát mẫu N = 520 sinh viên bằng bảng hỏi chuẩn Likert 5 mức độ.',
              'Nghiên cứu định tính: Phỏng vấn sâu 12 chuyên gia giảng dạy và cố vấn học tập.',
              'Công cụ xử lý: Phân tích độ tin cậy Cronbach Alpha và hồi quy đa biến trên SPSS/Python.'
            ],
            visualSuggestion: 'Sơ đồ hình phễu (Pipeline) từ Thu thập dữ liệu -> Làm sạch -> Phân tích mô hình.',
            speakerNotes: 'Về phương pháp luận, nhóm nghiên cứu đã áp dụng quy trình kiểm định nghiêm ngặt...'
          },
          {
            slideNumber: 5,
            title: '4. Kiến trúc Hệ thống / Mô hình Đề xuất',
            subtitle: 'Cấu trúc 3 tầng: Dữ liệu - Xử lý AI - Giao diện người dùng',
            layoutType: 'three-cards',
            keyPoints: [
              'Tầng 1 (Data Layer): Kho ngữ liệu học thuật tiếng Việt và tài nguyên mở.',
              'Tầng 2 (AI Engine): Mô hình ngôn ngữ lớn (LLM) tinh chỉnh cho ngữ cảnh học thuật.',
              'Tầng 3 (Client Presentation): Ứng dụng Web tương tác đa nền tảng đạt chuẩn Responsive.'
            ],
            visualSuggestion: 'Sơ đồ kiến trúc phân tầng (Architecture Block Diagram) có mũi tên luồng dữ liệu hai chiều.',
            speakerNotes: 'Đây là sơ đồ kiến trúc cốt lõi do nhóm tự nghiên cứu và phát triển...'
          },
          {
            slideNumber: 6,
            title: '5. Kết quả Thực nghiệm & Phân tích Dữ liệu',
            subtitle: 'Đo lường độ chính xác và mức độ tiếp nhận của người dùng',
            layoutType: 'stats',
            keyPoints: [
              'Độ chính xác mô hình (Accuracy): Đạt 94.2% trên tập dữ liệu kiểm thử độc lập.',
              'Tốc độ phản hồi (Latency): Trung bình 1.2 giây/truy vấn, cải thiện 3.5x so với giải pháp truyền thống.',
              'Chỉ số hài lòng (CSAT): 88.6% sinh viên đánh giá tích cực sau 4 tuần trải nghiệm.'
            ],
            visualSuggestion: '3 chỉ số số liệu lớn (Hero Numbers) kèm biểu đồ cột thể hiện mức tăng trưởng.',
            speakerNotes: 'Kính thưa Hội đồng, kết quả thực nghiệm sau 3 tháng triển khai cho thấy các chỉ số vượt kỳ vọng...'
          },
          {
            slideNumber: 7,
            title: '6. Thảo luận & So sánh với các Nghiên cứu trước',
            subtitle: 'Điểm đột phá và tính mới của công trình',
            layoutType: 'two-column',
            keyPoints: [
              'Ưu thế vượt trội: Tối ưu đặc thù cho hệ thống giáo trình và thuật ngữ tiếng Việt.',
              'Tính ứng dụng cao: Triển khai trực tiếp không đòi hỏi phần cứng đắt tiền.',
              'Chi phí vận hành: Giảm 60% nhờ cơ chế lưu bộ nhớ đệm (Caching & Vector DB).'
            ],
            visualSuggestion: 'Bảng so sánh 2 cột: Giải pháp truyền thống vs Giải pháp của đề tài.',
            speakerNotes: 'So với các công bố khoa học gần đây, đóng góp chính của đề tài nằm ở 3 điểm...'
          },
          {
            slideNumber: 8,
            title: '7. Đóng góp Khoa học & Ứng dụng Thực tiễn',
            subtitle: 'Giá trị chuyển giao công nghệ cho Nhà trường & Cộng đồng',
            layoutType: 'three-cards',
            keyPoints: [
              'Về mặt lý luận: Bổ sung khung đánh giá tương tác AI trong môi trường giáo dục Việt Nam.',
              'Về mặt thực tiễn: Cung cấp nền tảng mở hoàn toàn miễn phí cho hơn 5,000+ sinh viên.',
              'Về mặt sản phẩm: 01 bài báo khoa học và mã nguồn mở theo chuẩn CC BY-NC-SA 4.0.'
            ],
            visualSuggestion: '3 khối bento với huy hiệu thành tích và đường viền gradient sáng.',
            speakerNotes: 'Công trình không chỉ dừng lại ở mặt lý thuyết mà đã có sản phẩm chạy thực tế...'
          },
          {
            slideNumber: 9,
            title: '8. Hạn chế & Hướng phát triển Tương lai',
            subtitle: 'Lộ trình mở rộng quy mô nghiên cứu giai đoạn 2026 - 2027',
            layoutType: 'two-column',
            keyPoints: [
              'Hạn chế hiện tại: Mẫu khảo sát mới tập trung ở khối ngành Kỹ thuật và Công nghệ.',
              'Mở rộng giai đoạn 2: Tích hợp trợ lý giọng nói tiếng Việt đa vùng miền.',
              'Bảo mật & Quyền riêng tư: Nâng cấp chuẩn mã hóa dữ liệu đầu cuối (End-to-End Encryption).'
            ],
            visualSuggestion: 'Sơ đồ Timeline lộ trình phát triển quý 1 -> quý 4.',
            speakerNotes: 'Dù đã đạt kết quả khả quan, nhóm nhận thấy một số hạn chế cần tiếp tục hoàn thiện...'
          },
          {
            slideNumber: 10,
            title: 'Kết luận & Lời cảm ơn',
            subtitle: 'Trân trọng cảm ơn Quý Thầy Cô & Hội đồng Khoa học!',
            layoutType: 'conclusion',
            keyPoints: [
              'Đề tài đã hoàn thành 100% mục tiêu nghiên cứu đã đề ra ban đầu.',
              'Trân trọng gửi lời tri ân sâu sắc tới GVHD và Quý Thầy Cô trong Hội đồng.',
              'Nhóm nghiên cứu kính mong nhận được ý kiến đóng góp và phản biện của Quý Thầy Cô.',
              'Liên hệ tác giả: nguyenhuy.thudaumot@gmail.com | Kho tài liệu: ictc.io.vn'
            ],
            visualSuggestion: 'Nền trang trọng, chữ CẢM ƠN nổi bật kèm mã QR quét xem demo trực tuyến.',
            speakerNotes: 'Em xin trân trọng cảm ơn Quý Thầy Cô đã chú ý lắng nghe. Rất mong nhận được câu hỏi phản biện ạ!'
          }
        ];
      } else {
        // Fallback / General outline generator
        slides = Array.from({ length: slidesCount }, (_, i) => ({
          slideNumber: i + 1,
          title: i === 0 ? topic : `Slide ${i + 1}: Nội dung phân tích chương ${i}`,
          subtitle: i === 0 ? 'Bài thuyết trình chuyên sâu' : 'Luận điểm và minh chứng thực tế',
          layoutType: i === 0 ? 'title' : i === slidesCount - 1 ? 'conclusion' : 'two-column',
          keyPoints: [
            'Luận điểm cốt lõi 1: Trình bày bối cảnh và định hướng thực thi.',
            'Luận điểm cốt lõi 2: Dữ liệu phân tích và dẫn chứng từ nguồn uy tín.',
            'Hành động đề xuất: Giải pháp cụ thể và dự kiến kết quả đạt được.'
          ],
          visualSuggestion: 'Bố cục cân đối 16:9, màu sắc tương phản cao, hạn chế văn bản dài.',
          speakerNotes: `Tại slide ${i + 1}, diễn giả nhấn mạnh vào các số liệu trọng tâm...`
        }));
      }

      // Themes
      const themes = {
        academic: { name: 'Chuẩn Học Thuật ĐHQG', primary: '#0052CC', secondary: '#172B4D', accent: '#0065FF' },
        modern_tech: { name: 'Công Nghệ AI Tương Lai', primary: '#0C66E4', secondary: '#091E42', accent: '#388BFF' },
        inspiring_youth: { name: 'Thanh Niên Đoàn - Hội', primary: '#DA251D', secondary: '#005BAA', accent: '#FFCC00' },
        minimalist: { name: 'Tối Giản Hiện Đại (Clean)', primary: '#1E293B', secondary: '#475569', accent: '#3B82F6' }
      };

      const selectedTheme = themes[tone] || themes.academic;

      setGeneratedDeck({
        topic,
        domain,
        audience,
        slidesCount: slides.length,
        colorTheme: selectedTheme,
        recommendedFonts: {
          heading: 'Be Vietnam Pro Bold',
          body: 'Montserrat Regular / Inter'
        },
        slides
      });

      setIsGenerating(false);
      setActiveSlideIndex(0);
      onShowToast('Đã tạo thành công bộ cấu trúc Slide 10 trang chuẩn học thuật!');
    }, 1600);
  };

  const handleCopySlide = (slide: SlideStructure, idx: number) => {
    const text = `SLIDE ${slide.slideNumber}: ${slide.title}\nPhụ đề: ${slide.subtitle}\n\nNỘI DUNG CHÍNH:\n${slide.keyPoints.map(p => `• ${p}`).join('\n')}\n\nGỢI Ý HÌNH ẢNH/LAYOUT: ${slide.visualSuggestion}\n\nLỜI DẪN THUYẾT TRÌNH (SPEAKER NOTES):\n"${slide.speakerNotes}"`;
    navigator.clipboard.writeText(text);
    setCopiedSlideIndex(idx);
    setTimeout(() => setCopiedSlideIndex(null), 2000);
    onShowToast(`Đã sao chép nội dung Slide ${slide.slideNumber}!`);
  };

  const handleCopyAll = () => {
    if (!generatedDeck) return;
    const fullText = `# ${generatedDeck.topic}\n` +
      `Chủ đề: ${generatedDeck.domain.toUpperCase()} | Đối tượng: ${generatedDeck.audience}\n` +
      `Bảng màu đề xuất: ${generatedDeck.colorTheme.name} (${generatedDeck.colorTheme.primary})\n` +
      `Font chữ đề xuất: ${generatedDeck.recommendedFonts.heading} + ${generatedDeck.recommendedFonts.body}\n\n` +
      generatedDeck.slides.map(s => (
        `## Slide ${s.slideNumber}: ${s.title}\n` +
        `*${s.subtitle}*\n\n` +
        `**Nội dung:**\n${s.keyPoints.map(p => `- ${p}`).join('\n')}\n\n` +
        `**Gợi ý Layout:** ${s.visualSuggestion}\n\n` +
        `**Lời dẫn:** "${s.speakerNotes}"\n\n---\n`
      )).join('\n');

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
    onShowToast('Đã sao chép toàn bộ dàn bài Slide (Markdown chuẩn)!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between border-b border-blue-600/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">AI Slide & Outline Generator Studio</h3>
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 text-[10px] font-black uppercase rounded-full">
                  Độc quyền ICTC
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                Tự động hóa xây dựng dàn ý, bố cục slide, lời dẫn thuyết trình và bảng màu chuẩn học thuật
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ========================================================================= */}
          {/* GENERATOR INPUT FORM */}
          {/* ========================================================================= */}
          <div className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Col 1 & 2: Topic Input */}
              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tên đề tài / Chủ đề bài thuyết trình:</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Nhập tên đề tài khóa luận, báo cáo hoặc bài thuyết trình..."
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs"
                />
              </div>

              {/* Col 3: Domain Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Chuyên ngành / Thể loại:</span>
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as any)}
                  className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="nckh">Nghiên cứu Khoa học (NCKH / Khóa luận)</option>
                  <option value="cntt">Công nghệ Thông tin / AI / Phần mềm</option>
                  <option value="kinhte">Kinh tế & Quản trị Kinh doanh</option>
                  <option value="doan_hoi">Công tác Đoàn - Hội / Đại hội Chi đoàn</option>
                  <option value="marketing">Marketing & Truyền thông Sáng tạo</option>
                </select>
              </div>
            </div>

            {/* Sub-parameters row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Audience */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Đối tượng báo cáo:</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="hoi_dong">Hội đồng chấm thi / Giám khảo</option>
                  <option value="giang_vien">Giảng viên bộ môn</option>
                  <option value="sinh_vien">Sinh viên / Khán giả trẻ</option>
                  <option value="doanh_nghiep">Doanh nghiệp / Đối tác</option>
                </select>
              </div>

              {/* Tone / Theme */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Phong cách & Bảng màu:</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="academic">Chuẩn Học thuật ĐHQG (Xanh Navy)</option>
                  <option value="modern_tech">Công nghệ AI Hiện đại (Cyber Blue)</option>
                  <option value="inspiring_youth">Đoàn - Hội (Đỏ Cờ & Vàng Sao)</option>
                  <option value="minimalist">Tối giản Sang trọng (Clean Light)</option>
                </select>
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Đang phân tích cấu trúc...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>Tạo Đề Cương Slide AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="flex items-center space-x-2 pt-1 text-xs text-slate-500 overflow-x-auto no-scrollbar">
              <span className="font-bold text-slate-700 shrink-0 flex items-center space-x-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Gợi ý mẫu:</span>
              </span>
              {[
                'Khóa luận Tốt nghiệp: Hệ thống Phát hiện Tin giả bằng Deep Learning',
                'Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh nhiệm kỳ 2025 - 2027',
                'Báo cáo Kế hoạch Marketing Sản phẩm Xanh cho Doanh nghiệp vừa & nhỏ'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setTopic(suggestion)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* GENERATING ANIMATION STATE */}
          {/* ========================================================================= */}
          {isGenerating && (
            <div className="p-8 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900">
                  {generationStep === 1 && 'Đang tra cứu khung chuẩn học thuật & cơ sở lý thuyết...'}
                  {generationStep === 2 && 'Đang phân tích cấu trúc 10 Slide & phân bổ thời gian thuyết trình...'}
                  {generationStep === 3 && 'Đang tối ưu lời dẫn thuyết trình & bảng màu tiêu chuẩn...'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">Hệ thống áp dụng phương pháp luận chuẩn ĐHQG và quy chuẩn thiết kế 16:9</p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* GENERATED RESULTS DECK (INTERACTIVE SLIDE PLAYER) */}
          {/* ========================================================================= */}
          {generatedDeck && !isGenerating && (
            <div className="space-y-6">
              {/* Deck Summary Bar */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 border border-blue-400/40 text-[10px] font-mono font-bold rounded">
                      {generatedDeck.slidesCount} SLIDES HOÀN CHỈNH
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Thời lượng dự kiến: <strong>10 - 15 phút</strong>
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1">{generatedDeck.topic}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="flex items-center space-x-1">
                      <Palette className="w-3.5 h-3.5 text-rose-400" />
                      <span>Màu: <strong className="text-white">{generatedDeck.colorTheme.name}</strong></span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Font Tiêu đề: <strong className="text-white">{generatedDeck.recommendedFonts.heading}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedAll ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAll ? 'Đã sao chép dàn bài!' : 'Sao chép toàn bộ (Markdown)'}</span>
                  </button>
                </div>
              </div>

              {/* Main Interactive Slide Viewer & Slide Navigation List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Thumbnail List (4 cols) */}
                <div className="lg:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    Danh sách Slide ({generatedDeck.slides.length}):
                  </span>
                  {generatedDeck.slides.map((s, idx) => {
                    const isSelected = activeSlideIndex === idx;
                    return (
                      <div
                        key={s.slideNumber}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                          isSelected 
                            ? 'bg-blue-50/90 border-blue-500 shadow-md ring-1 ring-blue-400' 
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-mono font-black flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.slideNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {s.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{s.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Active Slide Card Detail (8 cols) */}
                <div className="lg:col-span-8 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
                  {/* Slide View Header */}
                  {(() => {
                    const currentSlide = generatedDeck.slides[activeSlideIndex];
                    if (!currentSlide) return null;

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-mono font-black rounded-lg">
                              SLIDE {currentSlide.slideNumber} / {generatedDeck.slides.length}
                            </span>
                            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                              Layout: {currentSlide.layoutType}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopySlide(currentSlide, activeSlideIndex)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedSlideIndex === activeSlideIndex ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép Slide này</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Slide Title & Subtitle */}
                        <div className="space-y-1">
                          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {currentSlide.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-cyan-300 font-medium">
                            {currentSlide.subtitle}
                          </p>
                        </div>

                        {/* Slide Key Bullets */}
                        <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            Nội dung trình chiếu chính:
                          </span>
                          <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                            {currentSlide.keyPoints.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></span>
                                <span className="leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Speaker Notes */}
                        <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-800/40 space-y-1">
                          <span className="text-[10px] font-mono text-blue-300 uppercase tracking-wider font-bold block">
                            Lời dẫn thuyết trình (Speaker Notes gợi ý):
                          </span>
                          <p className="text-xs text-blue-100 italic leading-relaxed">
                            "{currentSlide.speakerNotes}"
                          </p>
                        </div>

                        {/* Visual & Layout Recommendation */}
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Palette className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Gợi ý bố cục: <strong className="text-slate-200">{currentSlide.visualSuggestion}</strong></span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation controls footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      disabled={activeSlideIndex === 0}
                      onClick={() => setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      &larr; Slide trước
                    </button>

                    <span className="text-xs text-slate-400 font-mono">
                      {activeSlideIndex + 1} / {generatedDeck.slides.length}
                    </span>

                    <button
                      disabled={activeSlideIndex === generatedDeck.slides.length - 1}
                      onClick={() => setActiveSlideIndex(Math.min(generatedDeck.slides.length - 1, activeSlideIndex + 1))}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Slide tiếp theo &rarr;
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Steps Recommendation CTA */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h5 className="text-xs font-black text-blue-900 uppercase">Bước tiếp theo</h5>
                  <p className="text-xs text-slate-600 font-medium">
                    Tải mẫu Slide PowerPoint tương ứng hoặc dùng câu lệnh AI Prompt để sinh chi tiết từng luận điểm.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {onNavigateToDesign && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToDesign();
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Presentation className="w-3.5 h-3.5" />
                      <span>Xem Kho Slide Mẫu</span>
                    </button>
                  )}
                  {onNavigateToPrompt && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToPrompt();
                      }}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Kho AI Prompts</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
