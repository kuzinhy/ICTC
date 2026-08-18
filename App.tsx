import React, { useState, useEffect } from 'react';
import { DesignHub } from './components/DesignHub';
import { PromptHub } from './components/PromptHub';
import { ContactHub } from './components/ContactHub';
import { AdminDashboard } from './components/AdminDashboard';
import { MemberProfile } from './components/MemberProfile';
import { AuthModal } from './components/AuthModal';
import { User, SystemConfig } from './types';
import { INITIAL_USERS, DEFAULT_SYSTEM_CONFIG, INITIAL_DESIGN_FILES, INITIAL_AI_PROMPTS } from './data/mockData';
import { 
  FolderOpen, Sparkles, MessageCircle, LogIn, LogOut, 
  Shield, User as UserIcon, Settings, HelpCircle, Activity 
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  testFirestoreConnection, fetchSystemConfig, fetchDesignsFromDb, 
  fetchPromptsFromDb, fetchUsersFromDb, saveUserToDb 
} from './lib/db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'designs' | 'prompts' | 'contact' | 'admin' | 'profile'>('designs');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);

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
        // Purge legacy auto-added mock accounts
        parsed = parsed.filter(u => !['admin@ictc.io.vn', 'huy.design@ictc.io.vn', 'member@ictc.io.vn'].includes(u.email.toLowerCase()));
        if (parsed.length === 0) {
          parsed = INITIAL_USERS;
        }
        localStorage.setItem('ictc_registered_users', JSON.stringify(parsed));
      } catch (e) {}
    }

    const savedDesigns = localStorage.getItem('ictc_design_files');
    if (!savedDesigns) {
      localStorage.setItem('ictc_design_files', JSON.stringify(INITIAL_DESIGN_FILES));
    }

    const savedPrompts = localStorage.getItem('ictc_ai_prompts');
    if (!savedPrompts) {
      localStorage.setItem('ictc_ai_prompts', JSON.stringify(INITIAL_AI_PROMPTS));
    }

    // 2. Test connection & load real-time Firestore configs
    testFirestoreConnection();

    const syncCloudData = async () => {
      try {
        const config = await fetchSystemConfig();
        setSystemConfig(config);
        localStorage.setItem('ictc_system_config', JSON.stringify(config));

        const users = await fetchUsersFromDb();
        localStorage.setItem('ictc_registered_users', JSON.stringify(users));

        const designs = await fetchDesignsFromDb();
        localStorage.setItem('ictc_design_files', JSON.stringify(designs));

        const prompts = await fetchPromptsFromDb();
        localStorage.setItem('ictc_ai_prompts', JSON.stringify(prompts));
      } catch (e) {
        console.warn("Could not sync Firestore data, offline mode remains active:", e);
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
          // Auto create user object with fallback credentials
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
        // Fallback session state
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

          {/* User Session status or Login CTA */}
          <div className="flex items-center space-x-3.5">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-100 p-1.5 pr-3.5 rounded-full border border-slate-200/80">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center space-x-2 text-left hover:opacity-90 group transition-all"
                  title="Xem hồ sơ thành viên"
                >
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.displayName} 
                    className="w-8 h-8 rounded-full border border-white shadow-sm group-hover:ring-2 group-hover:ring-blue-500 transition-all"
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
        <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
          
          {/* Header Description */}
          <header className="text-center mb-10 space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 drop-shadow-xs leading-tight">
              {systemConfig.siteName}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              {systemConfig.siteDescription}. Khám phá hàng ngàn mẫu slide PowerPoint, tài liệu chuyên ngành, và bộ câu lệnh thiết kế hình ảnh AI cao cấp hoàn toàn miễn phí.
            </p>
          </header>

          {/* Primary View Tab Switcher */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-md flex flex-wrap sm:flex-nowrap gap-1">
              <button
                onClick={() => setActiveTab('designs')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
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
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === 'prompts'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Kho AI Prompts</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === 'contact'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Liên hệ Cộng đồng</span>
              </button>

              {/* Dynamic Profile tab is visible when currentUser is logged in */}
              {currentUser && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Hồ sơ của tôi</span>
                </button>
              )}

              {/* Dynamic Admin tab is ONLY visible when currentUser.role === 'Admin' */}
              {currentUser && currentUser.role === 'Admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    activeTab === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/10'
                      : 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100/70 border border-purple-200/50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Cấu hình Quản trị</span>
                </button>
              )}
            </div>
          </div>

          {/* Render Dynamic Layout Elements */}
          <div className="min-h-[450px]">
            {activeTab === 'designs' && <DesignHub currentUser={currentUser} />}
            {activeTab === 'prompts' && <PromptHub currentUser={currentUser} />}
            {activeTab === 'contact' && <ContactHub />}
            {activeTab === 'profile' && currentUser && <MemberProfile currentUser={currentUser} />}
            {activeTab === 'admin' && currentUser?.role === 'Admin' && (
              <AdminDashboard currentUser={currentUser} />
            )}
          </div>

          {/* Site Footer */}
          <footer className="text-center mt-20 md:mt-24 pb-8 border-t border-slate-200 pt-10 space-y-4">
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              &copy; {new Date().getFullYear()} {systemConfig.siteName}. Đồng hành cùng sinh viên Việt Nam.
            </p>
            <div className="flex justify-center space-x-6 text-xs text-slate-400 font-bold">
              <a href="https://zalo.me/g/kovwak924" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Zalo Cộng đồng</a>
              <span>•</span>
              <a href="https://www.facebook.com/groups/313739042955897" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Group Facebook</a>
              <span>•</span>
              <a href="https://www.tiktok.com/@huy.ng.m" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">TikTok Creator</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Login / Signup Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;
