import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2, Download, Layers, Sparkles } from 'lucide-react';
import { DesignFile } from '../types';

interface FullscreenSlideViewerModalProps {
  design: DesignFile;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (design: DesignFile) => void;
}

export const FullscreenSlideViewerModal: React.FC<FullscreenSlideViewerModalProps> = ({
  design,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!isOpen || !design) return null;

  // Generate slide preview images or use preview image & additional screenshots
  const slides = [
    design.previewImage,
    ...(design.previewScreenshots || []),
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31b272c490?auto=format&fit=crop&w=1200&q=80'
  ].slice(0, 8); // Max 8 slides

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden text-white">
      {/* Header Toolbar */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-slate-950/90 to-transparent flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black truncate max-w-md">{design.title}</h3>
            <p className="text-xs text-slate-400 font-medium">Trình chiếu Slide Mẫu • Trang {currentIndex + 1} / {slides.length}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Tự động chiếu'}</span>
          </button>

          {onDownload && (
            <button
              onClick={() => onDownload(design)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-blue-500/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Tải Slide .PPTX</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
            title="Đóng chế độ trình chiếu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Image Container */}
      <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={slides[currentIndex]}
            alt={`Slide page ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
          />
        </AnimatePresence>

        {/* Prev / Next Arrows */}
        <button
          onClick={() => setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 p-3 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full transition-all border border-slate-700/80 shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => setCurrentIndex(prev => (prev + 1) % slides.length)}
          className="absolute right-4 p-3 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full transition-all border border-slate-700/80 shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Filmstrip */}
      <div className="absolute bottom-4 inset-x-0 px-4 flex items-center justify-center space-x-2 overflow-x-auto no-scrollbar py-2 bg-slate-950/80">
        {slides.map((img, idx) => (
          <button
            key={idx}
            onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
            className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
              idx === currentIndex ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/30' : 'border-slate-800 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`Thumb ${idx + 1}`} className="w-16 h-10 object-cover" />
            <span className="absolute bottom-0 right-0 bg-slate-950/80 px-1 text-[9px] font-bold text-slate-300">{idx + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
