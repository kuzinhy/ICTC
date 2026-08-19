import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Type, Download, Sliders, RefreshCw, Check } from 'lucide-react';
import { VietnameseFont } from '../data/vietnamFontsData';

interface FontCompareModalProps {
  fontsList: VietnameseFont[];
  isOpen: boolean;
  onClose: () => void;
  onDownloadFont?: (font: VietnameseFont) => void;
}

export const FontCompareModal: React.FC<FontCompareModalProps> = ({
  fontsList,
  isOpen,
  onClose,
  onDownloadFont
}) => {
  if (!isOpen || !fontsList.length) return null;

  const [selectedFontIds, setSelectedFontIds] = useState<string[]>([
    fontsList[0]?.id,
    fontsList[1]?.id || fontsList[0]?.id
  ]);

  const [sampleText, setSampleText] = useState('Việt Nam Thịnh Vượng • ICTC Tri Thức & Sáng Tạo');
  const [fontSize, setFontSize] = useState<number>(32);

  const selectedFonts = selectedFontIds
    .map(id => fontsList.find(f => f.id === id))
    .filter(Boolean) as VietnameseFont[];

  const handleFontSelect = (index: number, fontId: string) => {
    const updated = [...selectedFontIds];
    updated[index] = fontId;
    setSelectedFontIds(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">So sánh Font chữ Trực quan (Side-by-Side)</h3>
              <p className="text-xs text-slate-400 font-medium">Gõ thử đoạn văn bản mẫu và so sánh nét chữ giữa các bộ Font Việt hóa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 block mb-1">Đoạn văn bản gõ thử nghiệm:</label>
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Nhập văn bản hiển thị thử..."
              />
            </div>

            <div className="sm:w-48 shrink-0">
              <label className="text-xs font-bold text-slate-700 block mb-1">Cỡ chữ: {fontSize}px</label>
              <input
                type="range"
                min="18"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white min-h-[300px]">
          {[0, 1].map((colIdx) => {
            const currentFont = selectedFonts[colIdx] || fontsList[0];

            return (
              <div key={colIdx} className="bg-slate-50/80 border border-slate-200 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  {/* Selector Dropdown */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Font mẫu #{colIdx + 1}:</span>
                    <select
                      value={currentFont?.id}
                      onChange={(e) => handleFontSelect(colIdx, e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {fontsList.map(font => (
                        <option key={font.id} value={font.id}>
                          {font.name} ({font.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Font Specs */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                      {currentFont.category}
                    </span>
                    <span>• {currentFont.weights?.length || 1} kiểu nét (Weights)</span>
                  </div>

                  {/* Live Render Preview Box */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl min-h-[140px] flex items-center justify-center text-center overflow-hidden">
                    <p
                      style={{
                        fontFamily: currentFont.family,
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.3
                      }}
                      className="text-slate-900 break-words w-full"
                    >
                      {sampleText || 'Nét chữ Việt hóa chuẩn'}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{currentFont.name}</span>
                  {onDownloadFont && (
                    <button
                      onClick={() => onDownloadFont(currentFont)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Font</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
