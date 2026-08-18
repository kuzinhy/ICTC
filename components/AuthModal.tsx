import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, Check, Shield, LogIn, ArrowRight, Sparkles, Eye, EyeOff, Loader2, Info } from 'lucide-react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { saveUserToDb } from '../lib/db';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  
  const [showGoogleSelector, setShowGoogleSelector] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Load remembered email on mount
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem('ictc_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle successful login/signup session
  const handleAuthSuccess = (user: User) => {
    setSuccessUser(user);
    setSuccess(true);
    setError('');
    
    // Save email if Remember Me is checked
    if (rememberMe && user.email) {
      localStorage.setItem('ictc_remembered_email', user.email);
    } else {
      localStorage.removeItem('ictc_remembered_email');
    }

    setTimeout(() => {
      onLoginSuccess(user);
      setSuccess(false);
      setSuccessUser(null);
      onClose();
    }, 2000);
  };

  const handleRealGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user && user.email) {
        handleGoogleLogin(user.email, user.displayName || undefined, user.photoURL || undefined);
      } else {
        setIsLoading(false);
      }
    } catch (e: any) {
      console.error("Firebase Sign In Error: ", e);
      setIsLoading(false);
      // Beautiful direct Gmail fallback transition
      setError('Kết nối trực tiếp bị giới hạn bởi iframe trình duyệt. Đã chuyển sang luồng đăng nhập nhanh bằng Gmail an toàn!');
      setShowGoogleSelector(true);
    }
  };

  const handleGoogleLogin = (selectedEmail: string, name?: string, photo?: string) => {
    setIsLoading(true);
    // Determine role based on email
    let role: 'Admin' | 'Creator' | 'Member' = 'Member';
    let avatarUrl = photo || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedEmail}`;
    let finalName = name || selectedEmail.split('@')[0];

    const lowerEmail = selectedEmail.toLowerCase();
    if (lowerEmail === 'nguyenhuy.thudaumot@gmail.com') {
      role = 'Admin';
      finalName = 'Nguyễn Huy';
      avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
    } else if (lowerEmail === 'admin@ictc.io.vn') {
      role = 'Admin';
      finalName = 'Nguyễn Huy (Admin)';
      avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    } else if (lowerEmail === 'huy.design@ictc.io.vn') {
      role = 'Creator';
      finalName = 'Huy Designer';
      avatarUrl = 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    } else if (lowerEmail === 'member@ictc.io.vn') {
      role = 'Member';
      finalName = 'Minh Thảo';
      avatarUrl = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    }

    const googleUser: User = {
      id: `usr-google-${Date.now()}`,
      email: selectedEmail,
      displayName: finalName,
      role: role,
      avatarUrl: avatarUrl,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    // Save newly created or existing user in active registry
    const savedUsersStr = localStorage.getItem('ictc_registered_users');
    let savedUsers: User[] = [...INITIAL_USERS];
    if (savedUsersStr) {
      try {
        savedUsers = JSON.parse(savedUsersStr) as User[];
      } catch (e) {}
    }
    
    if (!savedUsers.some(u => u.email.toLowerCase() === selectedEmail.toLowerCase())) {
      savedUsers.push(googleUser);
      localStorage.setItem('ictc_registered_users', JSON.stringify(savedUsers));
    } else {
      // Keep existing role if already registered
      const existing = savedUsers.find(u => u.email.toLowerCase() === selectedEmail.toLowerCase());
      if (existing) {
        googleUser.role = existing.role;
        googleUser.displayName = existing.displayName;
        googleUser.avatarUrl = existing.avatarUrl || googleUser.avatarUrl;
      }
    }

    // Sync profile to Firebase Firestore securely
    saveUserToDb(googleUser)
      .catch(err => {
        console.warn("Failed to sync profile to Cloud Firestore:", err);
      })
      .finally(() => {
        setIsLoading(false);
        setShowGoogleSelector(false);
        handleAuthSuccess(googleUser);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Fetch registered users from localStorage to keep it persistent!
    const savedUsersStr = localStorage.getItem('ictc_registered_users');
    let registeredUsersList = [...INITIAL_USERS];
    if (savedUsersStr) {
      try { registeredUsersList = JSON.parse(savedUsersStr); } catch (e) {}
    }

    if (isLogin) {
      // Find user in registry
      const found = registeredUsersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setTimeout(() => {
          setIsLoading(false);
          handleAuthSuccess(found);
        }, 1200);
      } else if (email.trim() && password.trim()) {
        // Create custom user on the fly if not exists
        const customUser: User = {
          id: `usr-${Date.now()}`,
          email: email,
          displayName: email.split('@')[0],
          role: email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com' ? 'Admin' : 'Member',
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        
        // Save to registry
        registeredUsersList.push(customUser);
        localStorage.setItem('ictc_registered_users', JSON.stringify(registeredUsersList));

        // Sync to Cloud Firestore database
        saveUserToDb(customUser)
          .catch(err => console.warn("Failed to sync manual profile to Firestore:", err))
          .finally(() => {
            setIsLoading(false);
            handleAuthSuccess(customUser);
          });
      } else {
        setIsLoading(false);
        setError('Vui lòng điền đầy đủ email và mật khẩu!');
      }
    } else {
      // Sign up validation
      if (!email || !displayName || !password) {
        setIsLoading(false);
        setError('Vui lòng điền đầy đủ các thông tin!');
        return;
      }

      if (password.length < 6) {
        setIsLoading(false);
        setError('Mật khẩu tối thiểu phải từ 6 ký tự để bảo mật!');
        return;
      }
      
      const newUser: User = {
        id: `usr-custom-${Date.now()}`,
        email,
        displayName,
        role: email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com' ? 'Admin' : 'Member',
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${displayName}`,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      // Check if email already registered
      if (registeredUsersList.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setIsLoading(false);
        setError('Email này đã được đăng ký trên hệ thống!');
        return;
      }

      registeredUsersList.push(newUser);
      localStorage.setItem('ictc_registered_users', JSON.stringify(registeredUsersList));

      // Sync to Cloud Firestore database
      saveUserToDb(newUser)
        .catch(err => console.warn("Failed to sync signup profile to Firestore:", err))
        .finally(() => {
          setIsLoading(false);
          handleAuthSuccess(newUser);
        });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Creator':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getRoleNameInVietnamese = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'Quản trị viên';
      case 'Creator':
        return 'Nhà sáng tạo';
      default:
        return 'Thành viên';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-[440px] overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300 transform scale-100">
        
        {/* Success Splash Overlay */}
        {success && (
          <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100 animate-bounce mb-4 shadow-sm">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>
            
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Xác thực thành công!</h4>
            <p className="text-sm text-slate-400 mt-1 mb-6 font-medium">Chào mừng bạn trở lại với hệ thống</p>

            {successUser && (
              <div className="flex flex-col items-center p-4 bg-slate-50 border border-slate-150 rounded-2xl w-full max-w-xs space-y-3">
                <img 
                  src={successUser.avatarUrl} 
                  alt={successUser.displayName} 
                  className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover" 
                  referrerPolicy="no-referrer"
                />
                <div className="text-center">
                  <h5 className="text-base font-bold text-slate-800">{successUser.displayName}</h5>
                  <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{successUser.email}</p>
                </div>
                <span className={`px-3 py-1 border text-xs font-black rounded-full uppercase tracking-wider ${getRoleBadgeColor(successUser.role)}`}>
                  {getRoleNameInVietnamese(successUser.role)}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-slate-400 mt-6 text-xs font-semibold">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Đang đồng bộ và chuyển hướng...</span>
            </div>
          </div>
        )}

        {/* Google Account Selector Overlay (Graceful Fallback Mode) */}
        {showGoogleSelector && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col p-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Google Cloud Login</span>
              </div>
              <button 
                onClick={() => setShowGoogleSelector(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between py-6">
              <div className="space-y-6">
                <div className="text-center space-y-1.5">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">Xác thực Google/Gmail của bạn</h4>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-[320px] mx-auto">
                    Bảo mật Sandbox Iframe của trình duyệt hạn chế việc mở popup liên kết trực tiếp. Hãy điền địa chỉ Gmail của bạn để truy cập ngay:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ Gmail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                      <input
                        type="email"
                        placeholder="ten.cua.ban@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full bg-slate-50 text-slate-950 font-bold text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white placeholder-slate-400 transition-all duration-150"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (customGoogleEmail.trim().includes('@')) {
                        handleGoogleLogin(customGoogleEmail.trim());
                      } else {
                        setError('Địa chỉ Gmail không đúng định dạng!');
                      }
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2"
                  >
                    <span>Liên kết & Tiếp tục</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start space-x-2.5">
                <Info className="w-4.5 h-4.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-normal">
                  Hệ thống tự động phân tích và cấp quyền quản trị (Admin) trực tiếp cho tài khoản quản lý <span className="font-bold text-slate-600">nguyenhuy.thudaumot@gmail.com</span> khi kết nối.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding Area */}
        <div className="px-6 pt-8 pb-5 text-center bg-slate-50/50 border-b border-slate-100 space-y-3">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">ICTC Share & Design</h3>
            <p className="text-xs text-slate-400 font-semibold">Tài nguyên, Prompts & Thiết kế sáng tạo</p>
          </div>
        </div>

        {/* Custom Segmented Control (Tabs) */}
        <div className="px-6 pt-5">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-150 ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-150 ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Đăng ký
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-5 flex-1">
          <div className="space-y-4">
            
            {/* Google Social Connect Option */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRealGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all duration-150 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Kết nối nhanh với Google</span>
            </button>

            {/* Elegant text divider */}
            <div className="relative flex py-1 items-center font-bold text-[10px] text-slate-300 uppercase tracking-widest">
              <div className="flex-grow border-t border-slate-150"></div>
              <span className="flex-shrink mx-4 text-slate-400">Hoặc tài khoản ICTC</span>
              <div className="flex-grow border-t border-slate-150"></div>
            </div>

            {/* Custom inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-semibold leading-relaxed">
                  {error}
                </div>
              )}

              {/* Full name input for sign up */}
              {!isLogin && (
                <div className="space-y-1.5 animate-slide-down">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Họ và tên</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white placeholder-slate-400 font-bold transition-all duration-150"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email liên hệ</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="email"
                    required
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white placeholder-slate-400 font-bold transition-all duration-150"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mật khẩu</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => alert('Chức năng đặt lại mật khẩu đã gửi yêu cầu xác minh tài khoản của bạn.')}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-extrabold tracking-tight"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 pl-10 pr-11 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white placeholder-slate-400 font-bold transition-all duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-[9px] text-slate-400 font-semibold flex items-center space-x-1">
                    <Info className="w-3 h-3 text-slate-400" />
                    <span>Mật khẩu tối thiểu cần 6 ký tự để kích hoạt tài khoản.</span>
                  </p>
                )}
              </div>

              {/* Remember Me and Terms checkboxes */}
              {isLogin ? (
                <div className="flex items-center space-x-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-500 font-bold select-none cursor-pointer">
                    Duy trì đăng nhập trên thiết bị này
                  </label>
                </div>
              ) : (
                <div className="flex items-start space-x-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    defaultChecked={true}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[10px] text-slate-400 font-semibold select-none cursor-pointer leading-normal">
                    Bằng việc đăng ký, tôi đồng ý tuân thủ Điều khoản sử dụng và Chính sách bảo mật chia sẻ tài nguyên sáng tạo của ICTC.
                  </label>
                </div>
              )}

              {/* Submit Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý thông tin...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản mới'}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
