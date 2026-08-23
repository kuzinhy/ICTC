import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, FolderOpen, Download, Star, ShieldCheck, 
  CheckCircle2, Layers, Cpu, BookOpen, Palette, Users, ChevronRight, 
  Zap, Play, ExternalLink, Lightbulb, Search, Award, BarChart3, 
  SlidersHorizontal, Check, RefreshCw, FileText, Type, Flame, Heart,
  Terminal, Shield, FileCheck, Share2
} from 'lucide-react';
import { User, DesignFile, AIPrompt, Article, VietnameseFont } from '../types';

interface MisaAmisHeroSectionProps {
  onNavigateTab: (tab: 'designs' | 'prompts' | 'articles' | 'fonts' | 'photo_prompts' | 'contact' | 'profile') => void;
  onOpenIdeaHub: () => void;
  onOpenPaletteModal: () => void;
  onOpenLegalModal: () => void;
  onOpenSearch: () => void;
  onOpenSlideGenerator?: () => void;
  onOpenCopilot?: () => void;
  onRequireAuth?: (reason?: string) => void;
  currentUser: User | null;
  designFilesCount: number;
  promptsCount: number;
  fontsCount: number;
  articlesCount: number;
}

export const MisaAmisHeroSection: React.FC<MisaAmisHeroSectionProps> = ({
  onNavigateTab,
  onOpenIdeaHub,
  onOpenPaletteModal,
  onOpenLegalModal,
  onOpenSearch,
  onOpenSlideGenerator,
  onOpenCopilot,
  onRequireAuth,
  currentUser,
  designFilesCount,
  promptsCount,
  fontsCount,
  articlesCount,
}) => {
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [activeMockupTab, setActiveMockupTab] = useState<'designs' | 'prompts' | 'fonts' | 'compliance'>('designs');

  const workflowSteps = [
    {
      id: 0,
      number: '01',
      title: 'Khám phá & Lựa chọn',
      subtitle: 'Tra cứu theo 5 khối ngành',
      desc: 'Bộ lọc tài nguyên chuẩn mực cho CNTT & AI, Nghiên cứu Khoa học, Kinh tế, Thiết kế và Công tác Đoàn - Hội.',
      icon: Search,
      actionLabel: 'Xem kho Slide',
      tabTarget: 'designs' as const,
      metrics: `${designFilesCount}+ Mẫu tuyển chọn`
    },
    {
      id: 1,
      number: '02',
      title: 'Tự động hóa với AI',
      subtitle: 'Sinh đề cương 10 Slide',
      desc: 'Tạo dàn ý thuyết trình, tóm tắt tiểu luận và sinh kịch bản báo cáo khoa học tự động cùng ICTC Copilot.',
      icon: Sparkles,
      actionLabel: 'Thử AI Slide Studio',
      customAction: onOpenSlideGenerator,
      tabTarget: 'prompts' as const,
      metrics: `${promptsCount}+ Prompt chuyên sâu`
    },
    {
      id: 2,
      number: '03',
      title: 'Chuẩn hóa Trực quan',
      subtitle: 'Font & Mã màu chuẩn',
      desc: '100% font chữ Việt hóa không lỗi dấu và bảng mã màu chính thống theo quy chuẩn Quốc kỳ, Đoàn - Hội Nhà nước.',
      icon: Type,
      actionLabel: 'Khám phá Font chữ',
      tabTarget: 'fonts' as const,
      metrics: `${fontsCount}+ Font Việt hóa`
    },
    {
      id: 3,
      number: '04',
      title: 'Báo cáo & Đạt Điểm Cao',
      subtitle: 'Xuất bản định dạng chuẩn',
      desc: 'Tải trực tiếp định dạng PPTX, Keynote, Vector kèm giấy phép CC BY-NC-SA 4.0 đảm bảo liêm chính học thuật.',
      icon: Award,
      actionLabel: 'Đọc cẩm nang',
      tabTarget: 'articles' as const,
      metrics: 'Đánh giá 4.9/5 ⭐'
    }
  ];

  const valueCards = [
    {
      title: 'Tiết kiệm 80% Thời Gian',
      desc: 'Không cần tạo lại từ trang trắng. Mọi bố cục slide đều được phân cấp thị giác theo chuẩn học thuật và doanh nghiệp.',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      stat: 'Giảm 4 giờ/bài giảng'
    },
    {
      title: 'Studio AI Đa Chuyên Ngành',
      desc: 'Hỗ trợ prompt chuyên sâu cho Gemini, ChatGPT, Claude với cấu trúc tối ưu cho bài báo khoa học và thuyết trình.',
      icon: Cpu,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200/80',
      stat: 'Chuẩn GPT-4o & Gemini'
    },
    {
      title: 'Chuẩn Hóa Việt Nam 100%',
      desc: 'Toàn bộ font chữ hỗ trợ đầy đủ bộ gõ Telex/VNI, tỷ lệ cờ đỏ sao vàng và biểu tượng Đoàn TNCS HCM chính xác.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
      stat: 'Tuân thủ quy chuẩn Nhà nước'
    },
    {
      title: 'Kiểm Duyệt Nội Dung 3 Cấp',
      desc: 'Đội ngũ Admin & thuật toán tự động rà soát an toàn nội dung, chấm điểm A+ và quét liên kết Google Drive trực tiếp.',
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200/80',
      stat: 'Độ tin cậy 99.9%'
    }
  ];

  return (
    <section className="relative overflow-hidden pt-1 pb-6 sm:pb-10" id="ictc-hero-section">
      {/* Background Subtle Gradient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-[36rem] h-[36rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-[28rem] h-[28rem] bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ========================================================================= */}
        {/* TOP HERO HEADLINE & ACTIONS */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto space-y-5 pt-2">
          {/* Tagline Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-800 text-xs font-bold shadow-xs backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="tracking-tight text-blue-900 font-extrabold uppercase text-[11px] sm:text-xs">
              Hệ thống Quản trị & Chia sẻ Tri thức Số 4.0
            </span>
            <span className="text-blue-300">|</span>
            <span className="text-blue-700 font-medium text-xs hidden sm:inline">
              Dành cho Sinh viên & Giảng viên Việt Nam
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]"
          >
            Tối Ưu Hóa Bài Giảng,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Slide Thuyết Trình & Ứng Dụng AI
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-3xl mx-auto"
          >
            Nền tảng chia sẻ học thuật chuẩn mực, tích hợp kho <strong className="text-slate-900 font-bold">{designFilesCount}+ mẫu Slide PowerPoint</strong>,{' '}
            <strong className="text-slate-900 font-bold">{promptsCount}+ câu lệnh AI</strong> và <strong className="text-slate-900 font-bold">{fontsCount}+ font chữ Việt hóa</strong> hoàn toàn miễn phí.
          </motion.p>

          {/* Hero Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            {onOpenSlideGenerator && (
              <button
                type="button"
                onClick={onOpenSlideGenerator}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Tạo Đề Cương Slide AI</span>
                <span className="px-1.5 py-0.5 bg-white/20 text-[10px] font-mono rounded">MỚI</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('designs')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer group"
            >
              <FolderOpen className="w-4 h-4 group-hover:rotate-6 transition-transform" />
              <span>Khám phá Kho Slide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onOpenCopilot && (
              <button
                type="button"
                onClick={onOpenCopilot}
                className="px-4 py-3 rounded-xl bg-cyan-50/90 hover:bg-cyan-100/90 text-cyan-900 font-bold text-xs sm:text-sm border border-cyan-200/90 transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span>Trợ lý Copilot</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSearch}
              className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-bold text-xs sm:text-sm border border-slate-200 shadow-xs hover:border-blue-300 transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Tìm kiếm</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-400 font-mono rounded hidden sm:inline">⌘K</kbd>
            </button>
          </motion.div>

          {/* Social Proof Stats Counters Bar */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto"
          >
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight">{designFilesCount}+</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Mẫu PowerPoint</p>
            </div>
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">{promptsCount}+</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">AI Prompts Chuẩn</p>
            </div>
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">{fontsCount}+</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Font Việt Hóa</p>
            </div>
            <div className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-600 tracking-tight">100%</p>
              <p className="text-[11px] text-slate-500 font-bold uppercase mt-0.5">Miễn phí & Kiểm duyệt</p>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE LIVE WORKSPACE MOCKUP DISPLAY (SaaS Workspace Window) */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative max-w-5xl mx-auto rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/90 via-slate-100 to-white border border-slate-300/80 shadow-xl"
        >
          <div className="bg-slate-900 rounded-xl overflow-hidden text-white shadow-md">
            {/* Top Window Header */}
            <div className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 text-xs font-mono text-slate-400 hidden sm:inline">ictc.io.vn • Không gian làm việc học thuật</span>
              </div>

              {/* URL address search simulation */}
              <div 
                onClick={onOpenSearch}
                className="flex-1 max-w-xs sm:max-w-md bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-300 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <Search className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">https://ictc.io.vn/studio-workspace</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-slate-700 text-[9px] rounded text-slate-400 font-mono hidden sm:inline">⌘K</kbd>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden md:inline">Trực tuyến</span>
              </div>
            </div>

            {/* Mockup View Selector Tabs */}
            <div className="px-3 pt-2.5 pb-2 bg-slate-900 border-b border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'designs', label: '1. Kho Slide Tuyển Chọn', icon: FolderOpen },
                { id: 'prompts', label: '2. Tự Động Hóa AI Prompt', icon: Sparkles },
                { id: 'fonts', label: '3. Chuẩn Hóa Font Việt Hóa', icon: Type },
                { id: 'compliance', label: '4. Bảng Màu & Bản Quyền', icon: ShieldCheck }
              ].map((tab) => {
                const isSelected = activeMockupTab === tab.id;
                const IconC = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMockupTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <IconC className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mockup Body Content Display */}
            <div className="p-4 sm:p-5 bg-slate-950/70 min-h-[220px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {activeMockupTab === 'designs' && (
                  <motion.div 
                    key="designs"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
                  >
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded">PowerPoint</span>
                        <span className="text-amber-400 font-bold text-xs flex items-center">⭐ 5.0</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">Mẫu Slide Báo Cáo NCKH Chuẩn ĐHQG</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">Bố cục phân chương, biểu đồ trực quan, hỗ trợ tỷ lệ 16:9 full HD.</p>
                      <button 
                        onClick={() => onNavigateTab('designs')}
                        className="w-full py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải mẫu ngay</span>
                      </button>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded">Đoàn - Hội</span>
                        <span className="text-amber-400 font-bold text-xs flex items-center">⭐ 4.9</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">Slide Đại Hội Đoàn TNCS Hồ Chí Minh</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">Chuẩn màu cờ đỏ sao vàng, huy hiệu Đoàn sắc nét, kèm sơ đồ nhân sự.</p>
                      <button 
                        onClick={() => onNavigateTab('designs')}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">Infographic</span>
                        <span className="text-amber-400 font-bold text-xs flex items-center">⭐ 5.0</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">Bộ Vector & Icon Công Nghệ 4.0</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">Hơn 200+ icon phẳng chất lượng cao cho bài thuyết trình CNTT & AI.</p>
                      <button 
                        onClick={() => onNavigateTab('designs')}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeMockupTab === 'prompts' && (
                  <motion.div 
                    key="prompts"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3.5"
                  >
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-bold rounded">Prompt Học Thuật</span>
                        <span className="text-xs text-slate-400 font-mono">Gemini & GPT-4o</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">Xây Dựng Đề Cương Nghiên Cứu Khoa Học</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">Tự động cấu trúc 5 chương, phương pháp nghiên cứu định tính/định lượng và trích dẫn APA.</p>
                      <div className="pt-1 flex items-center space-x-2">
                        <button 
                          onClick={() => onNavigateTab('prompts')}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sao chép Prompt</span>
                        </button>
                        {onOpenSlideGenerator && (
                          <button
                            onClick={onOpenSlideGenerator}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Mở Studio Slide &rarr;
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-bold rounded">Prompt Kịch Bản</span>
                        <span className="text-xs text-slate-400 font-mono">Thuyết trình 10 phút</span>
                      </div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">Tạo Lời Dẫn Thuyết Trình Khóa Luận Tốt Nghiệp</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">Tối ưu từng slide: Mở đầu ấn tượng, nhấn mạnh phát hiện cốt lõi và trả lời phản biện.</p>
                      <div className="pt-1 flex items-center space-x-2">
                        <button 
                          onClick={() => onNavigateTab('prompts')}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sao chép Prompt</span>
                        </button>
                        {onOpenCopilot && (
                          <button
                            onClick={onOpenCopilot}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Hỏi Copilot &rarr;
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeMockupTab === 'fonts' && (
                  <motion.div 
                    key="fonts"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">Font Tuyển Chọn</span>
                      <h4 className="text-sm sm:text-base font-bold text-white">Be Vietnam Pro, Montserrat & Playfair Display Việt Hóa</h4>
                      <p className="text-xs text-slate-400">100% không lỗi dấu tiếng Việt (ă, â, đ, ê, ô, ơ, ư). Tương thích hoàn hảo trên PowerPoint, Keynote, macOS và Canva.</p>
                    </div>
                    <button 
                      onClick={() => onNavigateTab('fonts')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>Xem Kho Font ({fontsCount}+)</span>
                    </button>
                  </motion.div>
                )}

                {activeMockupTab === 'compliance' && (
                  <motion.div 
                    key="compliance"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
                  >
                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <Palette className="w-4 h-4 text-rose-400" />
                        <span>Bảng màu Chuẩn Quốc Gia</span>
                      </h4>
                      <p className="text-xs text-slate-400">Mã màu chuẩn Đỏ cờ (#DA251D), Vàng sao (#FFFF00), Xanh Thanh niên (#005BAA) theo quy định.</p>
                      <button 
                        onClick={onOpenPaletteModal}
                        className="text-xs text-cyan-400 hover:underline font-bold pt-1 block cursor-pointer"
                      >
                        Mở Bảng tra cứu màu sắc &rarr;
                      </button>
                    </div>

                    <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Quy Chuẩn Sở Hữu Trí Tuệ</span>
                      </h4>
                      <p className="text-xs text-slate-400">Giấy phép Creative Commons CC BY-NC-SA 4.0 và đạo đức ứng dụng AI có trách nhiệm.</p>
                      <button 
                        onClick={onOpenLegalModal}
                        className="text-xs text-cyan-400 hover:underline font-bold pt-1 block cursor-pointer"
                      >
                        Xem chính sách bản quyền &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 4-STEP INTERACTIVE WORKFLOW PIPELINE */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              Quy Trình 4 Bước Chuẩn Mực
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Tối Ưu Hóa Bài Giảng & Báo Cáo Học Thuật
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Từ ý tưởng đến bài thuyết trình điểm A+ với 4 bước đơn giản, tự động hóa cùng ICTC.
            </p>
          </div>

          {/* Steps Stepper Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {workflowSteps.map((step, idx) => {
              const isSelected = activeWorkflowStep === idx;
              const IconComponent = step.icon;

              return (
                <div
                  key={step.id}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative flex flex-col justify-between space-y-3 ${
                    isSelected 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        BƯỚC {step.number}
                      </span>
                      <div className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600'}`}>
                        {step.subtitle}
                      </p>
                    </div>

                    <p className={`text-xs leading-relaxed ${isSelected ? 'text-blue-50' : 'text-slate-500'}`}>
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                      {step.metrics}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (step.customAction) {
                          step.customAction();
                        } else {
                          onNavigateTab(step.tabTarget);
                        }
                      }}
                      className={`text-xs font-bold flex items-center space-x-1 transition-all ${
                        isSelected 
                          ? 'text-white hover:underline' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      <span>{step.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO GRID: GIÁ TRỊ VƯỢT TRỘI */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-1">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
              Tính Năng Vượt Trội
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Tại Sao Hơn 50,000+ Sinh Viên & Giảng Viên Lựa Chọn ICTC?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {valueCards.map((card, idx) => {
              const IconC = card.icon;
              return (
                <div 
                  key={idx}
                  className={`bg-white p-4.5 rounded-2xl border ${card.border} shadow-xs hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className={`p-2.5 rounded-xl w-fit ${card.bg} ${card.color}`}>
                      <IconC className="w-4.5 h-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-700 uppercase tracking-tight flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{card.stat}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMMUNITY TRUST FOOTPRINT */}
        {/* ========================================================================= */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
              Cộng Đồng Tri Thức Số Mở
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Bạn có tài liệu hay, mẫu slide đẹp muốn đóng góp cho cộng đồng?
            </h3>
            <p className="text-xs text-blue-200/90 font-medium">
              Đóng góp tài nguyên nhận ngay huy hiệu Thành viên Tích cực & mở khóa quyền lợi VIP.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenIdeaHub}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-95 flex items-center space-x-1.5 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 text-slate-950" />
              <span>Gửi ý tưởng / Tài liệu</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('contact')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              <span>Liên hệ & Hỗ trợ</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

