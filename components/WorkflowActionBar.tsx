import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Bot, Palette, Type, UploadCloud, Lightbulb, 
  Search, ShieldCheck, ArrowRight, Zap, Layers, Bookmark, CheckCircle2
} from 'lucide-react';
import { User } from '../types';

interface WorkflowActionBarProps {
  onOpenSlideGenerator: () => void;
  onOpenCopilot: () => void;
  onOpenPaletteModal: () => void;
  onOpenSearch: () => void;
  onOpenIdeaHub: () => void;
  onOpenUpload: () => void;
  onNavigateTab: (tab: 'designs' | 'prompts' | 'articles' | 'fonts' | 'photo_prompts' | 'contact' | 'profile') => void;
  currentUser: User | null;
  bookmarkedCount: number;
}

export const WorkflowActionBar: React.FC<WorkflowActionBarProps> = ({
  onOpenSlideGenerator,
  onOpenCopilot,
  onOpenPaletteModal,
  onOpenSearch,
  onOpenIdeaHub,
  onOpenUpload,
  onNavigateTab,
  currentUser,
  bookmarkedCount,
}) => {
  const workflows = [
    {
      id: 'ai-slide',
      title: 'Tạo Slide AI',
      subtitle: 'Dàn ý 10 slide chuẩn',
      icon: Sparkles,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/90 hover:bg-indigo-100/90',
      borderColor: 'border-indigo-200/80',
      badge: 'Hot AI',
      badgeColor: 'bg-indigo-600 text-white',
      action: onOpenSlideGenerator,
    },
    {
      id: 'copilot',
      title: 'Trợ Lý Copilot',
      subtitle: 'Hỏi đáp & viết học thuật',
      icon: Bot,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50/90 hover:bg-cyan-100/90',
      borderColor: 'border-cyan-200/80',
      badge: '24/7',
      badgeColor: 'bg-cyan-600 text-white',
      action: onOpenCopilot,
    },
    {
      id: 'palette',
      title: 'Bảng Màu VN',
      subtitle: 'Quy chuẩn Nhà nước & Đảng',
      icon: Palette,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/90 hover:bg-rose-100/90',
      borderColor: 'border-rose-200/80',
      badge: 'Chuẩn',
      badgeColor: 'bg-rose-600 text-white',
      action: onOpenPaletteModal,
    },
    {
      id: 'fonts',
      title: 'Font Việt Hóa',
      subtitle: '100% không lỗi dấu',
      icon: Type,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/90 hover:bg-amber-100/90',
      borderColor: 'border-amber-200/80',
      badge: 'Unicode',
      badgeColor: 'bg-amber-600 text-white',
      action: () => onNavigateTab('fonts'),
    },
    {
      id: 'upload',
      title: 'Đóng Góp File',
      subtitle: 'Chia sẻ Slide & Prompt',
      icon: UploadCloud,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/90 hover:bg-emerald-100/90',
      borderColor: 'border-emerald-200/80',
      badge: '+Điểm',
      badgeColor: 'bg-emerald-600 text-white',
      action: onOpenUpload,
    },
    {
      id: 'ideas',
      title: 'Gợi Ý Tính Năng',
      subtitle: 'Đóng góp ý tưởng mới',
      icon: Lightbulb,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/90 hover:bg-purple-100/90',
      borderColor: 'border-purple-200/80',
      badge: 'Vote',
      badgeColor: 'bg-purple-600 text-white',
      action: onOpenIdeaHub,
    }
  ];

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-4 mb-4" id="professional-workflow-bar">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs shadow-blue-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Trung Tâm Tác Vụ Chuyên Nghiệp</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                ICTC Workflow 4.0
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Truy cập nhanh các công cụ AI, chuẩn hóa thiết kế và tài nguyên học thuật chỉ với một cú click
            </p>
          </div>
        </div>

        {/* Global Shortcuts and Saved Quick Access */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenSearch}
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200/80 transition-colors cursor-pointer"
            title="Nhấn phím ⌘K hoặc click để tra cứu toàn hệ thống"
          >
            <Search className="w-3 h-3 text-slate-400" />
            <span>Tra cứu</span>
            <kbd className="px-1 py-0.2 text-[9px] bg-white border border-slate-200 rounded text-slate-500 font-mono">⌘K</kbd>
          </button>

          {currentUser && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200/80 transition-colors cursor-pointer"
              title="Xem danh sách tài nguyên đã lưu yêu thích"
            >
              <Bookmark className="w-3 h-3 text-amber-600 fill-amber-500" />
              <span>Đã lưu</span>
              <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-full text-[10px] font-black">
                {bookmarkedCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of 6 High-Impact Workflows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {workflows.map((item) => {
          const IconComp = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={item.action}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col text-left p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${item.bgColor} ${item.borderColor}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 bg-white rounded-lg shadow-xs group-hover:scale-110 transition-transform ${item.iconColor}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-500 truncate">
                {item.subtitle}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
