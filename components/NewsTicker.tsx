import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, ChevronRight, ChevronLeft, Clock, Eye, Sparkles, 
  BookOpen, ArrowRight, Play, Pause, Bell, Compass
} from 'lucide-react';
import { Article } from '../types';

interface NewsTickerProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onNavigateArticlesTab?: () => void;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ 
  articles, 
  onSelectArticle,
  onNavigateArticlesTab
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter published articles
  const publishedArticles = articles.filter(a => a.status === 'Published');
  const activeArticles = publishedArticles.length > 0 ? publishedArticles : articles;

  // Auto rotate every 4.5 seconds unless paused
  useEffect(() => {
    if (isPaused || activeArticles.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeArticles.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, activeArticles.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activeArticles.length) % activeArticles.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeArticles.length);
  };

  if (activeArticles.length === 0) return null;

  const current = activeArticles[currentIndex] || activeArticles[0];

  return (
    <div className="w-full p-[1.5px] rounded-2xl google-studio-border google-studio-glow overflow-hidden relative group transition-all duration-300">
      {/* Inner background container with modern diffused blue gradient (xanh dương loan màu hiện đại) */}
      <div className="w-full h-full bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-[calc(1rem-1.5px)] backdrop-blur-xl overflow-hidden relative">
        {/* Modern diffused blue ambient glow lights */}
        <div className="absolute -top-10 -left-10 w-56 h-56 bg-blue-400/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-cyan-400/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

        <div 
          className="px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Left: Animated Badge & Ticker Content */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            
            {/* Pulsing Hot Badge with Google AI Studio styling */}
            <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/30 border border-white/20">
              <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">Bài viết mới</span>
              <span className="sm:hidden">Mới</span>
            </div>

            {/* Active Article Preview Item (Clickable) */}
            <div 
              onClick={() => onSelectArticle(current)}
              className="flex items-center space-x-2.5 flex-1 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              role="button"
              tabIndex={0}
            >
              {/* Category tag */}
              <span className="shrink-0 hidden lg:inline-flex px-2 py-0.5 bg-cyan-400/20 text-cyan-200 border border-cyan-300/30 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                {current.category}
              </span>

              {/* Title with smooth sliding transition */}
              <p className="text-xs sm:text-sm font-bold text-white truncate transition-all duration-300 hover:text-cyan-200">
                {current.title}
              </p>

              {/* Read time pill */}
              <div className="shrink-0 hidden md:flex items-center space-x-1 text-[11px] text-blue-100 font-medium bg-white/15 px-2 py-0.5 rounded-md border border-white/10">
                <Clock className="w-3 h-3 text-cyan-300" />
                <span>{current.readTimeMinutes} phút đọc</span>
              </div>
            </div>
          </div>

          {/* Right: Controls & Call to action */}
          <div className="flex items-center justify-between md:justify-end space-x-2 shrink-0 border-t md:border-t-0 border-white/15 pt-2 md:pt-0">
            
            {/* Quick item counter & indicators */}
            <div className="flex items-center space-x-1 px-2 text-[10px] text-blue-200 font-mono font-bold">
              <span>{currentIndex + 1}</span>
              <span className="text-blue-300/60">/</span>
              <span>{activeArticles.length}</span>
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrev}
                className="p-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-lg transition-colors border border-white/15"
                title="Bài trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-lg transition-colors border border-white/15"
                title="Bài tiếp theo"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Direct Read CTA Button with Google gradient shimmer */}
            <button
              onClick={() => onSelectArticle(current)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/30 border border-white/20"
            >
              <span>Đọc ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* View Hub Tab CTA */}
            {onNavigateArticlesTab && (
              <button
                onClick={onNavigateArticlesTab}
                className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-colors border border-white/15"
                title="Xem tất cả bài viết & chuyên mục"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tất cả bài</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
