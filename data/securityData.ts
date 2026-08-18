export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'SECURITY_ALERT' | 'CONTENT_MODERATION' | 'SESSION_REVOKED' | 'CONFIG_UPDATE';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userEmail: string;
  userName: string;
  ipAddress: string;
  location: string;
  device: string;
  details: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  userEmail: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityPolicyConfig {
  enable2FAForAdmins: boolean;
  enable2FAForMembers: boolean;
  maxFailedLoginAttempts: number;
  lockoutDurationMinutes: number;
  enforceStrongPassword: boolean;
  sessionTimeoutHours: number;
  emergencyLockdown: boolean;
  notifyOnNewDeviceLogin: boolean;
  blockSuspiciousIPs: boolean;
}

export const DEFAULT_SECURITY_CONFIG: SecurityPolicyConfig = {
  enable2FAForAdmins: true,
  enable2FAForMembers: false,
  maxFailedLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  enforceStrongPassword: true,
  sessionTimeoutHours: 72,
  emergencyLockdown: false,
  notifyOnNewDeviceLogin: true,
  blockSuspiciousIPs: true,
};

export const INITIAL_SECURITY_LOGS: SecurityAuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-17 21:55:12',
    eventType: 'LOGIN_SUCCESS',
    severity: 'low',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    userName: 'Nguyễn Huy',
    ipAddress: '14.241.120.88',
    location: 'Thủ Dầu Một, Bình Dương, VN',
    device: 'Chrome 128 on macOS (Apple Silicon)',
    details: 'Đăng nhập thành công với quyền Quản trị viên (Admin).'
  },
  {
    id: 'log-002',
    timestamp: '2026-08-17 20:14:03',
    eventType: 'CONTENT_MODERATION',
    severity: 'low',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    userName: 'Nguyễn Huy',
    ipAddress: '14.241.120.88',
    location: 'Thủ Dầu Một, Bình Dương, VN',
    device: 'Chrome 128 on macOS',
    details: 'Phê duyệt 3 mẫu thiết kế và 5 câu lệnh AI Prompt mới.'
  },
  {
    id: 'log-003',
    timestamp: '2026-08-17 18:32:45',
    eventType: 'LOGIN_FAILED',
    severity: 'medium',
    userEmail: 'admin@ictc.io.vn',
    userName: 'Không xác định',
    ipAddress: '103.149.28.14',
    location: 'Hà Nội, VN',
    device: 'Firefox 120 on Windows 11',
    details: 'Đăng nhập thất bại: Sai mật khẩu (Lần thử 1/5).'
  },
  {
    id: 'log-004',
    timestamp: '2026-08-17 14:10:20',
    eventType: 'ROLE_CHANGE',
    severity: 'high',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    userName: 'Nguyễn Huy',
    ipAddress: '14.241.120.88',
    location: 'Thủ Dầu Một, Bình Dương, VN',
    device: 'Chrome 128 on macOS',
    details: 'Nâng quyền thành viên "Đỗ Minh Quân" lên Nhà sáng tạo (Creator).'
  },
  {
    id: 'log-005',
    timestamp: '2026-08-16 23:45:10',
    eventType: 'LOGIN_SUCCESS',
    severity: 'low',
    userEmail: 'lan.hoang@ictc.io.vn',
    userName: 'Hoàng Thị Lan',
    ipAddress: '113.161.72.33',
    location: 'TP. Hồ Chí Minh, VN',
    device: 'Safari 17 on iPhone 15 Pro',
    details: 'Đăng nhập thành công tài khoản Thành viên.'
  }
];

export const INITIAL_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-001',
    userId: 'usr-admin-1',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    device: 'MacBook Pro 16" (Apple Silicon M3)',
    browser: 'Google Chrome 128.0',
    os: 'macOS Sonoma 14.6',
    ipAddress: '14.241.120.88',
    location: 'Thủ Dầu Một, Bình Dương, Việt Nam',
    lastActive: 'Đang hoạt động (Phiên này)',
    isCurrent: true
  },
  {
    id: 'sess-002',
    userId: 'usr-admin-1',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    device: 'iPhone 15 Pro Max',
    browser: 'Mobile Safari 17.5',
    os: 'iOS 17.5.1',
    ipAddress: '14.241.120.92',
    location: 'Thủ Dầu Một, Bình Dương, Việt Nam',
    lastActive: '35 phút trước',
    isCurrent: false
  },
  {
    id: 'sess-003',
    userId: 'usr-admin-1',
    userEmail: 'nguyenhuy.thudaumot@gmail.com',
    device: 'PC Máy tính cơ quan ICTC',
    browser: 'Microsoft Edge 126.0',
    os: 'Windows 11 Pro 64-bit',
    ipAddress: '118.69.182.204',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    lastActive: '2 ngày trước',
    isCurrent: false
  }
];

// Helper: Calculate Password Strength (0 to 100)
export function evaluatePasswordStrength(password: string): { score: number; label: string; color: string; feedback: string[] } {
  if (!password) {
    return { score: 0, label: 'Trống', color: 'bg-slate-200', feedback: ['Vui lòng nhập mật khẩu'] };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 8) score += 25;
  else feedback.push('Nên có ít nhất 8 ký tự');

  if (password.length >= 12) score += 15;

  // Character variations
  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Thêm chữ thường (a-z)');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Thêm chữ hoa (A-Z)');

  if (/[0-9]/.test(password)) score += 15;
  else feedback.push('Thêm số (0-9)');

  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  else feedback.push('Thêm ký tự đặc biệt (!@#$%^&*)');

  let label = 'Yếu';
  let color = 'bg-rose-500';

  if (score >= 80) {
    label = 'Rất mạnh (Khuyên dùng)';
    color = 'bg-emerald-500';
  } else if (score >= 60) {
    label = 'Mạnh';
    color = 'bg-blue-500';
  } else if (score >= 40) {
    label = 'Trung bình';
    color = 'bg-amber-500';
  }

  return { score, label, color, feedback };
}
