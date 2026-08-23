import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Search, ArrowUp, Lightbulb, ChevronUp, 
  HelpCircle, Sparkles, X, Palette, Scale, PhoneCall
} from 'lucide-react';

interface MisaAmisFloatingWidgetProps {
  onOpenSearch: () => void;
  onOpenIdeaHub: () => void;
  onOpenPaletteModal: () => void;
  onOpenLegalModal: () => void;
  onOpenSlideGenerator?: () => void;
  onOpenCopilot?: () => void;
}

export const MisaAmisFloatingWidget: React.FC<MisaAmisFloatingWidgetProps> = ({
  onOpenSearch,
  onOpenIdeaHub,
  onOpenPaletteModal,
  onOpenLegalModal,
  onOpenSlideGenerator,
  onOpenCopilot,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex flex-col items-end space-y-2.5 select-none">
      {/* Expanded Quick Action Tool Menu */}
      {isMenuOpen && (
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xl space-y-1 w-56 animate-fade-in text-slate-800">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Tiện ích nhanh</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-0.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {onOpenCopilot && (
            <button
              type="button"
              onClick={() => {
                onOpenCopilot();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-800 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 rounded-xl transition-colors text-left cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-600 animate-pulse" />
              <span>ICTC Copilot (Hỏi đáp)</span>
            </button>
          )}

          {onOpenSlideGenerator && (
            <button
              type="button"
              onClick={() => {
                onOpenSlideGenerator();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-800 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors text-left cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Tạo đề cương Slide AI</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onOpenSearch();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors text-left cursor-pointer"
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span>Tìm kiếm toàn cục (⌘K)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenIdeaHub();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-colors text-left cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Gửi ý tưởng mới</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenPaletteModal();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors text-left cursor-pointer"
          >
            <Palette className="w-4 h-4 text-rose-500" />
            <span>Bảng màu chuẩn VN</span>
          </button>

          <a
            href="https://zalo.me/g/kovwak924"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span>Zalo Cộng đồng ICTC</span>
          </a>
        </div>
      )}

      {/* Floating Buttons Group */}
      <div className="flex items-center space-x-2">
        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-full border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ChevronUp className="w-5 h-5 text-slate-600" />
          </button>
        )}

        {/* Quick Menu Toggle CTA (MISA AMIS Style) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-3.5 rounded-full text-white shadow-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center relative ${
            isMenuOpen 
              ? 'bg-slate-900 shadow-slate-900/40' 
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-600/40 hover:from-blue-700 hover:to-indigo-700'
          }`}
          title="Mở menu hỗ trợ và tiện ích nhanh"
          aria-label="Tiện ích hỗ trợ"
        >
          {isMenuOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
