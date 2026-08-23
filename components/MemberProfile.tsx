import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  User as UserIcon, Shield, Star, Award, Sparkles, Folder, CheckCircle, 
  Clock, Heart, Download, Edit2, Trash2, Calendar, Trophy, Zap, 
  Camera, Upload, Save, Check, X, RefreshCw, Phone, Mail, Building, FileText, Image as ImageIcon,
  Bookmark, BookmarkCheck, ExternalLink, Copy, BookOpen, Layers
} from 'lucide-react';
import { User, DesignFile, AIPrompt, Article } from '../types';
import { UserAvatar, compressAndResizeImage } from './UserAvatar';
import { 
  saveUserToDb, deleteDesignFromDb, deletePromptFromDb, deleteArticleFromDb,
  saveArticleToDb, saveDesignToDb, savePromptToDb 
} from '../lib/db';
import { useToast } from '../context/ToastContext';
import { ArticleReaderModal } from './ArticleReaderModal';
import { ArticleEditorModal } from './ArticleEditorModal';
import { DesignEditorModal } from './DesignEditorModal';
import { PromptEditorModal } from './PromptEditorModal';

interface MemberProfileProps {
  currentUser: User;
  onUpdateUser?: (updatedUser: User) => void;
  designFiles?: DesignFile[];
  aiPrompts?: AIPrompt[];
  articles?: Article[];
  onDesignUpdate?: (updatedFiles: DesignFile[]) => void;
  onPromptUpdate?: (updatedPrompts: AIPrompt[]) => void;
  onArticleUpdate?: (updatedArticles: Article[]) => void;
  onEditDesign?: (file: DesignFile) => void;
  onEditPrompt?: (prompt: AIPrompt) => void;
  onEditArticle?: (article: Article) => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({ 
  currentUser,
  onUpdateUser,
  designFiles,
  aiPrompts,
  articles,
  onDesignUpdate,
  onPromptUpdate,
  onArticleUpdate,
  onEditDesign,
  onEditPrompt,
  onEditArticle
}) => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [userFiles, setUserFiles] = useState<DesignFile[]>([]);
  const [userPrompts, setUserPrompts] = useState<AIPrompt[]>([]);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [contributionPoints, setContributionPoints] = useState(0);

  // Favorites state
  const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
  const [activeFavCategory, setActiveFavCategory] = useState<'all' | 'design' | 'prompt' | 'article'>('all');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  const loadFavorites = () => {
    const saved = localStorage.getItem('ictc_bookmarks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavoriteItems(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setFavoriteItems([]);
      }
    } else {
      setFavoriteItems([]);
    }
  };

  useEffect(() => {
    loadFavorites();

    const handleStorageChange = () => {
      loadFavorites();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const favoritedDesigns = useMemo(() => favoriteItems.filter(b => b.type === 'design' || b.targetType === 'design'), [favoriteItems]);
  const favoritedPrompts = useMemo(() => favoriteItems.filter(b => b.type === 'prompt' || b.targetType === 'prompt'), [favoriteItems]);
  const favoritedArticles = useMemo(() => favoriteItems.filter(b => b.type === 'article' || b.targetType === 'article'), [favoriteItems]);

  const filteredFavorites = useMemo(() => {
    if (activeFavCategory === 'design') return favoritedDesigns;
    if (activeFavCategory === 'prompt') return favoritedPrompts;
    if (activeFavCategory === 'article') return favoritedArticles;
    return favoriteItems;
  }, [activeFavCategory, favoriteItems, favoritedDesigns, favoritedPrompts, favoritedArticles]);

  const handleRemoveFavorite = (targetId: string, itemTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const saved = localStorage.getItem('ictc_bookmarks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as any[];
        const updated = parsed.filter(b => b.targetId !== targetId && b.id !== targetId);
        localStorage.setItem('ictc_bookmarks', JSON.stringify(updated));
        setFavoriteItems(updated);
        window.dispatchEvent(new Event('storage'));
        toastInfo(`Đã bỏ "${itemTitle}" khỏi danh sách Yêu thích.`, 'Bỏ lưu thành công');
      } catch (e) {}
    }
  };

  const handleCopyPromptText = (text: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toastSuccess(`Đã sao chép câu lệnh "${title}" vào khay nhớ tạm!`, 'Sao chép Prompt');
  };

  const handleOpenFavoriteItem = (item: any) => {
    const itemType = item.type || item.targetType;
    if (itemType === 'article') {
      const matched = (articles || []).find(a => a.id === item.targetId || a.id === item.id);
      if (matched) {
        setReadingArticle(matched);
      } else {
        setReadingArticle({
          id: item.targetId || item.id,
          title: item.title,
          slug: item.title?.toLowerCase().replace(/\s+/g, '-'),
          excerpt: item.description || item.title,
          content: `<p>${item.description || item.title}</p>`,
          coverImage: item.previewUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
          category: item.category || 'Chia sẻ',
          author: item.author || 'Thành viên ICTC',
          publishedAt: item.savedAt || new Date().toISOString().split('T')[0],
          viewsCount: 1,
          likesCount: 1,
          readingTimeMinutes: 3,
          isFeatured: false,
          status: 'Published'
        });
      }
    } else if (itemType === 'design') {
      if (item.driveUrl && item.driveUrl.startsWith('http')) {
        window.open(item.driveUrl, '_blank', 'noopener,noreferrer');
      } else if (item.attachedFileData) {
        const link = document.createElement('a');
        link.href = item.attachedFileData;
        link.download = item.attachedFileName || `${item.title}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toastInfo(`File mẫu thiết kế "${item.title}" đã lưu trong bộ sưu tập của bạn.`, 'Mẫu thiết kế');
      }
    } else if (itemType === 'prompt') {
      if (item.promptText) {
        handleCopyPromptText(item.promptText, item.title);
      }
    }
  };
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Editing state for modals
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);

  const [editingDesign, setEditingDesign] = useState<DesignFile | null>(null);
  const [isDesignEditorOpen, setIsDesignEditorOpen] = useState(false);

  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(currentUser.displayName || '');
    setDepartment(currentUser.department || '');
    setPhoneNumber(currentUser.phoneNumber || '');
    setBio(currentUser.bio || '');
  }, [currentUser]);

  useEffect(() => {
    const deletedIds = (() => {
      try { return JSON.parse(localStorage.getItem('ictc_deleted_ids') || '[]'); } catch (e) { return []; }
    })();

    // 1. Get user contributed designs
    const sourceFiles = designFiles && designFiles.length > 0 ? designFiles : (() => {
      const saved = localStorage.getItem('ictc_design_files');
      if (saved) {
        try { return JSON.parse(saved) as DesignFile[]; } catch (e) {}
      }
      return [];
    })();

    const filteredFiles = sourceFiles
      .filter(f => !deletedIds.includes(f.id))
      .filter(f => 
        f.authorId === currentUser.id || 
        (f.author && f.author.toLowerCase().includes(currentUser.displayName.toLowerCase())) ||
        (currentUser.role === 'Admin')
      );
    setUserFiles(filteredFiles);

    // 2. Get user contributed prompts
    const sourcePrompts = aiPrompts && aiPrompts.length > 0 ? aiPrompts : (() => {
      const saved = localStorage.getItem('ictc_ai_prompts');
      if (saved) {
        try { return JSON.parse(saved) as AIPrompt[]; } catch (e) {}
      }
      return [];
    })();

    const filteredPrompts = sourcePrompts
      .filter(p => !deletedIds.includes(p.id))
      .filter(p => 
        p.authorId === currentUser.id || 
        (p.author && p.author.toLowerCase().includes(currentUser.displayName.toLowerCase())) ||
        (currentUser.role === 'Admin')
      );
    setUserPrompts(filteredPrompts);

    // 3. Get user contributed articles
    const sourceArticles = articles && articles.length > 0 ? articles : (() => {
      const saved = localStorage.getItem('ictc_articles');
      if (saved) {
        try { return JSON.parse(saved) as Article[]; } catch (e) {}
      }
      return [];
    })();

    const filteredArticles = sourceArticles
      .filter(a => !deletedIds.includes(a.id))
      .filter(a => 
        a.authorId === currentUser.id || 
        (a.author && a.author.toLowerCase().includes(currentUser.displayName.toLowerCase())) ||
        (currentUser.role === 'Admin')
      );
    setUserArticles(filteredArticles);

  }, [currentUser, designFiles, aiPrompts, articles]);

  // Calculate dynamic gamification points
  useEffect(() => {
    const fileScore = userFiles.length * 50;
    const promptScore = userPrompts.length * 30;
    const popularityScore = userFiles.reduce((acc, f) => acc + (f.downloadsCount || 0), 0) * 2 +
                           userPrompts.reduce((acc, p) => acc + (p.likesCount || 0), 0) * 1;
    
    setContributionPoints(fileScore + promptScore + popularityScore + 100);
  }, [userFiles, userPrompts]);

  // Record deleted ID permanently so it persists across refreshes and syncs
  const recordDeletedId = (id: string) => {
    try {
      const saved = localStorage.getItem('ictc_deleted_ids');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('ictc_deleted_ids', JSON.stringify(list));
      }
    } catch (e) {}
  };

  // Handle avatar file upload
  const processAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG)');
      return;
    }

    try {
      setIsSaving(true);
      // Resize & compress to ~400px to maintain quality and optimal speed
      const compressedDataUrl = await compressAndResizeImage(file, 400, 0.88);
      
      const updatedUser: User = {
        ...currentUser,
        avatarUrl: compressedDataUrl
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        // Fallback local update
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        saveUserToDb(updatedUser).catch(console.warn);
      }

      toastSuccess('Đã cập nhật ảnh đại diện thành công!', 'Ảnh đại diện');
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
      toastError('Không thể xử lý tệp ảnh này. Vui lòng thử lại với ảnh khác.', 'Lỗi tải ảnh');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser.avatarUrl) return;
    if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện và quay về biểu tượng chữ cái mặc định?')) {
      setIsSaving(true);
      const updatedUser: User = {
        ...currentUser,
        avatarUrl: ''
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        saveUserToDb(updatedUser).catch(console.warn);
      }
      setIsSaving(false);
      toastInfo('Đã gỡ ảnh đại diện và chuyển về mặc định.', 'Gỡ ảnh đại diện');
    }
  };

  // Drag & drop handlers for avatar area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  // Save profile information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toastError('Vui lòng nhập đầy đủ họ và tên!', 'Thiếu thông tin');
      return;
    }

    setIsSaving(true);
    const updatedUser: User = {
      ...currentUser,
      displayName: displayName.trim(),
      department: department.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      bio: bio.trim() || undefined
    };

    try {
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        await saveUserToDb(updatedUser);
      }
      setIsEditingProfile(false);
      toastSuccess('Đã lưu thông tin cá nhân thành công!', 'Hồ sơ thành viên');
    } catch (e) {
      console.warn('Lưu thông tin thất bại:', e);
      toastSuccess('Đã cập nhật thông tin trong phiên làm việc!', 'Hồ sơ thành viên');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit / Save Design File Handlers
  const handleEditDesign = (file: DesignFile) => {
    if (onEditDesign) {
      onEditDesign(file);
    }
    setEditingDesign(file);
    setIsDesignEditorOpen(true);
  };

  const handleSaveDesign = async (savedFile: DesignFile) => {
    try {
      await saveDesignToDb(savedFile);
    } catch (e) {
      console.warn('Lưu thiết kế vào Firestore có cảnh báo, cập nhật bộ nhớ cục bộ:', e);
    }

    const currentAllDesigns = (designFiles && designFiles.length > 0) ? designFiles : userFiles;
    const exists = currentAllDesigns.some(f => f.id === savedFile.id);
    const updatedAll = exists 
      ? currentAllDesigns.map(f => f.id === savedFile.id ? savedFile : f)
      : [savedFile, ...currentAllDesigns];

    setUserFiles(prev => {
      const e = prev.some(f => f.id === savedFile.id);
      return e ? prev.map(f => f.id === savedFile.id ? savedFile : f) : [savedFile, ...prev];
    });

    localStorage.setItem('ictc_design_files', JSON.stringify(updatedAll));
    if (onDesignUpdate) {
      onDesignUpdate(updatedAll);
    }

    setIsDesignEditorOpen(false);
    setEditingDesign(null);
    toastSuccess('Đã cập nhật tài nguyên thiết kế thành công!', 'Hồ sơ cá nhân');
  };

  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tệp / bài đóng góp thiết kế này? Hành động này không thể hoàn tác.')) {
      recordDeletedId(fileId);

      try {
        await deleteDesignFromDb(fileId);
      } catch (e) {
        console.warn('Xóa từ Firestore có cảnh báo, tiếp tục xóa bộ nhớ cục bộ:', e);
      }

      setUserFiles(prev => prev.filter(f => f.id !== fileId));

      const source = (designFiles && designFiles.length > 0) ? designFiles : userFiles;
      const updated = source.filter(f => f.id !== fileId);
      localStorage.setItem('ictc_design_files', JSON.stringify(updated));

      if (onDesignUpdate) {
        onDesignUpdate(updated);
      }

      window.dispatchEvent(new Event('storage'));
      toastInfo('Đã xóa bài đóng góp thiết kế thành công.', 'Đã xóa');
    }
  };

  // Edit / Save Prompt Handlers
  const handleEditPrompt = (prompt: AIPrompt) => {
    if (onEditPrompt) {
      onEditPrompt(prompt);
    }
    setEditingPrompt(prompt);
    setIsPromptEditorOpen(true);
  };

  const handleSavePrompt = async (savedPrompt: AIPrompt) => {
    try {
      await savePromptToDb(savedPrompt);
    } catch (e) {
      console.warn('Lưu prompt vào Firestore có cảnh báo, cập nhật bộ nhớ cục bộ:', e);
    }

    const currentAllPrompts = (aiPrompts && aiPrompts.length > 0) ? aiPrompts : userPrompts;
    const exists = currentAllPrompts.some(p => p.id === savedPrompt.id);
    const updatedAll = exists 
      ? currentAllPrompts.map(p => p.id === savedPrompt.id ? savedPrompt : p)
      : [savedPrompt, ...currentAllPrompts];

    setUserPrompts(prev => {
      const e = prev.some(p => p.id === savedPrompt.id);
      return e ? prev.map(p => p.id === savedPrompt.id ? savedPrompt : p) : [savedPrompt, ...prev];
    });

    localStorage.setItem('ictc_ai_prompts', JSON.stringify(updatedAll));
    if (onPromptUpdate) {
      onPromptUpdate(updatedAll);
    }

    setIsPromptEditorOpen(false);
    setEditingPrompt(null);
    toastSuccess('Đã cập nhật câu lệnh AI thành công!', 'Hồ sơ cá nhân');
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đóng góp câu lệnh AI này? Hành động này không thể hoàn tác.')) {
      recordDeletedId(promptId);

      try {
        await deletePromptFromDb(promptId);
      } catch (e) {
        console.warn('Xóa từ Firestore có cảnh báo, tiếp tục xóa bộ nhớ cục bộ:', e);
      }

      setUserPrompts(prev => prev.filter(p => p.id !== promptId));

      const source = (aiPrompts && aiPrompts.length > 0) ? aiPrompts : userPrompts;
      const updated = source.filter(p => p.id !== promptId);
      localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));

      if (onPromptUpdate) {
        onPromptUpdate(updated);
      }

      window.dispatchEvent(new Event('storage'));
      toastInfo('Đã xóa câu lệnh AI thành công.', 'Đã xóa');
    }
  };

  // Edit / Save Article Handlers
  const handleEditArticle = (article: Article) => {
    if (onEditArticle) {
      onEditArticle(article);
    }
    setEditingArticle(article);
    setIsArticleEditorOpen(true);
  };

  const handleSaveArticle = async (savedArticle: Article) => {
    try {
      await saveArticleToDb(savedArticle);
    } catch (e) {
      console.warn('Lưu bài viết vào Firestore có cảnh báo, cập nhật bộ nhớ cục bộ:', e);
    }

    const currentAllArticles = (articles && articles.length > 0) ? articles : userArticles;
    const exists = currentAllArticles.some(a => a.id === savedArticle.id);
    const updatedAll = exists 
      ? currentAllArticles.map(a => a.id === savedArticle.id ? savedArticle : a)
      : [savedArticle, ...currentAllArticles];

    setUserArticles(prev => {
      const e = prev.some(a => a.id === savedArticle.id);
      return e ? prev.map(a => a.id === savedArticle.id ? savedArticle : a) : [savedArticle, ...prev];
    });

    localStorage.setItem('ictc_articles', JSON.stringify(updatedAll));
    if (onArticleUpdate) {
      onArticleUpdate(updatedAll);
    }

    setIsArticleEditorOpen(false);
    setEditingArticle(null);
    toastSuccess('Đã cập nhật bài viết thành công!', 'Hồ sơ cá nhân');
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.')) {
      recordDeletedId(articleId);

      try {
        await deleteArticleFromDb(articleId);
      } catch (e) {
        console.warn('Xóa từ Firestore có cảnh báo, tiếp tục xóa bộ nhớ cục bộ:', e);
      }

      setUserArticles(prev => prev.filter(a => a.id !== articleId));

      const source = (articles && articles.length > 0) ? articles : userArticles;
      const updated = source.filter(a => a.id !== articleId);
      localStorage.setItem('ictc_articles', JSON.stringify(updated));

      if (onArticleUpdate) {
        onArticleUpdate(updated);
      }

      window.dispatchEvent(new Event('storage'));
      toastInfo('Đã xóa bài viết thành công.', 'Đã xóa');
    }
  };

  // Determine user level & title
  const getDesignerTitle = () => {
    if (contributionPoints >= 1000) return { title: 'Đại sứ Sáng tạo (VIP)', color: 'from-amber-500 to-orange-600 text-white', ring: 'border-amber-400' };
    if (contributionPoints >= 500) return { title: 'Nhà thiết kế hạng Vàng', color: 'from-purple-500 to-indigo-600 text-white', ring: 'border-purple-400' };
    if (contributionPoints >= 250) return { title: 'Nhà thiết kế hạng Bạc', color: 'from-blue-500 to-teal-500 text-white', ring: 'border-blue-400' };
    return { title: 'Thành viên Tích cực', color: 'from-slate-100 to-slate-200 text-slate-800', ring: 'border-slate-300' };
  };

  const badgeConfig = getDesignerTitle();

  return (
    <div className="space-y-8 animate-fade-in relative" id="member-profile-root">
      
      {/* Hidden Global File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Profile Cover & Header card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm relative">
        {/* Cover banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="cover-grid" width="30" height="30" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M.5 30V.5H30" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cover-grid)" />
          </svg>
          <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white flex items-center space-x-1.5 border border-white/15">
            <Calendar className="w-3.5 h-3.5" />
            <span>Gia nhập: {currentUser.joinedDate}</span>
          </div>
        </div>

        {/* User profile layout row */}
        <div className="px-6 pb-6 pt-0 sm:px-8 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6">
            
            {/* Interactive Avatar Card with Drag & Drop & Upload Button */}
            <div 
              className={`relative group rounded-full p-1 bg-white shadow-lg shrink-0 transition-all ${
                isDragging ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UserAvatar 
                user={currentUser} 
                size="2xl" 
                className={`border-4 bg-white ${badgeConfig.ring}`}
              />

              {/* Upload trigger button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-md border-2 border-white transition-all group-hover:scale-110"
                title="Tải ảnh đại diện mới từ máy tính / điện thoại"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User details */}
            <div className="space-y-1.5 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {currentUser.displayName}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-gradient-to-r ${badgeConfig.color} border border-white/10 shadow-sm self-center sm:self-auto`}>
                  {currentUser.role}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 font-semibold">{currentUser.email}</p>
              
              {currentUser.department && (
                <p className="text-xs text-slate-600 font-medium flex items-center justify-center sm:justify-start">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {currentUser.department}
                </p>
              )}

              <p className="text-xs text-blue-600 font-extrabold flex items-center justify-center sm:justify-start">
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Danh hiệu: <span className="ml-1 underline decoration-2 decoration-blue-200">{badgeConfig.title}</span>
              </p>
            </div>
          </div>

          {/* Action buttons and summary */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Avatar quick actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/60 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh lên</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center justify-center p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                  title="Xóa ảnh và dùng chữ cái mặc định"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 font-bold text-xs rounded-xl border transition-colors shadow-xs ${
                  isEditingProfile 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Đóng chỉnh sửa' : 'Sửa thông tin'}</span>
              </button>
            </div>

            {/* Points summary bubble */}
            <div className="flex bg-slate-50 border border-slate-150 p-3.5 rounded-2xl justify-around gap-5 w-full sm:w-auto text-center">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Điểm đóng góp</p>
                <p className="text-lg font-black text-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-0.5" />
                  {contributionPoints.toLocaleString()}
                </p>
              </div>
              <div className="border-l border-slate-200 h-8 self-center"></div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</p>
                <p className="text-lg font-black text-slate-900">{(userFiles.length + userPrompts.length)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio row if present */}
        {currentUser.bio && !isEditingProfile && (
          <div className="px-6 pb-6 sm:px-8 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              "{currentUser.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Form (Expanded view) */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa hồ sơ cá nhân</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cập nhật thông tin hiển thị của bạn trên hệ thống ICTC</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên hiển thị *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Huy"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phòng ban / Chuyên ngành</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Khoa Công nghệ thông tin / Ban Quản trị"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại / Zalo</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912 345 678"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email (Cố định)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-100 text-slate-500 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiểu sử / Giới thiệu bản thân</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ đôi nét về bạn, sở thích thiết kế hoặc mục tiêu học tập..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Badges and milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${contributionPoints >= 100 ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${contributionPoints >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thành viên Tiên phong</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đăng ký thành công</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${userFiles.length >= 1 ? 'border-blue-100 bg-blue-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${userFiles.length >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thiết kế đồng</p>
            <p className="text-[10px] text-slate-400 font-semibold">Có 1 đóng góp Slide/UI</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${userFiles.length >= 3 || userPrompts.length >= 3 ? 'border-purple-100 bg-purple-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${userFiles.length >= 3 || userPrompts.length >= 3 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thiết kế bạc</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đóng góp 3+ tài liệu</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${contributionPoints >= 1000 ? 'border-amber-100 bg-amber-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${contributionPoints >= 1000 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Đại sứ Sáng tạo</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đạt trên 1,000 điểm</p>
          </div>
        </div>
      </div>

      {/* Favorites / Bookmarks Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>Mục Yêu thích & Bộ sưu tập đã lưu ({favoriteItems.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Danh sách các bài viết, mẫu thiết kế slide/đồ án và câu lệnh AI bạn đã đánh dấu lưu trữ.</p>
          </div>

          {/* Sub-category tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
            <button
              onClick={() => setActiveFavCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFavCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả ({favoriteItems.length})
            </button>
            <button
              onClick={() => setActiveFavCategory('design')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFavCategory === 'design'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Thiết kế ({favoritedDesigns.length})
            </button>
            <button
              onClick={() => setActiveFavCategory('prompt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFavCategory === 'prompt'
                  ? 'bg-white text-violet-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              AI Prompt ({favoritedPrompts.length})
            </button>
            <button
              onClick={() => setActiveFavCategory('article')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFavCategory === 'article'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Bài viết ({favoritedArticles.length})
            </button>
          </div>
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
            <Bookmark className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-bold text-slate-600">Chưa có mục yêu thích nào trong danh mục này</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Hãy nhấn vào biểu tượng <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> hoặc biểu tượng Lưu trên các bài viết, mẫu slide hoặc AI prompt để xem lại nhanh tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFavorites.map((item, index) => {
              const itemType = item.type || item.targetType;
              const isDesign = itemType === 'design';
              const isPrompt = itemType === 'prompt';
              const isArticle = itemType === 'article';

              return (
                <div
                  key={item.id || item.targetId || index}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2.5">
                    {/* Header Image & Badge */}
                    <div className="relative aspect-[16/9] bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                      <img
                        src={item.previewUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2">
                        {isDesign && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-xs">
                            <ImageIcon className="w-3 h-3" />
                            <span>Mẫu Thiết kế</span>
                          </span>
                        )}
                        {isPrompt && (
                          <span className="px-2.5 py-1 rounded-lg bg-violet-600/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Prompt</span>
                          </span>
                        )}
                        {isArticle && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-extrabold flex items-center space-x-1 shadow-xs">
                            <FileText className="w-3 h-3" />
                            <span>Bài viết</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleRemoveFavorite(item.targetId || item.id, item.title, e)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 text-rose-500 rounded-lg backdrop-blur-md shadow-xs transition-colors"
                        title="Bỏ lưu khỏi Yêu thích"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        {item.category || (isDesign ? 'Slide/Tài liệu' : isPrompt ? 'AI Prompt' : 'Chia sẻ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.promptText && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {item.promptText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-medium">
                      {item.savedAt ? `Lưu ${item.savedAt}` : item.author ? item.author : 'Thành viên ICTC'}
                    </span>

                    <button
                      onClick={() => handleOpenFavoriteItem(item)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                        isDesign
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                          : isPrompt
                          ? 'bg-violet-50 hover:bg-violet-100 text-violet-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isDesign && (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Mở / Tải về</span>
                        </>
                      )}
                      {isPrompt && (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                      {isArticle && (
                        <>
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Đọc bài</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contribution lists layout */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">Sản phẩm tôi đóng góp cho cộng đồng</h3>
          <p className="text-xs text-slate-400 mt-1">Các tài liệu, thiết kế đồ án, slide và câu lệnh AI cao cấp do bạn đóng góp sẽ được lưu trữ và kiểm duyệt tại đây.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* List 1: Slide & Design Files */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                <Folder className="w-4 h-4 mr-1.5 text-blue-500" />
                Mẫu Thiết kế / Tài liệu ({userFiles.length})
              </span>
            </div>

            {userFiles.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium italic">Bạn chưa đóng góp tài nguyên thiết kế nào.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userFiles.map(file => (
                  <div key={file.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          file.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {file.status === 'Approved' ? 'Đã duyệt' : 'Đang duyệt'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{file.fileType}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{file.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">Đăng vào: {file.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleEditDesign(file)}
                        className="p-1.5 bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-200 transition-colors"
                        title="Sửa bài đăng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List 2: AI Prompts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-purple-500" />
                Câu lệnh AI ({userPrompts.length})
              </span>
            </div>

            {userPrompts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium italic">Bạn chưa đóng góp câu lệnh AI nào.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userPrompts.map(prompt => (
                  <div key={prompt.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          prompt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {prompt.status === 'Approved' ? 'Đã duyệt' : 'Đang duyệt'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{prompt.toolType}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{prompt.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">Đăng vào: {prompt.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleEditPrompt(prompt)}
                        className="p-1.5 bg-white hover:bg-purple-50 text-slate-400 hover:text-purple-600 rounded-lg border border-slate-200 transition-colors"
                        title="Sửa câu lệnh"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List 3: Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-emerald-500" />
                Bài viết đã đăng ({userArticles.length})
              </span>
            </div>

            {userArticles.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium italic">Bạn chưa viết bài chia sẻ nào.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userArticles.map(article => (
                  <div key={article.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          article.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {article.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{article.category}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{article.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">Ngày đăng: {article.publishedAt}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="p-1.5 bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg border border-slate-200 transition-colors"
                        title="Sửa bài viết"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Article Reader Modal inside Profile when an article from favorites is opened */}
      {readingArticle && (
        <ArticleReaderModal
          article={readingArticle}
          currentUser={currentUser}
          onClose={() => setReadingArticle(null)}
        />
      )}

      {/* Article Editor Modal */}
      {isArticleEditorOpen && (
        <ArticleEditorModal
          isOpen={isArticleEditorOpen}
          onClose={() => {
            setIsArticleEditorOpen(false);
            setEditingArticle(null);
          }}
          articleToEdit={editingArticle}
          designFiles={designFiles || []}
          onSaveSuccess={handleSaveArticle}
          currentAuthorName={currentUser.displayName}
        />
      )}

      {/* Design Editor Modal */}
      {isDesignEditorOpen && (
        <DesignEditorModal
          isOpen={isDesignEditorOpen}
          onClose={() => {
            setIsDesignEditorOpen(false);
            setEditingDesign(null);
          }}
          editingFile={editingDesign}
          currentUser={currentUser}
          onSave={handleSaveDesign}
        />
      )}

      {/* Prompt Editor Modal */}
      {isPromptEditorOpen && (
        <PromptEditorModal
          isOpen={isPromptEditorOpen}
          onClose={() => {
            setIsPromptEditorOpen(false);
            setEditingPrompt(null);
          }}
          editingPrompt={editingPrompt}
          currentUser={currentUser}
          onSave={handleSavePrompt}
        />
      )}
    </div>
  );
};
