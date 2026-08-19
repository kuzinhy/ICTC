import React, { useState, useEffect } from 'react';
import { 
  X, Save, Eye, Sparkles, Image as ImageIcon, BookOpen, 
  Tag, Clock, Pin, Check, AlertCircle, FileText, Upload
} from 'lucide-react';
import { Article } from '../types';
import { saveArticleToDb } from '../lib/db';

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onSaveSuccess: (article: Article) => void;
  currentAuthorName: string;
}

const CATEGORY_OPTIONS: Article['category'][] = [
  'Mẹo thiết kế',
  'Nghiên cứu & Đồ án',
  'Thủ thuật AI',
  'Kỹ năng thuyết trình',
  'Thông báo & Sự kiện'
];

const PRESET_COVERS = [
  { label: 'Thiết kế Đồ họa & Typography', url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI & Trí tuệ nhân tạo', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Nghiên cứu Khoa học & Báo cáo', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Thuyết trình & Slide chuyên nghiệp', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Sự kiện & Hội thảo ICTC', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Màu sắc & Phối màu chuẩn Việt Nam', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' }
];

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  articleToEdit,
  onSaveSuccess,
  currentAuthorName
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Article['category']>('Mẹo thiết kế');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [fallbackCoverImage, setFallbackCoverImage] = useState('');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [tagsInput, setTagsInput] = useState('ICTC, Thiết Kế, Chia Sẻ');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate data when opening or editing
  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setCategory(articleToEdit.category || 'Mẹo thiết kế');
      setSummary(articleToEdit.summary || '');
      setContent(articleToEdit.content || '');
      setCoverImage(articleToEdit.coverImage || PRESET_COVERS[0].url);
      setFallbackCoverImage(articleToEdit.fallbackCoverImage || '');
      setReadTimeMinutes(articleToEdit.readTimeMinutes || 5);
      setTagsInput(articleToEdit.tags?.join(', ') || 'ICTC, Thiết Kế');
      setIsPinned(!!articleToEdit.isPinned);
      setStatus(articleToEdit.status === 'Draft' ? 'Draft' : 'Published');
    } else {
      // Default new article template
      setTitle('');
      setCategory('Mẹo thiết kế');
      setSummary('');
      setContent(`### Giới thiệu tổng quan\n\nChia sẻ kinh nghiệm thiết kế slide báo cáo và ấn phẩm truyền thông chuyên nghiệp...\n\n### 1. Các nguyên tắc cốt lõi\n- Bố cục lưới (Grid system)\n- Phối màu theo tiêu chuẩn nhận diện thương hiệu\n- Phông chữ Việt hóa chuẩn dấu\n\n### 2. Lời khuyên khi xuất bản\nLuôn xuất bản định dạng PDF chất lượng cao hoặc tệp gốc Google Slides.`);
      setCoverImage(PRESET_COVERS[0].url);
      setFallbackCoverImage('');
      setReadTimeMinutes(4);
      setTagsInput('ICTC, Slide, Báo Cáo, Thiết Kế');
      setIsPinned(false);
      setStatus('Published');
    }
    setErrorMsg('');
    setIsPreviewMode(false);
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài viết!');
      return;
    }
    if (!summary.trim()) {
      setErrorMsg('Vui lòng nhập tóm tắt ngắn cho bài viết!');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung chi tiết bài viết!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const processedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const finalArticle: Article = {
      id: articleToEdit?.id || `art-${Date.now()}`,
      title: title.trim(),
      slug: slug || `bai-viet-${Date.now()}`,
      summary: summary.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || PRESET_COVERS[0].url,
      fallbackCoverImage: fallbackCoverImage.trim() || undefined,
      category,
      author: articleToEdit?.author || currentAuthorName || 'Ban Quản trị ICTC',
      authorAvatar: articleToEdit?.authorAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentAuthorName}`,
      publishedAt: articleToEdit?.publishedAt || new Date().toISOString().split('T')[0],
      readTimeMinutes: Number(readTimeMinutes) || 5,
      viewsCount: articleToEdit?.viewsCount || 0,
      likesCount: articleToEdit?.likesCount || 0,
      commentsCount: articleToEdit?.commentsCount || 0,
      tags: processedTags.length > 0 ? processedTags : ['ICTC', 'Tin tức'],
      isPinned,
      status
    };

    try {
      // 1. Sync to Cloud Firestore if available
      await saveArticleToDb(finalArticle).catch(err => console.warn('Firestore sync optional fallback:', err));

      // 2. Return to parent
      onSaveSuccess(finalArticle);
      onClose();
    } catch (err: any) {
      setErrorMsg('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col relative my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {articleToEdit ? 'Chỉnh sửa bài viết' : 'Soạn thảo & Xuất bản bài viết mới'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Chia sẻ kiến thức, mẹo thiết kế hoặc thông báo quan trọng đến cộng đồng ICTC
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border ${
                isPreviewMode 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Chế độ Soạn thảo' : 'Xem trước bài'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isPreviewMode ? (
            /* LIVE PREVIEW */
            <div className="space-y-6 max-w-2xl mx-auto py-2">
              <div className="relative h-64 rounded-3xl overflow-hidden shadow-md">
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg w-fit mb-2">
                    {category}
                  </span>
                  <h1 className="text-2xl font-black">{title || 'Tiêu đề bài viết xem trước'}</h1>
                  <p className="text-xs text-slate-200 mt-1">
                    Bởi <strong>{currentAuthorName}</strong> • {readTimeMinutes} phút đọc
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 italic">
                "{summary || 'Tóm tắt bài viết sẽ hiển thị ở đây...'}"
              </div>

              <div className="prose prose-sm text-slate-800 space-y-3 whitespace-pre-wrap leading-relaxed">
                {content || 'Nội dung chi tiết bài viết...'}
              </div>
            </div>
          ) : (
            /* EDIT FORM */
            <form id="article-editor-form" onSubmit={handleSubmit} className="space-y-5">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tiêu đề bài viết *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: 10 Quy tắc Vàng Khi Thiết Kế Slide Báo Cáo..."
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chuyên mục *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tóm tắt ngắn (Hiện ở danh sách thẻ bài viết) *</label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả súc tích từ 1 - 2 câu về nội dung bài viết..."
                  className="w-full bg-slate-50 text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Cover Image & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ảnh bìa bài viết (URL hoặc chọn mẫu đẹp sẵn) *</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <input
                    type="url"
                    required
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-50 text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                      onError={(e) => {
                        (e.target as any).src = PRESET_COVERS[0].url;
                      }}
                    />
                  )}
                </div>

                {/* Cover Presets */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">Mẫu gợi ý:</span>
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg shrink-0 transition-colors ${
                        coverImage === preset.url
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Fallback Cover Image URL */}
                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ảnh đại diện dự phòng (Fallback Cover Image URL)</label>
                  <input
                    type="url"
                    value={fallbackCoverImage}
                    onChange={(e) => setFallbackCoverImage(e.target.value)}
                    placeholder="https://... (Sử dụng tự động khi ảnh bìa chính bị lỗi không load được)"
                    className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    * Tùy chọn: Nhập link ảnh thay thế khi ảnh bìa chính gặp sự cố kết nối hoặc không hiển thị được.
                  </p>
                </div>
              </div>

              {/* Content Markdown Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nội dung chi tiết bài viết (Hỗ trợ Markdown & Tiêu đề #, ##, -) *</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Đã nhập {content.length} ký tự</span>
                </div>
                <textarea
                  required
                  rows={9}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung bài viết chi tiết ở đây..."
                  className="w-full bg-slate-50 text-slate-900 p-4 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none font-sans"
                />
              </div>

              {/* Tags, Read Time, Pinned & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                {/* Tags */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>Thẻ phân loại (ngăn cách bằng dấu phẩy)</span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Slide, AI, Canva, ICTC"
                    className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                {/* Read Time */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Thời gian đọc</span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={readTimeMinutes}
                      onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                      className="w-full bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">phút</span>
                  </div>
                </div>

                {/* Pinned & Status */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 text-amber-500 rounded accent-amber-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 flex items-center">
                      <Pin className="w-3 h-3 mr-1 text-amber-500" /> Ghim nổi bật
                    </span>
                  </label>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-semibold text-slate-500">Trạng thái:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="bg-white text-slate-800 font-bold px-2 py-1 rounded-lg border border-slate-200 text-[11px] focus:outline-none"
                    >
                      <option value="Published">Xuất bản ngay</option>
                      <option value="Draft">Lưu bản nháp</option>
                    </select>
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            form="article-editor-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu...' : articleToEdit ? 'Cập nhật bài viết' : 'Xuất bản bài viết'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
