import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, BookOpen, Clock, Eye, Heart, Share2, Plus, 
  Sparkles, Filter, Bookmark, BookmarkCheck, ArrowRight, 
  Check, Calendar, User as UserIcon, X, Tag, Edit3, Flame, Pin,
  MessageSquare, MessageCircle, Link2, Download, Layers
} from 'lucide-react';
import { Article, User as UserType, DesignFile } from '../types';
import { INITIAL_ARTICLES } from '../data/mockData';
import { UserAvatar } from './UserAvatar';
import { ArticleReaderModal } from './ArticleReaderModal';
import { NewProductsShowcase } from './NewProductsShowcase';
import { LegalComplianceModal } from './LegalComplianceModal';
import { ReportViolationModal } from './ReportViolationModal';
import { saveArticleToDb, deleteArticleFromDb } from '../lib/db';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';
import { useToast } from '../context/ToastContext';

interface ArticleHubProps {
  currentUser: UserType | null;
  articles: Article[];
  onArticlesUpdate: (updatedArticles: Article[]) => void;
  selectedSpecialty?: string;
  onNavigateDesignHub?: () => void;
  onRequireAuth?: (reason?: string) => void;
}

const CATEGORIES = [
  'Tất cả',
  'Mẹo thiết kế',
  'Nghiên cứu & Đồ án',
  'Thủ thuật AI',
  'Kỹ năng thuyết trình',
  'Thông báo & Sự kiện'
];

export const ArticleHub: React.FC<ArticleHubProps> = ({ 
  currentUser, 
  articles,
  onArticlesUpdate,
  selectedSpecialty,
  onNavigateDesignHub,
  onRequireAuth 
}) => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Article Creation Modal
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Mẹo thiết kế' | 'Nghiên cứu & Đồ án' | 'Thủ thuật AI' | 'Kỹ năng thuyết trình' | 'Thông báo & Sự kiện'>('Mẹo thiết kế');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCoverImage, setNewCoverImage] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newReadTime, setNewReadTime] = useState(5);
  const [isPinned, setIsPinned] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(true);

  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Modals
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ip_policy');
  const [reportingItem, setReportingItem] = useState<{ id: string; title: string; type: 'article' | 'comment' } | null>(null);

  // Interaction States
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [likedArticleIds, setLikedArticleIds] = useState<string[]>([]);
  const [sharedToastId, setSharedToastId] = useState<string | null>(null);

  // Load articles & cached interactions
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('ictc_bookmarks');
    if (savedBookmarks) {
      try {
        const bms = JSON.parse(savedBookmarks);
        setBookmarkedIds(bms.map((b: any) => b.targetId));
      } catch (e) {}
    }

    const savedLikes = localStorage.getItem('ictc_liked_articles');
    if (savedLikes) {
      try {
        setLikedArticleIds(JSON.parse(savedLikes));
      } catch (e) {}
    }
  }, []);

  const handleToggleBookmark = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập hoặc đăng ký thành viên miễn phí để lưu bài viết vào bộ sưu tập!');
      }
      return;
    }

    const savedBookmarks = localStorage.getItem('ictc_bookmarks');
    let bookmarks: any[] = [];
    if (savedBookmarks) {
      try { bookmarks = JSON.parse(savedBookmarks); } catch (e) {}
    }

    const isAlready = bookmarks.some((b: any) => b.targetId === art.id);
    if (isAlready) {
      bookmarks = bookmarks.filter((b: any) => b.targetId !== art.id);
      setBookmarkedIds(prev => prev.filter(id => id !== art.id));
      toastInfo('Đã bỏ lưu bài viết khỏi danh mục Yêu thích.', 'Bỏ lưu bài viết');
    } else {
      bookmarks.push({
        id: `bm-${Date.now()}`,
        targetId: art.id,
        type: 'article',
        title: art.title,
        category: art.category,
        previewUrl: art.coverImage,
        savedAt: new Date().toISOString().split('T')[0]
      });
      setBookmarkedIds(prev => [...prev, art.id]);
      toastSuccess(`Đã lưu "${art.title}" vào danh sách Yêu thích của bạn!`, 'Đã lưu bài viết');
    }

    localStorage.setItem('ictc_bookmarks', JSON.stringify(bookmarks));
  };

  // Like Article directly from Card
  const handleToggleLike = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập tài khoản thành viên để thả tim bài viết!');
      }
      return;
    }

    const isLiked = likedArticleIds.includes(art.id);
    let updatedLikes: string[];
    let newLikesCount: number;

    if (isLiked) {
      updatedLikes = likedArticleIds.filter(id => id !== art.id);
      newLikesCount = Math.max(0, (art.likesCount || 0) - 1);
    } else {
      updatedLikes = [...likedArticleIds, art.id];
      newLikesCount = (art.likesCount || 0) + 1;
      toastSuccess(`Cảm ơn bạn đã thả tim cho bài viết "${art.title}"!`, 'Thả tim thành công');
    }

    setLikedArticleIds(updatedLikes);
    localStorage.setItem('ictc_liked_articles', JSON.stringify(updatedLikes));

    const updatedArt = { ...art, likesCount: newLikesCount };
    const updatedList = articles.map(a => a.id === art.id ? updatedArt : a);
    onArticlesUpdate(updatedList);
    saveArticleToDb(updatedArt).catch(console.warn);
  };

  // Share Article directly from Card
  const handleShareArticle = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSharedToastId(art.id);
    toastSuccess('Đã sao chép liên kết bài viết vào clipboard!', 'Chia sẻ bài viết');
    setTimeout(() => {
      setSharedToastId(null);
    }, 2500);
  };

  // Open Article Reader focused on comments
  const handleOpenComments = (e: React.MouseEvent, art: Article) => {
    e.stopPropagation();
    setSelectedArticle(art);
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const isAdmin = currentUser?.role === 'Admin';
    const authorName = currentUser?.displayName || 'Thành viên ICTC';

    // Run hidden safety moderation scan
    const safetyCheck = scanContentSafety({
      title: newTitle,
      description: newSummary + " " + newContent,
      tags: newTags.split(',').map(t => t.trim()),
      author: authorName
    });

    const isAutoFlagged = !safetyCheck.isSafe;

    if (isAutoFlagged) {
      // Automatically submit moderation report
      submitContentReport({
        targetId: `art-${Date.now()}`,
        targetType: 'article',
        targetTitle: newTitle,
        reason: `Phát hiện từ khóa nghi vấn (${safetyCheck.matchedKeywords.join(', ')})`,
        details: `Nội dung bị hệ thống tự động gắn cờ cảnh báo rủi ro ${safetyCheck.riskLevel.toUpperCase()}.`,
        reporterName: 'Hệ Thống Tự Động (Hidden Scanner)',
        severity: safetyCheck.riskLevel === 'severe' ? 'high' : 'medium',
        autoFlagged: true
      });
    }

    const articleStatus: 'Published' | 'Pending' = (isAdmin && !isAutoFlagged) ? 'Published' : 'Pending';

    const newArticleItem: Article = {
      id: `art-${Date.now()}`,
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      summary: newSummary.trim() || newTitle.trim(),
      content: newContent.trim(),
      coverImage: newCoverImage.trim() || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
      category: newCategory,
      author: authorName,
      authorId: currentUser?.id || 'usr-anonymous',
      authorAvatar: currentUser?.avatarUrl || '',
      publishedAt: new Date().toISOString().split('T')[0],
      readTimeMinutes: Number(newReadTime) || 5,
      viewsCount: 1,
      likesCount: 0,
      commentsCount: 0,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: isAdmin && isPinned,
      status: articleStatus,
      autoFlaggedViolation: isAutoFlagged,
      violationReason: isAutoFlagged ? `Từ khóa nghi vấn: ${safetyCheck.matchedKeywords.join(', ')}` : undefined
    };

    const updated = [newArticleItem, ...articles];
    onArticlesUpdate(updated);

    try {
      await saveArticleToDb(newArticleItem);
    } catch (err) {
      console.warn("Firestore sync failed:", err);
    }

    if (isAutoFlagged) {
      setFormSuccessMessage('CẢNH BÁO KIỂM DUYỆT: Bài viết chứa từ ngữ nhạy cảm cần xem xét. Bài đã được chuyển sang hàng chờ Ban Quản Trị thẩm định trước khi xuất bản!');
    } else if (isAdmin) {
      setFormSuccessMessage('Bài viết của Quản trị viên đã được xuất bản trực tiếp thành công!');
    } else {
      setFormSuccessMessage('Bài viết của bạn đã được gửi thành công và đang chờ Quản trị viên kiểm duyệt trước khi hiển thị công khai!');
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setFormSuccessMessage('');
      setIsWriteModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewSummary('');
      setNewContent('');
      setNewCoverImage('');
      setNewTags('');
      setIsPinned(false);
    }, 1800);
  };

  // Filtering
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      // Determine visibility:
      // 1. Published articles are visible to everyone
      // 2. Admins can view all articles (Published, Pending, Rejected)
      // 3. Members can view their own pending/rejected articles
      const isOwner = currentUser && (art.authorId === currentUser.id || art.author === currentUser.displayName);
      const canView = art.status === 'Published' || currentUser?.role === 'Admin' || isOwner;
      if (!canView) return false;

      const matchCategory = selectedCategory === 'Tất cả' || art.category === selectedCategory;
      const matchSearch = searchTerm === '' || 
        art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesSpecialty = true;
      if (selectedSpecialty && selectedSpecialty !== 'all') {
        const allText = `${art.title} ${art.summary} ${art.category} ${art.tags.join(' ')}`.toLowerCase();
        if (selectedSpecialty === 'design') {
          matchesSpecialty = art.category === 'Mẹo thiết kế' || /thiết kế|design|đồ họa|canva|powerpoint|slide|figma/i.test(allText);
        } else if (selectedSpecialty === 'code') {
          matchesSpecialty = art.category === 'Thủ thuật AI' || /lập trình|code|cntt|web|react|python|thuật toán|công nghệ/i.test(allText);
        } else if (selectedSpecialty === 'research') {
          matchesSpecialty = art.category === 'Nghiên cứu & Đồ án' || art.category === 'Kỹ năng thuyết trình' || /nghiên cứu|học thuật|đồ án|luận văn|tiểu luận|khoa học/i.test(allText);
        } else if (selectedSpecialty === 'marketing') {
          matchesSpecialty = /marketing|truyền thông|thương hiệu|quảng cáo|slogan|kế hoạch/i.test(allText);
        } else if (selectedSpecialty === 'youth') {
          matchesSpecialty = art.category === 'Thông báo & Sự kiện' || /đoàn|hội|thanh niên|tình nguyện|sinh viên|phong trào|sự kiện/i.test(allText);
        }
      }

      return matchCategory && matchSearch && matchesSpecialty;
    });
  }, [articles, searchTerm, selectedCategory, selectedSpecialty, currentUser]);

  const featuredArticle = articles.find(a => a.isPinned && a.status === 'Published') || articles.find(a => a.status === 'Published') || articles[0];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* Header & Write Article Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/10 via-indigo-900/5 to-purple-900/10 p-6 sm:p-8 rounded-3xl border border-blue-100">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black uppercase text-blue-600 tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Kênh Kiến Thức & Nghiên Cứu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Bài viết, Tin tức & Kinh nghiệm thực chiến
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl mt-1">
            Tổng hợp các bài viết hướng dẫn thiết kế slide đồ án, nghiên cứu khoa học, prompt AI và kỹ năng thuyết trình từ cộng đồng.
          </p>
        </div>

        {/* Action Button: Accessible to both Members and Admins */}
        <button
          onClick={() => {
            if (!currentUser) {
              if (onRequireAuth) {
                onRequireAuth('Vui lòng đăng nhập hoặc tạo tài khoản thành viên để đăng bài viết chia sẻ kiến thức!');
              }
              return;
            }
            setIsWriteModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{currentUser?.role === 'Admin' ? 'Đăng bài viết (Quản trị viên)' : 'Đăng bài viết mới'}</span>
        </button>
      </div>

      {/* Khung thể hiện các bài đăng sản phẩm, file thiết kế mới */}
      <NewProductsShowcase 
        onNavigateDesignHub={onNavigateDesignHub}
        variant="grid"
      />

      {/* Hero Featured Article (If no active search) */}
      {!searchTerm && selectedCategory === 'Tất cả' && featuredArticle && (
        <div 
          onClick={() => setSelectedArticle(featuredArticle)}
          className="group relative rounded-3xl overflow-hidden bg-slate-900 text-white cursor-pointer shadow-xl border border-slate-800 transition-all hover:shadow-2xl hover:border-blue-500/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
            {/* Left info */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase rounded-lg">
                    <Pin className="w-3 h-3 fill-amber-300" />
                    <span>Bài viết nổi bật</span>
                  </span>
                  <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/20 text-[10px] font-black rounded-lg uppercase">
                    {featuredArticle.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white group-hover:text-blue-300 transition-colors leading-tight">
                  {featuredArticle.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {featuredArticle.summary}
                </p>
              </div>

              {/* Author & Read CTA */}
              <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 mt-6">
                <div className="flex items-center space-x-3">
                  <UserAvatar 
                    name={featuredArticle.author} 
                    src={featuredArticle.authorAvatar} 
                    size="sm" 
                    className="border border-white/20"
                  />
                  <div>
                    <p className="text-xs font-bold text-white">{featuredArticle.author}</p>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {featuredArticle.readTimeMinutes} phút đọc • {featuredArticle.publishedAt}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 group-hover:bg-blue-400 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-blue-500/30">
                  <span>Khám phá bài viết</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Right cover image */}
            <div className="lg:col-span-5 relative h-64 lg:h-auto overflow-hidden">
              <img 
                src={featuredArticle.coverImage} 
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Category Filter Section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, mẹo thiết kế, từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Khung Sản phẩm & File Thiết kế Mới */}
      {!searchTerm && selectedCategory === 'Tất cả' && (
        <NewProductsShowcase 
          currentUser={currentUser}
          onNavigateDesignHub={onNavigateDesignHub}
          onRequireAuth={onRequireAuth}
          variant="grid"
        />
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((art) => {
          const isSaved = bookmarkedIds.includes(art.id);
          const isLiked = likedArticleIds.includes(art.id);
          const isToastShared = sharedToastId === art.id;

          return (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="group bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
            >
              {/* Cover Image Header */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <img
                  src={art.coverImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category & Moderation Status Pill */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg shadow-sm">
                    {art.category}
                  </span>
                  {art.isPinned && (
                    <span className="p-1 bg-amber-500 text-white rounded-lg shadow-sm" title="Được ghim">
                      <Pin className="w-3 h-3 fill-white" />
                    </span>
                  )}
                  {art.status === 'Pending' && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm animate-pulse flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Đang chờ duyệt</span>
                    </span>
                  )}
                  {art.status === 'Rejected' && (
                    <span className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center space-x-1" title={art.rejectionReason}>
                      <X className="w-3 h-3" />
                      <span>Bị từ chối</span>
                    </span>
                  )}
                </div>

                {/* Bookmark Shortcut */}
                <button
                  onClick={(e) => handleToggleBookmark(e, art)}
                  className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                    isSaved
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-black/40 hover:bg-black/60 text-white'
                  }`}
                  title={isSaved ? 'Đã lưu' : 'Lưu bài viết'}
                >
                  {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{art.readTimeMinutes} phút đọc</span>
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{art.publishedAt}</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                    {art.summary}
                  </p>
                </div>

                {/* Author row & Views */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserAvatar 
                      name={art.author} 
                      src={art.authorAvatar} 
                      size="sm" 
                    />
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                      {art.author}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.viewsCount || 0}</span>
                  </div>
                </div>

                {/* Interactive Action Bar: Thả Tim, Bình Luận, Chia Sẻ */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  
                  {/* Nút Thả tim */}
                  <button
                    onClick={(e) => handleToggleLike(e, art)}
                    className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold transition-all ${
                      isLiked 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200/60' 
                        : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/50'
                    }`}
                    title={isLiked ? 'Bỏ thích' : 'Thả tim bài viết'}
                  >
                    <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                    <span className="text-[11px]">{art.likesCount || 0}</span>
                  </button>

                  {/* Nút Bình luận */}
                  <button
                    onClick={(e) => handleOpenComments(e, art)}
                    className="flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                    title="Bình luận bài viết"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    <span className="text-[11px]">{art.commentsCount || 0}</span>
                  </button>

                  {/* Nút Chia sẻ */}
                  <button
                    onClick={(e) => handleShareArticle(e, art)}
                    className={`flex-1 py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 font-bold transition-colors ${
                      isToastShared 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                        : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                    }`}
                    title="Sao chép liên kết chia sẻ"
                  >
                    {isToastShared ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-400" />}
                    <span className="text-[11px]">{isToastShared ? 'Đã sao chép' : 'Chia sẻ'}</span>
                  </button>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-700">Chưa tìm thấy bài viết phù hợp</h4>
          <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác hoặc chọn chuyên mục khác.</p>
        </div>
      )}

      {/* Article Reader Modal */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          currentUser={currentUser}
          onClose={() => setSelectedArticle(null)}
          onSelectArticle={(art) => setSelectedArticle(art)}
          onRequireAuth={onRequireAuth}
          relatedArticles={articles.filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category)}
        />
      )}

      {/* Write Article Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Đăng bài viết & Chia sẻ kinh nghiệm</h3>
              </div>
              <button 
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Role-based Moderation Banner */}
              {currentUser?.role === 'Admin' ? (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start space-x-2.5 text-xs text-indigo-900">
                  <span className="p-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shrink-0">Admin</span>
                  <div className="leading-snug">
                    <strong className="font-bold text-indigo-950">Chế độ Quản trị viên:</strong> Bài viết của bạn sẽ được <strong>Tự động xuất bản trực tiếp</strong> lên trang chủ & trang tin tức mà không cần qua khâu kiểm duyệt.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-bold text-amber-950">Chế độ Thành viên:</strong> Sau khi gửi, bài viết sẽ được chuyển đến hàng đợi <strong>chờ Ban Quản trị kiểm duyệt</strong> trước khi hiển thị công khai trên toàn hệ thống.
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-bounce">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccessMessage || 'Bài viết đã được xử lý thành công!'}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 7 Mẹo thiết kế slide bảo vệ luận văn đạt điểm tối đa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Chuyên mục *</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Thời gian đọc ước tính (Phút)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newReadTime}
                    onChange={(e) => setNewReadTime(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh bìa bài viết (URL ảnh)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newCoverImage}
                  onChange={(e) => setNewCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tóm tắt ngắn (1-2 câu)</label>
                <textarea
                  rows={2}
                  placeholder="Tóm tắt điểm cốt lõi của bài viết để hiển thị trên thẻ bài..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nội dung bài viết (Hỗ trợ Markdown) *</label>
                <textarea
                  rows={7}
                  required
                  placeholder={`## 1. Mở đầu\nNội dung mở đầu...\n\n### 2. Các bước thực hiện\n* Bước 1\n* Bước 2\n\n> "Trích dẫn hay"`}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Từ khóa (Tags, phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Slide, Thuyết trình, Nghiên cứu, UI Kit"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {currentUser?.role === 'Admin' && (
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="pinCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Ghim bài viết này lên thanh tin tức di chuyển & bài viết nổi bật
                  </label>
                </div>
              )}

              {/* Intellectual Property and Content Guidelines Agreement */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-2xl flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="articleComplianceCheck"
                  required
                  checked={complianceAgreed}
                  onChange={(e) => setComplianceAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="articleComplianceCheck" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                  Tôi cam kết bài viết tuân thủ{' '}
                  <button 
                    type="button" 
                    onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }} 
                    className="text-blue-600 font-bold underline hover:text-blue-800 inline"
                  >
                    Quy định Bản quyền & SHTT
                  </button>
                  {' '}và{' '}
                  <button 
                    type="button" 
                    onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }} 
                    className="text-blue-600 font-bold underline hover:text-blue-800 inline"
                  >
                    Chuẩn mực cộng đồng ICTC
                  </button>
                  , không sao chép trái phép.
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!complianceAgreed}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
                >
                  {currentUser?.role === 'Admin' ? 'Xuất bản bài viết ngay (Không cần duyệt)' : 'Gửi bài viết để Ban Quản trị duyệt'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Legal & Compliance Modal */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Report Violation Modal */}
      {reportingItem && (
        <ReportViolationModal
          isOpen={!!reportingItem}
          onClose={() => setReportingItem(null)}
          targetId={reportingItem.id}
          targetType={reportingItem.type}
          targetTitle={reportingItem.title}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
