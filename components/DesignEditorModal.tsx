import React, { useState, useEffect } from 'react';
import { 
  X, Save, UploadCloud, Link as LinkIcon, FileText, Info,
  Sparkles, Check, AlertCircle, ShieldAlert, Crown
} from 'lucide-react';
import { DesignFile, User } from '../types';
import { scanContentSafety } from '../lib/contentModeration';

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
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [isVip, setIsVip] = useState(false);
  
  // Safety Scan states
  const [isScanning, setIsScanning] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState<{ isSafe: boolean; keywords: string[] } | null>(null);

  useEffect(() => {
    if (editingFile) {
      setTitle(editingFile.title);
      setCategory(editingFile.category);
      setFileType(editingFile.fileType || 'PPTX');
      setFileSize(editingFile.fileSize || '10 MB');
      setDriveUrl(editingFile.driveUrl);
      setPreviewUrl(editingFile.previewUrl);
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
      const combinedText = `${title} ${description} ${tags}`;
      const scanResult = scanContentSafety(combinedText);
      setSafetyNotice(scanResult);
      setIsScanning(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Double check with silent safety check
    const combinedText = `${title} ${description} ${tags}`;
    const scanResult = scanContentSafety(combinedText);

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const fileData: DesignFile = {
      id: editingFile?.id || `design-${Date.now()}`,
      title,
      description,
      category,
      fileType,
      fileSize,
      driveUrl,
      previewUrl: previewUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
      tags: tagArray,
      downloadsCount: editingFile?.downloadsCount || 0,
      rating: editingFile?.rating || 5.0,
      createdAt: editingFile?.createdAt || new Date().toISOString().split('T')[0],
      author: editingFile?.author || currentUser.displayName || 'Ban Quản Trị',
      authorId: editingFile?.authorId || currentUser.id,
      status: status,
      autoFlaggedViolation: !scanResult.isSafe,
      violationReason: !scanResult.isSafe ? `Nội dung chứa từ khóa nhạy cảm bị gắn cờ: ${scanResult.keywords.join(', ')}` : undefined,
      isVip: isVip,
    };

    onSave(fileData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
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
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Liên kết Google Drive tải file gốc</span>
                <LinkIcon className="w-3 h-3 text-blue-500" />
              </label>
              <input
                type="url"
                required
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... hoặc folder..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Preview Cover URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ảnh bìa minh họa (Preview Image URL)</label>
              <input
                type="url"
                required
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              {previewUrl && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-bold mb-1">Ảnh xem trước hiện tại:</p>
                  <img
                    src={previewUrl}
                    alt="Preview cover"
                    className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                </div>
              )}
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
