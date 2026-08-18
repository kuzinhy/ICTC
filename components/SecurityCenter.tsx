import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, Key, Lock, Smartphone, Laptop, 
  AlertTriangle, Check, RefreshCw, UserX, Eye, Bell, Activity, Globe,
  LogOut, CheckCircle2, XCircle, Info, Sliders, Zap, Save, Copy
} from 'lucide-react';
import { User } from '../types';
import { 
  SecurityAuditLog, ActiveSession, SecurityPolicyConfig,
  DEFAULT_SECURITY_CONFIG, INITIAL_SECURITY_LOGS, INITIAL_ACTIVE_SESSIONS,
  evaluatePasswordStrength
} from '../data/securityData';

interface SecurityCenterProps {
  currentUser: User;
  onRequireAuth?: (reason?: string) => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ currentUser, onRequireAuth }) => {
  const [securityConfig, setSecurityConfig] = useState<SecurityPolicyConfig>(DEFAULT_SECURITY_CONFIG);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(INITIAL_SECURITY_LOGS);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(INITIAL_ACTIVE_SESSIONS);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 2FA modal state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFactorPin, setTwoFactorPin] = useState('839210');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Password change test state
  const [newPassword, setNewPassword] = useState('');
  const passwordStrength = evaluatePasswordStrength(newPassword);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load config & sessions from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('ictc_security_config');
    if (savedConfig) {
      try {
        setSecurityConfig(JSON.parse(savedConfig));
      } catch (e) {
        setSecurityConfig(DEFAULT_SECURITY_CONFIG);
      }
    }

    const savedLogs = localStorage.getItem('ictc_security_logs');
    if (savedLogs) {
      try {
        setAuditLogs(JSON.parse(savedLogs));
      } catch (e) {}
    }

    const savedSessions = localStorage.getItem('ictc_active_sessions');
    if (savedSessions) {
      try {
        setActiveSessions(JSON.parse(savedSessions));
      } catch (e) {}
    }
  }, []);

  const handleSaveSecurityConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ictc_security_config', JSON.stringify(securityConfig));
    setSaveSuccess(true);
    showToast('Cấu hình bảo mật hệ thống đã được cập nhật thành công!');
    setTimeout(() => setSaveSuccess(false), 2500);

    // Add audit log
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eventType: 'CONFIG_UPDATE',
      severity: 'medium',
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      ipAddress: '14.241.120.88',
      location: 'Thủ Dầu Một, Bình Dương, VN',
      device: 'Admin Dashboard Web',
      details: 'Cập nhật chính sách bảo mật phòng vệ tài khoản.'
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    localStorage.setItem('ictc_security_logs', JSON.stringify(updatedLogs));
  };

  // Revoke a specific session
  const handleRevokeSession = (sessionId: string) => {
    const target = activeSessions.find(s => s.id === sessionId);
    if (target?.isCurrent) {
      alert('Không thể đăng xuất phiên làm việc hiện tại!');
      return;
    }
    const updated = activeSessions.filter(s => s.id !== sessionId);
    setActiveSessions(updated);
    localStorage.setItem('ictc_active_sessions', JSON.stringify(updated));
    showToast(`Đã thu hồi phiên đăng nhập trên thiết bị "${target?.device || 'Khác'}"`);

    // Log event
    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eventType: 'SESSION_REVOKED',
      severity: 'low',
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      ipAddress: '14.241.120.88',
      location: 'Thủ Dầu Một, Bình Dương, VN',
      device: 'Admin Console',
      details: `Thu hồi quyền truy cập của phiên làm việc ${sessionId}.`
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Revoke ALL other sessions
  const handleRevokeAllOtherSessions = () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi TẤT CẢ các thiết bị và trình duyệt khác không?')) return;
    const updated = activeSessions.filter(s => s.isCurrent);
    setActiveSessions(updated);
    localStorage.setItem('ictc_active_sessions', JSON.stringify(updated));
    showToast('Đã đăng xuất thành công khỏi tất cả các thiết bị khác!');

    const newLog: SecurityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      eventType: 'SESSION_REVOKED',
      severity: 'high',
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      ipAddress: '14.241.120.88',
      location: 'Thủ Dầu Một, Bình Dương, VN',
      device: 'Admin Console',
      details: 'Kích hoạt lệnh khẩn cấp: Đăng xuất toàn bộ các phiên làm việc ngoại trừ phiên hiện tại.'
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // Toggle Emergency Lockdown
  const handleToggleLockdown = () => {
    const nextState = !securityConfig.emergencyLockdown;
    const msg = nextState 
      ? 'CẢNH BÁO: Bạn đang bật Chế độ Khóa Khẩn Cấp. Tất cả việc đăng ký mới và các thao tác nhạy cảm sẽ bị khóa tạm thời!'
      : 'Bạn có chắc chắn muốn tắt Chế độ Khóa Khẩn Cấp để hệ thống hoạt động bình thường?';
    if (!confirm(msg)) return;

    const newConf = { ...securityConfig, emergencyLockdown: nextState };
    setSecurityConfig(newConf);
    localStorage.setItem('ictc_security_config', JSON.stringify(newConf));
    showToast(nextState ? 'ĐÃ KÍCH HOẠT CHẾ ĐỘ KHÓA KHẨN CẤP!' : 'Đã đưa hệ thống về trạng thái vận hành bình thường.');
  };

  // Calculate Security Health Score
  const calculateSecurityScore = () => {
    let score = 50;
    if (securityConfig.enable2FAForAdmins) score += 15;
    if (securityConfig.enforceStrongPassword) score += 15;
    if (securityConfig.blockSuspiciousIPs) score += 10;
    if (securityConfig.notifyOnNewDeviceLogin) score += 10;
    return Math.min(score, 100);
  };

  const securityScore = calculateSecurityScore();

  return (
    <div className="space-y-8 animate-fade-in" id="security-center-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-fade-in border border-slate-700">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner - Security Health Overview */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-cyan-300 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hệ thống Phòng vệ An ninh Mạng ICTC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Trung tâm Bảo mật & Chống Xâm phạm Tài khoản
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Bảo vệ tài khoản quản trị và thành viên khỏi các nguy cơ đánh cắp phiên đăng nhập (Session Hijacking), tấn công dò mật khẩu (Brute-Force), và truy cập trái phép từ thiết bị lạ.
            </p>
          </div>

          {/* Security Score Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center space-x-4 shrink-0 shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/80 border-2 border-emerald-400">
              <span className="text-xl font-black text-emerald-400">{securityScore}%</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Chỉ số An toàn Hệ thống</p>
              <p className="text-sm font-black text-white">
                {securityScore >= 90 ? 'Mức độ: Rất Cao (Tối ưu)' : 'Mức độ: Cần Cải Thiện'}
              </p>
              <span className="text-[10px] text-emerald-300 flex items-center mt-0.5">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Đã kích hoạt tường lửa & 2FA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY LOCKDOWN WARNING (IF ACTIVE) */}
      {securityConfig.emergencyLockdown && (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center space-x-3 text-rose-900">
            <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-black text-base">CHẾ ĐỘ KHÓA BẢO VỆ KHẨN CẤP ĐANG BẬT</h4>
              <p className="text-xs text-rose-700 font-medium">
                Tất cả đăng ký tài khoản mới và truy cập ngoài hệ thống đang bị hạn chế nghiêm ngặt để bảo vệ cơ sở dữ liệu.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleLockdown}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0"
          >
            Tắt Khóa Khẩn Cấp
          </button>
        </div>
      )}

      {/* CORE 3 PILLARS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PILLAR 1: ACTIVE SESSIONS & DEVICE MANAGEMENT */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-slate-900 text-base">Thiết bị & Phiên làm việc</h3>
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
              {activeSessions.length} phiên
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Theo dõi tất cả thiết bị đang đăng nhập tài khoản của bạn. Đăng xuất ngay nếu phát hiện thiết bị lạ.
          </p>

          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div 
                key={session.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  session.isCurrent 
                    ? 'bg-emerald-50/40 border-emerald-200' 
                    : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs">{session.device}</span>
                      {session.isCurrent && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded uppercase">
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{session.browser} • {session.os}</p>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center">
                      <Globe className="w-3 h-3 mr-1 text-slate-400" />
                      {session.ipAddress} • {session.location}
                    </p>
                  </div>

                  {!session.isCurrent && (
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
                      title="Đăng xuất thiết bị này"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRevokeAllOtherSessions}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl transition-colors border border-rose-200 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất tất cả thiết bị khác</span>
          </button>
        </div>

        {/* PILLAR 2: TWO-FACTOR AUTHENTICATION & STRONG CREDENTIALS */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">Xác thực 2 Lớp (2FA)</h3>
            </div>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${
              is2FAEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {is2FAEnabled ? 'Đã bật' : 'Chưa bật'}
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Mỗi khi đăng nhập từ thiết bị mới, hệ thống sẽ yêu cầu nhập mã OTP bảo mật 6 số gửi qua ứng dụng Authenticator hoặc email.
          </p>

          {/* 2FA State Box */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">Google Authenticator / OTP</span>
              </div>
              <button
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  showToast(!is2FAEnabled ? 'Đã kích hoạt xác thực 2 bước (2FA)!' : 'Đã tắt xác thực 2 bước.');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  is2FAEnabled 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {is2FAEnabled ? 'Đang bật' : 'Bật ngay'}
              </button>
            </div>

            {is2FAEnabled && (
              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between">
                <span>Mã PIN dự phòng khẩn cấp:</span>
                <span className="font-mono font-black text-indigo-700 tracking-wider">839-210</span>
              </div>
            )}
          </div>

          {/* Password Strength Tester */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Kiểm tra độ mạnh mật khẩu mới:</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập thử mật khẩu để kiểm tra..."
              className="w-full bg-slate-50 text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {newPassword && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500">Độ an toàn:</span>
                  <span className="text-slate-900">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PILLAR 3: SYSTEM SECURITY POLICIES & LOCKDOWN */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-900 text-base">Chính sách Phòng vệ</h3>
            </div>
          </div>

          <form onSubmit={handleSaveSecurityConfig} className="space-y-3 text-xs">
            {/* Toggle 1: 2FA for Admin */}
            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <span className="font-semibold text-slate-700">Bắt buộc 2FA cho Quản trị viên (Admin)</span>
              <input
                type="checkbox"
                checked={securityConfig.enable2FAForAdmins}
                onChange={(e) => setSecurityConfig({ ...securityConfig, enable2FAForAdmins: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
              />
            </label>

            {/* Toggle 2: Strong password */}
            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <span className="font-semibold text-slate-700">Bắt buộc mật khẩu mạnh (≥8 ký tự)</span>
              <input
                type="checkbox"
                checked={securityConfig.enforceStrongPassword}
                onChange={(e) => setSecurityConfig({ ...securityConfig, enforceStrongPassword: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
              />
            </label>

            {/* Toggle 3: Block Suspicious IPs */}
            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <span className="font-semibold text-slate-700">Tự động chặn IP nghi vấn Brute-Force</span>
              <input
                type="checkbox"
                checked={securityConfig.blockSuspiciousIPs}
                onChange={(e) => setSecurityConfig({ ...securityConfig, blockSuspiciousIPs: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer accent-blue-600"
              />
            </label>

            {/* Max failed attempts */}
            <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Số lần đăng nhập sai tối đa:</span>
                <span className="font-bold text-blue-600">{securityConfig.maxFailedLoginAttempts} lần</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                value={securityConfig.maxFailedLoginAttempts}
                onChange={(e) => setSecurityConfig({ ...securityConfig, maxFailedLoginAttempts: Number(e.target.value) })}
                className="w-full h-1 bg-slate-200 rounded appearance-none accent-blue-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu chính sách bảo mật</span>
            </button>
          </form>

          {/* Emergency button */}
          <button
            onClick={handleToggleLockdown}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-colors border ${
              securityConfig.emergencyLockdown
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-slate-100 hover:bg-rose-50 text-rose-700 border-slate-200'
            }`}
          >
            {securityConfig.emergencyLockdown ? 'Đang bật Khóa Khẩn Cấp' : 'Kích hoạt Khóa Khẩn Cấp'}
          </button>
        </div>

      </div>

      {/* SECURITY AUDIT LOG TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Nhật ký Kiểm toán An ninh (Realtime Security Audit Log)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ghi lại chi tiết mọi hành vi đăng nhập, nâng quyền, và thay đổi cấu hình bảo mật trên toàn hệ thống.
            </p>
          </div>

          <button
            onClick={() => {
              setAuditLogs(INITIAL_SECURITY_LOGS);
              localStorage.removeItem('ictc_security_logs');
              showToast('Đã làm mới nhật ký an ninh hệ thống!');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Làm mới Log</span>
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider bg-slate-50/70">
                <th className="py-3 px-4 rounded-l-xl">Thời gian</th>
                <th className="py-3 px-4">Sự kiện</th>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">IP & Địa điểm</th>
                <th className="py-3 px-4">Thiết bị</th>
                <th className="py-3 px-4 rounded-r-xl">Chi tiết thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => {
                const isFailed = log.eventType === 'LOGIN_FAILED';
                const isRole = log.eventType === 'ROLE_CHANGE';

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        log.severity === 'critical' ? 'bg-rose-100 text-rose-800' :
                        log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        log.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {log.userName}
                      <p className="text-[10px] text-slate-400 font-normal">{log.userEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800">{log.ipAddress}</span>
                      <p className="text-[10px] text-slate-400">{log.location}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {log.device}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
