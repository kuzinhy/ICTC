import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, X, MessageSquare, Search, ArrowRight, FolderOpen, 
  Type, BookOpen, Palette, ShieldCheck, Zap, Check, HelpCircle,
  Lightbulb, Compass, Award, ExternalLink
} from 'lucide-react';
import { DesignFile, AIPrompt, Article, VietnameseFont } from '../types';

interface AcademicCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'designs' | 'prompts' | 'articles' | 'fonts' | 'photo_prompts' | 'contact' | 'profile') => void;
  onOpenSlideGenerator: () => void;
  onOpenPaletteModal: () => void;
  onOpenLegalModal: () => void;
  onShowToast: (msg: string) => void;
}

interface CopilotQuickPrompt {
  id: string;
  icon: any;
  category: string;
  question: string;
  answer: string;
  actionText: string;
  actionType: 'navigate' | 'modal' | 'slide_gen';
  targetTab?: 'designs' | 'prompts' | 'articles' | 'fonts';
  targetModal?: 'palette' | 'legal';
}

export const AcademicCopilotModal: React.FC<AcademicCopilotModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSlideGenerator,
  onOpenPaletteModal,
  onOpenLegalModal,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<CopilotQuickPrompt | null>(null);

  const copilotKnowledgeBase: CopilotQuickPrompt[] = [
    {
      id: 'slide-nckh',
      icon: FolderOpen,
      category: 'Soạn Slide Báo Cáo',
      question: 'Làm thế nào để soạn Slide Báo cáo Khóa luận / NCKH đạt điểm A+?',
      answer: 'Cấu trúc chuẩn gồm 10-12 slide: (1) Tiêu đề & Tác giả -> (2) Đặt vấn đề -> (3) Mục tiêu nghiên cứu -> (4) Phương pháp luận (Định tính/Định lượng) -> (5) Mô hình / Kiến trúc -> (6-7) Kết quả thực nghiệm -> (8) Thảo luận & Tính mới -> (9) Hạn chế & Hướng phát triển -> (10) Lời cảm ơn. Bạn nên dùng font không chân (Be Vietnam Pro) và tỷ lệ 16:9.',
      actionText: 'Tạo đề cương Slide với AI',
      actionType: 'slide_gen'
    },
    {
      id: 'prompt-gemini',
      icon: Sparkles,
      category: 'AI Prompts Học Thuật',
      question: 'Prompt nào tối ưu nhất để viết Tổng quan tài liệu (Literature Review)?',
      answer: 'Sử dụng cấu trúc 4 bước: (1) Định nghĩa vai trò chuyên gia -> (2) Cung cấp chủ đề & từ khóa -> (3) Yêu cầu tổng hợp theo ma trận tác giả - năm - phương pháp - kết quả chính -> (4) Chỉ rõ định dạng trích dẫn APA 7th. Tránh dùng AI để tạo nguồn ảo.',
      actionText: 'Khám phá Kho Prompt Học thuật',
      actionType: 'navigate',
      targetTab: 'prompts'
    },
    {
      id: 'font-vietnam',
      icon: Type,
      category: 'Font Chữ Việt Hóa',
      question: 'Những font chữ nào đẹp, không bao giờ bị lỗi dấu tiếng Việt?',
      answer: 'Khuyên dùng 3 bộ font tiêu chuẩn quốc gia: Be Vietnam Pro (chuẩn văn bản hiện đại), Montserrat Việt hóa (chuẩn tiêu đề & slide công nghệ) và Playfair Display Việt hóa (chuẩn bằng khen, chứng chỉ, bài học thuật trang trọng).',
      actionText: 'Xem Bảng Font Chữ Việt Hóa',
      actionType: 'navigate',
      targetTab: 'fonts'
    },
    {
      id: 'doan-hoi-brand',
      icon: Palette,
      category: 'Quy Chuẩn Đoàn - Hội',
      question: 'Màu cờ đỏ sao vàng và biểu trưng Đoàn TNCS Hồ Chí Minh có mã hex chuẩn là gì?',
      answer: 'Màu Đỏ Cờ chuẩn: #DA251D (CMYK: 0, 100, 100, 0), Vàng Sao chuẩn: #FFFF00 (CMYK: 0, 0, 100, 0), Xanh Thanh Niên Đoàn: #005BAA. Tỷ lệ ngôi sao vàng bằng 2/5 chiều dài lá cờ.',
      actionText: 'Mở Bảng Màu Chuẩn Nhà Nước',
      actionType: 'modal',
      targetModal: 'palette'
    },
    {
      id: 'copyright-rules',
      icon: ShieldCheck,
      category: 'Bản Quyền & Trích Nguồn',
      question: 'Tài nguyên trên ICTC được cấp phép theo quy định nào?',
      answer: 'Tất cả slide, bài viết và prompt trên ICTC phát hành theo giấy phép Creative Commons CC BY-NC-SA 4.0 (Ghi nhận tác giả - Phi thương mại - Chia sẻ tương tự). Bạn được tự do tải về và tái sử dụng cho mục đích học tập phi lợi nhuận.',
      actionText: 'Xem Quy chế Bản quyền & Đạo đức AI',
      actionType: 'modal',
      targetModal: 'legal'
    }
  ];

  const filteredItems = copilotKnowledgeBase.filter(item => 
    !searchQuery || 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (item: CopilotQuickPrompt) => {
    onClose();
    if (item.actionType === 'slide_gen') {
      onOpenSlideGenerator();
    } else if (item.actionType === 'navigate' && item.targetTab) {
      onNavigateTab(item.targetTab);
    } else if (item.actionType === 'modal') {
      if (item.targetModal === 'palette') onOpenPaletteModal();
      if (item.targetModal === 'legal') onOpenLegalModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between border-b border-blue-600/30 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base sm:text-lg tracking-tight">ICTC Academic Copilot</h3>
                <span className="px-2 py-0.5 bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 text-[10px] font-black uppercase rounded-full">
                  Trợ Lý Học Thuật AI
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                Tra cứu hướng dẫn, giải đáp quy chuẩn bài giảng, prompt và phương pháp học thuật
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

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Fast Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hỏi trợ lý về soạn slide, quy chuẩn font chữ, prompt AI, trích dẫn APA..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all shadow-xs"
            />
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-slate-500 shrink-0">Chủ đề gợi ý:</span>
            {[
              'Soạn Slide NCKH',
              'Prompt Viết Tiểu Luận',
              'Font Chữ Không Lỗi',
              'Bảng Màu Chuẩn VN',
              'Quy Chế Bản Quyền'
            ].map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold rounded-full whitespace-nowrap transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Knowledge Cards Stream */}
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const IconC = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 bg-slate-50/80 hover:bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0">
                        <IconC className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {item.question}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-1">
                    {item.answer}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Nguồn: Quy chuẩn ICTC Academic</span>
                    <button
                      onClick={() => handleAction(item)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Chưa tìm thấy câu trả lời phù hợp</p>
                <p className="text-xs text-slate-500">Bạn có thể tạo slide trực tiếp hoặc tham gia nhóm Zalo để nhận trợ giúp từ đội ngũ Admin.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSlideGenerator();
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Mở Bộ Tạo Slide AI
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
