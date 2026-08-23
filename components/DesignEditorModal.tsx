import React, { useState, useEffect } from 'react';
import { 
  X, Save, UploadCloud, Link as LinkIcon, FileText, Info,
  Sparkles, Check, AlertCircle, ShieldAlert, Crown, Upload, HardDrive, FolderPlus, ExternalLink, Loader2, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { DesignFile, User } from '../types';
import { scanContentSafety } from '../lib/contentModeration';
import { uploadFileToGoogleDrive, getActiveAppsScriptUrl } from '../lib/appsScriptUploader';
import { DRIVE_PPT_FOLDER, DRIVE_DESIGN_FOLDER, DRIVE_PROMPT_FOLDER } from '../data/constants';
import { normalizeImageUrl, getProxyImageUrl } from '../lib/imageUtils';

export const PRESET_FILE_ICONS = [
  {
    ext: 'PPTX',
    label: 'PowerPoint',
    iconName: '📊',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'ZIP',
    label: 'Nén ZIP/RAR',
    iconName: '📦',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'PSD',
    label: 'Photoshop',
    iconName: '🎨',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'AI',
    label: 'Illustrator',
    iconName: '✏️',
    badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
    url: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'CDR',
    label: 'CorelDraw',
    iconName: '📐',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'PDF',
    label: 'Tài liệu PDF',
    iconName: '📄',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    url: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'DOCX',
    label: 'Word',
    iconName: '📝',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'XLSX',
    label: 'Excel',
    iconName: '📈',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  },
  {
    ext: 'CANVA',
    label: 'Canva',
    iconName: '✨',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
  }
];

interface DesignEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFile: DesignFile | null;
  currentUser: User;
  onSave: (file: DesignFile) => void;
}

export const DesignEditorModal: React.FC<DesignEditorModalProps> = ({
  isOpen,
  onClose,
  editingFile,
  currentUser,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('PowerPoint Templates');
  const [fileType, setFileType] = useState('PPTX');
  const [fileSize, setFileSize] = useState('15 MB');
  const [driveUrl, setDriveUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80');
  const [fallbackPreviewUrl, setFallbackPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [isVip, setIsVip] = useState(false);
  
  // Safety Scan states
  const [isScanning, setIsScanning] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState<{ isSafe: boolean; keywords: string[] } | null>(null);

  // Apps Script & Google Drive uploading states
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState('');
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileName, setDesignFileName] = useState('');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

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

  const handleDesignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignFile(file);
      setDesignFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setFileSize(`${sizeMb} MB`);
      
      // Auto fill title if empty
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }

      // Auto detect file extension
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PPTX';
      setFileType(ext);

      // Auto match preset cover icon
      const upperExt = ext.toUpperCase();
      const matched = PRESET_FILE_ICONS.find(p => 
        p.ext === upperExt || 
        (upperExt === 'PPT' && p.ext === 'PPTX') || 
        (upperExt === 'RAR' && p.ext === 'ZIP') || 
        (upperExt === '7Z' && p.ext === 'ZIP') || 
        (upperExt === 'DOC' && p.ext === 'DOCX') || 
        (upperExt === 'XLS' && p.ext === 'XLSX')
      );
      if (matched) {
        setPreviewUrl(matched.url);
      }
    }
  };

  const handleAutoUploadToDrive = async () => {
    if (!designFile) {
      setError('Vui lòng chọn tệp thiết kế từ máy trước!');
      return;
    }

    setIsUploadingToDrive(true);
    setError('');
    setDriveUploadSuccess(null);

    try {
      const result = await uploadFileToGoogleDrive({
        file: designFile,
        contentType: 'design',
        title: title || designFile.name,
        contributor: currentUser.displayName || 'Admin ICTC',
        email: currentUser.email,
        description: description || 'Tệp thiết kế được tải lên trực tiếp',
        customScriptUrl: googleAppsScriptUrl
      });

      if (result.fileUrl) {
        setDriveUrl(result.fileUrl);
      }
      setDriveUploadSuccess(result.message);
    } catch (err: any) {
      console.error(err);
      setError(`Không thể tải lên tự động: ${err?.message || 'Vui lòng kiểm tra lại cấu hình'}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  useEffect(() => {
    if (editingFile) {
      setTitle(editingFile.title);
      setCategory(editingFile.category);
      setFileType(editingFile.fileType || 'PPTX');
      setFileSize(editingFile.fileSize || '10 MB');
      setDriveUrl(editingFile.driveUrl);
      setPreviewUrl(editingFile.previewUrl);
      setFallbackPreviewUrl(editingFile.fallbackPreviewUrl || '');
      setDescription(editingFile.description);
      setTags(editingFile.tags.join(', '));
      setStatus(editingFile.status || 'Approved');
      setIsVip(!!editingFile.isVip);
    } else {
      // Clear form for new item
      setTitle('');
      setCategory('PowerPoint Templates');
      setFileType('PPTX');
      setFileSize('12 MB');
      setDriveUrl('');
      setPreviewUrl('https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80');
      setFallbackPreviewUrl('');
      setDescription('');
      setTags('Powerpoint, Template, Blue, Gold');
      setStatus('Approved');
      setIsVip(false);
    }
    setSafetyNotice(null);
  }, [editingFile, isOpen]);

  if (!isOpen) return null;

  const handleScanText = () => {
    setIsScanning(true);
    setSafetyNotice(null);
    setTimeout(() => {
      const scanResult = scanContentSafety({ 
        title, 
        description, 
        tags: tags.split(',').map(t => t.trim()) 
      });
      setSafetyNotice(scanResult);
      setIsScanning(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // Double check with silent safety check
    const scanResult = scanContentSafety({ 
      title, 
      description, 
      tags: tagArray 
    });

    const fileData: DesignFile = {
      id: editingFile?.id || `design-${Date.now()}`,
      title,
      description,
      category,
      fileType,
      fileSize,
      driveUrl,
      previewUrl: previewUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
      fallbackPreviewUrl: fallbackPreviewUrl.trim() || undefined,
      tags: tagArray,
      downloadsCount: editingFile?.downloadsCount || 0,
      rating: editingFile?.rating || 5.0,
      createdAt: editingFile?.createdAt || new Date().toISOString().split('T')[0],
      author: editingFile?.author || currentUser.displayName || 'Ban Quản Trị',
      authorId: editingFile?.authorId || currentUser.id,
      status: status,
      autoFlaggedViolation: !scanResult.isSafe,
      violationReason: !scanResult.isSafe ? `Nội dung chứa từ khóa nhạy cảm bị gắn cờ: ${scanResult.matchedKeywords.join(', ')}` : undefined,
      isVip: isVip,
    };

    onSave(fileData);
  };

  const isPptFormat = fileType.toUpperCase().includes('PPT') || category.toLowerCase().includes('powerpoint');
  const targetFolderName = isPptFormat ? '/Powerpoint' : '/Thietke';
  const targetFolderUrl = isPptFormat ? DRIVE_PPT_FOLDER : DRIVE_DESIGN_FOLDER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl my-auto overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-900 text-base">
              {editingFile ? 'Chỉnh Sửa Slide / Thiết Kế' : 'Thêm Mới Slide / Thiết Kế Quản Trị'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          {/* Quick Creator Tag */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="font-bold text-blue-950">Đặc quyền Admin:</strong> Tài nguyên này sẽ được cập nhật trực tiếp vào cơ sở dữ liệu và đồng bộ tới toàn bộ người dùng ngay lập tức.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề thiết kế</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Slide Đại hội Đoàn trường ĐH Thủ Dầu Một..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Danh mục chính</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="PowerPoint Templates">PowerPoint Templates</option>
                <option value="Canva Designs">Canva Designs</option>
                <option value="Photoshop Resources">Photoshop (PSD) Resources</option>
                <option value="Illustrator Resources">Illustrator (AI) Vector</option>
                <option value="Nghiên cứu khoa học">Nghiên cứu & Đồ án tốt nghiệp</option>
              </select>
            </div>

            {/* File Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Định dạng File / Dung lượng</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  placeholder="PPTX, PSD, AI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-center font-bold"
                />
                <input
                  type="text"
                  required
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="15 MB, 2.5 GB"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-center font-bold"
                />
              </div>
            </div>

            {/* Google Drive URL */}
            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Liên kết Google Drive tải file gốc</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">Thư mục con: {targetFolderName}</span>
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
                      {isPptFormat ? (
                        <>Vui lòng tải file PowerPoint (.ppt, .pptx) của bạn lên thư mục <strong className="text-blue-700 font-bold">/Powerpoint</strong>.</>
                      ) : (
                        <>Vui lòng tải file thiết kế (.ai, .cdr, .psd, .zip) của bạn lên thư mục <strong className="text-blue-700 font-bold">/Thietke</strong>.</>
                      )}
                    </p>
                  </div>
                  <a
                    href={targetFolderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0 font-sans"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Mở thư mục {targetFolderName}</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>

                {/* Upload file simulation & Automatic upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">A. Chọn tệp thiết kế từ máy tính</span>
                    <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl text-center space-y-1.5 bg-white hover:bg-blue-50/20 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept=".pptx,.ppt,.canva,.zip,.rar,.psd,.ai,.pdf"
                        onChange={handleDesignFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="text-xs">
                        {designFileName ? (
                          <span className="font-bold text-blue-700 block truncate">{designFileName}</span>
                        ) : (
                          <span className="font-bold text-slate-800">Nhấp chọn tệp thiết kế (.pptx, .psd, .zip...)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">B. Hoặc Nhập URL Tải về / Link Drive</span>
                      <input
                        type="url"
                        required
                        placeholder="https://drive.google.com/file/d/... hoặc link trực tiếp"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
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
                      Bạn có thể tải tệp lên trực tiếp. Hệ thống sẽ tự động chuyển tệp vào thư mục con <strong className="font-black text-emerald-900">/Thietke</strong> của bạn ngay lập tức!
                    </p>
                    
                    {designFile ? (
                      <div className="pt-1 flex items-center justify-between gap-3">
                        <div className="text-[10px] text-slate-500 truncate max-w-[60%]">
                          Tệp đang chọn: <strong className="text-slate-700 font-bold">{designFileName}</strong>
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

                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Cover URL & Preset Format Icon Selector */}
            <div className="sm:col-span-2 space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Link ảnh đại diện (Thumbnail) / Biểu tượng minh họa
                </label>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Có sẵn biểu tượng định dạng
                </span>
              </div>

              {/* Preset Icon Buttons Grid */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">
                  1. Chọn nhanh biểu tượng định dạng tệp có sẵn:
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PRESET_FILE_ICONS.map((preset) => {
                    const isSelected = previewUrl === preset.url;
                    return (
                      <button
                        key={preset.ext}
                        type="button"
                        onClick={() => setPreviewUrl(preset.url)}
                        className={`flex items-center space-x-1.5 px-2.5 py-2 rounded-xl border text-[11px] font-bold transition-all text-left ${
                          isSelected 
                            ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-600 text-white shadow-xs' 
                            : `${preset.badgeClass} bg-white shadow-3xs`
                        }`}
                      >
                        <span className="text-sm shrink-0">{preset.iconName}</span>
                        <span className="truncate">{preset.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-white ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input for direct custom URL */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">
                    2. HOẶC điền link ảnh đại diện tùy chỉnh (Image URL):
                  </span>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(normalizeImageUrl(previewUrl))}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                      title="Chuẩn hóa đường dẫn Google Drive / Direct URL"
                    >
                      Tự động tối ưu link
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  required
                  value={previewUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPreviewUrl(normalizeImageUrl(val));
                  }}
                  placeholder="https://images.unsplash.com/photo-... hoặc https://sv2.anhsieuviet.com/..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {previewUrl && (
                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold flex items-center space-x-1">
                      <ImageIcon className="w-3 h-3 text-blue-600" />
                      <span>Xem trước ảnh đại diện trực tiếp:</span>
                    </p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-blue-600 font-medium flex items-center space-x-0.5"
                    >
                      <span>Mở link gốc</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 min-h-[120px] flex items-center justify-center shadow-2xs">
                    <img
                      src={previewUrl}
                      alt="Preview cover"
                      className="w-full h-36 object-cover"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      onError={(e) => {
                        const img = e.currentTarget;
                        const proxy = getProxyImageUrl(previewUrl);
                        if (img.src !== proxy && !previewUrl.includes('images.weserv.nl')) {
                          img.src = proxy;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 gap-2">
                      <span className="text-white text-xs font-bold px-3 py-1 bg-slate-900/80 rounded-lg backdrop-blur-md">
                        Ảnh xem trước hợp lệ (No-Referrer Bypassed)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewUrl(getProxyImageUrl(previewUrl))}
                        className="text-[10px] font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-colors"
                      >
                        ⚡ Chuyển qua máy chủ đệm Web Proxy nếu bị chặn
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fallback Preview Cover URL */}
            <div className="sm:col-span-2 space-y-1 pt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ảnh đại diện dự phòng (Fallback / Backup Image URL)</label>
              <input
                type="url"
                value={fallbackPreviewUrl}
                onChange={(e) => setFallbackPreviewUrl(e.target.value)}
                placeholder="https://... (Sử dụng tự động khi ảnh chính bị lỗi không load được)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-400">
                * Tùy chọn: Nhập liên kết ảnh thay thế trong trường hợp ảnh chính gặp sự cố mạng hoặc không thể hiển thị.
              </p>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mô tả tài nguyên & Hướng dẫn sử dụng</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả cụ thể cách chỉnh sửa, bố cục màu sắc, font sử dụng..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
            </div>

            {/* Tags */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Từ khóa phân tách bằng dấu phẩy (Tags)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Doan, PowerPoint, Blue, Doan Thanh Nien, Dai hoi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Status (Approved, Pending, Rejected) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái phát hành</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              >
                <option value="Approved">Duyệt & Phát hành ngay (Approved)</option>
                <option value="Pending">Chờ duyệt trong hàng đợi (Pending)</option>
                <option value="Rejected">Từ chối xuất bản (Rejected)</option>
              </select>
            </div>

            {/* VIP Checkbox Toggle */}
            <div className="space-y-1 flex items-center h-full pt-4">
              <label className="relative flex items-center space-x-3 cursor-pointer bg-amber-50/40 hover:bg-amber-100/50 p-3 rounded-xl border border-amber-200 w-full transition-colors select-none">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4.5 h-4.5 text-amber-500 border-amber-300 rounded-md focus:ring-amber-500 cursor-pointer"
                />
                <div>
                  <span className="block text-xs font-black text-amber-950 flex items-center">
                    <Crown className="w-3.5 h-3.5 text-amber-500 mr-1 fill-amber-400" />
                    Tài nguyên VIP
                  </span>
                  <span className="block text-[10px] text-amber-700 font-medium leading-none mt-0.5">
                    Thành viên trả phí mới được tải
                  </span>
                </div>
              </label>
            </div>

            {/* Security Safety Verification */}
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleScanText}
                disabled={isScanning}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isScanning ? 'Đang rà quét từ nhạy cảm...' : 'Rà quét an toàn nội dung'}</span>
              </button>
            </div>
          </div>

          {/* Safety scan notice feedback */}
          {safetyNotice && (
            <div className={`p-4 rounded-2xl border text-xs flex items-start space-x-2.5 ${
              safetyNotice.isSafe 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {safetyNotice.isSafe ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold text-emerald-950">Nội dung hợp lệ:</strong> Bộ lọc không phát hiện từ ngữ nhạy cảm hoặc vi phạm tiêu chuẩn chính trị của Biểu trưng Quốc gia. Sẵn sàng phát hành.
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold text-rose-950">Cảnh báo nội dung nghi vấn:</strong> Bộ quét phát hiện từ khóa nhạy cảm không phù hợp: <span className="font-extrabold text-rose-600">"{safetyNotice.keywords.join(', ')}"</span>. Hãy cân nhắc điều chỉnh lại để tránh vi phạm nguyên tắc cộng đồng.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-blue-500/10 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingFile ? 'Cập Nhật Thiết Kế' : 'Thêm Mới Thiết Kế'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
