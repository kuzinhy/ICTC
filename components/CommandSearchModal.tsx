import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, FileText, Sparkles, BookOpen, ExternalLink, 
  ArrowRight, Download, Eye, Heart, Tag, Command
} from 'lucide-react';
import { DesignFile, AIPrompt, Article } from '../types';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  designFiles: DesignFile[];
  aiPrompts: AIPrompt[];
  articles: Article[];
  onSelectDesign: (file: DesignFile) => void;
  onSelectPrompt: (prompt: AIPrompt) => void;
  onSelectArticle: (article: Article) => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({
  isOpen,
  onClose,
  designFiles,
  aiPrompts,
  articles,
  onSelectDesign,
  onSelectPrompt,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<'all' | 'designs' | 'prompts' | 'articles'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const matchedDesigns = cleanQuery
    ? designFiles.filter(d => 
        d.title.toLowerCase().includes(cleanQuery) || 
        d.category.toLowerCase().includes(cleanQuery) ||
        d.tags.some(t => t.toLowerCase().includes(cleanQuery))
      )
    : designFiles.slice(0, 4);

  const matchedPrompts = cleanQuery
    ? aiPrompts.filter(p => 
        p.title.toLowerCase().includes(cleanQuery) || 
        p.category.toLowerCase().includes(cleanQuery) ||
        p.tags.some(t => t.toLowerCase().includes(cleanQuery))
      )
    : aiPrompts.slice(0, 4);

  const matchedArticles = cleanQuery
    ? articles.filter(a => 
        a.title.toLowerCase().includes(cleanQuery) || 
        a.category.toLowerCase().includes(cleanQuery) ||
        a.tags.some(t => t.toLowerCase().includes(cleanQuery))
      )
    : articles.slice(0, 4);

  const totalResults = matchedDesigns.length + matchedPrompts.length + matchedArticles.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm tài liệu slide, prompt AI, bài viết hoặc từ khóa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-slate-900 text-sm sm:text-base font-semibold focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 text-slate-400 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-xs"
          >
            ESC
          </button>
        </div>

        {/* Filter Badges */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveType('all')}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              activeType === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({totalResults})
          </button>
          <button
            onClick={() => setActiveType('designs')}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              activeType === 'designs' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mẫu Slide & UI ({matchedDesigns.length})
          </button>
          <button
            onClick={() => setActiveType('prompts')}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              activeType === 'prompts' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            AI Prompts ({matchedPrompts.length})
          </button>
          <button
            onClick={() => setActiveType('articles')}
            className={`px-3 py-1 rounded-xl font-bold transition-colors ${
              activeType === 'articles' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bài viết ({matchedArticles.length})
          </button>
        </div>

        {/* Scrollable Results */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Articles Section */}
          {(activeType === 'all' || activeType === 'articles') && matchedArticles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase text-blue-600 tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bài viết & Tin tức ({matchedArticles.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      onClose();
                      onSelectArticle(art);
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-150 hover:border-blue-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {art.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {art.category} • {art.readTimeMinutes} phút đọc • {art.publishedAt}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Design Files Section */}
          {(activeType === 'all' || activeType === 'designs') && matchedDesigns.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase text-indigo-600 tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Mẫu Thiết Kế Slide & UI ({matchedDesigns.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedDesigns.map((des) => (
                  <div
                    key={des.id}
                    onClick={() => {
                      onClose();
                      onSelectDesign(des);
                    }}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/80 border border-slate-150 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src={des.previewUrl} alt={des.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {des.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {des.category} • {des.fileType} • {des.downloadsCount} lượt tải
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompts Section */}
          {(activeType === 'all' || activeType === 'prompts') && matchedPrompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-black uppercase text-purple-600 tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompts & Câu Lệnh ({matchedPrompts.length})</span>
              </div>
              <div className="space-y-1.5">
                {matchedPrompts.map((prm) => (
                  <div
                    key={prm.id}
                    onClick={() => {
                      onClose();
                      onSelectPrompt(prm);
                    }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/80 border border-slate-150 hover:border-purple-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img src={prm.previewImageUrl} alt={prm.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                          {prm.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {prm.toolType} • {prm.category} • {prm.likesCount} tim
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Không tìm thấy tài nguyên nào phù hợp</p>
              <p className="text-[11px] text-slate-400">Thử tìm kiếm với từ khóa ngắn gọn hơn như "slide", "poster", "AI", "midjourney"...</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Nhấn <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] font-bold text-slate-600">ESC</kbd> để đóng cửa sổ tìm kiếm</span>
          <span>ICTC Intelligent Search</span>
        </div>

      </div>
    </div>
  );
};
