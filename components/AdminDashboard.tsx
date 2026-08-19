import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, CheckCircle, Settings, Shield, UserX, AlertTriangle, 
  Check, X, ToggleLeft, ToggleRight, Save, Database, Sparkles, Folder, Code,
  BookOpen, Pin, Trash2, Eye, Heart, Clock, ExternalLink, HardDrive,
  MessageSquare, RefreshCw, Filter, Search, ChevronRight, CheckCheck,
  AlertCircle, FileText, ArrowUpRight, Award, Layers, Plus, Edit3, ShieldCheck, Lock,
  Type, Download, Copy, Share2, Flag, ShieldAlert, Lightbulb, Zap, ThumbsUp
} from 'lucide-react';
import { User, DesignFile, AIPrompt, SystemConfig, Article, ContentReport, CommunityIdea } from '../types';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_USERS, INITIAL_ARTICLES, INITIAL_DESIGN_FILES, INITIAL_AI_PROMPTS, INITIAL_COMMUNITY_IDEAS } from '../data/mockData';
import { VietnameseFont, VIETNAMESE_FONTS_DATA, FONT_CATEGORIES } from '../data/vietnamFontsData';
import { DriveUploadResearch } from './DriveUploadResearch';
import { MemberManagement } from './MemberManagement';
import { VietnamDesignPaletteModal } from './VietnamDesignPaletteModal';
import { LegalComplianceModal } from './LegalComplianceModal';
import { ArticleEditorModal } from './ArticleEditorModal';
import { FontUploadModal } from './FontUploadModal';
import { SecurityCenter } from './SecurityCenter';
import { fetchContentReports, updateReportStatus } from '../lib/contentModeration';
import { 
  saveArticleToDb, deleteArticleFromDb, saveDesignToDb, savePromptToDb,
  fetchFontsFromDb, saveFontToDb, deleteFontFromDb, deleteDesignFromDb, deletePromptFromDb
} from '../lib/db';
import { DesignEditorModal } from './DesignEditorModal';
import { PromptEditorModal } from './PromptEditorModal';
import { LeaderboardModal } from './LeaderboardModal';
import { exportDesignsToCSV, exportUsersToCSV, exportFontsToCSV } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

interface AdminDashboardProps {
  currentUser: User;
  designFiles: DesignFile[];
  promptFiles: AIPrompt[];
  articlesList: Article[];
  fontsList: VietnameseFont[];
  userList: User[];
  systemConfig: SystemConfig;
  onDesignUpdate: (updated: DesignFile[]) => void;
  onPromptUpdate: (updated: AIPrompt[]) => void;
  onArticleUpdate: (updated: Article[]) => void;
  onFontUpdate: (updated: VietnameseFont[]) => void;
  onUserUpdate: (updated: User[]) => void;
  onConfigUpdate: (updated: SystemConfig) => void;
}

type ModerationFilterType = 'all' | 'designs' | 'prompts' | 'articles';
type ModerationStatusFilter = 'pending' | 'approved' | 'rejected';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  currentUser,
  designFiles,
  promptFiles,
  articlesList,
  fontsList,
  userList,
  systemConfig,
  onDesignUpdate,
  onPromptUpdate,
  onArticleUpdate,
  onFontUpdate,
  onUserUpdate,
  onConfigUpdate
}) => {
  const { success: toastSuccess, info: toastInfo, warning: toastWarning } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'moderation' | 'reports' | 'articles' | 'fonts' | 'users' | 'security' | 'settings' | 'uploadResearch' | 'ideas'>('moderation');
  const [localConfig, setLocalConfig] = useState<SystemConfig>(systemConfig);
  const [reportsList, setReportsList] = useState<ContentReport[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [communityIdeas, setCommunityIdeas] = useState<CommunityIdea[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Load Community Ideas
  useEffect(() => {
    const saved = localStorage.getItem('ictc_community_ideas');
    if (saved) {
      try { setCommunityIdeas(JSON.parse(saved)); } catch (e) { setCommunityIdeas(INITIAL_COMMUNITY_IDEAS); }
    } else {
      setCommunityIdeas(INITIAL_COMMUNITY_IDEAS);
    }
  }, [activeSubTab]);

  // Update local config when prop changes (e.g. after cloud sync)
  useEffect(() => {
    setLocalConfig(systemConfig);
  }, [systemConfig]);

  // Article creation/editing modal state
  const [isArticleEditorOpen, setIsArticleEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Font creation/editing modal state
  const [isFontUploadModalOpen, setIsFontUploadModalOpen] = useState(false);
  const [editingFont, setEditingFont] = useState<VietnameseFont | null>(null);
  const [fontSearchTerm, setFontSearchTerm] = useState('');
  const [fontCategoryFilter, setFontCategoryFilter] = useState('Tất cả');

  // Moderation filtering
  const [modCategory, setModCategory] = useState<ModerationFilterType>('all');
  const [modStatus, setModStatus] = useState<ModerationStatusFilter>('pending');
  const [modSearch, setModSearch] = useState('');

  // Rejection Dialog State
  const [rejectionModalItem, setRejectionModalItem] = useState<{ id: string; type: 'design' | 'prompt' | 'article'; title: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Liên kết tệp tin không truy cập được hoặc quyền chia sẻ chưa mở công khai.');

  // Quick Preview Modal State
  const [previewItem, setPreviewItem] = useState<{ type: 'design' | 'prompt' | 'article'; data: any } | null>(null);

  // Modals for Compliance & Vietnam Standards
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ip_policy');

  // Design & Prompt Editor states
  const [isDesignEditorOpen, setIsDesignEditorOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignFile | null>(null);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);

  // Toast feedback
  const showToast = (msg: string) => {
    toastSuccess(msg, 'Quản trị hệ thống');
  };

  // Load Admin Data
  const loadAllData = () => {
    // 7. Content Reports
    const reports = fetchContentReports();
    setReportsList(reports);
  };

  useEffect(() => {
    loadAllData();
  }, [activeSubTab]);

  // Counts of pending items
  const pendingDesigns = designFiles.filter(f => f.status === 'Pending');
  const pendingPrompts = promptFiles.filter(p => p.status === 'Pending');
  const pendingArticles = articlesList.filter(a => a.status === 'Pending');
  const totalPending = pendingDesigns.length + pendingPrompts.length + pendingArticles.length;

  // Handle Toggle Article Pin
  const handleTogglePinArticle = async (art: Article) => {
    const updated = articlesList.map(a => a.id === art.id ? { ...a, isPinned: !a.isPinned } : a);
    onArticleUpdate(updated);
    const target = updated.find(a => a.id === art.id);
    if (target) {
      saveArticleToDb(target).catch(console.warn);
    }
    showToast(`Đã ${art.isPinned ? 'bỏ ghim' : 'ghim nổi bật'} bài viết!`);
  };

  // Handle Create / Edit Article
  const handleOpenCreateArticle = () => {
    setEditingArticle(null);
    setIsArticleEditorOpen(true);
  };

  const handleOpenEditArticle = (art: Article) => {
    setEditingArticle(art);
    setIsArticleEditorOpen(true);
  };

  const handleSaveArticleSuccess = (savedArticle: Article) => {
    const existingIndex = articlesList.findIndex(a => a.id === savedArticle.id);
    let updated: Article[];
    if (existingIndex >= 0) {
      updated = articlesList.map(a => a.id === savedArticle.id ? savedArticle : a);
      showToast('Đã cập nhật bài viết thành công!');
    } else {
      updated = [savedArticle, ...articlesList];
      showToast('Đã xuất bản bài viết mới thành công!');
    }
    onArticleUpdate(updated);
    saveArticleToDb(savedArticle).catch(console.warn);
  };

  // Handle Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    const updated = articlesList.filter(a => a.id !== id);
    onArticleUpdate(updated);
    deleteArticleFromDb(id).catch(console.warn);
    showToast('Đã xóa bài viết thành công!');
  };

  // Handle Save / Delete Design
  const handleSaveDesignSuccess = (savedDesign: DesignFile) => {
    const existingIndex = designFiles.findIndex(f => f.id === savedDesign.id);
    let updated: DesignFile[];
    if (existingIndex >= 0) {
      updated = designFiles.map(f => f.id === savedDesign.id ? savedDesign : f);
      showToast('Đã cập nhật tệp thiết kế thành công!');
    } else {
      updated = [savedDesign, ...designFiles];
      showToast('Đã thêm mới tệp thiết kế thành công!');
    }
    onDesignUpdate(updated);
    saveDesignToDb(savedDesign).catch(console.warn);
    setIsDesignEditorOpen(false);
  };

  const handleDeleteDesign = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tệp thiết kế này khỏi hệ thống không?')) return;
    const updated = designFiles.filter(f => f.id !== id);
    onDesignUpdate(updated);
    deleteDesignFromDb(id).catch(console.warn);
    showToast('Đã xóa tệp thiết kế thành công!');
  };

  // Handle Save / Delete Prompt
  const handleSavePromptSuccess = (savedPrompt: AIPrompt) => {
    const existingIndex = promptFiles.findIndex(p => p.id === savedPrompt.id);
    let updated: AIPrompt[];
    if (existingIndex >= 0) {
      updated = promptFiles.map(p => p.id === savedPrompt.id ? savedPrompt : p);
      showToast('Đã cập nhật AI Prompt thành công!');
    } else {
      updated = [savedPrompt, ...promptFiles];
      showToast('Đã thêm mới AI Prompt thành công!');
    }
    onPromptUpdate(updated);
    savePromptToDb(savedPrompt).catch(console.warn);
    setIsPromptEditorOpen(false);
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn AI Prompt này khỏi hệ thống không?')) return;
    const updated = promptFiles.filter(p => p.id !== id);
    onPromptUpdate(updated);
    deletePromptFromDb(id).catch(console.warn);
    showToast('Đã xóa AI Prompt thành công!');
  };

  // Handle Content Approval
  const handleApproveContent = (id: string, type: 'design' | 'prompt' | 'article') => {
    if (type === 'design') {
      const updated = designFiles.map(f => f.id === id ? { ...f, status: 'Approved' as const, rejectionReason: undefined } : f);
      onDesignUpdate(updated);
      const target = updated.find(f => f.id === id);
      if (target) saveDesignToDb(target).catch(console.warn);
      showToast('Đã phê duyệt và xuất bản file thiết kế thành công!');
    } else if (type === 'prompt') {
      const updated = promptFiles.map(p => p.id === id ? { ...p, status: 'Approved' as const, rejectionReason: undefined } : p);
      onPromptUpdate(updated);
      const target = updated.find(p => p.id === id);
      if (target) savePromptToDb(target).catch(console.warn);
      showToast('Đã phê duyệt và công khai câu lệnh AI thành công!');
    } else if (type === 'article') {
      const updated = articlesList.map(a => a.id === id ? { ...a, status: 'Published' as const, rejectionReason: undefined } : a);
      onArticleUpdate(updated);
      const target = updated.find(a => a.id === id);
      if (target) saveArticleToDb(target).catch(console.warn);
      showToast('Đã phê duyệt và xuất bản bài viết lên trang tin tức!');
    }

    if (previewItem && previewItem.data.id === id) {
      setPreviewItem(null);
    }
  };

  // Handle Batch Approve all pending
  const handleBatchApproveAll = () => {
    if (totalPending === 0) return;
    if (!confirm(`Bạn có chắc muốn phê duyệt toàn bộ ${totalPending} bài đăng đang chờ không?`)) return;

    // Approve designs
    const updatedDesigns = designFiles.map(f => f.status === 'Pending' ? { ...f, status: 'Approved' as const } : f);
    onDesignUpdate(updatedDesigns);

    // Approve prompts
    const updatedPrompts = promptFiles.map(p => p.status === 'Pending' ? { ...p, status: 'Approved' as const } : p);
    onPromptUpdate(updatedPrompts);

    // Approve articles
    const updatedArticles = articlesList.map(a => a.status === 'Pending' ? { ...a, status: 'Published' as const } : a);
    onArticleUpdate(updatedArticles);

    showToast(`Đã phê duyệt thành công ${totalPending} tài nguyên!`);
  };

  // Open Rejection Dialog
  const handleOpenRejectModal = (id: string, type: 'design' | 'prompt' | 'article', title: string) => {
    setRejectionModalItem({ id, type, title });
    setRejectionReason('Liên kết tệp tin không truy cập được hoặc quyền chia sẻ chưa mở công khai.');
  };

  // Confirm Rejection with Reason
  const handleConfirmRejection = () => {
    if (!rejectionModalItem) return;
    const { id, type } = rejectionModalItem;

    if (type === 'design') {
      const updated = designFiles.map(f => f.id === id ? { ...f, status: 'Rejected' as const, rejectionReason } : f);
      onDesignUpdate(updated);
      const target = updated.find(f => f.id === id);
      if (target) saveDesignToDb(target).catch(console.warn);
    } else if (type === 'prompt') {
      const updated = promptFiles.map(p => p.id === id ? { ...p, status: 'Rejected' as const, rejectionReason } : p);
      onPromptUpdate(updated);
      const target = updated.find(p => p.id === id);
      if (target) savePromptToDb(target).catch(console.warn);
    } else if (type === 'article') {
      const updated = articlesList.map(a => a.id === id ? { ...a, status: 'Rejected' as const, rejectionReason } : a);
      onArticleUpdate(updated);
      const target = updated.find(a => a.id === id);
      if (target) saveArticleToDb(target).catch(console.warn);
    }

    showToast('Đã từ chối bài đăng và lưu lý do phản hồi cho tác giả.');
    setRejectionModalItem(null);
    if (previewItem && previewItem.data.id === id) {
      setPreviewItem(null);
    }
  };

  // Save System Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigUpdate(localConfig);
    setSaveSuccess(true);
    showToast('Cấu hình hệ thống đã được cập nhật thành công!');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Filter items for Moderation View
  const getFilteredModerationItems = () => {
    let list: Array<{ type: 'design' | 'prompt' | 'article'; data: any }> = [];

    // Filter by type
    if (modCategory === 'all' || modCategory === 'designs') {
      const filtered = designFiles.filter(f => {
        if (modStatus === 'pending') return f.status === 'Pending';
        if (modStatus === 'approved') return f.status === 'Approved';
        if (modStatus === 'rejected') return f.status === 'Rejected';
        return true;
      });
      list.push(...filtered.map(d => ({ type: 'design' as const, data: d })));
    }

    if (modCategory === 'all' || modCategory === 'prompts') {
      const filtered = promptFiles.filter(p => {
        if (modStatus === 'pending') return p.status === 'Pending';
        if (modStatus === 'approved') return p.status === 'Approved';
        if (modStatus === 'rejected') return p.status === 'Rejected';
        return true;
      });
      list.push(...filtered.map(p => ({ type: 'prompt' as const, data: p })));
    }

    if (modCategory === 'all' || modCategory === 'articles') {
      const filtered = articlesList.filter(a => {
        if (modStatus === 'pending') return a.status === 'Pending';
        if (modStatus === 'approved') return a.status === 'Published';
        if (modStatus === 'rejected') return a.status === 'Rejected';
        return true;
      });
      list.push(...filtered.map(a => ({ type: 'article' as const, data: a })));
    }

    // Filter by search
    if (modSearch.trim()) {
      const q = modSearch.toLowerCase();
      list = list.filter(item => {
        const title = item.data.title?.toLowerCase() || '';
        const author = item.data.author?.toLowerCase() || '';
        const cat = item.data.category?.toLowerCase() || '';
        return title.includes(q) || author.includes(q) || cat.includes(q);
      });
    }

    return list;
  };

  // Font CRUD handlers
  const handleSaveFontSuccess = (savedFont: VietnameseFont) => {
    let updated: VietnameseFont[];
    const exists = fontsList.some(f => f.id === savedFont.id);
    if (exists) {
      updated = fontsList.map(f => f.id === savedFont.id ? savedFont : f);
      showToast(`Đã cập nhật bộ font "${savedFont.name}" thành công!`);
    } else {
      updated = [savedFont, ...fontsList];
      showToast(`Đã thêm bộ font mới "${savedFont.name}" vào kho lưu trữ!`);
    }
    onFontUpdate(updated);
    saveFontToDb(savedFont).catch(e => console.warn('Could not sync font to cloud:', e));
    setEditingFont(null);
  };

  const handleDeleteFont = (fontId: string, fontName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bộ font "${fontName}" khỏi hệ thống?`)) {
      const updated = fontsList.filter(f => f.id !== fontId);
      onFontUpdate(updated);
      deleteFontFromDb(fontId).catch(e => console.warn('Could not delete font from cloud:', e));
      showToast(`Đã xóa font "${fontName}".`);
    }
  };

  const handleTogglePinFont = (fontId: string) => {
    const target = fontsList.find(f => f.id === fontId);
    if (!target) return;
    const updatedFont = { ...target, isPinned: !target.isPinned };
    const updated = fontsList.map(f => f.id === fontId ? updatedFont : f);
    onFontUpdate(updated);
    saveFontToDb(updatedFont).catch(e => console.warn('Could not sync font:', e));
    showToast(updatedFont.isPinned ? `Đã ghim nổi bật font "${target.name}"!` : `Đã bỏ ghim font "${target.name}".`);
  };

  const moderationItems = getFilteredModerationItems();

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl" id="admin-dashboard-root">
      {/* Upper navigation header */}
      <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Trung tâm Quản trị & Kiểm duyệt</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase rounded-full">Admin Level</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Xin chào, {currentUser.displayName} • Quản trị viên hệ thống ICTC</p>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl border border-slate-200 text-xs font-bold gap-1 shrink-0 overflow-x-auto max-w-full relative">
          {[
            { 
              id: 'moderation', 
              label: 'Kiểm duyệt bài', 
              icon: CheckCircle, 
              badge: totalPending > 0 ? totalPending : null,
              badgeColor: 'bg-rose-500 text-white'
            },
            { 
              id: 'reports', 
              label: 'Báo cáo vi phạm', 
              icon: Flag, 
              iconColor: 'text-rose-600',
              badge: reportsList.filter(r => r.status?.toLowerCase() === 'pending').length > 0 ? reportsList.filter(r => r.status?.toLowerCase() === 'pending').length : null,
              badgeColor: 'bg-rose-600 text-white'
            },
            { id: 'articles', label: `Bài viết (${articlesList.length})`, icon: BookOpen },
            { id: 'fonts', label: `Quản lý Font (${fontsList.length})`, icon: Type },
            { id: 'users', label: `Thành viên (${userList.length})`, icon: Users },
            { id: 'security', label: 'Bảo mật & Phòng vệ', icon: ShieldCheck, iconColor: 'text-emerald-600' },
            { id: 'settings', label: 'Cấu hình chung', icon: Settings },
            { id: 'uploadResearch', label: 'Drive Research', icon: HardDrive },
            { id: 'ideas', label: 'Nâng cấp Ý tưởng', icon: Lightbulb, iconColor: 'text-amber-500', activeTextColor: 'text-amber-600' },
          ].map((subtab) => {
            const isActive = activeSubTab === subtab.id;
            const IconComp = subtab.icon;

            return (
              <motion.button
                key={subtab.id}
                onClick={() => setActiveSubTab(subtab.id as any)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer select-none ${
                  isActive
                    ? subtab.activeTextColor || 'text-blue-600 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="adminSubtabBackground"
                    className="absolute inset-0 bg-white rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.span
                  animate={{
                    scale: isActive ? 1.22 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="relative z-10 inline-flex items-center justify-center shrink-0"
                >
                  <IconComp className={`w-4 h-4 ${subtab.iconColor && !isActive ? subtab.iconColor : ''}`} />
                </motion.span>

                <span className="relative z-10">{subtab.label}</span>

                {subtab.badge !== null && subtab.badge !== undefined && (
                  <span className={`relative z-10 px-1.5 py-0.5 text-[9px] rounded-full font-black animate-pulse ${subtab.badgeColor}`}>
                    {subtab.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Admin Action Toolbar */}
      <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="uppercase tracking-wider text-amber-400 font-black">Công cụ Quản trị Nhanh:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingDesign(null);
              setIsDesignEditorOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer ring-2 ring-blue-400/30"
            title="Thêm trực tiếp mẫu thiết kế Slide / UI / Đồ án mới"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm file thiết kế</span>
          </button>

          <button
            onClick={() => {
              setEditingArticle(null);
              setIsArticleEditorOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
            title="Soạn thảo và đăng bài viết tri thức mới"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng bài viết mới</span>
          </button>

          <button
            onClick={() => {
              setEditingPrompt(null);
              setIsPromptEditorOpen(true);
            }}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
            title="Đóng góp câu lệnh AI Prompt cao cấp mới"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm AI Prompt</span>
          </button>

          <button
            onClick={() => {
              setEditingFont(null);
              setIsFontUploadModalOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl shadow-sm transition-all flex items-center space-x-1.5 active:scale-95"
            title="Tải lên bộ Font chữ Việt hóa mới"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Font chữ</span>
          </button>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
            title="Xem bảng xếp hạng tác giả & huy hiệu đóng góp"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Bảng Xếp Hạng & Huy Hiệu</span>
          </button>

          <button
            onClick={() => {
              exportDesignsToCSV(designFiles);
              toastSuccess('Đã xuất dữ liệu thiết kế ra tệp CSV thành công!', 'Xuất dữ liệu');
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Xuất báo cáo danh sách tài nguyên ra file Excel / CSV"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Xuất CSV Báo cáo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ideas')}
            className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all flex items-center space-x-1.5 active:scale-95 ${
              activeSubTab === 'ideas'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Sáng kiến Ý tưởng</span>
          </button>
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="p-6 sm:p-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: MODERATION CENTER (KIỂM DUYỆT & DUYỆT BÀI TẬP TRUNG) */}
        {/* ========================================================================= */}
        {activeSubTab === 'moderation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Đang chờ duyệt</p>
                  <p className="text-xl font-black text-amber-950">{totalPending} bài</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">File Slide / Thiết kế</p>
                  <p className="text-xl font-black text-blue-950">{pendingDesigns.length} chờ</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Câu lệnh AI Prompt</p>
                  <p className="text-xl font-black text-purple-950">{pendingPrompts.length} chờ</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Bài viết & Tin tức</p>
                  <p className="text-xl font-black text-emerald-950">{pendingArticles.length} chờ</p>
                </div>
              </div>
            </div>

            {/* Quick Compliance Verification Bar for Admins */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl text-xs font-semibold">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-bold">Quy chuẩn kiểm duyệt nội dung & SHTT:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPaletteOpen(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold transition-all"
                >
                  Tra cứu Mã màu & Kích thước chuẩn
                </button>
                <button
                  onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold transition-all"
                >
                  Quy định Bản quyền & SHTT
                </button>
                <button
                  onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold transition-all"
                >
                  Nguyên tắc cộng đồng
                </button>
                <button
                  onClick={() => { setLegalTab('ai_ethics'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold transition-all"
                >
                  Đạo đức AI & Biểu trưng Quốc gia
                </button>
              </div>
            </div>

            {/* Filter & Batch Actions Bar */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category selector */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 mr-1 flex items-center">
                  <Filter className="w-3.5 h-3.5 mr-1" /> Thể loại:
                </span>
                <button
                  onClick={() => setModCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modCategory === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  Tất cả ({designFiles.length + promptFiles.length + articlesList.length})
                </button>
                <button
                  onClick={() => setModCategory('designs')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modCategory === 'designs' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  File thiết kế ({designFiles.length})
                </button>
                <button
                  onClick={() => setModCategory('prompts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modCategory === 'prompts' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  AI Prompts ({promptFiles.length})
                </button>
                <button
                  onClick={() => setModCategory('articles')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    modCategory === 'articles' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                  }`}
                >
                  Bài viết ({articlesList.length})
                </button>
              </div>

              {/* Status selector */}
              <div className="flex items-center space-x-2">
                <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                  <button
                    onClick={() => setModStatus('pending')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      modStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Chờ duyệt ({totalPending})
                  </button>
                  <button
                    onClick={() => setModStatus('approved')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      modStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Đã duyệt
                  </button>
                  <button
                    onClick={() => setModStatus('rejected')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      modStatus === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Từ chối
                  </button>
                </div>

                {modStatus === 'pending' && totalPending > 0 && (
                  <button
                    onClick={handleBatchApproveAll}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all active:scale-95 flex items-center space-x-1 whitespace-nowrap"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Duyệt tất cả</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search within moderation list */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bài đăng theo tiêu đề, tác giả, chuyên mục..."
                value={modSearch}
                onChange={(e) => setModSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* List of moderation items */}
            {moderationItems.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                <h4 className="text-base font-bold text-slate-800">
                  {modStatus === 'pending' ? 'Không có bài đăng nào đang chờ duyệt!' : 'Không có dữ liệu phù hợp với bộ lọc.'}
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  {modStatus === 'pending' 
                    ? 'Tất cả các tệp thiết kế, câu lệnh AI và bài viết đóng góp từ thành viên đều đã được xử lý hoàn tất.'
                    : 'Hãy chuyển trạng thái hoặc chọn danh mục khác để xem lịch sử.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moderationItems.map((item) => {
                  const { type, data } = item;
                  const isPending = data.status === 'Pending';
                  const isRejected = data.status === 'Rejected';

                  return (
                    <div 
                      key={`${type}-${data.id}`}
                      className={`bg-white border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                        isPending ? 'border-amber-300 bg-amber-50/10' : isRejected ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                              type === 'design' ? 'bg-blue-100 text-blue-800' :
                              type === 'prompt' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {type === 'design' ? 'File Thiết Kế' : type === 'prompt' ? 'AI Prompt' : 'Bài Viết'}
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[9px] font-bold rounded">
                              {data.category}
                            </span>
                            {data.fileType && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded uppercase">
                                {data.fileType}
                              </span>
                            )}
                          </div>

                          <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                            isPending ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            isRejected ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isPending ? 'Chờ duyệt' : isRejected ? 'Đã từ chối' : 'Đã duyệt'}
                          </span>
                        </div>

                        {/* Title & info */}
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                          {data.title}
                        </h4>

                        {/* Content preview */}
                        {type === 'design' && (
                          <div className="text-xs text-slate-500 line-clamp-2">
                            {data.description || 'Không có mô tả chi tiết.'}
                          </div>
                        )}

                        {type === 'prompt' && (
                          <div className="bg-slate-900 text-slate-200 p-2.5 rounded-xl font-mono text-[11px] line-clamp-2">
                            {data.rawPrompt}
                          </div>
                        )}

                        {type === 'article' && (
                          <div className="text-xs text-slate-500 line-clamp-2">
                            {data.summary || data.content?.slice(0, 120)}
                          </div>
                        )}

                        {/* Author & Timestamp */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span>Tác giả: <strong className="text-slate-700">{data.author}</strong></span>
                          <span>{data.createdAt || data.publishedAt}</span>
                        </div>

                        {/* If Rejected, show reason */}
                        {isRejected && data.rejectionReason && (
                          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 flex items-start space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                            <span><strong>Lý do từ chối:</strong> {data.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setPreviewItem({ type, data })}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem chi tiết</span>
                        </button>

                        {data.driveUrl && (
                          <a
                            href={data.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors"
                            title="Mở liên kết Drive nguồn"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <div className="flex-1"></div>

                        {/* Rejection / Approval buttons */}
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleOpenRejectModal(data.id, type, data.title)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
                              title="Từ chối duyệt bài"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </button>
                            <button
                              onClick={() => handleApproveContent(data.id, type)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center space-x-1 shadow-xs transition-all active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt & Xuất bản</span>
                            </button>
                          </>
                        ) : isRejected ? (
                          <button
                            onClick={() => handleApproveContent(data.id, type)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Duyệt lại</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRejectModal(data.id, type, data.title)}
                            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold text-xs rounded-xl flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Thu hồi duyệt</span>
                          </button>
                        )}

                        {/* Admin Action Buttons (Edit / Delete) */}
                        {(type === 'design' || type === 'prompt') && (
                          <div className="flex items-center space-x-1 ml-2 border-l border-slate-200 pl-2">
                            <button
                              onClick={() => {
                                if (type === 'design') {
                                  setEditingDesign(data);
                                  setIsDesignEditorOpen(true);
                                } else {
                                  setEditingPrompt(data);
                                  setIsPromptEditorOpen(true);
                                }
                              }}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors"
                              title="Chỉnh sửa nội dung"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (type === 'design') {
                                  handleDeleteDesign(data.id);
                                } else {
                                  handleDeletePrompt(data.id);
                                }
                              }}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                              title="Xóa vĩnh viễn khỏi hệ thống"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ARTICLES MANAGEMENT */}
        {/* ========================================================================= */}
        {activeSubTab === 'articles' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Quản lý bài viết & Tin tức học thuật ({articlesList.length})</h3>
                <p className="text-xs text-slate-500">Soạn thảo bài mới, ghim bài nổi bật, kiểm duyệt hoặc chỉnh sửa các bài viết chia sẻ tri thức.</p>
              </div>

              <button
                onClick={handleOpenCreateArticle}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2 shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Viết bài mới</span>
              </button>
            </div>

            {articlesList.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-300 rounded-3xl space-y-3">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Chưa có bài viết nào trong hệ thống</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy nhấn nút "Viết bài mới" ở trên để tạo bài viết đầu tiên chia sẻ kinh nghiệm thiết kế hoặc tin tức ICTC.
                </p>
                <button
                  onClick={handleOpenCreateArticle}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Tạo bài viết ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {articlesList.map((art) => (
                  <div
                    key={art.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      art.isPinned ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <img
                        src={art.coverImage}
                        alt={art.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                            {art.category}
                          </span>
                          {art.isPinned && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded flex items-center">
                              <Pin className="w-2.5 h-2.5 mr-1" /> Ghim nổi bật
                            </span>
                          )}
                          <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                            art.status === 'Published' ? 'bg-emerald-100 text-emerald-800' :
                            art.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {art.status === 'Published' ? 'Đã xuất bản' : art.status === 'Pending' ? 'Chờ duyệt' : 'Bản nháp'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm truncate">{art.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          Bởi <strong>{art.author}</strong> • {art.publishedAt} • {art.viewsCount || 0} lượt xem • {art.likesCount || 0} thích
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleOpenEditArticle(art)}
                        className="p-2 bg-white text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl transition-colors"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleTogglePinArticle(art)}
                        className={`p-2 rounded-xl border transition-colors ${
                          art.isPinned
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-slate-500 hover:text-amber-600 border-slate-200 hover:border-amber-200'
                        }`}
                        title={art.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu trang'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setPreviewItem({ type: 'article', data: art })}
                        className="p-2 bg-white text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors"
                        title="Xem nội dung chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1.5: CONTENT VIOLATION REPORTS & AUTOMATED MODERATION */}
        {/* ========================================================================= */}
        {activeSubTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header info */}
            <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-rose-900/40 space-y-3">
              <div className="flex items-center space-x-2 text-rose-400 font-black text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Trung Tâm Tiếp Nhận & Xử Lý Vi Phạm Nội Dung Nghi Vấn</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Báo Cáo Vi Phạm & Cảnh Báo Kiểm Duyệt Tự Động (Hidden Scanner)
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
                Cơ chế ẩn liên tục rà quét nội dung không phù hợp (từ ngữ nhạy cảm, xuyên tạc, quảng cáo spam, vi phạm bản quyền) khi người dùng đăng tin. Đồng thời tiếp nhận phản ánh báo cáo từ cộng đồng. Ban Quản Trị có quyền xử lý hoặc bác bỏ trực tiếp.
              </p>
            </div>

            {/* Reports List Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-rose-600 fill-rose-600" />
                  <span>Danh Sách Phản Ánh & Cảnh Báo ({reportsList.length})</span>
                </h3>
                <button
                  onClick={() => setReportsList(fetchContentReports())}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Làm mới</span>
                </button>
              </div>

              {reportsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="font-bold text-slate-600">Hệ thống an toàn - Không có báo cáo vi phạm nào!</p>
                  <p className="text-xs">Tất cả bài đăng và tài nguyên trên website đều tuân thủ đúng chuẩn mực cộng đồng.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportsList.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        report.status?.toLowerCase() === 'pending'
                          ? 'bg-rose-50/50 border-rose-200'
                          : report.status?.toLowerCase() === 'resolved'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-lg ${
                            report.severity === 'high' || report.severity === 'critical'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            Rủi ro {report.severity.toUpperCase()}
                          </span>

                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg uppercase">
                            {report.targetType}
                          </span>

                          {report.autoFlagged && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-lg flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Tự động quét</span>
                            </span>
                          )}

                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg ${
                            report.status?.toLowerCase() === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : report.status?.toLowerCase() === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {report.status?.toLowerCase() === 'pending' ? 'Đang chờ xử lý' : report.status?.toLowerCase() === 'resolved' ? 'Đã xử lý' : 'Đã bác bỏ'}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          Thời gian: {report.reportedAt ? new Date(report.reportedAt).toLocaleString('vi-VN') : 'Mới đây'}
                        </span>
                      </div>

                      <div className="pt-3 space-y-1.5">
                        <h4 className="text-sm font-black text-slate-900">
                          {report.targetTitle} <span className="text-xs text-slate-400 font-normal">(ID: {report.targetId})</span>
                        </h4>
                        <p className="text-xs text-rose-800 font-bold">
                          Lý do báo cáo: <span className="font-normal text-slate-800">{report.reason}</span>
                        </p>
                        {report.details && (
                          <p className="text-xs text-slate-600 italic bg-white/80 p-2.5 rounded-xl border border-slate-200">
                            "{report.details}"
                          </p>
                        )}
                        <p className="text-[11px] text-slate-500">
                          Người gửi báo cáo: <strong className="text-slate-700">{report.reporterName}</strong>
                        </p>
                      </div>

                      {/* Action buttons */}
                      {report.status?.toLowerCase() === 'pending' && (
                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              updateReportStatus(report.id, 'dismissed', `Bác bỏ bởi Admin ${currentUser.displayName}`);
                              setReportsList(fetchContentReports());
                              showToast('Đã bác bỏ báo cáo này!');
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                          >
                            Bác bỏ báo cáo
                          </button>
                          <button
                            onClick={() => {
                              updateReportStatus(report.id, 'resolved', `Đã xử lý bởi Admin ${currentUser.displayName}`);
                              setReportsList(fetchContentReports());
                              showToast('Đã đánh dấu đã xử lý xong báo cáo!');
                            }}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã xử lý vi phạm</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2.5: FONT MANAGEMENT & DRIVE UPLOAD */}
        {/* ========================================================================= */}
        {activeSubTab === 'fonts' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Stat Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Tổng số Font chữ</p>
                  <p className="text-xl font-black text-blue-950">{fontsList.length} bộ</p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Google Fonts Chuẩn</p>
                  <p className="text-xl font-black text-emerald-950">{fontsList.filter(f => f.isGoogleFont).length} bộ</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-purple-600 text-white rounded-xl shadow-xs">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Đóng góp Tải lên</p>
                  <p className="text-xl font-black text-purple-950">{fontsList.filter(f => f.isCustomUploaded).length} bộ</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Lượt tải về</p>
                  <p className="text-xl font-black text-amber-950">
                    {fontsList.reduce((acc, f) => acc + (f.downloadsCount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar: Search, Category Filter, Add Font, Open Drive */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên font, tác giả, tag..."
                    value={fontSearchTerm}
                    onChange={(e) => setFontSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category select */}
                <select
                  value={fontCategoryFilter}
                  onChange={(e) => setFontCategoryFilter(e.target.value)}
                  className="bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Tất cả">Tất cả danh mục ({fontsList.length})</option>
                  <option value="Google Fonts">Chỉ Google Fonts ({fontsList.filter(f => f.isGoogleFont).length})</option>
                  {FONT_CATEGORIES.filter(c => c !== 'Tất cả' && c !== 'Google Fonts').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={systemConfig.driveFontFolder || systemConfig.sharedUploadDriveUrl || systemConfig.driveDesignFolder}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Mở Drive Lưu Font</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <button
                  onClick={() => {
                    setEditingFont(null);
                    setIsFontUploadModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Thêm Font Mới</span>
                </button>
              </div>
            </div>

            {/* Font Items List */}
            {fontsList.filter(font => {
              const matchesSearch = 
                font.name.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                font.creator.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                font.description.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                font.tags.some(t => t.toLowerCase().includes(fontSearchTerm.toLowerCase()));

              let matchesCat = true;
              if (fontCategoryFilter === 'Tất cả') {
                matchesCat = true;
              } else if (fontCategoryFilter === 'Google Fonts') {
                matchesCat = !!font.isGoogleFont;
              } else {
                matchesCat = font.category === fontCategoryFilter;
              }

              return matchesSearch && matchesCat;
            }).length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <Type className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">Không tìm thấy bộ font nào</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Hãy thử tìm kiếm với từ khóa khác hoặc bấm nút "Thêm Font Mới" để tải lên bộ font chữ tiếng Việt.
                </p>
                <button
                  onClick={() => {
                    setEditingFont(null);
                    setIsFontUploadModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Thêm Font Ngay
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fontsList.filter(font => {
                  const matchesSearch = 
                    font.name.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                    font.creator.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                    font.description.toLowerCase().includes(fontSearchTerm.toLowerCase()) ||
                    font.tags.some(t => t.toLowerCase().includes(fontSearchTerm.toLowerCase()));

                  let matchesCat = true;
                  if (fontCategoryFilter === 'Tất cả') {
                    matchesCat = true;
                  } else if (fontCategoryFilter === 'Google Fonts') {
                    matchesCat = !!font.isGoogleFont;
                  } else {
                    matchesCat = font.category === fontCategoryFilter;
                  }

                  return matchesSearch && matchesCat;
                }).map((font) => (
                  <div
                    key={font.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      font.isPinned ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center border border-slate-800 shrink-0 p-1 text-center">
                        <span className="text-xl font-bold font-serif" style={{ fontFamily: font.fontFamily }}>Aa</span>
                        <span className="text-[9px] text-slate-400 truncate max-w-full font-mono">{font.weight?.slice(0, 10) || 'Std'}</span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                            {font.category}
                          </span>
                          
                          {font.isGoogleFont && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center">
                              <Sparkles className="w-2.5 h-2.5 mr-1" /> Google Fonts
                            </span>
                          )}

                          {font.isPinned && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded flex items-center">
                              <Pin className="w-2.5 h-2.5 mr-1" /> Ghim nổi bật
                            </span>
                          )}

                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                            {font.encoding}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm truncate flex items-center space-x-2">
                          <span>{font.name}</span>
                          <span className="text-xs text-slate-400 font-normal">({font.fontFamily})</span>
                        </h4>

                        <p className="text-[11px] text-slate-500">
                          Tác giả/Việt hóa: <strong>{font.creator}</strong> • Biến thể: <strong>{font.weight}</strong> • Bản quyền: <span className="text-emerald-600 font-semibold">{font.license}</span> • {font.downloadsCount || 0} lượt tải
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setEditingFont(font);
                          setIsFontUploadModalOpen(true);
                        }}
                        className="p-2 bg-white text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-xl transition-colors"
                        title="Chỉnh sửa thông tin font"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleTogglePinFont(font.id)}
                        className={`p-2 rounded-xl border transition-colors ${
                          font.isPinned
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-white text-slate-500 hover:text-amber-600 border-slate-200 hover:border-amber-200'
                        }`}
                        title={font.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu trang'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <a
                        href={font.downloadUrl || font.driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors"
                        title="Tải font / Mở Google Drive"
                      >
                        <Download className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDeleteFont(font.id, font.name)}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-colors"
                        title="Xóa bộ font"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: USER MANAGEMENT */}
        {/* ========================================================================= */}
        {activeSubTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <MemberManagement 
              currentUser={currentUser} 
              users={userList} 
              onUsersChange={onUserUpdate} 
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SECURITY CENTER (PHÒNG VỆ & BẢO MẬT TÀI KHOẢN) */}
        {/* ========================================================================= */}
        {activeSubTab === 'security' && (
          <div className="animate-fade-in">
            <SecurityCenter currentUser={currentUser} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SYSTEM SETTINGS (CẤU HÌNH HỆ THỐNG & DRIVE TIẾP NHẬN) */}
        {/* ========================================================================= */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-3xl animate-fade-in">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Cấu hình Toàn hệ thống & Thư mục Drive Chung</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập các thư mục Google Drive tiếp nhận tệp tin, model AI và cơ chế tự động duyệt bài.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cấu hình hệ thống đã được lưu trữ thành công và đồng bộ tức thì!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tên cổng thông tin (Site Name)</label>
                  <input
                    type="text"
                    required
                    value={localConfig.siteName}
                    onChange={(e) => setLocalConfig({ ...localConfig, siteName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Model AI mặc định (Gemini)</label>
                  <select
                    value={localConfig.defaultAIModel}
                    onChange={(e) => setLocalConfig({ ...localConfig, defaultAIModel: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ổn định nhất)</option>
                    <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (Mới nhất)</option>
                    <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Cao cấp)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Slogan & Mô tả chi tiết trang web</label>
                <textarea
                  rows={2}
                  required
                  value={localConfig.siteDescription}
                  onChange={(e) => setLocalConfig({ ...localConfig, siteDescription: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              {/* Shared Upload Folder */}
              <div className="p-4 bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Thư mục Google Drive tiếp nhận tệp tin đóng góp (Shared Upload Folder)
                  </label>
                </div>
                <input
                  type="url"
                  required
                  value={localConfig.sharedUploadDriveUrl || localConfig.driveDesignFolder}
                  onChange={(e) => setLocalConfig({ ...localConfig, sharedUploadDriveUrl: e.target.value })}
                  className="w-full bg-white text-slate-700 font-mono text-xs rounded-xl border border-blue-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
                <p className="text-[11px] text-slate-500">
                  Thành viên khi bấm "Mở Thư mục Drive" trong biểu mẫu tải lên sẽ được chuyển hướng tới liên kết thư mục dùng chung này.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thư mục Drive Slide thuyết trình chính thức</label>
                <input
                  type="url"
                  required
                  value={localConfig.driveDesignFolder}
                  onChange={(e) => setLocalConfig({ ...localConfig, driveDesignFolder: e.target.value })}
                  className="w-full bg-slate-50 text-slate-600 font-mono text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thư mục Drive AI Prompt chính thức</label>
                <input
                  type="url"
                  required
                  value={localConfig.drivePromptFolder}
                  onChange={(e) => setLocalConfig({ ...localConfig, drivePromptFolder: e.target.value })}
                  className="w-full bg-slate-50 text-slate-600 font-mono text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thư mục Google Drive Chuyên Biệt Lưu Trữ Font Chữ</label>
                <input
                  type="url"
                  value={localConfig.driveFontFolder || localConfig.driveDesignFolder}
                  onChange={(e) => setLocalConfig({ ...localConfig, driveFontFolder: e.target.value })}
                  className="w-full bg-slate-50 text-slate-600 font-mono text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>

              {/* Google Apps Script Proxy Config */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Google Apps Script Web App URL (Để Tải Tệp Tự Động Lên Drive)
                  </label>
                </div>
                <input
                  type="url"
                  value={localConfig.googleAppsScriptUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, googleAppsScriptUrl: e.target.value })}
                  className="w-full bg-white text-slate-700 font-mono text-xs rounded-xl border border-emerald-200 p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://script.google.com/macros/s/.../exec"
                />
                <p className="text-[11px] text-slate-500">
                  Nhập URL Triển khai Ứng dụng Web từ Google Apps Script của bạn. Khi cấu hình URL này, thành viên có thể upload tệp trực tiếp và hệ thống sẽ tự động phân loại vào các thư mục con: <span className="font-bold text-emerald-700">/Font</span>, <span className="font-bold text-emerald-700">/Thietke</span>, hoặc <span className="font-bold text-emerald-700">/Promt mẫu</span>.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-900">Cho phép thành viên gửi bài</p>
                    <p className="text-[10px] text-slate-400">Cho phép người dùng thành viên gửi bài thiết kế/prompt lên hàng đợi kiểm duyệt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, allowPublicUploads: !localConfig.allowPublicUploads })}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {localConfig.allowPublicUploads ? (
                      <ToggleRight className="w-9 h-9 stroke-[1.5]" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-900">Tự động duyệt bài Creator</p>
                    <p className="text-[10px] text-slate-400">Bài đăng từ tài khoản có vai trò Creator hoặc Admin sẽ được tự động xuất bản.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalConfig({ ...localConfig, autoApproveCreators: !localConfig.autoApproveCreators })}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {localConfig.autoApproveCreators ? (
                      <ToggleRight className="w-9 h-9 stroke-[1.5]" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-blue-500/15"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình hệ thống</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DRIVE UPLOAD RESEARCH */}
        {/* ========================================================================= */}
        {activeSubTab === 'uploadResearch' && (
          <DriveUploadResearch />
        )}

        {/* ========================================================================= */}
        {/* TAB 6: IDEAS & INNOVATION MANAGEMENT (NÂNG CẤP Ý TƯỞNG) */}
        {/* ========================================================================= */}
        {activeSubTab === 'ideas' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Lightbulb className="w-6 h-6 text-amber-100" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">Trung Tâm Nâng Cấp & Quản Lý Ý Tưởng</h3>
                  <p className="text-xs text-amber-100">Duyệt sáng kiến cộng đồng, phê duyệt nâng cấp thành dự án thiết kế và tài nguyên chính thức</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingDesign(null);
                  setIsDesignEditorOpen(true);
                }}
                className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 font-black text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Thêm File Thiết Kế Mới</span>
              </button>
            </div>

            {/* Ideas List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-lg">
                        {idea.category}
                      </span>

                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-lg ${
                        idea.status === 'Đã nâng cấp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : idea.status === 'Đang phát triển'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {idea.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{idea.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{idea.description}</p>

                    <div className="pt-2 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                      <span>Đóng góp bởi: <strong className="text-slate-700">{idea.author}</strong></span>
                      <span className="flex items-center space-x-1 text-rose-500 font-bold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500" />
                        <span>{idea.votesCount} lượt chọn</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {idea.status !== 'Đã nâng cấp' ? (
                      <button
                        onClick={() => {
                          const updated = communityIdeas.map(i => i.id === idea.id ? { 
                            ...i, 
                            status: 'Đã nâng cấp' as const,
                            adminNotes: 'Ý tưởng đã được Ban Quản Trị phê duyệt nâng cấp thành file thiết kế chính thức.' 
                          } : i);
                          setCommunityIdeas(updated);
                          localStorage.setItem('ictc_community_ideas', JSON.stringify(updated));
                          
                          setEditingDesign({
                            id: `des-${Date.now()}`,
                            title: idea.title,
                            description: idea.description,
                            category: idea.category === 'Mẫu Slide & Thiết kế' ? 'PowerPoint Templates' : 'Infographics & Posters',
                            fileType: 'PPTX',
                            fileSize: '15.0 MB',
                            driveUrl: localConfig.driveDesignFolder || '',
                            previewUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
                            tags: idea.tags || ['Nâng cấp', 'Slide'],
                            downloadsCount: 0,
                            rating: 5.0,
                            createdAt: new Date().toISOString().split('T')[0],
                            author: `${currentUser.displayName} (Admin)`,
                            status: 'Approved'
                          });
                          setIsDesignEditorOpen(true);
                          toastSuccess(`Đã phê duyệt và khởi tạo dự án thiết kế từ ý tưởng "${idea.title}"!`);
                        }}
                        className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Nâng cấp thành File Thiết Kế</span>
                      </button>
                    ) : (
                      <div className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Đã nâng cấp thành công</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* REJECTION REASON MODAL */}
      {/* ========================================================================= */}
      {rejectionModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Từ chối bài đăng</h3>
              </div>
              <button onClick={() => setRejectionModalItem(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Bạn đang từ chối bài đăng: <strong className="text-slate-900">"{rejectionModalItem.title}"</strong>. Vui lòng chọn hoặc ghi rõ lý do để tác giả chỉnh sửa:
            </p>

            {/* Quick reason suggestions */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Gợi ý lý do phổ biến:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Liên kết Drive chưa mở quyền công khai.',
                  'Tệp tin lỗi hoặc không đúng định dạng chuẩn.',
                  'Hình ảnh minh họa bị mờ/không đạt chất lượng.',
                  'Nội dung trùng lặp với tài nguyên đã có.',
                  'Thiếu thông tin mô tả chi tiết quy cách sử dụng.'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung phản hồi chi tiết *</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectionModalItem(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Xem trước nội dung thẩm định</h3>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase">
                  {previewItem.type} • {previewItem.data.category}
                </span>
                <span className="text-xs text-slate-400">
                  Tác giả: <strong className="text-slate-800">{previewItem.data.author}</strong>
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900">{previewItem.data.title}</h2>

              {previewItem.data.previewUrl && (
                <img
                  src={previewItem.data.previewUrl}
                  alt={previewItem.data.title}
                  className="w-full h-48 sm:h-64 object-cover rounded-2xl border border-slate-200"
                />
              )}

              {previewItem.data.coverImage && (
                <img
                  src={previewItem.data.coverImage}
                  alt={previewItem.data.title}
                  className="w-full h-48 sm:h-64 object-cover rounded-2xl border border-slate-200"
                />
              )}

              {previewItem.data.description && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-slate-700 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1">Mô tả tài nguyên:</p>
                  {previewItem.data.description}
                </div>
              )}

              {previewItem.data.rawPrompt && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Câu lệnh AI (Raw Prompt):</p>
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap">
                    {previewItem.data.rawPrompt}
                  </pre>
                </div>
              )}

              {previewItem.data.content && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-700">Nội dung bài viết:</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {previewItem.data.content}
                  </div>
                </div>
              )}

              {previewItem.data.driveUrl && (
                <div className="flex items-center justify-between p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-900 truncate mr-2">Link Drive: {previewItem.data.driveUrl}</span>
                  <a
                    href={previewItem.data.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shrink-0"
                  >
                    <span>Mở link</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-slate-500 text-xs font-bold rounded-xl"
              >
                Đóng
              </button>
              <button
                onClick={() => handleOpenRejectModal(previewItem.data.id, previewItem.type, previewItem.data.title)}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl"
              >
                Từ chối
              </button>
              <button
                onClick={() => handleApproveContent(previewItem.data.id, previewItem.type)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Phê duyệt ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Editor & Creator Modal */}
      <ArticleEditorModal
        isOpen={isArticleEditorOpen}
        onClose={() => {
          setIsArticleEditorOpen(false);
          setEditingArticle(null);
        }}
        articleToEdit={editingArticle}
        onSaveSuccess={handleSaveArticleSuccess}
        currentAuthorName={currentUser.displayName || 'Ban Quản trị ICTC'}
      />

      {/* Vietnam Design Palette & Standards Modal */}
      <VietnamDesignPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Legal & Compliance Modal */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Font Upload & Editor Modal */}
      <FontUploadModal
        isOpen={isFontUploadModalOpen}
        onClose={() => {
          setIsFontUploadModalOpen(false);
          setEditingFont(null);
        }}
        fontToEdit={editingFont}
        onSaveSuccess={handleSaveFontSuccess}
        currentAuthorName={currentUser.displayName || 'Admin'}
        driveFontFolderUrl={systemConfig.driveFontFolder || systemConfig.sharedUploadDriveUrl || systemConfig.driveDesignFolder}
      />

      {/* Design Editor & Creator Modal */}
      <DesignEditorModal
        isOpen={isDesignEditorOpen}
        onClose={() => {
          setIsDesignEditorOpen(false);
          setEditingDesign(null);
        }}
        editingFile={editingDesign}
        currentUser={currentUser}
        onSave={handleSaveDesignSuccess}
      />

      {/* Prompt Editor & Creator Modal */}
      <PromptEditorModal
        isOpen={isPromptEditorOpen}
        onClose={() => {
          setIsPromptEditorOpen(false);
          setEditingPrompt(null);
        }}
        editingPrompt={editingPrompt}
        currentUser={currentUser}
        onSave={handleSavePromptSuccess}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        users={userList}
        designFiles={designFiles}
        aiPrompts={promptFiles}
        articles={articlesList}
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
};
