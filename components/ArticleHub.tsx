import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, BookOpen, Clock, Eye, Heart, Share2, Plus, 
  Sparkles, Filter, Bookmark, BookmarkCheck, ArrowRight, 
  Check, Calendar, User as UserIcon, X, Tag, Edit3, Flame, Pin,
  MessageSquare, MessageCircle, Link2, Download, Layers,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { Article, User as UserType, DesignFile } from '../types';
import { INITIAL_ARTICLES } from '../data/mockData';
import { UserAvatar } from './UserAvatar';
import { ArticleReaderModal } from './ArticleReaderModal';
import { ArticleEditorModal } from './ArticleEditorModal';
import { NewProductsShowcase } from './NewProductsShowcase';
import { LegalComplianceModal } from './LegalComplianceModal';
import { ReportViolationModal } from './ReportViolationModal';
import { saveArticleToDb, deleteArticleFromDb } from '../lib/db';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';
import { useToast } from '../context/ToastContext';

interface ArticleHubProps {
  currentUser: UserType | null;
  articles: Article[];
  designFiles?: DesignFile[];
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
  designFiles = [],
  onArticlesUpdate,
  selectedSpecialty,
  onNavigateDesignHub,
  onRequireAuth 
}) => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Advanced Article Editor Modal State (Supports both Creating and Direct Editing)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

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

  const handleEditorSaveSuccess = (savedArticle: Article) => {
    const exists = articles.some(a => a.id === savedArticle.id);
    let updated: Article[];
    if (exists) {
      updated = articles.map(a => a.id === savedArticle.id ? savedArticle : a);
      toastSuccess('Đã cập nhật bài viết thành công!', 'Sửa bài viết');
    } else {
      updated = [savedArticle, ...articles];
      toastSuccess('Đã đăng bài viết mới thành công!', 'Đăng bài');
    }
    onArticlesUpdate(updated);
    setEditingArticle(null);
    setIsEditorOpen(false);
  };

  const handleDeleteArticle = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      const updated = articles.filter(a => a.id !== articleId);
      onArticlesUpdate(updated);
      try {
        await deleteArticleFromDb(articleId);
      } catch (err) {
        console.warn('Could not delete article from Firestore:', err);
      }
      toastInfo('Đã xóa bài viết khỏi hệ thống.', 'Đã xóa bài viết');
    }
  };

  // Filtering
  const filteredArticles = useMemo(() => {
    return (articles || []).filter(art => {
      const isOwner = currentUser && (art.authorId === currentUser.id || art.author === currentUser.displayName);
      const canView = !art.status || art.status === 'Published' || art.status === 'Approved' || currentUser?.role === 'Admin' || isOwner;
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

  // Pagination & Load More States
  const [displayMode, setDisplayMode] = useState<'loadMore' | 'pagination'>('loadMore');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset pagination state when filters change
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(itemsPerPage);
  }, [searchTerm, selectedCategory, selectedSpecialty, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / itemsPerPage));

  const displayedArticles = useMemo(() => {
    if (displayMode === 'loadMore') {
      return filteredArticles.slice(0, visibleCount);
    } else {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredArticles.slice(start, start + itemsPerPage);
    }
  }, [filteredArticles, displayMode, visibleCount, currentPage, itemsPerPage]);

  const featuredArticle = articles.find(a => a.isPinned && a.status === 'Published') || articles.find(a => a.status === 'Published') || articles[0];

  return (
    <div className="space-y-10 animate-fade-in pb-12" id="article-hub-root">
      
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
            setEditingArticle(null);
            setIsEditorOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{currentUser?.role === 'Admin' ? 'Đăng bài viết (Quản trị viên)' : 'Đăng bài viết mới'}</span>
        </button>
      </div>

      {/* Khung thể hiện các bài đăng sản phẩm, file thiết kế mới */}
      <NewProductsShowcase 
        currentUser={currentUser}
        onNavigateDesignHub={onNavigateDesignHub}
        onRequireAuth={onRequireAuth}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase rounded-lg">
                      <Pin className="w-3 h-3 fill-amber-300" />
                      <span>Bài viết nổi bật</span>
                    </span>
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/20 text-[10px] font-black rounded-lg uppercase">
                      {featuredArticle.category}
                    </span>
                  </div>

                  {/* Direct Edit Button for Featured Article */}
                  {currentUser && (currentUser.role === 'Admin' || featuredArticle.authorId === currentUser.id || featuredArticle.author === currentUser.displayName) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingArticle(featuredArticle);
                        setIsEditorOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1 border border-blue-400/30"
                      title="Sửa bài viết trực tiếp"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa bài</span>
                    </button>
                  )}
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (featuredArticle.fallbackCoverImage && target.src !== featuredArticle.fallbackCoverImage) {
                    target.src = featuredArticle.fallbackCoverImage;
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80';
                  }
                }}
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map((art) => {
          const isSaved = bookmarkedIds.includes(art.id);
          const isLiked = likedArticleIds.includes(art.id);
          const isToastShared = sharedToastId === art.id;
          const canEdit = currentUser && (currentUser.role === 'Admin' || art.authorId === currentUser.id || art.author === currentUser.displayName);

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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (art.fallbackCoverImage && target.src !== art.fallbackCoverImage) {
                      target.src = art.fallbackCoverImage;
                    } else {
                      target.src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80';
                    }
                  }}
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

                {/* Top Actions: Edit, Delete & Bookmark */}
                <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
                  {canEdit && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingArticle(art);
                          setIsEditorOpen(true);
                        }}
                        className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all cursor-pointer"
                        title="Sửa bài viết trực tiếp"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteArticle(art.id, e)}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-all cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={(e) => handleToggleBookmark(e, art)}
                    className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-black/40 hover:bg-black/60 text-white'
                    }`}
                    title={isSaved ? 'Đã lưu' : 'Lưu bài viết'}
                  >
                    {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </button>
                </div>
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

      {/* Pagination & Load More Control Bar */}
      {filteredArticles.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Info & Progress */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto text-center sm:text-left">
              <div className="text-xs font-bold text-slate-600 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0"></span>
                <span>
                  Hiển thị <strong className="text-slate-900 font-extrabold">{displayedArticles.length}</strong> / <strong className="text-slate-900 font-extrabold">{filteredArticles.length}</strong> bài viết
                </span>
              </div>

              {/* Progress bar in loadMore mode */}
              {displayMode === 'loadMore' && (
                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 hidden md:block">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((displayedArticles.length / filteredArticles.length) * 100))}%` }}
                  />
                </div>
              )}
            </div>

            {/* Display Mode & Items Per Page Selector */}
            <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
                <button
                  onClick={() => setDisplayMode('loadMore')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    displayMode === 'loadMore'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tải thêm
                </button>
                <button
                  onClick={() => setDisplayMode('pagination')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    displayMode === 'pagination'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Phân trang
                </button>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-slate-600">
                <span className="font-semibold text-[11px] hidden xs:inline">Hiển thị:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value={6}>6 bài/trang</option>
                  <option value={9}>9 bài/trang</option>
                  <option value={12}>12 bài/trang</option>
                  <option value={18}>18 bài/trang</option>
                </select>
              </div>
            </div>
          </div>

          {/* Load More Mode Actions */}
          {displayMode === 'loadMore' && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-slate-100">
              {visibleCount < filteredArticles.length ? (
                <button
                  onClick={() => setVisibleCount(prev => Math.min(filteredArticles.length, prev + itemsPerPage))}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Tải thêm {Math.min(itemsPerPage, filteredArticles.length - visibleCount)} bài viết tiếp theo</span>
                </button>
              ) : (
                <div className="text-slate-500 text-xs font-semibold flex items-center space-x-1.5 py-1">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Đã tải toàn bộ {filteredArticles.length} bài viết phù hợp!</span>
                </div>
              )}

              {visibleCount > itemsPerPage && (
                <button
                  onClick={() => {
                    setVisibleCount(itemsPerPage);
                    document.getElementById('article-hub-root')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Thu gọn</span>
                </button>
              )}
            </div>
          )}

          {/* Pagination Mode Actions */}
          {displayMode === 'pagination' && totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  document.getElementById('article-hub-root')?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Trang trước</span>
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1.5 text-slate-400 text-xs">...</span>}
                        <button
                          onClick={() => {
                            setCurrentPage(page);
                            document.getElementById('article-hub-root')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  document.getElementById('article-hub-root')?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span className="hidden sm:inline">Trang tiếp</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      )}

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

      {/* Advanced Article Editor Modal (Supports Create & Direct Edit) */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingArticle(null);
        }}
        articleToEdit={editingArticle}
        designFiles={designFiles}
        onSaveSuccess={handleEditorSaveSuccess}
        currentAuthorName={currentUser?.displayName || 'Thành viên ICTC'}
      />

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
