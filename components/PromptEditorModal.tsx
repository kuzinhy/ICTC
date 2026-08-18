import React, { useState, useEffect } from 'react';
import { 
  X, Save, Sparkles, Image as ImageIcon, Code, Info, 
  Check, AlertCircle, ShieldAlert, Tag, Crown, Upload, HardDrive, FolderPlus, ExternalLink
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
  
  // Drive & Apps Script States
  const [driveUrl, setDriveUrl] = useState('');
  const [googleAppsScriptUrl, setGoogleAppsScriptUrl] = useState('');
  const [promptFile, setPromptFile] = useState<File | null>(null);
  const [promptFileName, setPromptFileName] = useState('');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState('');

  // AI Optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [safetyNotice, setSafetyNotice] = useState<import('../lib/contentModeration').SafetyCheckResult | null>(null);

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

  const handlePromptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromptFile(file);
      setPromptFileName(file.name);
      
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const handleAutoUploadToDrive = () => {
    if (!promptFile) {
      setError('Vui lòng chọn tệp tin đính kèm trước!');
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
            fileName: promptFile.name,
            mimeType: promptFile.type || 'application/octet-stream',
            fileData: base64,
            contentType: 'prompt',
            title: title || promptFile.name,
            contributor: currentUser.displayName || 'Admin ICTC',
            email: currentUser.email,
            description: rawPrompt || 'Tệp câu lệnh mẫu tải lên trực tiếp'
          })
        });

        const resultDriveUrl = `https://drive.google.com/drive/folders/1adp9EiA1GTNFSaq2g0cz8dJbr1YpDzFd`;
        setDriveUrl(resultDriveUrl);
        setDriveUploadSuccess('Tải lên hoàn tất! Tệp tin đã được chuyển thẳng tới thư mục Google Drive: /Promt mẫu.');
      } catch (err: any) {
        console.error(err);
        setError('Không thể kết nối đến máy chủ Google Drive. Vui lòng tải lên thủ công.');
      } finally {
        setIsUploadingToDrive(false);
      }
    };
    reader.readAsDataURL(promptFile);
  };

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
      setDriveUrl(editingPrompt.driveUrl || '');
    } else {
      setTitle('');
      setToolType('Midjourney');
      setCategory('Phông Hội Nghị');
      setRawPrompt('');
      setOptimizedPrompt('');
      setPreviewImageUrl('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80');
      setTags('Phong dai hoi, Trong dong, Doan Thanh Nien, Do');
      setStatus('Approved');
      setIsVip(false);
      setDriveUrl('');
    }
    setSafetyNotice(null);
  }, [editingPrompt, isOpen]);

  if (!isOpen) return null;

  // Utilize Gemini to auto-optimize raw prompt as a professional tool helper
  const handleAIOptimize = async () => {
    if (!rawPrompt) return;
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(rawPrompt, category, toolType as any);
      setOptimizedPrompt(result);
    } catch (e) {
      // Fallback
      setOptimizedPrompt(`A high detailed professional vector background, ${rawPrompt}, realistic lighting, highly rendered, cinematic, 8k resolution`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleScanText = () => {
    const scanResult = scanContentSafety({
      title,
      description: `${rawPrompt} ${optimizedPrompt}`,
      tags: tags.split(',').map(t => t.trim())
    });
    setSafetyNotice(scanResult);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagArray = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const scanResult = scanContentSafety({
      title,
      description: `${rawPrompt} ${optimizedPrompt}`,
      tags: tagArray
    });

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
      violationReason: !scanResult.isSafe ? `Nội dung chứa từ khóa nhạy cảm bị gắn cờ: ${scanResult.matchedKeywords.join(', ')}` : undefined,
      isVip: isVip,
      driveUrl: driveUrl,
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

            {/* Google Drive URL & Prompt File Routing */}
            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Liên kết tải tệp tin / tài nguyên đính kèm Prompt</span>
                <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-mono font-bold">Thư mục con: /Promt mẫu</span>
              </label>

              <div className="border border-purple-100 rounded-2xl overflow-hidden bg-gradient-to-b from-purple-50/50 to-indigo-50/20 p-4 space-y-4">
                
                {/* Thư mục tiếp nhận chỉ định */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      <span>Thư mục chỉ định của Nguyễn Huy:</span>
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Vui lòng tải tệp tin bổ trợ câu lệnh lên thư mục con <strong className="text-purple-700 font-bold">/Promt mẫu</strong> nằm trong thư mục dùng chung <strong className="text-slate-700">Tainguyenchiase</strong>.
                    </p>
                  </div>
                  <a
                    href="https://drive.google.com/drive/folders/1adp9EiA1GTNFSaq2g0cz8dJbr1YpDzFd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all shrink-0 font-sans"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Mở thư mục /Promt mẫu</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                </div>

                {/* Upload file simulation & Automatic upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">A. Chọn tệp bổ trợ từ máy tính</span>
                    <div className="p-4 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl text-center space-y-1.5 bg-white hover:bg-purple-50/20 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        accept=".txt,.zip,.rar,.json,.png,.jpg,.jpeg"
                        onChange={handlePromptFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-purple-600 mx-auto" />
                      <div className="text-xs">
                        {promptFileName ? (
                          <span className="font-bold text-purple-700 block truncate">{promptFileName}</span>
                        ) : (
                          <span className="font-bold text-slate-800">Nhấp chọn tệp đính kèm (.zip, .txt...)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">B. Hoặc Nhập URL Tải về / Link Drive</span>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... hoặc link tải trực tiếp"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        className="w-full bg-white text-slate-900 rounded-xl border border-slate-200 px-3.5 py-3 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder:text-slate-400"
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
                      Bạn có thể tải tệp lên trực tiếp. Hệ thống sẽ tự động chuyển tệp vào thư mục con <strong className="font-black text-emerald-900">/Promt mẫu</strong> của bạn ngay lập tức!
                    </p>
                    
                    {promptFile ? (
                      <div className="pt-1 flex items-center justify-between gap-3">
                        <div className="text-[10px] text-slate-500 truncate max-w-[60%]">
                          Tệp đang chọn: <strong className="text-slate-700 font-bold">{promptFileName}</strong>
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
                    <strong className="font-bold text-rose-950">Gắn cờ nhạy cảm:</strong> Nội dung có chứa từ ngữ cần loại bỏ: <span className="font-extrabold text-rose-600">"{safetyNotice.matchedKeywords.join(', ')}"</span>. Hãy biên tập lại để đảm bảo tính chuẩn mực học thuật.
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
