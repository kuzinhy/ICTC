import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Clock, Eye, Heart, Share2, Bookmark, BookmarkCheck, 
  Calendar, User as UserIcon, Check, Copy, Sparkles, BookOpen, 
  ExternalLink, ArrowLeft, Type, ZoomIn, ZoomOut, ThumbsUp, Tag,
  MessageSquare, Send, Trash2, MessageCircle, Link2, Share, Lock, Shield, Flag, ShieldAlert
} from 'lucide-react';
import { Article, User, ArticleComment } from '../types';
import { UserAvatar } from './UserAvatar';
import { saveArticleToDb } from '../lib/db';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';
import { ReportViolationModal } from './ReportViolationModal';

interface ArticleReaderModalProps {
  article: Article;
  currentUser: User | null;
  onClose: () => void;
  onSelectArticle?: (article: Article) => void;
  onRequireAuth?: (reason?: string) => void;
  relatedArticles?: Article[];
}

const DEFAULT_SAMPLE_COMMENTS: Record<string, ArticleComment[]> = {
  'art-1': [
    {
      id: 'cmt-101',
      articleId: 'art-1',
      author: 'Trần Minh Tuấn',
      authorAvatar: '',
      content: 'Bài viết rất hữu ích cho đợt bảo vệ đồ án tốt nghiệp sắp tới của mình! Nhất là nguyên tắc 1 Slide - 1 Thông điệp chính giúp slide gọn gàng hơn hẳn.',
      createdAt: '2026-08-16 14:30',
      likesCount: 14
    },
    {
      id: 'cmt-102',
      articleId: 'art-1',
      author: 'Lê Thảo My',
      authorAvatar: '',
      content: 'Cảm ơn admin đã chia sẻ. Mình đã tải thêm bộ template slide khoa học từ Thư viện thiết kế để áp dụng luôn, rất đồng bộ và chuyên nghiệp.',
      createdAt: '2026-08-16 19:15',
      likesCount: 8
    }
  ],
  'art-2': [
    {
      id: 'cmt-201',
      articleId: 'art-2',
      author: 'Ngô Quốc Bảo',
      authorAvatar: '',
      content: 'Phần phân tích 5 thành phần cốt lõi của Prompting chuẩn xác quá. Áp dụng vào Midjourney cho ra hình ảnh sắc nét và đúng yêu cầu hơn nhiều!',
      createdAt: '2026-08-15 09:20',
      likesCount: 19
    },
    {
      id: 'cmt-202',
      articleId: 'art-2',
      author: 'Phạm Hồng Ánh',
      authorAvatar: '',
      content: 'Bộ prompt mẫu tiếng Việt ở Kho AI Prompts rất phong phú, kết hợp với bài viết này là combo hoàn hảo cho designer.',
      createdAt: '2026-08-15 16:45',
      likesCount: 11
    }
  ]
};

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({
  article,
  currentUser,
  onClose,
  onSelectArticle,
  onRequireAuth,
  relatedArticles = []
}) => {
  const [likes, setLikes] = useState(article.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeViews, setActiveViews] = useState(article.viewsCount || 0);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  // Comment section states
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  
  // Moderation Report Modal State
  const [reportTargetItem, setReportTargetItem] = useState<{ id: string; title: string; type: 'article' | 'comment' } | null>(null);
  const [commentWarning, setCommentWarning] = useState<string | null>(null);

  const commentSectionRef = useRef<HTMLDivElement>(null);

  // Load comments and bookmark status
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('ictc_bookmarks');
    if (savedBookmarks) {
      try {
        const bookmarks = JSON.parse(savedBookmarks);
        setIsBookmarked(bookmarks.some((b: any) => b.targetId === article.id));
      } catch (e) {}
    }

    // Load article comments from localStorage or initialize with sample comments
    const storageKey = `ictc_article_comments_${article.id}`;
    const savedComments = localStorage.getItem(storageKey);
    if (savedComments) {
      try {
        setComments(JSON.parse(savedComments));
      } catch (e) {
        setComments(DEFAULT_SAMPLE_COMMENTS[article.id] || []);
      }
    } else {
      const initialCmts = DEFAULT_SAMPLE_COMMENTS[article.id] || [
        {
          id: `cmt-${Date.now()}`,
          articleId: article.id,
          author: 'Thành viên ICTC',
          authorAvatar: '',
          content: 'Bài viết chia sẻ rất chi tiết và thiết thực. Cảm ơn tác giả đã đóng góp cho cộng đồng!',
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          likesCount: 5
        }
      ];
      setComments(initialCmts);
      localStorage.setItem(storageKey, JSON.stringify(initialCmts));
    }

    // Increment view count
    const updatedViews = (article.viewsCount || 0) + 1;
    setActiveViews(updatedViews);
    const updatedArticle = { ...article, viewsCount: updatedViews };
    saveArticleToDb(updatedArticle).catch(console.warn);

    // Save to articles list in localStorage
    const savedArticles = localStorage.getItem('ictc_articles');
    if (savedArticles) {
      try {
        const list = JSON.parse(savedArticles) as Article[];
        const updatedList = list.map(a => a.id === article.id ? updatedArticle : a);
        localStorage.setItem('ictc_articles', JSON.stringify(updatedList));
      } catch (e) {}
    }
  }, [article.id]);

  const handleLike = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập tài khoản thành viên để thả tim bài viết!');
      }
      return;
    }

    let newCount: number;
    if (hasLiked) {
      newCount = Math.max(0, likes - 1);
      setLikes(newCount);
      setHasLiked(false);
    } else {
      newCount = likes + 1;
      setLikes(newCount);
      setHasLiked(true);
    }

    const updated = { ...article, likesCount: newCount };
    saveArticleToDb(updated).catch(console.warn);
    
    const savedArticles = localStorage.getItem('ictc_articles');
    if (savedArticles) {
      try {
        const list = JSON.parse(savedArticles) as Article[];
        const updatedList = list.map(a => a.id === article.id ? updated : a);
        localStorage.setItem('ictc_articles', JSON.stringify(updatedList));
      } catch (e) {}
    }
  };

  const handleToggleBookmark = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập thành viên để lưu bài viết vào danh sách yêu thích!');
      }
      return;
    }

    const savedBookmarks = localStorage.getItem('ictc_bookmarks');
    let bookmarks: any[] = [];
    if (savedBookmarks) {
      try { bookmarks = JSON.parse(savedBookmarks); } catch (e) {}
    }

    if (isBookmarked) {
      bookmarks = bookmarks.filter((b: any) => b.targetId !== article.id);
      setIsBookmarked(false);
    } else {
      bookmarks.push({
        id: `bm-${Date.now()}`,
        targetId: article.id,
        type: 'article',
        title: article.title,
        category: article.category,
        previewUrl: article.coverImage,
        savedAt: new Date().toISOString().split('T')[0]
      });
      setIsBookmarked(true);
    }

    localStorage.setItem('ictc_bookmarks', JSON.stringify(bookmarks));
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareZalo = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://zalo.me/share?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const scrollToComments = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập hoặc tạo tài khoản thành viên để gửi bình luận và thảo luận bài viết!');
      }
      return;
    }
    if (!newCommentText.trim()) return;

    const authorName = currentUser.displayName || 'Thành viên ICTC';
    const authorAvatar = currentUser.avatarUrl || '';
    const authorId = currentUser.id;

    // Run hidden safety check on comment
    const safetyCheck = scanContentSafety({
      description: newCommentText,
      author: authorName
    });

    if (!safetyCheck.isSafe) {
      // Auto report
      submitContentReport({
        targetId: `cmt-${Date.now()}`,
        targetType: 'comment',
        targetTitle: `Bình luận bài viết: "${article.title.substring(0, 30)}..."`,
        reason: `Bình luận chứa từ ngữ nhạy cảm (${safetyCheck.matchedKeywords.join(', ')})`,
        details: `Nội dung bình luận: "${newCommentText.trim()}"`,
        reporterName: 'Hệ Thống Tự Động (Hidden Scanner)',
        severity: 'medium',
        autoFlagged: true
      });

      setCommentWarning(`Cảnh báo: Bình luận chứa từ ngữ chưa phù hợp (${safetyCheck.matchedKeywords.join(', ')}). Bình luận đã được lưu và gửi Ban Quản Trị xem xét.`);
      setTimeout(() => setCommentWarning(null), 5000);
    }

    const newCmt: ArticleComment = {
      id: `cmt-${Date.now()}`,
      articleId: article.id,
      author: authorName,
      authorId: authorId,
      authorAvatar: authorAvatar,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      likesCount: 0
    };

    const updatedComments = [newCmt, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`ictc_article_comments_${article.id}`, JSON.stringify(updatedComments));

    // Update commentsCount in article
    const updatedCount = updatedComments.length;
    const updatedArticle = { ...article, commentsCount: updatedCount };
    saveArticleToDb(updatedArticle).catch(console.warn);

    const savedArticles = localStorage.getItem('ictc_articles');
    if (savedArticles) {
      try {
        const list = JSON.parse(savedArticles) as Article[];
        const updatedList = list.map(a => a.id === article.id ? updatedArticle : a);
        localStorage.setItem('ictc_articles', JSON.stringify(updatedList));
      } catch (e) {}
    }

    setNewCommentText('');
  };

  // Like a comment
  const handleLikeComment = (commentId: string) => {
    const isLiked = likedCommentIds.includes(commentId);
    let updatedLikedIds: string[];
    if (isLiked) {
      updatedLikedIds = likedCommentIds.filter(id => id !== commentId);
    } else {
      updatedLikedIds = [...likedCommentIds, commentId];
    }
    setLikedCommentIds(updatedLikedIds);

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          likesCount: isLiked ? Math.max(0, (c.likesCount || 0) - 1) : (c.likesCount || 0) + 1
        };
      }
      return c;
    });

    setComments(updated);
    localStorage.setItem(`ictc_article_comments_${article.id}`, JSON.stringify(updated));
  };

  // Delete comment (Author or Admin)
  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này không?')) {
      const updated = comments.filter(c => c.id !== commentId);
      setComments(updated);
      localStorage.setItem(`ictc_article_comments_${article.id}`, JSON.stringify(updated));

      const updatedCount = updated.length;
      const updatedArticle = { ...article, commentsCount: updatedCount };
      saveArticleToDb(updatedArticle).catch(console.warn);

      const savedArticles = localStorage.getItem('ictc_articles');
      if (savedArticles) {
        try {
          const list = JSON.parse(savedArticles) as Article[];
          const updatedList = list.map(a => a.id === article.id ? updatedArticle : a);
          localStorage.setItem('ictc_articles', JSON.stringify(updatedList));
        } catch (e) {}
      }
    }
  };

  // Convert raw markdown / text into readable styled blocks
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 tracking-tight border-b border-slate-100 pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-3 tracking-tight">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-5 p-4 sm:p-5 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-2xl text-slate-700 italic font-medium">
            {trimmed.replace('> ', '').replace(/"/g, '')}
          </blockquote>
        );
      }

      if (trimmed.startsWith('---')) {
        return <hr key={idx} className="my-8 border-slate-200" />;
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        const lines = trimmed.split('\n');
        return (
          <ul key={idx} className="space-y-2 my-4 pl-5 list-disc list-outside text-slate-700">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[\*\-\d\.]+\s+/, '');
              return (
                <li key={lIdx} className="leading-relaxed">
                  <span dangerouslySetInnerHTML={{
                    __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
                  }} />
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p 
          key={idx} 
          className="leading-relaxed text-slate-700 my-4"
          dangerouslySetInnerHTML={{
            __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
          }}
        />
      );
    });
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-base sm:text-lg';
    if (fontSize === 'xlarge') return 'text-lg sm:text-xl';
    return 'text-sm sm:text-base';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 w-full max-w-4xl max-h-[92vh] my-auto flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {article.readTimeMinutes} phút đọc
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Font size adjustment */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-xs">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors ${fontSize === 'normal' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Cỡ chữ vừa"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-colors ${fontSize === 'large' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Cỡ chữ to"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 text-[13px] font-bold rounded-lg transition-colors ${fontSize === 'xlarge' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Cỡ chữ rất to"
              >
                A++
              </button>
            </div>

            {/* Jump to comments button */}
            <button
              onClick={scrollToComments}
              className="p-2 rounded-xl border bg-white hover:bg-slate-100 text-slate-600 border-slate-200 transition-all flex items-center space-x-1"
              title="Xem bình luận"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">{comments.length}</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked 
                  ? 'bg-amber-50 text-amber-600 border-amber-200' 
                  : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
              }`}
              title={isBookmarked ? 'Đã lưu vào bộ sưu tập' : 'Lưu bài viết'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Share dropdown / button */}
            <div className="relative">
              <button
                onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                className={`p-2 rounded-xl border transition-all ${
                  copySuccess 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-200'
                }`}
                title="Chia sẻ bài viết"
              >
                {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              {isShareMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-scale-up space-y-1">
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors text-left"
                  >
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>Sao chép liên kết</span>
                  </button>
                  <button
                    onClick={() => {
                      handleShareFacebook();
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left"
                  >
                    <Share className="w-4 h-4" />
                    <span>Chia sẻ lên Facebook</span>
                  </button>
                  <button
                    onClick={() => {
                      handleShareZalo();
                      setIsShareMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors text-left"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>Gửi qua Zalo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-10 space-y-6">
          
          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Summary callout */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-150">
              {article.summary}
            </p>

            {/* Author & Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-100">
              <div className="flex items-center space-x-3">
                <UserAvatar 
                  name={article.author} 
                  src={article.authorAvatar} 
                  size="md"
                  className="border border-slate-200"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">{article.author}</p>
                  <p className="text-[10px] text-slate-400 font-medium flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {article.publishedAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{activeViews.toLocaleString()} lượt xem</span>
                </span>
                <span className="flex items-center space-x-1 text-rose-500">
                  <Heart className="w-4 h-4 fill-rose-500" />
                  <span>{likes.toLocaleString()} yêu thích</span>
                </span>
                <span className="flex items-center space-x-1 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span>{comments.length} bình luận</span>
                </span>
              </div>
            </div>
          </div>

          {/* Featured Cover Photo */}
          {article.coverImage && (
            <div className="rounded-3xl overflow-hidden shadow-md border border-slate-100 max-h-96">
              <img 
                src={article.coverImage} 
                alt={article.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (article.fallbackCoverImage && target.src !== article.fallbackCoverImage) {
                    target.src = article.fallbackCoverImage;
                  } else {
                    target.src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80';
                  }
                }}
              />
            </div>
          )}

          {/* Article Main Text Body */}
          <div className={`prose max-w-none text-slate-800 ${getFontSizeClass()}`}>
            {renderFormattedContent(article.content)}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center mr-1">
                <Tag className="w-3.5 h-3.5 mr-1" />
                Từ khóa:
              </span>
              {article.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Sticky Quick Interaction Bar: Thả tim, Bình luận, Chia sẻ, Lưu bài */}
          <div className="p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 border border-blue-100/80 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Tương tác với bài viết</h4>
              <p className="text-xs text-slate-500">Thả tim ủng hộ tác giả, để lại bình luận hoặc chia sẻ cho bạn bè cùng đọc.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Nút Thả Tim */}
              <button
                onClick={handleLike}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs active:scale-95 ${
                  hasLiked 
                    ? 'bg-rose-600 text-white shadow-rose-500/20' 
                    : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                }`}
                title={hasLiked ? 'Bỏ thích' : 'Thả tim bài viết'}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white text-white' : 'text-rose-500'}`} />
                <span>{hasLiked ? 'Đã thả tim' : 'Thả tim'} ({likes})</span>
              </button>

              {/* Nút Bình Luận */}
              <button
                onClick={scrollToComments}
                className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 transition-all shadow-xs active:scale-95"
                title="Viết bình luận"
              >
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Bình luận ({comments.length})</span>
              </button>

              {/* Nút Chia Sẻ */}
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs active:scale-95 ${
                  copySuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title="Chia sẻ liên kết"
              >
                {copySuccess ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-indigo-600" />}
                <span>{copySuccess ? 'Đã sao chép link' : 'Chia sẻ'}</span>
              </button>

              {/* Nút Lưu Bài */}
              <button
                onClick={handleToggleBookmark}
                className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all shadow-xs active:scale-95 ${
                  isBookmarked 
                    ? 'bg-amber-500 text-white shadow-amber-500/20' 
                    : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-600 border border-slate-200'
                }`}
                title={isBookmarked ? 'Đã lưu' : 'Lưu bài'}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Comment Section (Khung Bình Luận) */}
          <div ref={commentSectionRef} className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Bình luận & Thảo luận ({comments.length})
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Chia sẻ suy nghĩ và đóng góp ý kiến của bạn</p>
                </div>
              </div>
            </div>

            {/* Guest Membership Banner if not logged in */}
            {!currentUser && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-2.5 text-xs text-slate-700 font-medium">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">🔒 Yêu cầu tài khoản thành viên để thảo luận</span>
                    <span className="text-[11px] text-slate-500">Đăng nhập tài khoản để gửi bình luận, trao đổi học thuật và thả tim bài viết.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onRequireAuth) {
                      onRequireAuth('Vui lòng đăng nhập hoặc tạo tài khoản thành viên để bình luận bài viết!');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm transition-all shrink-0"
                >
                  Đăng nhập ngay
                </button>
              </div>
            )}

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center space-x-3 pb-2 border-b border-slate-200/70">
                <UserAvatar 
                  user={currentUser} 
                  name={currentUser?.displayName || guestName || 'Khách'} 
                  size="sm"
                  className="border border-white shadow-xs" 
                />
                {currentUser ? (
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{currentUser.displayName}</span>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase">{currentUser.role}</span>
                  </div>
                ) : (
                  <div className="flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Nhập tên của bạn (hoặc đăng nhập)..."
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <textarea
                rows={3}
                required
                placeholder="Viết bình luận hoặc đặt câu hỏi cho bài viết này..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Giao tiếp lịch sự, tôn trọng quy tắc cộng đồng ICTC
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi bình luận</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((cmt) => {
                const isLiked = likedCommentIds.includes(cmt.id);
                const canDelete = currentUser?.role === 'Admin' || (currentUser && currentUser.id === cmt.authorId);

                return (
                  <div key={cmt.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <UserAvatar 
                          name={cmt.author} 
                          src={cmt.authorAvatar} 
                          size="sm"
                          className="border border-slate-200" 
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{cmt.author}</span>
                          <span className="text-[10px] text-slate-400">{cmt.createdAt}</span>
                        </div>
                      </div>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteComment(cmt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Xóa bình luận"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pl-9">
                      {cmt.content}
                    </p>

                    <div className="pl-9 pt-1 flex items-center space-x-3">
                      <button
                        onClick={() => handleLikeComment(cmt.id)}
                        className={`inline-flex items-center space-x-1 text-[11px] font-semibold transition-colors ${
                          isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span>{cmt.likesCount || 0}</span>
                      </button>
                      <button
                        onClick={() => setNewCommentText(`@${cmt.author} `)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        Trả lời
                      </button>
                    </div>
                  </div>
                );
              })}

              {comments.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200/60 p-6 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Chưa có bình luận nào</p>
                  <p className="text-[11px] text-slate-400">Hãy là người đầu tiên để lại bình luận cho bài viết này!</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Articles Carousel */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Bài viết cùng chuyên mục</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.slice(0, 2).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectArticle && onSelectArticle(rel)}
                    className="p-4 bg-slate-50 hover:bg-blue-50/60 border border-slate-150 hover:border-blue-200 rounded-2xl transition-all cursor-pointer group"
                  >
                    <span className="text-[10px] font-extrabold uppercase text-blue-600">{rel.category}</span>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate mt-1">
                      {rel.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{rel.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-400 font-medium">
          <div className="flex items-center space-x-3">
            <span>&copy; {new Date().getFullYear()} ICTC Share & Design Knowledge Hub</span>
            <button
              onClick={() => setReportTargetItem({ id: article.id, title: article.title, type: 'article' })}
              className="text-rose-600 hover:text-rose-700 hover:underline text-[11px] font-bold flex items-center space-x-1"
            >
              <Flag className="w-3 h-3 fill-rose-600" />
              <span>Báo cáo bài viết vi phạm</span>
            </button>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>

      {/* Report Violation Modal */}
      {reportTargetItem && (
        <ReportViolationModal
          isOpen={!!reportTargetItem}
          onClose={() => setReportTargetItem(null)}
          targetId={reportTargetItem.id}
          targetType={reportTargetItem.type}
          targetTitle={reportTargetItem.title}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
