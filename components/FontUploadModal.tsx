import React, { useState, useEffect } from 'react';
import { 
  X, Upload, HardDrive, Type, Image as ImageIcon, Check, 
  AlertCircle, ExternalLink, ShieldCheck, Tag, FileText, 
  Sparkles, Layers, Sliders, FolderPlus, Info, Eye
} from 'lucide-react';
import { VietnameseFont, FONT_CATEGORIES } from '../data/vietnamFontsData';
import { DRIVE_DESIGN_FOLDER } from '../data/constants';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';

interface FontUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fontToEdit?: VietnameseFont | null;
  onSaveSuccess: (font: VietnameseFont) => void;
  currentAuthorName: string;
  driveFontFolderUrl?: string;
}

export const FontUploadModal: React.FC<FontUploadModalProps> = ({
  isOpen,
  onClose,
  fontToEdit,
  onSaveSuccess,
  currentAuthorName,
  driveFontFolderUrl = DRIVE_DESIGN_FOLDER
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VietnameseFont['category']>('Hiện đại & UI/UX');
  const [creator, setCreator] = useState('');
  const [encoding, setEncoding] = useState<VietnameseFont['encoding']>('Unicode dựng sẵn');
  const [fontFamily, setFontFamily] = useState('');
  const [googleFontFamily, setGoogleFontFamily] = useState('');
  const [weight, setWeight] = useState('Đầy đủ bộ (Regular, Bold, Italic)');
  const [description, setDescription] = useState('');
  const [bestFor, setBestFor] = useState('');
  const [license, setLicense] = useState<VietnameseFont['license']>('Open Font License (OFL)');
  const [previewSample, setPreviewSample] = useState('Cộng hòa Xã hội Chủ nghĩa Việt Nam - Độc lập - Tự do - Hạnh phúc');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState(driveFontFolderUrl);
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isGoogleFont, setIsGoogleFont] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  // File upload states
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontFileName, setFontFileName] = useState('');
  const [fontFileSize, setFontFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [liveCustomFontFamily, setLiveCustomFontFamily] = useState<string | null>(null);

  // Load existing font data if in edit mode
  useEffect(() => {
    if (fontToEdit) {
      setName(fontToEdit.name || '');
      setCategory(fontToEdit.category || 'Hiện đại & UI/UX');
      setCreator(fontToEdit.creator || '');
      setEncoding(fontToEdit.encoding || 'Unicode dựng sẵn');
      setFontFamily(fontToEdit.fontFamily || '');
      setGoogleFontFamily(fontToEdit.googleFontFamily || '');
      setWeight(fontToEdit.weight || 'Đầy đủ bộ');
      setDescription(fontToEdit.description || '');
      setBestFor(fontToEdit.bestFor || '');
      setLicense(fontToEdit.license || 'Open Font License (OFL)');
      setPreviewSample(fontToEdit.previewSample || 'Cộng hòa Xã hội Chủ nghĩa Việt Nam - Độc lập - Tự do - Hạnh phúc');
      setDownloadUrl(fontToEdit.downloadUrl || '');
      setDriveFolderUrl(fontToEdit.driveFolderUrl || driveFontFolderUrl);
      setTagsInput(fontToEdit.tags?.join(', ') || '');
      setCoverImage(fontToEdit.coverImage || '');
      setIsGoogleFont(!!fontToEdit.isGoogleFont);
      setIsPinned(!!fontToEdit.isPinned);
      setFontFileName(fontToEdit.fileSize ? `Font File (${fontToEdit.fileSize})` : '');
      setFontFileSize(fontToEdit.fileSize || '');
    } else {
      setName('');
      setCategory('Hiện đại & UI/UX');
      setCreator(currentAuthorName || 'ICTC Community');
      setEncoding('Unicode dựng sẵn');
      setFontFamily('');
      setGoogleFontFamily('');
      setWeight('Đầy đủ bộ (Regular, SemiBold, Bold)');
      setDescription('');
      setBestFor('Slide thuyết trình, Tiêu đề sự kiện, Báo cáo đồ án');
      setLicense('Open Font License (OFL)');
      setPreviewSample('Cộng hòa Xã hội Chủ nghĩa Việt Nam - Độc lập - Tự do - Hạnh phúc');
      setDownloadUrl(driveFontFolderUrl);
      setDriveFolderUrl(driveFontFolderUrl);
      setTagsInput('Tiếng Việt, Font đẹp, Đồ họa');
      setCoverImage('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80');
      setIsGoogleFont(false);
      setIsPinned(false);
      setFontFile(null);
      setFontFileName('');
      setFontFileSize('');
    }
    setError('');
  }, [fontToEdit, isOpen, currentAuthorName, driveFontFolderUrl]);

  if (!isOpen) return null;

  // Handle Font File Selection (.ttf, .otf, .woff, .woff2, .zip)
  const handleFontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFontFile(file);
      setFontFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setFontFileSize(`${sizeMb} MB`);

      // If user uploaded a TTF/OTF/WOFF font directly, register dynamic font-face for instant preview
      if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fontUrl = event.target?.result as string;
            const customFontName = `CustomPreviewFont_${Date.now()}`;
            const fontFace = new FontFace(customFontName, `url(${fontUrl})`);
            fontFace.load().then((loadedFace) => {
              (document.fonts as any).add(loadedFace);
              setLiveCustomFontFamily(customFontName);
              if (!fontFamily) {
                setFontFamily(`"${customFontName}", sans-serif`);
              }
            });
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.warn("Could not register local font face:", err);
        }
      }

      if (!name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setName(cleanName);
      }
    }
  };

  // Handle Specimen / Cover Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên bộ font chữ!');
      return;
    }

    setIsUploading(true);

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Hidden safety check
    const safetyCheck = scanContentSafety({
      title: name,
      description: `${description} ${bestFor}`,
      tags,
      author: creator
    });

    const isAutoFlagged = !safetyCheck.isSafe;

    if (isAutoFlagged) {
      submitContentReport({
        targetId: fontToEdit ? fontToEdit.id : `font-custom-${Date.now()}`,
        targetType: 'font',
        targetTitle: name,
        reason: `Phát hiện từ khóa nghi vấn (${safetyCheck.matchedKeywords.join(', ')})`,
        details: `Tải lên bộ font chữ bị hệ thống cờ cảnh báo ${safetyCheck.riskLevel.toUpperCase()}.`,
        reporterName: 'Hệ Thống Tự Động (Hidden Scanner)',
        severity: safetyCheck.riskLevel === 'high' ? 'high' : 'medium',
        autoFlagged: true
      });
    }

    const newFont: VietnameseFont = {
      id: fontToEdit ? fontToEdit.id : `font-custom-${Date.now()}`,
      name: name.trim(),
      category,
      creator: creator.trim() || 'ICTC Community',
      encoding,
      fontFamily: fontFamily.trim() || (liveCustomFontFamily ? `"${liveCustomFontFamily}", sans-serif` : '"Plus Jakarta Sans", sans-serif'),
      googleFontFamily: googleFontFamily.trim() || undefined,
      weight: weight.trim() || 'Đầy đủ bộ',
      description: description.trim() || 'Bộ font chữ Việt hóa chất lượng cao, chuẩn dấu tiếng Việt.',
      bestFor: bestFor.trim() || 'Thiết kế đồ họa, Slide, Tiêu đề sự kiện',
      license,
      downloadsCount: fontToEdit ? fontToEdit.downloadsCount : Math.floor(Math.random() * 500) + 120,
      rating: fontToEdit ? fontToEdit.rating : 5.0,
      previewSample: previewSample.trim() || 'Cộng hòa Xã hội Chủ nghĩa Việt Nam',
      downloadUrl: downloadUrl.trim() || driveFontFolderUrl,
      driveFolderUrl: driveFolderUrl.trim() || driveFontFolderUrl,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
      tags: tags.length > 0 ? tags : ['Việt hóa', 'Font đẹp', category],
      isGoogleFont,
      isCustomUploaded: true,
      isPinned,
      fileSize: fontFileSize || fontToEdit?.fileSize || '3.5 MB',
      createdAt: fontToEdit?.createdAt || new Date().toISOString().split('T')[0],
      autoFlaggedViolation: isAutoFlagged,
      violationReason: isAutoFlagged ? `Từ khóa nghi vấn: ${safetyCheck.matchedKeywords.join(', ')}` : undefined
    };

    setTimeout(() => {
      setIsUploading(false);
      onSaveSuccess(newFont);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in" id="font-upload-modal">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Type className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {fontToEdit ? 'Chỉnh sửa & Cập nhật Font chữ' : 'Thêm Font chữ Mới & Lưu trữ Google Drive'}
              </h3>
              <p className="text-xs text-slate-300">
                Tải lên tệp font, ảnh minh họa mẫu chữ và cấu hình liên kết lưu trữ đồng bộ Google Drive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Drive Storage Workspace Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5">
                    <span>Thư mục Lưu trữ Google Drive Tiếp Nhận Font</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">Cloud Drive Sync</span>
                  </h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Tệp font (.zip, .ttf, .otf) và tư liệu minh họa sẽ được liên kết và quản lý tập trung trong thư mục Google Drive đã chia sẻ.
                  </p>
                </div>
              </div>

              <a
                href={driveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 active:scale-95"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Mở Drive Tiếp Nhận</span>
                <ExternalLink className="w-3 h-3 ml-1 opacity-80" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Đường dẫn Thư mục Google Drive (Chứa Font)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Link Tải xuống Trực tiếp (Download Link)
                </label>
                <input
                  type="url"
                  placeholder="https://fonts.google.com/specimen/... hoặc link tải Drive"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Basic Font Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Tên Bộ Font Chữ / Tên Việt Hóa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Be Vietnam Pro, UTM Bebas Neue, SVN-Gilroy..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Phân Loại Thiết Kế
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {FONT_CATEGORIES.filter(c => c !== 'Tất cả').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Creator, Encoding & License */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Tác Giả / Đơn Vị Việt Hóa
              </label>
              <input
                type="text"
                placeholder="VD: Google Fonts, UTM, SVN, Thư Nguyễn..."
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Bảng Mã Gõ Tiếng Việt
              </label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Unicode dựng sẵn">Unicode dựng sẵn (Chuẩn quốc tế)</option>
                <option value="VNI-Windows">VNI-Windows</option>
                <option value="TCVN3 (ABC)">TCVN3 (ABC)</option>
                <option value="Đa bảng mã">Đa bảng mã</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Giấy Phép Bản Quyền
              </label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value as any)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Open Font License (OFL)">Open Font License (OFL)</option>
                <option value="Miễn phí sử dụng">Miễn phí sử dụng</option>
                <option value="Miễn phí cá nhân & Thương mại">Miễn phí cá nhân & Thương mại</option>
              </select>
            </div>
          </div>

          {/* Technical: CSS Font-Family & Google Font Param */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                CSS font-family (Để hiển thị trực tiếp)
              </label>
              <input
                type="text"
                placeholder='VD: "Be Vietnam Pro", sans-serif hoặc "Cinzel", serif'
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 font-mono rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Google Fonts Specimen / Query (Nếu có)
              </label>
              <input
                type="text"
                placeholder='VD: Be+Vietnam+Pro:wght@400;700 hoặc Playfair+Display'
                value={googleFontFamily}
                onChange={(e) => {
                  setGoogleFontFamily(e.target.value);
                  if (e.target.value.trim()) setIsGoogleFont(true);
                }}
                className="w-full bg-slate-50 text-slate-900 font-mono rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Weights & Best For */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Độ Dày / Biến Thể (Weights)
              </label>
              <input
                type="text"
                placeholder="VD: 18 Weights (Thin to Black), Regular 400 & Bold 700..."
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Ứng Dụng Tối Ưu (Best For)
              </label>
              <input
                type="text"
                placeholder="VD: Phông nền đại hội, Giấy khen vinh danh, Slide báo cáo..."
                value={bestFor}
                onChange={(e) => setBestFor(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* File Upload Zone (TTF / OTF / ZIP) & Specimen Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Font File Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Tệp Cài Đặt Font (.TTF, .OTF, .WOFF, .ZIP)</span>
                {fontFileSize && <span className="text-blue-600 font-bold">{fontFileSize}</span>}
              </label>

              <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center space-y-2 bg-slate-50 hover:bg-blue-50/40 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2,.zip,.rar"
                  onChange={handleFontFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                <div className="text-xs">
                  {fontFileName ? (
                    <span className="font-bold text-blue-700 block truncate">{fontFileName}</span>
                  ) : (
                    <>
                      <span className="font-bold text-slate-800">Nhấp để chọn tệp font</span> hoặc kéo thả vào đây
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">Hỗ trợ tệp đơn lẻ .ttf, .otf hoặc trọn bộ .zip nén</p>
              </div>
            </div>

            {/* Cover / Specimen Image Box */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Ảnh Minh Họa Typography / Ảnh Bìa
              </label>

              <div className="flex items-center space-x-3">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                )}
                <div className="flex-1 space-y-1.5">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                      id="font-cover-upload"
                    />
                    <label
                      htmlFor="font-cover-upload"
                      className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy tính</span>
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Hoặc dán URL ảnh bìa tại đây..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Mô Tả Chi Tiết & Ghi Chú Kỹ Thuật
            </label>
            <textarea
              rows={3}
              placeholder="Giới thiệu phong cách typography, đặc điểm các ký tự dấu và lời khuyên phối font trong thiết kế..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3.5 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Tags & Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Từ Khóa (Tags cách nhau bằng dấu phẩy)
              </label>
              <input
                type="text"
                placeholder="VD: Google Fonts, Tiêu đề, Đại hội, Không chân, Đậm..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-6 pt-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Ghim nổi bật đầu danh mục</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGoogleFont}
                  onChange={(e) => setIsGoogleFont(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Huy hiệu Google Fonts</span>
              </label>
            </div>
          </div>

          {/* Live Typography Preview Tester */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Xem Trước Chữ Mẫu Trực Quan (Live Test)</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px]">
                {fontFamily || 'sans-serif'}
              </span>
            </div>

            <input
              type="text"
              value={previewSample}
              onChange={(e) => setPreviewSample(e.target.value)}
              className="w-full bg-slate-800/80 text-white rounded-xl border border-slate-700 px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-400 focus:outline-none"
              placeholder="Nhập câu mẫu để thử nghiệm dấu tiếng Việt..."
            />

            <div
              className="p-4 bg-slate-950/80 rounded-xl text-center text-xl sm:text-2xl font-bold tracking-tight text-white border border-slate-800 transition-all min-h-[70px] flex items-center justify-center overflow-x-auto"
              style={{
                fontFamily: liveCustomFontFamily ? `"${liveCustomFontFamily}", sans-serif` : (fontFamily || 'inherit')
              }}
            >
              {previewSample || 'Cộng hòa Xã hội Chủ nghĩa Việt Nam'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang lưu trữ font...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{fontToEdit ? 'Cập nhật Font' : 'Xuất bản & Lưu trữ Font'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
