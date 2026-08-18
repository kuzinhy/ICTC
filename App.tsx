import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignHub } from './components/DesignHub';
import { PromptHub } from './components/PromptHub';
import { ArticleHub } from './components/ArticleHub';
import { FontHub } from './components/FontHub';
import { ContactHub } from './components/ContactHub';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberProfile } from './components/MemberProfile';
import { AuthModal } from './components/AuthModal';
import { NewsTicker } from './components/NewsTicker';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { CommandSearchModal } from './components/CommandSearchModal';
import { VietnamDesignPaletteModal } from './components/VietnamDesignPaletteModal';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { User, SystemConfig, Article, DesignFile, AIPrompt } from './types';
import { 
  INITIAL_USERS, DEFAULT_SYSTEM_CONFIG, INITIAL_DESIGN_FILES, 
  INITIAL_AI_PROMPTS, INITIAL_ARTICLES 
} from './data/mockData';
import { UserAvatar } from './components/UserAvatar';
import { 
  FolderOpen, Sparkles, MessageCircle, LogIn, LogOut, 
  Shield, User as UserIcon, Settings, HelpCircle, Activity,
  BookOpen, Search, Command, Palette, Scale, ShieldCheck, Type,
  Filter, ChevronDown, Check, Code, GraduationCap, TrendingUp, Award, Layers
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  testFirestoreConnection, fetchSystemConfig, fetchDesignsFromDb, 
  fetchPromptsFromDb, fetchUsersFromDb, fetchArticlesFromDb, saveUserToDb 
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
  const [activeTab, setActiveTab] = useState<'designs' | 'prompts' | 'articles' | 'fonts' | 'contact' | 'admin' | 'profile'>('designs');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [isSpecialtyDropdownOpen, setIsSpecialtyDropdownOpen] = useState(false);
  const specialtyDropdownRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>();
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

  // Global data caches for Search and NewsTicker
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [designFiles, setDesignFiles] = useState<DesignFile[]>(INITIAL_DESIGN_FILES);
  const [aiPrompts, setAiPrompts] = useState<AIPrompt[]>(INITIAL_AI_PROMPTS);

  // Global modals
  const [selectedArticleForReading, setSelectedArticleForReading] = useState<Article | null>(null);
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ip_policy');

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen(prev => !prev);
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

  // Initialize and seed local storage with default database schemas
  useEffect(() => {
    // 1. Check offline fallback setup first
    const savedConfig = localStorage.getItem('ictc_system_config');
    if (!savedConfig) {
      localStorage.setItem('ictc_system_config', JSON.stringify(DEFAULT_SYSTEM_CONFIG));
      setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    } else {
      try { setSystemConfig(JSON.parse(savedConfig)); } catch (e) {}
    }

    const savedUsers = localStorage.getItem('ictc_registered_users');
    if (!savedUsers) {
      localStorage.setItem('ictc_registered_users', JSON.stringify(INITIAL_USERS));
    } else {
      try {
        let parsed: User[] = JSON.parse(savedUsers);
        parsed = parsed.filter(u => !['admin@ictc.io.vn', 'huy.design@ictc.io.vn', 'member@ictc.io.vn'].includes(u.email.toLowerCase()));
        parsed = parsed.map(u => {
          if (u.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com' && u.avatarUrl?.includes('unsplash.com')) {
            return { ...u, avatarUrl: '' };
          }
          return u;
        });
        if (parsed.length === 0) {
          parsed = INITIAL_USERS;
        }
        localStorage.setItem('ictc_registered_users', JSON.stringify(parsed));
      } catch (e) {}
    }

    const savedDesigns = localStorage.getItem('ictc_design_files');
    if (savedDesigns) {
      try { setDesignFiles(JSON.parse(savedDesigns)); } catch (e) {}
    } else {
      localStorage.setItem('ictc_design_files', JSON.stringify(INITIAL_DESIGN_FILES));
      setDesignFiles(INITIAL_DESIGN_FILES);
    }

    const savedPrompts = localStorage.getItem('ictc_ai_prompts');
    if (savedPrompts) {
      try { setAiPrompts(JSON.parse(savedPrompts)); } catch (e) {}
    } else {
      localStorage.setItem('ictc_ai_prompts', JSON.stringify(INITIAL_AI_PROMPTS));
      setAiPrompts(INITIAL_AI_PROMPTS);
    }

    const savedArticles = localStorage.getItem('ictc_articles');
    if (savedArticles) {
      try { setArticles(JSON.parse(savedArticles)); } catch (e) {}
    } else {
      localStorage.setItem('ictc_articles', JSON.stringify(INITIAL_ARTICLES));
      setArticles(INITIAL_ARTICLES);
    }

    // 2. Test connection & load real-time Firestore configs
    testFirestoreConnection();

    const syncCloudData = async () => {
      try {
        const config = await fetchSystemConfig();
        setSystemConfig(config);
        localStorage.setItem('ictc_system_config', JSON.stringify(config));

        const designs = await fetchDesignsFromDb();
        setDesignFiles(designs);
        localStorage.setItem('ictc_design_files', JSON.stringify(designs));

        const prompts = await fetchPromptsFromDb();
        setAiPrompts(prompts);
        localStorage.setItem('ictc_ai_prompts', JSON.stringify(prompts));

        const arts = await fetchArticlesFromDb();
        setArticles(arts);
        localStorage.setItem('ictc_articles', JSON.stringify(arts));

        if (auth.currentUser) {
          const users = await fetchUsersFromDb();
          localStorage.setItem('ictc_registered_users', JSON.stringify(users));
        }
      } catch (e) {
        console.warn("Cloud sync fallback to local storage:", e);
      }
    };

    syncCloudData();

    // 3. Listen to real Firebase Authentication status
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const localUsers = localStorage.getItem('ictc_registered_users');
        let registeredUsers = INITIAL_USERS;
        if (localUsers) {
          try { registeredUsers = JSON.parse(localUsers); } catch (err) {}
        }

        let foundUser = registeredUsers.find(u => u.email.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (!foundUser) {
          let role: 'Admin' | 'Creator' | 'Member' = 'Member';
          if (firebaseUser.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com') {
            role = 'Admin';
          }
          foundUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: role,
            avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.email}`,
            joinedDate: new Date().toISOString().split('T')[0]
          };

          registeredUsers.push(foundUser);
          localStorage.setItem('ictc_registered_users', JSON.stringify(registeredUsers));
          
          saveUserToDb(foundUser).catch(err => {
            console.warn("Could not write profile to Firebase Firestore:", err);
          });
        }

        setCurrentUser(foundUser);
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(foundUser));
      } else {
        const savedSession = localStorage.getItem('ictc_logged_in_user');
        if (savedSession) {
          try { setCurrentUser(JSON.parse(savedSession)); } catch (err) {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ictc_logged_in_user', JSON.stringify(user));
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

  const handleRequireAuth = (reason?: string) => {
    setAuthReason(reason || 'Vui lòng đăng nhập hoặc tạo tài khoản thành viên để tiếp tục!');
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500/10 selection:text-blue-700">
      
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
        <main className="container mx-auto px-4 py-6 sm:py-10 max-w-7xl space-y-6">
          
          {/* Header Description */}
          <header className="text-center mb-6 space-y-2.5 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 drop-shadow-xs leading-tight">
              {systemConfig.siteName}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              {systemConfig.siteDescription}. Khám phá hàng ngàn mẫu slide PowerPoint, tài liệu chuyên ngành, bài viết kinh nghiệm và bộ câu lệnh AI cao cấp.
            </p>
          </header>

          {/* Dynamic News Ticker Component (Di chuyển tin tức & bài viết mới) */}
          <NewsTicker 
            articles={articles}
            onSelectArticle={(art) => setSelectedArticleForReading(art)}
            onNavigateArticlesTab={() => setActiveTab('articles')}
          />

          {/* Primary View Tab Switcher */}
          <div className="max-w-6xl mx-auto my-6" id="primary-tab-switcher">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* Tab Navigation Buttons */}
              <div className="flex-1 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-md flex overflow-x-auto no-scrollbar gap-1 scroll-smooth">
                <button
                  onClick={() => setActiveTab('designs')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                    activeTab === 'designs'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Thư viện Thiết kế</span>
                </button>

                <button
                  onClick={() => setActiveTab('prompts')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                    activeTab === 'prompts'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kho AI Prompts</span>
                </button>

                {/* Bài viết mới tab */}
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                    activeTab === 'articles'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Bài viết & Tin tức</span>
                </button>

                {/* Font Việt hóa tab */}
                <button
                  onClick={() => setActiveTab('fonts')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                    activeTab === 'fonts'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Font Việt hóa</span>
                </button>

                <button
                  onClick={() => setActiveTab('contact')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                    activeTab === 'contact'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Liên hệ</span>
                </button>

                {/* Dynamic Profile tab is visible when currentUser is logged in */}
                {currentUser && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                      activeTab === 'profile'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </button>
                )}

                {/* Dynamic Admin tab is ONLY visible when currentUser.role === 'Admin' */}
                {currentUser && currentUser.role === 'Admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0 sm:shrink ${
                      activeTab === 'admin'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                        : 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/70 border border-purple-200/50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Quản trị</span>
                  </button>
                )}
              </div>

              {/* Specialty Filter Dropdown */}
              <div className="relative shrink-0" ref={specialtyDropdownRef} id="specialty-filter-container">
                <button
                  type="button"
                  onClick={() => setIsSpecialtyDropdownOpen(!isSpecialtyDropdownOpen)}
                  className={`w-full sm:w-auto flex items-center justify-between sm:justify-center space-x-2 py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
                    selectedSpecialty !== 'all'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border-slate-200/80'
                  }`}
                  id="specialty-dropdown-trigger"
                  aria-label="Lọc nhanh chuyên ngành"
                  title="Lọc nhanh nội dung hiển thị theo chuyên ngành"
                >
                  <div className="flex items-center space-x-2">
                    <Filter className={`w-4 h-4 ${selectedSpecialty !== 'all' ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="truncate max-w-[130px] md:max-w-[160px]">
                      {SPECIALTY_OPTIONS.find(s => s.id === selectedSpecialty)?.label || 'Chuyên ngành'}
                    </span>
                    {selectedSpecialty !== 'all' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isSpecialtyDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
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
                    selectedSpecialty={selectedSpecialty}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'prompts' && (
                  <PromptHub 
                    currentUser={currentUser} 
                    selectedSpecialty={selectedSpecialty}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'articles' && (
                  <ArticleHub 
                    currentUser={currentUser} 
                    selectedSpecialty={selectedSpecialty}
                    onNavigateDesignHub={() => setActiveTab('designs')} 
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'fonts' && (
                  <FontHub 
                    currentUser={currentUser}
                    systemConfig={systemConfig}
                    onRequireAuth={handleRequireAuth}
                  />
                )}
                {activeTab === 'contact' && <ContactHub />}
                {activeTab === 'profile' && currentUser && (
                  <MemberProfile 
                    currentUser={currentUser} 
                    onUpdateUser={handleUpdateCurrentUser} 
                  />
                )}
                {activeTab === 'admin' && currentUser?.role === 'Admin' && (
                  <AdminDashboard currentUser={currentUser} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Site Footer */}
          <footer className="mt-20 md:mt-24 pb-12 border-t border-slate-200 pt-10 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                    IC
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight">{systemConfig.siteName}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium max-w-md">
                  Nền tảng chia sẻ tài nguyên thiết kế, AI prompts và nghiên cứu học tập phi lợi nhuận cho sinh viên và cán bộ Đoàn - Hội Việt Nam.
                </p>
              </div>

              {/* Compliance & Standards Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setIsPaletteOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bảng màu & Tỷ lệ chuẩn VN</span>
                </button>
                <button
                  onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bản quyền SHTT</span>
                </button>
                <button
                  onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chuẩn mực cộng đồng</span>
                </button>
                <button
                  onClick={() => { setLegalTab('ai_ethics'); setIsLegalOpen(true); }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Đạo đức AI</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-400 gap-4">
              <p className="font-semibold text-center sm:text-left">
                &copy; {new Date().getFullYear()} {systemConfig.siteName}. Giấy phép nội dung CC BY-NC-SA 4.0.
              </p>
              <div className="flex items-center space-x-5 font-bold">
                <a href="https://zalo.me/g/kovwak924" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Zalo Cộng đồng</a>
                <span>•</span>
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

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

export default App;
