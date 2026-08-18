import React, { useState, useEffect } from 'react';
import { 
  X, Save, Sparkles, Image as ImageIcon, Code, Info, 
  Check, AlertCircle, ShieldAlert, Tag, Crown
} from 'lucide-react';
import { AIPrompt, User } from '../types';
import { scanContentSafety } from '../lib/contentModeration';
import { optimizePrompt } from '../lib/gemini';

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPrompt: AIPrompt | null;
  currentUser: User;
  onSave: (prompt: AIPrompt) => void;
}

export const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  isOpen,
  onClose,
  editingPrompt,
  currentUser,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [toolType, setToolType] = useState<'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini' | 'All'>('Midjourney');
  const [category, setCategory] = useState('Phông Hội Nghị');
  const [rawPrompt, setRawPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [isVip, setIsVip] = useState(false);
  
  // AI Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState<{ isSafe: boolean; keywords: string[] } | null>(null);

  useEffect(() => {
    if (editingPrompt) {
      setTitle(editingPrompt.title);
      setToolType(editingPrompt.toolType || 'Midjourney');
      setCategory(editingPrompt.category || 'Phông Hội Nghị');
      setRawPrompt(editingPrompt.rawPrompt);
      setOptimizedPrompt(editingPrompt.optimizedPrompt);
      setPreviewImageUrl(editingPrompt.previewImageUrl);
      setTags(editingPrompt.tags.join(', '));
      setStatus(editingPrompt.status || 'Approved');
      setIsVip(!!editingPrompt.isVip);
    } else {
      setTitle('');
      setToolType('Midjourney');
      setCategory('Phông Hội Nghị');
      setRawPrompt('');
      setOptimizedPrompt('');
      setPreviewImageUrl('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80');
      setTags('Phông đỏ, Trống đồng, Hội nghị');
      setStatus('Approved');
      setIsVip(false);
    }
    setSafetyNotice(null);
  }, [editingPrompt, isOpen]);

  if (!isOpen) return null;

  // Utilize Gemini to auto-optimize raw prompt as a professional tool helper
  const handleAIOptimize = async () => {
    if (!rawPrompt) return;
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(rawPrompt, toolType as any);
      setOptimizedPrompt(result);
    } catch (e) {
      // Fallback
      setOptimizedPrompt(`A high detailed professional vector background, ${rawPrompt}, realistic lighting, highly rendered, cinematic, 8k resolution`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleScanText = () => {
    const combinedText = `${title} ${rawPrompt} ${optimizedPrompt} ${tags}`;
    const scanResult = scanContentSafety(combinedText);
    setSafetyNotice(scanResult);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedText = `${title} ${rawPrompt} ${optimizedPrompt} ${tags}`;
    const scanResult = scanContentSafety(combinedText);

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const promptData: AIPrompt = {
      id: editingPrompt?.id || `prompt-${Date.now()}`,
      title,
      rawPrompt,
      optimizedPrompt: optimizedPrompt || rawPrompt,
      category,
      toolType,
      previewImageUrl: previewImageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
      tags: tagArray,
      likesCount: editingPrompt?.likesCount || 0,
      createdAt: editingPrompt?.createdAt || new Date().toISOString().split('T')[0],
      author: editingPrompt?.author || currentUser.displayName || 'Ban Quản Trị',
      authorId: editingPrompt?.authorId || currentUser.id,
      status: status,
      autoFlaggedViolation: !scanResult.isSafe,
      violationReason: !scanResult.isSafe ? `Nội dung chứa từ khóa nhạy cảm bị gắn cờ: ${scanResult.keywords.join(', ')}` : undefined,
      isVip: isVip,
    };

    onSave(promptData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-slate-900 text-base">
              {editingPrompt ? 'Chỉnh Sửa AI Prompt' : 'Thêm Mới AI Prompt Quản Trị'}
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
          {/* Quick Notice */}
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-start space-x-2.5 text-xs text-purple-900">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <strong className="font-bold text-purple-950">Chế độ biên soạn Prompt:</strong> Hãy định nghĩa chính xác từ khóa và cấu trúc câu lệnh để sinh viên dễ dàng sao chép và sáng tạo trực tiếp.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiêu đề bộ thiết kế vẽ AI</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Phông sân khấu đại hội chi đoàn xanh dương hiện đại..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* AI Tool Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mô hình AI tối ưu</label>
              <select
                value={toolType}
                onChange={(e) => setToolType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white animate-pulse-once"
              >
                <option value="Midjourney">Midjourney (Khuyên dùng cho đồ họa)</option>
                <option value="DALL-E 3">DALL-E 3 (Chat GPT / Bing)</option>
                <option value="Stable Diffusion">Stable Diffusion (Chuyên nghiệp)</option>
                <option value="Gemini">Gemini AI (Google Imagen)</option>
                <option value="All">Dùng chung cho mọi AI (All)</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chuyên mục thiết kế</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                <option value="Phông Hội Nghị">Phông sân khấu & Hội nghị</option>
                <option value="Băng Rôn & Standee">Băng Rôn & Standee</option>
                <option value="Thiệp Mời & Thư Cảm Ơn">Thiệp Mời & Thư Cảm Ơn</option>
                <option value="Biểu Trưng & Logo">Biểu Trưng & Logo</option>
                <option value="Bìa Sổ & Ấn phẩm">Bìa Sổ & Ấn phẩm khác</option>
              </select>
            </div>

            {/* Raw Prompt */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Câu lệnh gốc tiếng Việt (Raw Prompt)</span>
                <span className="text-[10px] text-slate-400 font-medium">Nhập mong muốn bằng tiếng Việt hoặc tiếng Anh</span>
              </label>
              <textarea
                rows={3}
                required
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
                placeholder="Ví dụ: vẽ một phông nền đại hội đoàn thanh niên cộng sản hồ chí minh màu đỏ vàng truyền thống có trống đồng..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
              />
            </div>

            {/* AI Optimization Trigger */}
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleAIOptimize}
                disabled={isOptimizing || !rawPrompt}
                className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>{isOptimizing ? 'Google Gemini đang dịch thuật & tối ưu...' : 'Dịch & Tối ưu hóa bằng AI (Tiếng Anh)'}</span>
              </button>
            </div>

            {/* Optimized Prompt */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Câu lệnh tiếng Anh hoàn chỉnh (Optimized English Prompt)</span>
                <Code className="w-3.5 h-3.5 text-purple-600" />
              </label>
              <textarea
                rows={3}
                required
                value={optimizedPrompt}
                onChange={(e) => setOptimizedPrompt(e.target.value)}
                placeholder="Ví dụ: A professional vector backdrop for Vietnamese youth union conference, traditional red and yellow, featuring a subtle dong son bronze drum pattern in the center..."
                className="w-full bg-slate-900 text-purple-200 font-mono p-3 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Preview Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ảnh minh họa kết quả vẽ AI (Preview Image URL)</label>
              <input
                type="url"
                required
                value={previewImageUrl}
                onChange={(e) => setPreviewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
              {previewImageUrl && (
                <div className="pt-2">
                  <p className="text-[10px] text-slate-400 font-bold mb-1">Kết quả trực quan xem trước:</p>
                  <img
                    src={previewImageUrl}
                    alt="AI render output preview"
                    className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-2xs"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Bộ từ khóa (phân tách bằng dấu phẩy)</span>
                <Tag className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Phong dai hoi, Trong dong, Doan Thanh Nien, Do"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái duyệt</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              >
                <option value="Approved">Duyệt và xuất bản (Approved)</option>
                <option value="Pending">Chờ duyệt (Pending)</option>
                <option value="Rejected">Từ chối vẽ (Rejected)</option>
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
                    Thành viên trả phí mới được sao chép
                  </span>
                </div>
              </label>
            </div>

            {/* Scan text for Safety compliance */}
            <div className="space-y-1 flex flex-col justify-end">
              <button
                type="button"
                onClick={handleScanText}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors border border-slate-200"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                <span>Kiểm tra ngôn từ nhạy cảm</span>
              </button>
            </div>
          </div>

          {/* Safety Notice feedback */}
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
                    <strong className="font-bold text-emerald-950">Ngôn ngữ an toàn:</strong> Không phát hiện bất kỳ từ ngữ thô tục, quảng cáo, cờ bạc hay nội dung vi phạm tiêu chuẩn chính quy nào.
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong className="font-bold text-rose-950">Gắn cờ nhạy cảm:</strong> Nội dung có chứa từ ngữ cần loại bỏ: <span className="font-extrabold text-rose-600">"{safetyNotice.keywords.join(', ')}"</span>. Hãy biên tập lại để đảm bảo tính chuẩn mực học thuật.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-500/10 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{editingPrompt ? 'Cập Nhật Prompt' : 'Thêm Mới Prompt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
