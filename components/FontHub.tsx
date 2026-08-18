import React, { useState, useEffect } from 'react';
import { 
  Type, Search, Download, Copy, Check, Sparkles, ExternalLink, 
  Layers, Sliders, RefreshCw, Bookmark, ArrowUpRight, HelpCircle,
  FileText, ShieldCheck, Tag, Eye, Heart, Palette, Plus, Code,
  FolderPlus, HardDrive, Share2, Grid, List, Moon, Sun, Flag
} from 'lucide-react';
import { 
  VIETNAMESE_FONTS_DATA, GOOGLE_RESOURCES_DATA, FONT_CATEGORIES, 
  VietnameseFont, GoogleResourceItem 
} from '../data/vietnamFontsData';
import { DRIVE_DESIGN_FOLDER } from '../data/constants';
import { FontUploadModal } from './FontUploadModal';
import { ReportViolationModal } from './ReportViolationModal';
import { fetchFontsFromDb, saveFontToDb } from '../lib/db';
import { User, SystemConfig } from '../types';

interface FontHubProps {
  currentUser?: User | null;
  systemConfig?: SystemConfig;
  onRequireAuth?: (reason?: string) => void;
}

const SAMPLE_TEXT_PRESETS = [
  'Việt Nam Đất Nước Rồng Tiên - Tự Do & Hạnh Phúc 2026',
  'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
  'ĐẠI HỘI ĐẢNG BỘ CƠ SỞ NHIỆM KỲ 2025 - 2030',
  'Lễ Kỷ Niệm 50 Năm Ngày Thành Lập & Phát Triển',
  'Chúc Mừng Năm Mới - An Khang Thịnh Vượng - Vạn Sự Như Ý',
  'Nền tảng Công nghệ Đổi mới Sáng tạo & Chuyển đổi số Quốc gia',
  'RÈN LUYỆN THÂN THỂ - BẢO VỆ TỔ QUỐC - XÂY DỰNG ĐẤT NƯỚC',
  'const innovate = async () => { await deploySystem("Vietnam-AI"); };'
];

export const FontHub: React.FC<FontHubProps> = ({ 
  currentUser, 
  systemConfig, 
  onRequireAuth 
}) => {
  const [fontsList, setFontsList] = useState<VietnameseFont[]>(VIETNAMESE_FONTS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [sampleText, setSampleText] = useState('Việt Nam Đất Nước Rồng Tiên - Tự Do & Hạnh Phúc 2026');
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontWeight, setFontWeight] = useState<string>('normal');
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [isDarkPreview, setIsDarkPreview] = useState<boolean>(false);
  const [copiedFontId, setCopiedFontId] = useState<string | null>(null);
  const [copiedCdnId, setCopiedCdnId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fonts' | 'google-resources'>('fonts');
  const [selectedFontForCdn, setSelectedFontForCdn] = useState<VietnameseFont | null>(null);
  const [reportingItem, setReportingItem] = useState<{ id: string; title: string } | null>(null);

  // Load fonts from storage / DB on mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const stored = localStorage.getItem('ictc_vietnamese_fonts');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setFontsList(parsed);
            }
          } catch (e) {}
        }
        const dbFonts = await fetchFontsFromDb();
        if (dbFonts && dbFonts.length > 0) {
          setFontsList(dbFonts);
          localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(dbFonts));
        }
      } catch (err) {
        console.warn("Using offline Vietnamese fonts database");
      }
    };
    loadFonts();
  }, []);

  // Dynamically load Google Fonts stylesheets into document.head so all preview specimens render accurately
  useEffect(() => {
    const googleFontFamiliesToLoad = fontsList
      .filter(f => f.googleFontFamily)
      .map(f => f.googleFontFamily)
      .join('&family=');

    if (googleFontFamiliesToLoad) {
      const linkId = 'ictc-dynamic-google-fonts';
      let existingLink = document.getElementById(linkId) as HTMLLinkElement | null;
      
      const fullHref = `https://fonts.googleapis.com/css2?family=${googleFontFamiliesToLoad}&display=swap`;
      
      if (!existingLink) {
        existingLink = document.createElement('link');
        existingLink.id = linkId;
        existingLink.rel = 'stylesheet';
        existingLink.href = fullHref;
        document.head.appendChild(existingLink);
      } else if (existingLink.href !== fullHref) {
        existingLink.href = fullHref;
      }
    }
  }, [fontsList]);

  // Filter fonts
  const filteredFonts = fontsList.filter(font => {
    const matchesSearch = 
      font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.bestFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesCategory = true;
    if (selectedCategory === 'Tất cả') {
      matchesCategory = true;
    } else if (selectedCategory === 'Google Fonts') {
      matchesCategory = !!font.isGoogleFont;
    } else {
      matchesCategory = font.category === selectedCategory;
    }

    return matchesSearch && matchesCategory;
  });

  const handleCopyCss = (font: VietnameseFont) => {
    const cssRule = `font-family: ${font.fontFamily};`;
    navigator.clipboard.writeText(cssRule);
    setCopiedFontId(font.id);
    setTimeout(() => setCopiedFontId(null), 2000);
  };

  const handleCopyGoogleCdn = (font: VietnameseFont, type: 'link' | 'import') => {
    if (!font.googleFontFamily) {
      handleCopyCss(font);
      return;
    }
    const snippet = type === 'link'
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link href="https://fonts.googleapis.com/css2?family=${font.googleFontFamily}&display=swap" rel="stylesheet">`
      : `@import url('https://fonts.googleapis.com/css2?family=${font.googleFontFamily}&display=swap');`;

    navigator.clipboard.writeText(snippet);
    setCopiedCdnId(`${font.id}-${type}`);
    setTimeout(() => setCopiedCdnId(null), 2000);
  };

  const handleAddNewFont = (newFont: VietnameseFont) => {
    const updated = [newFont, ...fontsList.filter(f => f.id !== newFont.id)];
    setFontsList(updated);
    localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(updated));
    saveFontToDb(newFont).catch(e => console.warn('Could not sync to cloud db:', e));
  };

  const driveFontFolderUrl = systemConfig?.driveFontFolder || systemConfig?.sharedUploadDriveUrl || DRIVE_DESIGN_FOLDER;

  return (
    <div className="space-y-8 animate-fade-in" id="font-hub-root">
      
      {/* Header Banner - Kho Font Việt Hóa Chuẩn & Google Fonts */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-cyan-300 border border-white/20">
              <Type className="w-3.5 h-3.5" />
              <span>Typography Tiếng Việt • Hệ Sinh Thái Google Fonts Đầy Đủ Dấu Chuẩn</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Thư Viện Font Chữ Việt Hóa & Tài Nguyên Mở Google
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
              Tuyển tập trọn bộ các dòng font chữ Việt hóa chuẩn mực từ Google Fonts, UTM, SVN, UVN dành cho thiết kế phông sân khấu hội nghị, băng rôn khẩu hiệu, văn bản hành chính quy phạm, thiệp mời vinh danh và slide thuyết trình chuyên nghiệp.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-slate-200">
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Khắc phục lỗi gõ dấu tiếng Việt</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Toàn bộ Font Việt Hóa Google & Open Source</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl backdrop-blur-xs border border-white/10">
                <HardDrive className="w-4 h-4 text-cyan-300" />
                <span>Lưu trữ đồng bộ Google Drive</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 z-10">
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Vui lòng đăng nhập để thêm và đóng góp Font chữ vào kho Google Drive của hệ thống.');
                  return;
                }
                setIsUploadModalOpen(true);
              }}
              className="flex items-center justify-center px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-600/30 active:scale-95 border border-emerald-400/30"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[3]" />
              Thêm Font Mới
            </button>

            <button
              onClick={() => setIsGuideOpen(!isGuideOpen)}
              className="flex items-center justify-center px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-sm rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm"
            >
              <HelpCircle className="w-4 h-4 mr-2 text-cyan-300" />
              Hướng dẫn cài đặt
            </button>

            <a
              href={driveFontFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-extrabold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Download className="w-4 h-4 mr-2 text-white" />
              Thư mục Font Drive (.ZIP)
            </a>
          </div>
        </div>
      </div>

      {/* Main Switcher: Kho Font Chữ vs Hệ Sinh Thái Tài Nguyên Mở Google */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'fonts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Thư Viện Font Chữ Việt Hóa ({fontsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('google-resources')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'google-resources'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Nguồn Tài Nguyên Mở Google ({GOOGLE_RESOURCES_DATA.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-slate-500">
          <HardDrive className="w-4 h-4 text-blue-600" />
          <span>Thư mục Drive: <a href={driveFontFolderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ICTC_FONTS</a></span>
        </div>
      </div>

      {/* Guide Collapse Box */}
      {isGuideOpen && (
        <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Hướng dẫn cài đặt và sử dụng Font tiếng Việt chuẩn xác không bị lỗi dấu</span>
            </h3>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Đóng
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-[10px] uppercase">1. Windows / macOS</span>
              <h4 className="font-bold text-slate-900 text-sm">Cài trực tiếp vào hệ thống</h4>
              <p className="text-slate-600 leading-relaxed">
                Tải file font định dạng <strong>.TTF</strong> hoặc <strong>.OTF</strong> về máy, nhấp chuột phải chọn <strong>"Install for all users"</strong> (Windows) hoặc mở Font Book chọn <strong>"Install Font"</strong> (macOS).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 font-bold rounded text-[10px] uppercase">2. Bộ gõ Unikey / EVKey</span>
              <h4 className="font-bold text-slate-900 text-sm">Chọn đúng bảng mã bộ gõ</h4>
              <p className="text-slate-600 leading-relaxed">
                • Font Google Fonts, UTM, SVN: Dùng <strong>Unicode dựng sẵn</strong>.<br />
                • Font bắt đầu bằng VNI-: Dùng bảng mã <strong>VNI Windows</strong>.<br />
                • Font bắt đầu bằng .VN: Dùng bảng mã <strong>TCVN3 (ABC)</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] uppercase">3. Web & Canva Pro</span>
              <h4 className="font-bold text-slate-900 text-sm">Nhúng Web hoặc Tải lên Canva</h4>
              <p className="text-slate-600 leading-relaxed">
                Trong Canva Pro: vào <strong>Bộ thương hiệu → Tải lên phông chữ</strong>. Trong Website: nhấp <strong>"Mã Nhúng Web"</strong> để copy cú pháp &lt;link&gt; hoặc @import đưa vào trang web.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FONTS TYPOGRAPHY HUB */}
      {activeTab === 'fonts' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* INTERACTIVE TYPOGRAPHY TESTER CONTROL BAR */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              
              {/* Sample Text Input */}
              <div className="flex-1 w-full space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thử nghiệm trực quan dấu tiếng Việt (Gõ câu bất kỳ):</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    placeholder="Nhập câu tiếng Việt bất kỳ để kiểm tra hiển thị dấu..."
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-all"
                  />
                  {sampleText && (
                    <button
                      onClick={() => setSampleText('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Tool Controls: Size, Weight, Dark/Light */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                
                {/* Font Size Slider */}
                <div className="w-44 space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Sliders className="w-3 h-3 text-blue-600" />
                      <span>Cỡ chữ:</span>
                    </span>
                    <span className="font-mono text-blue-600">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="60"
                    step="2"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Font Weight Selector */}
                <div className="space-y-1 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block px-1">Độ Đậm</label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="300">Light 300</option>
                    <option value="normal">Regular 400</option>
                    <option value="600">SemiBold 600</option>
                    <option value="bold">Bold 700</option>
                    <option value="900">Black 900</option>
                  </select>
                </div>

                {/* Dark/Light Specimen Invert Toggle */}
                <button
                  onClick={() => setIsDarkPreview(!isDarkPreview)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDarkPreview 
                      ? 'bg-slate-900 text-yellow-400 border-slate-800 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                  }`}
                  title="Đổi nền sáng/tối thử nghiệm font"
                >
                  {isDarkPreview ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pr-2">Gợi ý mẫu:</span>
              {SAMPLE_TEXT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSampleText(preset)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200/60"
                >
                  {preset.length > 30 ? preset.slice(0, 30) + '...' : preset}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY TABS & SEARCH BAR */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category tabs */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs w-full md:w-auto overflow-x-auto no-scrollbar flex gap-1">
              {FONT_CATEGORIES.map(category => {
                const count = category === 'Tất cả' 
                  ? fontsList.length 
                  : category === 'Google Fonts'
                    ? fontsList.filter(f => f.isGoogleFont).length
                    : fontsList.filter(f => f.category === category).length;
                const isSelected = selectedCategory === category;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                        : 'bg-slate-50/70 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm tên font, tác giả, tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold placeholder-slate-400 shadow-xs"
              />
            </div>
          </div>

          {/* FONT CARDS LIST */}
          <div className="space-y-6">
            {filteredFonts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <Type className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-800 font-bold">Không tìm thấy font chữ nào phù hợp</p>
                <p className="text-slate-400 text-xs mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
              </div>
            ) : (
              filteredFonts.map((font) => {
                const displayText = sampleText.trim() || font.previewSample;
                
                return (
                  <div
                    key={font.id}
                    className={`border rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden p-6 sm:p-8 space-y-6 ${
                      font.isPinned ? 'border-blue-300 bg-gradient-to-b from-blue-50/20 to-white ring-1 ring-blue-200/50' : 'border-slate-200/90 bg-white'
                    }`}
                  >
                    {/* Top Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            {font.name}
                          </h3>
                          
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold rounded-lg uppercase">
                            {font.category}
                          </span>

                          {font.isGoogleFont && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-lg flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Google Fonts</span>
                            </span>
                          )}

                          {font.isPinned && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded-lg">
                              ★ Nổi bật
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          Tác giả/Việt hóa: <strong className="text-slate-700 font-semibold">{font.creator}</strong> • Bảng mã: <strong className="text-slate-700 font-semibold">{font.encoding}</strong> • Biến thể: <span className="text-indigo-600 font-bold">{font.weight}</span> • Bản quyền: <span className="text-emerald-600 font-bold">{font.license}</span>
                        </p>
                      </div>

                      {/* Actions Right */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        
                        {/* CDN / Link generator modal trigger */}
                        {font.googleFontFamily && (
                          <button
                            onClick={() => setSelectedFontForCdn(font)}
                            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-indigo-200/80"
                            title="Lấy mã nhúng CDN Google Fonts"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Mã Nhúng Web</span>
                          </button>
                        )}

                        <button
                          onClick={() => setReportingItem({ id: font.id, title: font.name })}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors border border-rose-200/80"
                          title="Báo cáo font chữ vi phạm bản quyền hoặc hỏng link"
                        >
                          <Flag className="w-3.5 h-3.5 fill-rose-600" />
                        </button>

                        <button
                          onClick={() => handleCopyCss(font)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-200/80"
                          title="Sao chép cú pháp font-family CSS"
                        >
                          {copiedFontId === font.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Đã copy CSS</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy CSS</span>
                            </>
                          )}
                        </button>

                        <a
                          href={font.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm shadow-blue-500/20 active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Tải Font</span>
                        </a>
                      </div>
                    </div>

                    {/* DYNAMIC LIVE PREVIEW BOX */}
                    <div className={`p-6 rounded-2xl overflow-x-auto no-scrollbar min-h-[110px] flex items-center transition-all ${
                      isDarkPreview 
                        ? 'bg-slate-950 border border-slate-800 text-white shadow-inner' 
                        : 'bg-slate-50/70 border border-slate-200/80 text-slate-900'
                    }`}>
                      <p 
                        style={{ 
                          fontSize: `${fontSize}px`, 
                          fontFamily: font.fontFamily,
                          fontWeight: fontWeight as any,
                          lineHeight: 1.35
                        }}
                        className="font-semibold transition-all duration-150 selection:bg-blue-600 selection:text-white"
                      >
                        {displayText}
                      </p>
                    </div>

                    {/* Bottom Specifications & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2 text-xs">
                      <div className="md:col-span-8 space-y-1">
                        <p className="text-slate-600 leading-relaxed font-medium">
                          {font.description}
                        </p>
                        <p className="text-slate-500">
                          <strong className="text-blue-700 font-bold">Khuyên dùng cho:</strong> {font.bestFor}
                        </p>
                      </div>

                      <div className="md:col-span-4 flex flex-wrap items-center justify-start md:justify-end gap-1.5">
                        {font.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-md text-[10px]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: GOOGLE DESIGN ECOSYSTEM & OPEN RESOURCES */}
      {activeTab === 'google-resources' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header intro for Google Resources */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-blue-600 font-black text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Nguồn Tài Nguyên Thiết Kế & Hệ Sinh Thái Mở Chính Thức Từ Google</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tích Hợp Toàn Bộ Công Cụ & Thư Viện Đồ Họa Miễn Phí Của Google
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-4xl">
              Google cung cấp hệ sinh thái tài nguyên đồ họa mã nguồn mở đồ sộ bậc nhất thế giới bao gồm hơn 3,000 biểu tượng Material Symbols vector SVG, nền tảng phân phối font chữ CDN toàn cầu, quy chuẩn thiết kế Material You M3, cùng kho mẫu bài thuyết trình Google Slides và môi trường sáng tạo AI Studio.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GOOGLE_RESOURCES_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black rounded-lg uppercase tracking-wider">
                      {item.provider}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">{item.category}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <span>{item.actionText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Material Symbols Quick Search Showcase Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  <span>Khám phá 3,000+ Biểu tượng Google Material Symbols</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Tất cả các biểu tượng được thiết kế theo tỉ lệ quang học chuẩn mực của Google, hỗ trợ tùy biến độ dày nét, kích thước và màu sắc dễ dàng trong Figma, Canva và Website.
                </p>
              </div>

              <a
                href="https://fonts.google.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 transition-all shrink-0 active:scale-95 flex items-center space-x-2"
              >
                <span>Mở Google Icons Library</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* CDN EMBED CODE MODAL */}
      {selectedFontForCdn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">
                  Mã nhúng Web Font CDN: {selectedFontForCdn.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFontForCdn(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Option 1: HTML Link */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>1. Cú pháp thẻ HTML &lt;link&gt; (Dán vào thẻ &lt;head&gt;):</span>
                <button
                  onClick={() => handleCopyGoogleCdn(selectedFontForCdn, 'link')}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-xs"
                >
                  {copiedCdnId === `${selectedFontForCdn.id}-link` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCdnId === `${selectedFontForCdn.id}-link` ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-xl overflow-x-auto">
{`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${selectedFontForCdn.googleFontFamily}&display=swap" rel="stylesheet">`}
              </pre>
            </div>

            {/* Option 2: CSS Import */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>2. Cú pháp CSS @import (Dán vào đầu file .css):</span>
                <button
                  onClick={() => handleCopyGoogleCdn(selectedFontForCdn, 'import')}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-xs"
                >
                  {copiedCdnId === `${selectedFontForCdn.id}-import` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCdnId === `${selectedFontForCdn.id}-import` ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl overflow-x-auto">
{`@import url('https://fonts.googleapis.com/css2?family=${selectedFontForCdn.googleFontFamily}&display=swap');`}
              </pre>
            </div>

            {/* Option 3: CSS Rule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>3. Cú pháp CSS font-family:</span>
                <button
                  onClick={() => handleCopyCss(selectedFontForCdn)}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-xs"
                >
                  {copiedFontId === selectedFontForCdn.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFontId === selectedFontForCdn.id ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-white font-mono text-[11px] rounded-xl overflow-x-auto">
{`font-family: ${selectedFontForCdn.fontFamily};`}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedFontForCdn(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FONT UPLOAD MODAL */}
      <FontUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSaveSuccess={handleAddNewFont}
        currentAuthorName={currentUser?.displayName || 'Admin'}
        driveFontFolderUrl={driveFontFolderUrl}
      />

      {/* REPORT VIOLATION MODAL */}
      {reportingItem && (
        <ReportViolationModal
          isOpen={!!reportingItem}
          onClose={() => setReportingItem(null)}
          targetId={reportingItem.id}
          targetType="font"
          targetTitle={reportingItem.title}
          currentUser={currentUser}
        />
      )}

    </div>
  );
};
