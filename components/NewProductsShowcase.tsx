import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, ExternalLink, Star, FileText, ArrowRight, 
  Clock, Tag, Eye, Layers, ShieldCheck, Flame, ChevronRight, Lock
} from 'lucide-react';
import { DesignFile, User } from '../types';
import { INITIAL_DESIGN_FILES, DRIVE_DESIGN_FOLDER } from '../data/mockData';
import { saveDesignToDb } from '../lib/db';

interface NewProductsShowcaseProps {
  designFiles?: DesignFile[];
  currentUser?: User | null;
  onSelectFile?: (file: DesignFile) => void;
  onNavigateDesignHub?: () => void;
  onRequireAuth?: (reason?: string) => void;
  variant?: 'banner' | 'sidebar' | 'grid';
}

export const NewProductsShowcase: React.FC<NewProductsShowcaseProps> = ({
  designFiles,
  currentUser,
  onSelectFile,
  onNavigateDesignHub,
  onRequireAuth,
  variant = 'grid'
}) => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

  useEffect(() => {
    if (designFiles && designFiles.length > 0) {
      setFiles(designFiles);
    } else {
      const saved = localStorage.getItem('ictc_design_files');
      if (saved) {
        try {
          setFiles(JSON.parse(saved));
        } catch (e) {
          setFiles(INITIAL_DESIGN_FILES);
        }
      } else {
        setFiles(INITIAL_DESIGN_FILES);
      }
    }
  }, [designFiles]);

  const handleDownload = (e: React.MouseEvent, file: DesignFile) => {
    e.stopPropagation();

    // Security check: Only members can download
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập hoặc đăng ký tài khoản thành viên miễn phí để tải file thiết kế này!');
      }
      return;
    }

    const updatedCount = (file.downloadsCount || 0) + 1;
    const updatedItem = { ...file, downloadsCount: updatedCount };
    
    // Save to DB
    saveDesignToDb(updatedItem).catch(console.warn);

    // Save to localStorage
    const saved = localStorage.getItem('ictc_design_files');
    if (saved) {
      try {
        const list = JSON.parse(saved) as DesignFile[];
        const updatedList = list.map(f => f.id === file.id ? updatedItem : f);
        localStorage.setItem('ictc_design_files', JSON.stringify(updatedList));
      } catch (e) {}
    }

    setFiles(prev => prev.map(f => f.id === file.id ? updatedItem : f));

    // Open link
    const targetUrl = file.driveUrl || DRIVE_DESIGN_FOLDER;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = (file: DesignFile) => {
    if (onSelectFile) {
      onSelectFile(file);
    } else if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập thành viên để xem chi tiết và tải file thiết kế này!');
      }
    } else {
      window.open(file.driveUrl, '_blank');
    }
  };

  // Sort files by newest creation date
  const sortedFiles = [...files].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime() || 0;
    const dateB = new Date(b.createdAt).getTime() || 0;
    return dateB - dateA;
  });

  const categories = ['Tất cả', 'PowerPoint Templates', 'UI/UX Kits', 'Poster & Infographics', 'Canva Templates'];

  const filteredFiles = activeCategory === 'Tất cả' 
    ? sortedFiles 
    : sortedFiles.filter(f => f.category === activeCategory);

  // Sidebar variant: Compact vertical list
  if (variant === 'sidebar') {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-lg text-white shadow-xs">
              <Flame className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">File Thiết Kế Mới</h4>
              <p className="text-[10px] text-slate-400 font-medium">Vừa được đăng tải & cập nhật</p>
            </div>
          </div>
          {onNavigateDesignHub && (
            <button
              onClick={onNavigateDesignHub}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center group"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sortedFiles.slice(0, 4).map((file) => (
            <div
              key={file.id}
              onClick={() => handleCardClick(file)}
              className="group flex items-center space-x-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                <img 
                  src={file.previewUrl} 
                  alt={file.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-0.5 right-0.5 px-1 py-0.2 bg-rose-500 text-white text-[8px] font-black rounded uppercase">
                  MỚI
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded">
                    {file.fileType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {file.fileSize}
                  </span>
                  {!currentUser && (
                    <span className="text-[9px] text-amber-600 flex items-center" title="Yêu cầu đăng nhập">
                      <Lock className="w-2.5 h-2.5 ml-0.5" />
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                  {file.title}
                </h5>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <span className="truncate max-w-[90px]">{file.author}</span>
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                    {file.rating || 5.0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid/Banner full showcase
  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-50/70 to-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-xl border border-blue-100/80 space-y-6 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-xs flex items-center space-x-1">
              <Flame className="w-3 h-3 fill-white" />
              <span>Sản phẩm & File thiết kế mới</span>
            </span>
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Cập nhật liên tục 24/7
            </span>
            {!currentUser && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 border border-amber-400/30 text-[10px] font-bold rounded-md flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Thành viên mở khóa tải</span>
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Tài nguyên & Sản phẩm vừa đăng tải
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl font-medium mt-0.5">
            Các file PowerPoint đồ án, bộ UI/UX Figma, poster và tài liệu khoa học mới nhất từ ban quản trị và cộng đồng.
          </p>
        </div>

        {onNavigateDesignHub && (
          <button
            onClick={onNavigateDesignHub}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-95 text-blue-700 text-xs font-bold rounded-xl border border-blue-100 transition-all shadow-xs shrink-0 group"
          >
            <span>Đến Thư viện Thiết kế</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {filteredFiles.slice(0, 4).map((file) => (
          <div
            key={file.id}
            onClick={() => handleCardClick(file)}
            className="group bg-white hover:bg-blue-50/10 border border-slate-200/80 hover:border-blue-400/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:shadow-blue-500/5 cursor-pointer"
          >
            {/* Image Preview Box */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-200/60">
              <img 
                src={file.previewUrl} 
                alt={file.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex items-center space-x-1">
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded-md uppercase shadow-xs">
                  Mới
                </span>
                <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[9px] font-bold rounded-md">
                  {file.fileType}
                </span>
              </div>

              {!currentUser && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/95 text-white text-[9px] font-bold rounded-md flex items-center space-x-1 shadow-xs">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Thành viên</span>
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-slate-200 font-semibold">
                <span>{file.fileSize}</span>
                <span className="flex items-center text-amber-400 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                  <Star className="w-2.5 h-2.5 fill-amber-400 mr-1" />
                  {file.rating || 5.0}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wide block">
                  {file.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {file.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {file.description}
                </p>
              </div>

              {/* Action and Download Stats */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                <div className="text-[10px] text-slate-400">
                  <span>{file.downloadsCount?.toLocaleString() || 0} lượt tải</span>
                </div>

                <button
                  onClick={(e) => handleDownload(e, file)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs ${
                    currentUser 
                      ? 'bg-blue-600 hover:bg-blue-500' 
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                  title={currentUser ? "Tải về file thiết kế này" : "Đăng nhập thành viên để tải về"}
                >
                  {currentUser ? <Download className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  <span>{currentUser ? 'Tải về' : 'Tải file (Khóa)'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
