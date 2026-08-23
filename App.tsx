import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignHub } from './components/DesignHub';
import { PromptHub } from './components/PromptHub';
import { ArticleHub } from './components/ArticleHub';
import { FontHub } from './components/FontHub';
import { PersonalPhotoPromptHub } from './components/PersonalPhotoPromptHub';
import { ContactHub } from './components/ContactHub';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberProfile } from './components/MemberProfile';
import { AuthModal } from './components/AuthModal';
import { NewsTicker } from './components/NewsTicker';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { CommandSearchModal } from './components/CommandSearchModal';
import { VietnamDesignPaletteModal } from './components/VietnamDesignPaletteModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { IdeaHubModal } from './components/IdeaHubModal';
import { DesignEditorModal } from './components/DesignEditorModal';
import { AISlideGeneratorModal } from './components/AISlideGeneratorModal';
import { AcademicCopilotModal } from './components/AcademicCopilotModal';
import { MisaAmisHeroSection } from './components/MisaAmisHeroSection';
import { MisaAmisFloatingWidget } from './components/MisaAmisFloatingWidget';
import { WorkflowActionBar } from './components/WorkflowActionBar';
import { User, SystemConfig, Article, DesignFile, AIPrompt, VietnameseFont } from './types';
import { 
  INITIAL_USERS, DEFAULT_SYSTEM_CONFIG, INITIAL_DESIGN_FILES, 
  INITIAL_AI_PROMPTS, INITIAL_ARTICLES 
} from './data/mockData';
import { VIETNAMESE_FONTS_DATA } from './data/vietnamFontsData';
import { UserAvatar } from './components/UserAvatar';
import { 
  FolderOpen, Sparkles, MessageCircle, LogIn, LogOut, Camera,
  Shield, User as UserIcon, Settings, HelpCircle, Activity,
  BookOpen, Search, Command, Palette, Scale, ShieldCheck, Type,
  Filter, ChevronDown, Check, Code, GraduationCap, TrendingUp, Award, Layers,
  Bell, Lightbulb, Zap, Plus, ArrowRight
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { 
  testFirestoreConnection, fetchSystemConfig, fetchDesignsFromDb, 
  fetchPromptsFromDb, fetchUsersFromDb, fetchArticlesFromDb, saveUserToDb,
  fetchFontsFromDb, updateSystemConfigInDb, deleteUserFromDb, saveDesignToDb,
  handleFirestoreError, OperationType
} from './lib/db';

import { ToastContainer } from './components/ToastContainer';
import { useToast } from './context/ToastContext';

const SPECIALTY_OPTIONS = [
  { id: 'all', label: 'Tất cả chuyên ngành', icon: Layers, desc: 'Hiển thị toàn bộ tài nguyên học thuật' },
  { id: 'design', label: 'Thiết kế & Đồ họa', icon: Palette, desc: 'Slide, Poster, Vector, Canva, UI/UX' },
  { id: 'code', label: 'Lập trình & CNTT', icon: Code, desc: 'Website, Tech Prompts, CSDL, Code' },
  { id: 'research', label: 'Nghiên cứu & Học thuật', icon: GraduationCap, desc: 'Tiểu luận, Báo cáo, Đề tài NCKH' },
  { id: 'marketing', label: 'Kinh tế & Marketing', icon: TrendingUp, desc: 'Kế hoạch truyền thông, Pitch deck' },
  { id: 'youth', label: 'Đoàn - Hội & Phong trào', icon: Award, desc: 'Hội nghị, Tình nguyện, Biểu mẫu' },
];

const App: React.FC = () => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'designs' | 'prompts' | 'articles' | 'fonts' | 'photo_prompts' | 'contact' | 'admin' | 'profile'>('designs');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const specialtyDropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  // Global data caches for Search and NewsTicker
  const [articles, setArticles] = useState<Article[]>([]);
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([]);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>([]);
  const [fontsList, setFontsList] = useState<VietnameseFont[]>([]);
  const [userList, setUserList] = useState<User[]>([]);

  // Idea Hub & Direct Design Upload Modal states
  const [isIdeaHubOpen, setIsIdeaHubOpen] = useState(false);
  const [isDirectDesignEditorOpen, setIsDirectDesignEditorOpen] = useState(false);
  const [directDesignInitialTitle, setDirectDesignInitialTitle] = useState<string | undefined>();
  const [bookmarkedCount, setBookmarkedCount] = useState<number>(0);

  // Sync bookmarks count
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('ictc_bookmarks') || '[]');
        setBookmarkedCount(Array.isArray(saved) ? saved.length : 0);
      } catch (e) {
        setBookmarkedCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  // Count pending items waiting for moderation
  const pendingCount = useMemo(() => {
    const designs = designFiles.filter(f => f.status === 'Pending').length;
    const prompts = aiPrompts.filter(p => p.status === 'Pending').length;
    const arts = articles.filter(a => a.status === 'Pending').length;
    return designs + prompts + arts;
  }, [designFiles, aiPrompts, articles]);

  // Consolidate data initialization and sync
  useEffect(() => {
    const isDeletedItem = (title: string = '', id?: string) => {
      if (id) {
        try {
          const deletedIds = JSON.parse(localStorage.getItem('ictc_deleted_ids') || '[]');
          if (Array.isArray(deletedIds) && deletedIds.includes(id)) return true;
        } catch (e) {}
      }
      const t = title.toLowerCase();
      return t.includes('mau ppt vai tro doan tncs hcm') || 
             t.includes('mẫu ppt vai trò đoàn tncs hcm') ||
             (t.includes('mau ppt') && t.includes('vai tro')) ||
             (t.includes('mẫu ppt') && t.includes('vai trò'));
    };

    const initializeData = async () => {
      // 1. Initial local state from storage or mock
      const getLocal = (key: string, fallback: any) => {
        const saved = localStorage.getItem(key);
        if (!saved) return fallback;
        try { return JSON.parse(saved); } catch (e) { return fallback; }
      };

      const localCfg = getLocal('ictc_system_config', DEFAULT_SYSTEM_CONFIG);
      if (!localCfg.googleAppsScriptUrl) {
        localCfg.googleAppsScriptUrl = DEFAULT_SYSTEM_CONFIG.googleAppsScriptUrl;
      }
      setSystemConfig(localCfg);

      const localDesigns = getLocal('ictc_design_files', INITIAL_DESIGN_FILES).filter((item: any) => !isDeletedItem(item.title, item.id));
      
      // Merge initial curated prompts & articles with stored ones to guarantee new curated content is always available
      const rawStoredPrompts = getLocal('ictc_ai_prompts', INITIAL_AI_PROMPTS);
      const promptMap = new Map<string, any>();
      INITIAL_AI_PROMPTS.forEach(p => promptMap.set(p.id, p));
      if (Array.isArray(rawStoredPrompts)) {
        rawStoredPrompts.forEach((p: any) => promptMap.set(p.id, p));
      }
      const localPrompts = Array.from(promptMap.values()).filter((item: any) => !isDeletedItem(item.title, item.id));

      const rawStoredArticles = getLocal('ictc_articles', INITIAL_ARTICLES);
      const articleMap = new Map<string, any>();
      INITIAL_ARTICLES.forEach(a => articleMap.set(a.id, a));
      if (Array.isArray(rawStoredArticles)) {
        rawStoredArticles.forEach((a: any) => articleMap.set(a.id, a));
      }
      const localArticles = Array.from(articleMap.values()).filter((item: any) => !isDeletedItem(item.title, item.id));

      setDesignFiles(localDesigns);
      setAiPrompts(localPrompts);
      setArticles(localArticles);
      setFontsList(getLocal('ictc_vietnamese_fonts', VIETNAMESE_FONTS_DATA));
      setUserList(getLocal('ictc_registered_users', INITIAL_USERS));

      // Clean bookmarks in localStorage
      const localBookmarks = getLocal('ictc_bookmarks', []);
      if (Array.isArray(localBookmarks) && localBookmarks.length > 0) {
        const cleanedBookmarks = localBookmarks.filter((bm: any) => !isDeletedItem(bm.title || '', bm.targetId || bm.id));
        localStorage.setItem('ictc_bookmarks', JSON.stringify(cleanedBookmarks));
      }

      // 2. Fetch fresh data from Cloud
      try {
        const [config, designs, prompts, arts, dbFonts, dbUsers] = await Promise.all([
          fetchSystemConfig(),
          fetchDesignsFromDb(),
          fetchPromptsFromDb(),
          fetchArticlesFromDb(),
          fetchFontsFromDb(),
          fetchUsersFromDb()
        ]);

        if (config) {
          setSystemConfig(config);
          localStorage.setItem('ictc_system_config', JSON.stringify(config));
        }
        if (designs?.length) {
          const cleaned = designs.filter(item => !isDeletedItem(item.title, item.id));
          setDesignFiles(cleaned);
          localStorage.setItem('ictc_design_files', JSON.stringify(cleaned));
        }
        if (prompts?.length) {
          const cleaned = prompts.filter(item => !isDeletedItem(item.title, item.id));
          setAiPrompts(cleaned);
          localStorage.setItem('ictc_ai_prompts', JSON.stringify(cleaned));
        }
        if (arts?.length) {
          const cleaned = arts.filter(item => !isDeletedItem(item.title, item.id));
          setArticles(cleaned);
          localStorage.setItem('ictc_articles', JSON.stringify(cleaned));
        }
        if (dbFonts?.length) {
          setFontsList(dbFonts);
          localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(dbFonts));
        }
        if (dbUsers?.length) {
          setUserList(dbUsers);
          localStorage.setItem('ictc_registered_users', JSON.stringify(dbUsers));
        }
      } catch (e) {
        console.warn("Cloud sync failed, using local/mock data:", e);
      }
    };

    initializeData();

    // 3. Real-time sync listeners with safe error handling
    const unsubDesigns = onSnapshot(
      collection(db, 'designs'),
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DesignFile)).filter(item => !isDeletedItem(item.title, item.id));
        if (items.length > 0) {
          setDesignFiles(items);
          localStorage.setItem('ictc_design_files', JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'designs');
      }
    );

    const unsubPrompts = onSnapshot(
      collection(db, 'prompts'),
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIPrompt)).filter(item => !isDeletedItem(item.title, item.id));
        if (items.length > 0) {
          setAiPrompts(items);
          localStorage.setItem('ictc_ai_prompts', JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'prompts');
      }
    );

    const unsubArticles = onSnapshot(
      collection(db, 'articles'),
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article)).filter(item => !isDeletedItem(item.title, item.id));
        if (items.length > 0) {
          setArticles(items);
          localStorage.setItem('ictc_articles', JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'articles');
      }
    );

    const unsubFonts = onSnapshot(
      collection(db, 'fonts'),
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VietnameseFont));
        if (items.length > 0) {
          setFontsList(items);
          localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'fonts');
      }
    );

    const unsubConfig = onSnapshot(
      collection(db, 'systemConfig'),
      (snap) => {
        const global = snap.docs.find(d => d.id === 'global');
        if (global) {
          const config = global.data() as SystemConfig;
          setSystemConfig(config);
          localStorage.setItem('ictc_system_config', JSON.stringify(config));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'systemConfig');
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        if (items.length > 0) {
          setUserList(items);
          localStorage.setItem('ictc_registered_users', JSON.stringify(items));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    );

    // Listen to real Firebase Authentication status
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const allUsers = await fetchUsersFromDb();
          let foundUser = allUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
          
          if (!foundUser) {
            // New user registration
            const role: 'Admin' | 'Creator' | 'Member' = 
              firebaseUser.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com' ? 'Admin' : 'Member';
            
            foundUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role,
              avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.email}`,
              joinedDate: new Date().toISOString().split('T')[0]
            };

            await saveUserToDb(foundUser);
          }

          setCurrentUser(foundUser);
          localStorage.setItem('ictc_logged_in_user', JSON.stringify(foundUser));

          setUserList(prev => {
            const exists = prev.some(u => u.email.toLowerCase() === foundUser.email.toLowerCase());
            const updated = exists ? prev.map(u => u.email.toLowerCase() === foundUser.email.toLowerCase() ? foundUser : u) : [foundUser, ...prev];
            localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
            return updated;
          });
        } catch (err) {
          console.warn("Error syncing user with Firestore:", err);
          // Fallback to local
          const savedSession = localStorage.getItem('ictc_logged_in_user');
          if (savedSession) {
            try { setCurrentUser(JSON.parse(savedSession)); } catch (e) {}
          }
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('ictc_logged_in_user');
      }
    });

    return () => {
      unsubscribeAuth();
      unsubDesigns();
      unsubPrompts();
      unsubArticles();
      unsubFonts();
      if (unsubUsers) unsubUsers();
      unsubConfig();
    };
  }, [toastSuccess, toastInfo]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ictc_logged_in_user', JSON.stringify(user));

    setUserList(prev => {
      const exists = prev.some(u => u.email.toLowerCase() === user.email.toLowerCase());
      const updated = exists ? prev.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? user : u) : [user, ...prev];
      localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
      return updated;
    });

    toastSuccess(`Xin chào ${user.displayName}! Chúc bạn có trải nghiệm tuyệt vời cùng ICTC.`, 'Đăng nhập thành công');
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
    
    const savedUsersStr = localStorage.getItem('ictc_registered_users');
    let savedUsers: User[] = [...INITIAL_USERS];
    if (savedUsersStr) {
      try { savedUsers = JSON.parse(savedUsersStr); } catch (e) {}
    }
    const updatedList = savedUsers.map(u => 
      (u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()) ? updatedUser : u
    );
    localStorage.setItem('ictc_registered_users', JSON.stringify(updatedList));

    saveUserToDb(updatedUser).catch(err => {
      console.warn("Could not sync updated profile to Firestore:", err);
    });
    toastSuccess('Hồ sơ cá nhân và avatar của bạn đã được cập nhật thành công!', 'Cập nhật hồ sơ');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem('ictc_logged_in_user');
    if (activeTab === 'admin') {
      setActiveTab('designs');
    }
    toastInfo('Bạn đã đăng xuất tài khoản an toàn khỏi hệ thống.', 'Đã đăng xuất');
  };

  // Global modals
  const [selectedArticleForReading, setSelectedArticleForReading] = useState<Article | null>(null);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ip_policy');
  const [isSlideGeneratorOpen, setIsSlideGeneratorOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Global Keyboard Shortcuts (Cmd+K: Search, Cmd+J: Copilot, Cmd+B: Vietnam Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsCopilotOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close specialty dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (specialtyDropdownRef.current && !specialtyDropdownRef.current.contains(e.target as Node)) {
        setIsSpecialtyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const handleRequireAuth = (reason?: string) => {
    setAuthReason(reason || 'Vui lòng đăng nhập hoặc tạo tài khoản thành viên để tiếp tục!');
    setIsAuthOpen(true);
  };

  const handleSaveDirectDesignSuccess = (savedDesign: DesignFile) => {
    const existingIndex = designFiles.findIndex(f => f.id === savedDesign.id);
    let updated: DesignFile[];
    if (existingIndex >= 0) {
      updated = designFiles.map(f => f.id === savedDesign.id ? savedDesign : f);
    } else {
      updated = [savedDesign, ...designFiles];
    }
    setDesignFiles(updated);
    localStorage.setItem('ictc_design_files', JSON.stringify(updated));
    saveDesignToDb(savedDesign).catch(console.warn);
    toastSuccess('Đã đăng tải tệp thiết kế thành công!', 'Thêm file thiết kế');
    setIsDirectDesignEditorOpen(false);
    setDirectDesignInitialTitle(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/10 selection:text-blue-700">
      
      {/* Top Banner Announcement Bar - Modern Blue Gradient */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-800 text-white py-1.5 px-4 text-xs font-semibold relative z-50 shadow-xs border-b border-blue-700/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 truncate">
            <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider shrink-0 shadow-xs">
              🇻🇳 Cổng Tri Thức Số
            </span>
            <span className="truncate text-blue-100/90 text-[11px] sm:text-xs font-medium">
              Hệ sinh thái chia sẻ Slide PowerPoint, AI Prompts & Font chữ Việt hóa dùng chung
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] shrink-0">
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="hover:text-cyan-300 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Palette className="w-3 h-3 text-cyan-300" />
              <span className="hidden md:inline">Bảng màu Việt Nam</span>
            </button>
            <span className="text-blue-300/30">•</span>
            <button
              onClick={() => setIsLegalOpen(true)}
              className="hover:text-cyan-300 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Scale className="w-3 h-3 text-cyan-300" />
              <span className="hidden md:inline">Quy chuẩn Cờ & Biểu tượng</span>
            </button>
            <span className="text-blue-300/30">•</span>
            <button
              onClick={() => setIsIdeaHubOpen(true)}
              className="hover:text-cyan-200 transition-colors flex items-center space-x-1 text-cyan-300 font-bold cursor-pointer"
            >
              <Lightbulb className="w-3 h-3 text-cyan-300" />
              <span>Gửi ý tưởng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upper Top Navbar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('designs')}>
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/15">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg block">
                {systemConfig.siteName}
              </span>
              <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest block -mt-1">
                Kênh chia sẻ tri thức Việt
              </span>
            </div>
          </div>

          {/* Center / Right: Quick Global Search Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCommandSearchOpen(true)}
              className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs font-semibold rounded-full border border-slate-200 transition-all"
              title="Tìm kiếm nhanh toàn hệ thống"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Tìm kiếm tài nguyên...</span>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 text-[10px] font-mono rounded text-slate-400">⌘K</kbd>
            </button>

            {/* User Session status or Login CTA */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCommandSearchOpen(true)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              {currentUser ? (
                <div className="flex items-center space-x-3 bg-slate-100 p-1.5 pr-3.5 rounded-full border border-slate-200/80">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center space-x-2 text-left hover:opacity-90 group transition-all"
                    title="Xem hồ sơ thành viên"
                  >
                    <UserAvatar 
                      user={currentUser} 
                      size="sm" 
                      className="border border-white shadow-sm group-hover:ring-2 group-hover:ring-blue-500 transition-all flex-shrink-0"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px] group-hover:text-blue-600 transition-colors">
                        {currentUser.displayName}
                      </p>
                      <p className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider leading-none">
                        {currentUser.role}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-full transition-all duration-200 shadow-sm shadow-blue-500/10"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Background Grid Pattern */}
      <div className="relative isolate overflow-hidden">
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-slate-200/60 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="grid-pattern-light"
              width="100"
              height="100"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 100V.5H100" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#grid-pattern-light)" />
        </svg>

        {/* Soft Blue Radial Accents */}
        <div
          className="absolute -top-30 left-1/4 -z-10 w-[40rem] h-[40rem] -translate-x-1/2 rounded-full bg-blue-400/5 blur-3xl opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute top-20 right-1/4 -z-10 w-[35rem] h-[35rem] translate-x-1/2 rounded-full bg-indigo-400/5 blur-3xl opacity-40"
          aria-hidden="true"
        />

        {/* Main Workspace Frame */}
        <main className="container mx-auto px-4 py-4 sm:py-6 max-w-7xl space-y-6 sm:space-y-8">
          
          {/* MISA AMIS Enterprise Hero & 4-Step Interactive Workflow Pipeline */}
          <MisaAmisHeroSection
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              // Smooth scroll to primary tab container
              const elem = document.getElementById('primary-tab-switcher');
              if (elem) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            onOpenIdeaHub={() => setIsIdeaHubOpen(true)}
            onOpenPaletteModal={() => setIsPaletteOpen(true)}
            onOpenLegalModal={() => {
              setLegalTab('ip_policy');
              setIsLegalOpen(true);
            }}
            onOpenSearch={() => setIsCommandSearchOpen(true)}
            onOpenSlideGenerator={() => setIsSlideGeneratorOpen(true)}
            onOpenCopilot={() => setIsCopilotOpen(true)}
            onRequireAuth={handleRequireAuth}
            currentUser={currentUser}
            designFilesCount={designFiles.length}
            promptsCount={aiPrompts.length}
            fontsCount={fontsList.length}
            articlesCount={articles.length}
          />

          {/* Dynamic News Ticker Component (Di chuyển tin tức & bài viết mới) */}
          <NewsTicker 
            articles={articles}
            onSelectArticle={(art) => setSelectedArticleForReading(art)}
            onNavigateArticlesTab={() => setActiveTab('articles')}
          />

          {/* Professional Workflow & Productivity Quick Action Bar */}
          <div className="max-w-6xl mx-auto">
            <WorkflowActionBar
              onOpenSlideGenerator={() => setIsSlideGeneratorOpen(true)}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onOpenPaletteModal={() => setIsPaletteOpen(true)}
              onOpenSearch={() => setIsCommandSearchOpen(true)}
              onOpenIdeaHub={() => setIsIdeaHubOpen(true)}
              onOpenUpload={() => {
                if (!currentUser) {
                  handleRequireAuth('Vui lòng đăng nhập để đóng góp tệp thiết kế hoặc prompt!');
                  return;
                }
                setIsDirectDesignEditorOpen(true);
              }}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                const elem = document.getElementById('primary-tab-switcher');
                if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              currentUser={currentUser}
              bookmarkedCount={bookmarkedCount}
            />
          </div>

          {/* Primary View Tab Switcher with MISA AMIS Segmented SaaS Tabs */}
          <div className="max-w-6xl mx-auto my-6 sm:my-8" id="primary-tab-switcher">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Tab Navigation Buttons with Framer Motion Icon Scaling and Smooth Sliding Pill */}
              <div className="flex-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-sm flex overflow-x-auto no-scrollbar gap-1 scroll-smooth relative">
                {[
                  { id: 'designs', label: 'Thư viện Thiết kế', icon: FolderOpen },
                  { id: 'prompts', label: 'Kho AI Prompts', icon: Sparkles },
                  { id: 'photo_prompts', label: 'Prompt Ảnh Cá Nhân', icon: Camera, iconColor: 'text-violet-600' },
                  { id: 'articles', label: 'Bài viết & Tin tức', icon: BookOpen },
                  { id: 'fonts', label: 'Font Việt hóa', icon: Type },
                  { id: 'contact', label: 'Liên hệ', icon: MessageCircle },
                  ...(currentUser ? [{ id: 'profile', label: 'Hồ sơ', icon: UserIcon }] : []),
                  ...(currentUser?.role === 'Admin' ? [{ id: 'admin', label: 'Quản trị', icon: Shield, isAdmin: true }] : []),
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  const IconComp = tab.icon;

                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className={`relative flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl text-[11px] sm:text-xs font-bold transition-colors duration-200 whitespace-nowrap shrink-0 sm:shrink cursor-pointer select-none ${
                        isActive
                          ? 'text-white'
                          : tab.isAdmin
                          ? 'text-purple-600 hover:text-purple-700 bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200/50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {/* Active Sliding Background Pill (Framer Motion layoutId) */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBackgroundMain"
                          className={`absolute inset-0 rounded-xl shadow-md ${
                            tab.isAdmin
                              ? 'bg-purple-600 shadow-purple-500/25'
                              : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 shadow-blue-500/25'
                          }`}
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}

                      {/* Icon with smooth Framer Motion scale-up effect */}
                      <motion.span
                        animate={{
                          scale: isActive ? 1.15 : 1,
                          y: isActive ? -1 : 0,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 25,
                        }}
                        className="relative z-10 inline-flex items-center justify-center shrink-0"
                      >
                        <IconComp className={`w-3.5 h-3.5 ${tab.iconColor && !isActive ? tab.iconColor : ''}`} />
                      </motion.span>

                      {/* Tab Title Label */}
                      <span className="relative z-10">{tab.label}</span>

                      {/* Pending count notification badge for Admin Tab */}
                      {tab.isAdmin && pendingCount > 0 && (
                        <span className="relative z-10 inline-flex items-center space-x-1 ml-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                          </span>

                          <span 
                            className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-tight ${
                              isActive
                                ? 'bg-rose-500 text-white ring-1 ring-white/30'
                                : 'bg-rose-600 text-white shadow-xs shadow-rose-600/30'
                            }`}
                            title={`Có ${pendingCount} bài đăng mới đang chờ duyệt`}
                          >
                            <Bell className="w-2.5 h-2.5 animate-bounce" />
                            <span>{pendingCount}</span>
                          </span>
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Specialty Filter Dropdown */}
              <div className="relative shrink-0" ref={specialtyDropdownRef} id="specialty-filter-container">
                <button
                  type="button"
                  onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                  className={`w-full sm:w-auto flex items-center justify-between sm:justify-center space-x-1.5 py-2.5 px-3.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer ${
                    selectedSpecialty !== 'all'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200/90'
                  }`}
                  id="specialty-dropdown-trigger"
                  aria-label="Lọc nhanh chuyên ngành"
                  title="Lọc nhanh nội dung hiển thị theo chuyên ngành"
                >
                  <div className="flex items-center space-x-1.5">
                    <Filter className={`w-3.5 h-3.5 ${selectedSpecialty !== 'all' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="truncate max-w-[100px] md:max-w-[140px]">
                      {SPECIALTY_OPTIONS.find(s => s.id === selectedSpecialty)?.label || 'Chuyên ngành'}
                    </span>
                    {selectedSpecialty !== 'all' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isSpecialtyDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {/* Dropdown Popover Menu */}
                {isSpecialtyDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in divide-y divide-slate-100"
                    id="specialty-dropdown-menu"
                  >
                    <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Filter className="w-3.5 h-3.5 text-blue-500" />
                        <span>Lọc theo chuyên ngành</span>
                      </span>
                      {selectedSpecialty !== 'all' && (
                        <button 
                          onClick={() => {
                            setSelectedSpecialty('all');
                            setIsSpecialtyDropdownOpen(false);
                            toastInfo('Đã chuyển về xem tất cả tài nguyên hệ thống.', 'Đặt lại bộ lọc');
                          }}
                          className="text-blue-600 hover:text-blue-700 text-xs font-bold hover:underline cursor-pointer"
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>
                    <div className="py-1.5 space-y-1 max-h-72 overflow-y-auto no-scrollbar">
                      {SPECIALTY_OPTIONS.map((option) => {
                        const IconComp = option.icon;
                        const isSelected = selectedSpecialty === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSelectedSpecialty(option.id);
                              setIsSpecialtyDropdownOpen(false);
                              if (option.id !== 'all') {
                                toastInfo(`Đã lọc nội dung theo: ${option.label}`, 'Bộ lọc chuyên ngành');
                              } else {
                                toastInfo('Hiển thị toàn bộ tài nguyên học thuật.', 'Tất cả chuyên ngành');
                              }
                            }}
                            className={`w-full flex items-start space-x-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-50/90 text-blue-900 font-bold border border-blue-200/60' 
                                : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'bg-slate-100 text-slate-600'}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs ${isSelected ? 'font-black text-blue-950' : 'font-bold text-slate-800'} truncate`}>
                                  {option.label}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{option.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Render Dynamic Layout Elements */}
          <div className="min-h-[450px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                {activeTab === 'designs' && (
                  <DesignHub 
                    currentUser={currentUser} 
                    files={designFiles}
                    onFilesUpdate={(updated) => {
                      setDesignFiles(updated);
                      localStorage.setItem('ictc_design_files', JSON.stringify(updated));
                    }}
                    selectedSpecialty={selectedSpecialty}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'prompts' && (
                  <PromptHub 
                    currentUser={currentUser} 
                    prompts={aiPrompts}
                    onPromptsUpdate={(updated) => {
                      setAiPrompts(updated);
                      localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
                    }}
                    selectedSpecialty={selectedSpecialty}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'photo_prompts' && (
                  <PersonalPhotoPromptHub 
                    currentUser={currentUser} 
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'articles' && (
                  <ArticleHub 
                    currentUser={currentUser} 
                    articles={articles}
                    designFiles={designFiles}
                    onArticlesUpdate={(updated) => {
                      setArticles(updated);
                      localStorage.setItem('ictc_articles', JSON.stringify(updated));
                    }}
                    selectedSpecialty={selectedSpecialty}
                    onNavigateDesignHub={() => setActiveTab('designs')} 
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'fonts' && (
                  <FontHub 
                    currentUser={currentUser}
                    systemConfig={systemConfig}
                    fontsList={fontsList}
                    onFontsUpdate={(updated) => {
                      setFontsList(updated);
                      localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(updated));
                    }}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'contact' && <ContactHub />}
                {activeTab === 'profile' && currentUser && (
                  <MemberProfile 
                    currentUser={currentUser} 
                    onUpdateUser={handleUpdateCurrentUser} 
                    designFiles={designFiles}
                    aiPrompts={aiPrompts}
                    articles={articles}
                    onDesignUpdate={(updated) => {
                      setDesignFiles(updated);
                      localStorage.setItem('ictc_design_files', JSON.stringify(updated));
                    }}
                    onPromptUpdate={(updated) => {
                      setAiPrompts(updated);
                      localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
                    }}
                    onArticleUpdate={(updated) => {
                      setArticles(updated);
                      localStorage.setItem('ictc_articles', JSON.stringify(updated));
                    }}
                  />
                )}
                {activeTab === 'admin' && currentUser?.role === 'Admin' && (
                  <AdminDashboard 
                    currentUser={currentUser} 
                    designFiles={designFiles}
                    promptFiles={aiPrompts}
                    articlesList={articles}
                    fontsList={fontsList}
                    userList={userList}
                    systemConfig={systemConfig}
                    onDesignUpdate={(updated) => {
                      setDesignFiles(updated);
                      localStorage.setItem('ictc_design_files', JSON.stringify(updated));
                    }}
                    onPromptUpdate={(updated) => {
                      setAiPrompts(updated);
                      localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
                    }}
                    onArticleUpdate={(updated) => {
                      setArticles(updated);
                      localStorage.setItem('ictc_articles', JSON.stringify(updated));
                    }}
                    onFontUpdate={(updated) => {
                      setFontsList(updated);
                      localStorage.setItem('ictc_vietnamese_fonts', JSON.stringify(updated));
                    }}
                    onUserUpdate={(updated) => {
                      setUserList(updated);
                      localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
                    }}
                    onConfigUpdate={(updated) => {
                      setSystemConfig(updated);
                      localStorage.setItem('ictc_system_config', JSON.stringify(updated));
                      updateSystemConfigInDb(updated).catch(console.warn);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Site Footer - MISA AMIS Enterprise SaaS Architecture */}
          <footer className="mt-16 md:mt-24 pb-12 border-t border-slate-200/90 pt-12 space-y-10">
            {/* Top Multi-column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 text-slate-600">
              {/* Col 1: Brand & Identity */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
                    IC
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-base tracking-tight block">
                      {systemConfig.siteName}
                    </span>
                    <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest block -mt-0.5">
                      Enterprise Knowledge
                    </span>
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Hệ thống chia sẻ tri thức số, mẫu Slide PowerPoint, AI Prompts & Font chữ Việt hóa đạt chuẩn dành cho sinh viên và cán bộ Đoàn - Hội Việt Nam.
                </p>
                <div className="pt-2 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                    Bảo mật chuẩn ISO
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    CC BY-NC-SA 4.0
                  </span>
                </div>
              </div>

              {/* Col 2: Hệ sinh thái tài nguyên */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Hệ sinh thái Tri thức</h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-600">
                  <li>
                    <button 
                      onClick={() => setActiveTab('designs')}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>Kho Slide & Vector ({designFiles.length})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('prompts')}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>AI Prompts chuẩn hóa ({aiPrompts.length})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('fonts')}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <Type className="w-3.5 h-3.5 text-teal-500" />
                      <span>Font chữ Việt hóa ({fontsList.length})</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('articles')}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>Bài viết & Nghiên cứu ({articles.length})</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 3: Quy chuẩn & Pháp lý */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Quy chuẩn & Pháp lý</h4>
                <ul className="space-y-2 text-xs font-semibold text-slate-600">
                  <li>
                    <button
                      onClick={() => setIsPaletteOpen(true)}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <Palette className="w-3.5 h-3.5 text-rose-500" />
                      <span>Bảng màu & Tỷ lệ chuẩn VN</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <Scale className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bản quyền & Sở hữu trí tuệ</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chuẩn mực đóng góp</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setLegalTab('ai_ethics'); setIsLegalOpen(true); }}
                      className="hover:text-blue-600 transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>Đạo đức AI & Trích nguồn</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Col 4: Cộng đồng & Đóng góp */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Kênh kết nối & Đóng góp</h4>
                <div className="space-y-2 text-xs font-semibold">
                  <a
                    href="https://zalo.me/g/kovwak924"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50/80 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    <span>Zalo ICTC Community</span>
                  </a>
                  <button
                    onClick={() => setIsIdeaHubOpen(true)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-amber-50/80 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Gửi đề xuất ý tưởng</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200/80 pt-6 text-xs text-slate-400 gap-4">
              <p className="font-semibold text-center sm:text-left">
                &copy; {new Date().getFullYear()} {systemConfig.siteName}. Phát triển theo phong cách Enterprise SaaS hiện đại.
              </p>
              <div className="flex items-center space-x-4 font-bold">
                <a href="https://www.facebook.com/groups/313739042955897" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Group Facebook</a>
                <span>•</span>
                <a href="https://www.tiktok.com/@huy.ng.m" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">TikTok Creator</a>
                <span>•</span>
                <button 
                  onClick={() => { setLegalTab('dmca_takedown'); setIsLegalOpen(true); }}
                  className="hover:text-rose-600 underline transition-colors"
                >
                  Báo cáo vi phạm (DMCA)
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* MISA AMIS Floating Assistant & Fast Action Widget */}
      <MisaAmisFloatingWidget
        onOpenSearch={() => setIsCommandSearchOpen(true)}
        onOpenIdeaHub={() => setIsIdeaHubOpen(true)}
        onOpenPaletteModal={() => setIsPaletteOpen(true)}
        onOpenLegalModal={() => {
          setLegalTab('ip_policy');
          setIsLegalOpen(true);
        }}
        onOpenSlideGenerator={() => setIsSlideGeneratorOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* AI Slide Generator Modal Studio */}
      <AISlideGeneratorModal
        isOpen={isSlideGeneratorOpen}
        onClose={() => setIsSlideGeneratorOpen(false)}
        onNavigateToDesign={() => setActiveTab('designs')}
        onNavigateToPrompt={() => setActiveTab('prompts')}
        onShowToast={(msg) => toastSuccess(msg)}
      />

      {/* ICTC Academic Copilot Modal */}
      <AcademicCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenSlideGenerator={() => setIsSlideGeneratorOpen(true)}
        onOpenPaletteModal={() => setIsPaletteOpen(true)}
        onOpenLegalModal={() => {
          setLegalTab('ip_policy');
          setIsLegalOpen(true);
        }}
        onShowToast={(msg) => toastSuccess(msg)}
      />

      {/* Article Reader Modal */}
      {selectedArticleForReading && (
        <ArticleReaderModal
          article={selectedArticleForReading}
          currentUser={currentUser}
          onClose={() => setSelectedArticleForReading(null)}
          onSelectArticle={(art) => setSelectedArticleForReading(art)}
          onRequireAuth={handleRequireAuth}
          relatedArticles={articles.filter(a => a.id !== selectedArticleForReading.id)}
        />
      )}

      {/* Global Command Search Dialog (Ctrl + K) */}
      <CommandSearchModal
        isOpen={isCommandSearchOpen}
        onClose={() => setIsCommandSearchOpen(false)}
        designFiles={designFiles}
        aiPrompts={aiPrompts}
        articles={articles}
        onSelectDesign={(file) => {
          setActiveTab('designs');
        }}
        onSelectPrompt={(prm) => {
          setActiveTab('prompts');
        }}
        onSelectArticle={(art) => {
          setSelectedArticleForReading(art);
        }}
      />

      {/* Login / Signup Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthReason(undefined);
        }}
        onLoginSuccess={handleLoginSuccess}
        authReason={authReason}
      />

      {/* Vietnam Design Standards & Color Palette Modal */}
      <VietnamDesignPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Intellectual Property & Legal Compliance Modal */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Idea Hub & Innovations Modal */}
      {isIdeaHubOpen && (
        <IdeaHubModal
          currentUser={currentUser}
          onClose={() => setIsIdeaHubOpen(false)}
          onRequireAuth={handleRequireAuth}
          onOpenCreateDesign={(title) => {
            setDirectDesignInitialTitle(title);
            setIsDirectDesignEditorOpen(true);
          }}
        />
      )}

      {/* Quick Direct Design Editor Modal */}
      {isDirectDesignEditorOpen && (
        <DesignEditorModal
          isOpen={isDirectDesignEditorOpen}
          designFile={directDesignInitialTitle ? {
            id: `des-${Date.now()}`,
            title: directDesignInitialTitle,
            description: '',
            category: 'PowerPoint Templates',
            fileType: 'PPTX',
            fileSize: '10.0 MB',
            driveUrl: systemConfig.driveDesignFolder || '',
            previewUrl: '',
            tags: ['Mới', 'Slide'],
            downloadsCount: 0,
            rating: 5.0,
            createdAt: new Date().toISOString().split('T')[0],
            author: currentUser ? `${currentUser.displayName} (${currentUser.role})` : 'Thành viên ICTC',
            status: currentUser?.role === 'Admin' || currentUser?.role === 'Creator' ? 'Approved' : 'Pending'
          } : null}
          systemConfig={systemConfig}
          onClose={() => {
            setIsDirectDesignEditorOpen(false);
            setDirectDesignInitialTitle(undefined);
          }}
          onSaveSuccess={handleSaveDirectDesignSuccess}
        />
      )}

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

export default App;
