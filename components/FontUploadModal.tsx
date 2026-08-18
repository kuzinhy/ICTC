import React, { useState, useEffect } from 'react';
import { 
  X, Upload, HardDrive, Type, Image as ImageIcon, Check, 
  AlertCircle, ExternalLink, ShieldCheck, Tag, FileText, 
  Sparkles, Layers, Sliders, FolderPlus, Info, Eye, Settings
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
  const [isVip, setIsVip] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // File upload states & Apps Script Configuration
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState('');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('ictc_system_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.googleAppsScriptUrl) {
          setGoogleAppsScriptUrl(parsed.googleAppsScriptUrl);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
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
      setIsVip(!!fontToEdit.isVip);
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
      setIsVip(false);
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

  const handleAutoUploadToDrive = () => {
    if (!fontFile) {
      setError('Vui lòng chọn tệp cài đặt Font trước!');
      return;
    }
    if (!googleAppsScriptUrl) {
      setError('Hệ thống chưa cấu hình URL Apps Script. Vui lòng dán link thủ công.');
      return;
    }

    setIsUploadingToDrive(true);
    setError('');
    setDriveUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        
        await fetch(googleAppsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({
            fileName: fontFile.name,
            mimeType: fontFile.type || 'application/octet-stream',
            fileData: base64,
            contentType: 'font',
            title: name || fontFile.name,
            contributor: creator || 'Thành viên ICTC',
            email: 'nguyenhuy.thudaumot@gmail.com',
            description: description || 'Tệp font được gửi từ form upload'
          })
        });

        const resultDriveUrl = `https://drive.google.com/drive/folders/1adp9EiA1GTNFSaq2g0cz8dJbr1YpDzFd`;
        setDownloadUrl(resultDriveUrl);
        setDriveUploadSuccess('Tải lên hoàn tất! Tệp tin đã được chuyển thẳng tới thư mục Google Drive: /Font.');
      } catch (err: any) {
        console.error(err);
        setError('Không thể kết nối đến máy chủ Google Drive. Vui lòng tải lên thủ công.');
      } finally {
        setIsUploadingToDrive(false);
      }
    };
    reader.readAsDataURL(fontFile);
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
        severity: safetyCheck.riskLevel === 'severe' ? 'high' : 'medium',
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
      isVip,
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center space-x-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* BLOCK 1: TIÊU ĐỀ */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center">
              <span>1. Tiêu đề / Tên Bộ Font Chữ</span>
              <span className="text-rose-500 ml-1 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Be Vietnam Pro, UTM Bebas, SVN-Gilroy..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* BLOCK 2: NỘI DUNG MÔ TẢ */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
              2. Nội dung / Mô tả Chi tiết Bộ Font
            </label>
            <textarea
              rows={3}
              placeholder="Giới thiệu phong cách phông chữ, đặc điểm thiết kế Việt hóa và lời khuyên phối font khi sử dụng..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 p-4 text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* BLOCK 3: ẢNH MINH HỌA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
              3. Ảnh Minh Họa Typography / Ảnh Bìa
            </label>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as any).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              )}
              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    id="font-cover-upload"
                  />
                  <label
                    htmlFor="font-cover-upload"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors shadow-xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải ảnh lên từ thiết bị</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Hoặc dán URL liên kết ảnh minh họa tại đây..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* BLOCK 4: TẢI LÊN TỆP HOẶC LINK TẢI GOOGLE DRIVE */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>4. Link tải về hoặc Upload tệp lên</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">Thư mục con: /Font</span>
            </label>

            <div className="border border-blue-100 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/50 to-indigo-50/20 p-4 space-y-4">
              
              {/* Thư mục tiếp nhận chỉ định */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span>Thư mục chỉ định của Nguyễn Huy:</span>
                  </p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Vui lòng tải tệp tin của bạn lên thư mục con <strong className="text-blue-700 font-bold">/Font</strong> nằm trong thư mục dùng chung <strong className="text-slate-700">Tainguyenchiase</strong>.
                  </p>
                </div>
                <a
                  href="https://drive.google.com/drive/folders/1adp9EiA1GTNFSaq2g0cz8dJbr1YpDzFd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 font-sans"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Mở thư mục /Font</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>

              {/* Upload file simulation & Automatic upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">A. Chọn tệp từ máy tính</span>
                  <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-center space-y-1.5 bg-white hover:bg-blue-50/20 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept=".ttf,.otf,.woff,.woff2,.zip,.rar"
                      onChange={handleFontFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-5 h-5 text-blue-600 mx-auto" />
                    <div className="text-xs">
                      {fontFileName ? (
                        <span className="font-bold text-blue-700 block truncate">{fontFileName}</span>
                      ) : (
                        <span className="font-bold text-slate-800">Nhấp chọn tệp cài (.zip, .ttf, .otf)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 flex flex-col justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">B. Hoặc Nhập URL Tải về / Link Drive</span>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/open?id=... hoặc link trực tiếp"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      className="w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-3.5 py-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Upload via Google Apps Script (If configured) */}
              {googleAppsScriptUrl ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-850">
                      <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                      <span className="text-xs font-bold">Phát hiện Google Apps Script Web App của Nguyễn Huy</span>
                    </div>
                    <span className="text-[9px] bg-emerald-200/50 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Sẵn sàng</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 leading-snug">
                    Bạn có thể tải tệp lên trực tiếp. Hệ thống sẽ tự động chuyển tệp vào thư mục con <strong className="font-black text-emerald-900">/Font</strong> của bạn ngay lập tức!
                  </p>
                  
                  {fontFile ? (
                    <div className="pt-1 flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500 truncate max-w-[60%]">
                        Tệp đang chọn: <strong className="text-slate-700 font-bold">{fontFileName}</strong>
                      </div>
                      <button
                        type="button"
                        disabled={isUploadingToDrive}
                        onClick={handleAutoUploadToDrive}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs text-white flex items-center space-x-1.5 transition-all ${
                          isUploadingToDrive 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20'
                        }`}
                      >
                        {isUploadingToDrive ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang chuyển lên Drive...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Bắt đầu Upload tự động</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-medium italic">
                      * Hãy nhấp chọn tệp tin từ máy tính để bắt đầu quá trình tải lên tự động.
                    </div>
                  )}

                  {driveUploadSuccess && (
                    <div className="p-2 bg-emerald-100/50 border border-emerald-300 text-emerald-900 rounded-lg text-[11px] font-bold flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{driveUploadSuccess}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Admin có thể cấu hình <strong>Google Apps Script URL</strong> trong cài đặt quản trị để bật chức năng upload 1-click tự động định tuyến.</span>
                </div>
              )}

              {/* Direct Drive Folder override link (hidden by default under advanced if needed, but we keep it sync'ed to our state) */}
              <input
                type="hidden"
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
              />
            </div>
          </div>

          {/* CẤU HÌNH THÔNG TIN PHỤ KỸ THUẬT & TRẠNG THÁI (COLLAPSIBLE) */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200/80 text-left font-bold text-xs text-slate-700 flex items-center justify-between transition-all"
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Cấu hình kỹ thuật nâng cao (Tùy chọn)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                {showAdvanced ? 'Đóng cấu hình ▴' : 'Mở cấu hình ▾'}
              </span>
            </button>

            {showAdvanced && (
              <div className="p-4 space-y-4 border-t border-slate-200 bg-white animate-fade-in text-xs">
                
                {/* Category & Creator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phân Loại Thiết Kế</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold focus:bg-white focus:outline-none"
                    >
                      {FONT_CATEGORIES.filter(c => c !== 'Tất cả').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tác Giả / Người Việt Hóa</label>
                    <input
                      type="text"
                      placeholder="VD: Google Fonts, UTM, SVN, Thư Nguyễn..."
                      value={creator}
                      onChange={(e) => setCreator(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Encoding & License */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bảng Mã Tiếng Việt</label>
                    <select
                      value={encoding}
                      onChange={(e) => setEncoding(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="Unicode dựng sẵn">Unicode dựng sẵn (Chuẩn)</option>
                      <option value="VNI-Windows">VNI-Windows</option>
                      <option value="TCVN3 (ABC)">TCVN3 (ABC)</option>
                      <option value="Đa bảng mã">Đa bảng mã</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Giấy Phép</label>
                    <select
                      value={license}
                      onChange={(e) => setLicense(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    >
                      <option value="Open Font License (OFL)">Open Font License (OFL)</option>
                      <option value="Miễn phí sử dụng">Miễn phí sử dụng</option>
                      <option value="Miễn phí cá nhân & Thương mại">Miễn phí cá nhân & Thương mại</option>
                    </select>
                  </div>
                </div>

                {/* Technical: CSS Font Family */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CSS font-family</label>
                    <input
                      type="text"
                      placeholder='VD: "Be Vietnam Pro", sans-serif'
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 font-mono rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Biến Thể (Weights)</label>
                    <input
                      type="text"
                      placeholder="VD: Regular, Bold..."
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tags input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Từ khóa (Tags cách nhau bằng dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="VD: Google Fonts, Tiêu đề, Đại hội..."
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Extra specs drive folder override for system database */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Đường dẫn Lưu Trữ Thư Mục Drive Override (Nếu có)</label>
                  <input
                    type="text"
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

              </div>
            )}
          </div>

          {/* Checkbox triggers */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-700">Ghim nổi bật</span>
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

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="font-bold text-amber-600">★ Gắn nhãn Font VIP (Yêu cầu hội viên)</span>
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
