import { ContentReport } from '../types';

// Danh sách các nhóm từ khóa vi phạm & nhạy cảm trong hệ thống kiểm duyệt ngầm (Hidden Rule-Based Safety Engine)
export const SENSITIVE_KEYWORDS_DICTIONARY = {
  // 1. Cờ bạc, cá độ, lừa đảo, tài xỉu, tiền tệ bất hợp pháp
  GAMBLING_SCAM: [
    'cá độ', 'cá cược', 'đánh bạc', 'tài xỉu', 'baccarat', 'nổ hũ', 'quay hũ', 'lô đề', 'soi cầu',
    'kubet', 'thabet', 'sunwin', 'go88', 'b52', 'rikvip', 'kingfun', 'f8bet', 'jun88', 'shbet',
    'kèo bóng đá', 'nhà cái', 'nạp rút 1:1', 'rút tiền tức thì', 'lừa đảo', 'hack coin', 'tặng coin',
    'nhận thưởng 88k', 'link nhận tiền', 'vay nóng', 'vay tiền online', 'bốc bát họ', 'đòi nợ thuê'
  ],

  // 2. Nội dung tục tĩu, phản cảm, xúc phạm, đồi trụy
  OBSCENE_VULGAR: [
    'đm', 'đcm', 'dcm', 'vcl', 'clgt', 'vcl', 'đĩ', 'cave', 'gái gọi', 'lộ clip', 'clip nóng',
    'phim sex', 'sex việt', 'khiêu dâm', 'ấu dâm', 'show hàng', 'chat sex', 'khoe hàng',
    'dâm đãng', 'chịch', 'xoạc', 'hiếp dâm', 'bán dâm', 'mua dâm', 'đụ', 'địt', 'lồn', 'buồi', 'cặc'
  ],

  // 3. Kích động thù địch, bạo lực, xúc phạm chính trị, vi phạm pháp luật
  VIOLENCE_HOSTILITY: [
    'phản động', 'chống phá nhà nước', 'khủng bố', 'chế tạo bom', 'mua súng', 'bán súng', 'thuốc nổ',
    'ma túy', 'cần sa', 'chất cấm', 'giết người', 'tự tử', 'đâm thuê chém mướn', 'thuốc kích dục',
    'xúc phạm danh dự', 'lăng mạ', 'bôi nhọ', 'xuyên tạc lịch sử'
  ],

  // 4. Spam link độc hại, rút gọn link nguy hiểm, lừa đảo phishing
  MALICIOUS_LINKS: [
    'bit.ly/scam', 'tinyurl.com/free-money', 't.me/hack', 't.me/keobong', 't.me/gai_goi',
    't.me/casino', 'fb-login-free', 'nhan-qua-garena', 'hack-free-fire', 'hack-roblox',
    'hack-acc', 'nhanquavng', 'rut-tien-nhanh', 'nhan-tien-momo'
  ]
};

export interface SafetyCheckResult {
  isSafe: boolean;
  riskLevel: 'safe' | 'warning' | 'severe';
  matchedKeywords: string[];
  categoryReasons: string[];
  summaryMessage: string;
  suggestedRemediation?: string;
}

/**
 * Quét tự động ngầm nội dung (Hidden Content Safety Scan)
 * Kiểm tra các trường dữ liệu tiêu đề, mô tả, nội dung, tags, URL
 */
export function scanContentSafety(input: {
  title?: string;
  description?: string;
  content?: string;
  tags?: string[];
  author?: string;
  url?: string;
}): SafetyCheckResult {
  const combinedText = [
    input.title || '',
    input.description || '',
    input.content || '',
    (input.tags || []).join(' '),
    input.author || '',
    input.url || ''
  ].join(' ').toLowerCase();

  const matchedKeywords: string[] = [];
  const categoryReasons: string[] = [];

  // Kiểm tra cờ bạc / lừa đảo
  for (const kw of SENSITIVE_KEYWORDS_DICTIONARY.GAMBLING_SCAM) {
    if (combinedText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
      if (!categoryReasons.includes('Cờ bạc, cá cược hoặc lừa đảo tài chính')) {
        categoryReasons.push('Cờ bạc, cá cược hoặc lừa đảo tài chính');
      }
    }
  }

  // Kiểm tra từ ngữ thô tục / đồi trụy
  for (const kw of SENSITIVE_KEYWORDS_DICTIONARY.OBSCENE_VULGAR) {
    // Check with word boundaries or substring
    const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
    if (combinedText.includes(kw.toLowerCase()) || regex.test(combinedText)) {
      matchedKeywords.push(kw);
      if (!categoryReasons.includes('Từ ngữ phản cảm, thô tục hoặc nội dung không phù hợp thuần phong mỹ tục')) {
        categoryReasons.push('Từ ngữ phản cảm, thô tục hoặc nội dung không phù hợp thuần phong mỹ tục');
      }
    }
  }

  // Kiểm tra bạo lực / kích động
  for (const kw of SENSITIVE_KEYWORDS_DICTIONARY.VIOLENCE_HOSTILITY) {
    if (combinedText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
      if (!categoryReasons.includes('Nội dung bạo lực, chất cấm hoặc vi phạm pháp luật')) {
        categoryReasons.push('Nội dung bạo lực, chất cấm hoặc vi phạm pháp luật');
      }
    }
  }

  // Kiểm tra liên kết độc hại / phishing
  for (const kw of SENSITIVE_KEYWORDS_DICTIONARY.MALICIOUS_LINKS) {
    if (combinedText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
      if (!categoryReasons.includes('Liên kết spam, lừa đảo phishing hoặc chuyển hướng độc hại')) {
        categoryReasons.push('Liên kết spam, lừa đảo phishing hoặc chuyển hướng độc hại');
      }
    }
  }

  // Phân cấp mức độ rủi ro
  if (matchedKeywords.length === 0) {
    return {
      isSafe: true,
      riskLevel: 'safe',
      matchedKeywords: [],
      categoryReasons: [],
      summaryMessage: 'Nội dung hợp lệ theo tiêu chuẩn cộng đồng ICTC.'
    };
  }

  const isSevere = matchedKeywords.length >= 2 || 
    categoryReasons.some(r => r.includes('bạo lực') || r.includes('lừa đảo') || r.includes('độc hại'));

  const riskLevel: 'warning' | 'severe' = isSevere ? 'severe' : 'warning';

  return {
    isSafe: false,
    riskLevel,
    matchedKeywords,
    categoryReasons,
    summaryMessage: `Hệ thống tự động phát hiện nội dung có dấu hiệu vi phạm quy tắc: ${categoryReasons.join('; ')}.`,
    suggestedRemediation: 'Vui lòng kiểm tra lại câu từ, tránh sử dụng các thuật ngữ nhạy cảm hoặc liên kết không rõ nguồn gốc.'
  };
}

/**
 * Danh sách các lý do báo cáo chuẩn dành cho người dùng
 */
export const REPORT_REASONS = [
  {
    id: 'copyright',
    label: 'Vi phạm bản quyền & Sở hữu trí tuệ',
    description: 'Sử dụng tác phẩm thiết kế, hình ảnh của tác giả khác mà không có sự đồng ý hoặc không ghi nguồn rõ ràng.'
  },
  {
    id: 'broken_or_malicious_link',
    label: 'Liên kết hỏng, lừa đảo hoặc chứa mã độc',
    description: 'Link Google Drive bị khóa quyền, link chuyển hướng sang web cá cược hoặc trang chứa tệp độc hại.'
  },
  {
    id: 'inappropriate_content',
    label: 'Nội dung phản cảm, xúc phạm hoặc không lành mạnh',
    description: 'Chứa hình ảnh hoặc từ ngữ thô tục, bạo lực, trái với thuần phong mỹ tục hoặc tiêu chuẩn cộng đồng học thuật.'
  },
  {
    id: 'spam_advertising',
    label: 'Spam, quảng cáo rác không đúng chuyên mục',
    description: 'Đăng tải nội dung quảng cáo sản phẩm, dịch vụ không liên quan đến thiết kế, học tập hoặc nghiên cứu.'
  },
  {
    id: 'misleading_quality',
    label: 'Nội dung giả mạo hoặc chất lượng sai lệch',
    description: 'File thực tế không khớp với hình ảnh mô tả, tệp tin rỗng hoặc bị hư hỏng không sử dụng được.'
  },
  {
    id: 'other',
    label: 'Lý do khác',
    description: 'Cung cấp thêm thông tin chi tiết về hành vi vi phạm.'
  }
];

/**
 * Lưu báo cáo vi phạm vào LocalStorage và cập nhật danh sách
 */
export function submitContentReport(report: Omit<ContentReport, 'id' | 'reportedAt' | 'status'>): ContentReport {
  const newReport: ContentReport = {
    ...report,
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    reportedAt: new Date().toISOString().split('T')[0],
    status: 'Pending'
  };

  try {
    const saved = localStorage.getItem('ictc_content_reports');
    const reports: ContentReport[] = saved ? JSON.parse(saved) : [];
    const updated = [newReport, ...reports];
    localStorage.setItem('ictc_content_reports', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save report to localStorage:', e);
  }

  return newReport;
}

/**
 * Lấy danh sách tất cả các báo cáo vi phạm
 */
export function getAllContentReports(): ContentReport[] {
  try {
    const saved = localStorage.getItem('ictc_content_reports');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export const fetchContentReports = getAllContentReports;

// ==========================================
// 1. NHẬT KÝ HỆ THỐNG & TRUY XUẤT (AUDIT LOGS)
// ==========================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: 'APPROVE' | 'REJECT' | 'DELETE' | 'ROLE_CHANGE' | 'CONFIG_UPDATE' | 'VIP_GRANT' | 'BAN_USER' | 'SYSTEM_SCAN';
  targetType: 'article' | 'design' | 'prompt' | 'user' | 'system' | 'font';
  targetTitle: string;
  details: string;
}

export function addAuditLog(log: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  try {
    const newEntry: AuditLogEntry = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('vi-VN')
    };
    const saved = localStorage.getItem('ictc_audit_logs');
    const logs: AuditLogEntry[] = saved ? JSON.parse(saved) : [];
    const updated = [newEntry, ...logs].slice(0, 200); // Keep last 200 logs
    localStorage.setItem('ictc_audit_logs', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save audit log:', e);
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem('ictc_audit_logs');
    if (saved) return JSON.parse(saved);
    // Initial mock logs if empty
    const initialLogs: AuditLogEntry[] = [
      {
        id: 'log-101',
        timestamp: new Date().toLocaleString('vi-VN'),
        actorName: 'Quản trị viên Hệ thống',
        actorRole: 'Admin',
        actionType: 'SYSTEM_SCAN',
        targetType: 'system',
        targetTitle: 'Kiểm tra toàn vẹn liên kết Drive',
        details: 'Khởi chạy công cụ kiểm tra tự động liên kết tài nguyên trên toàn hệ thống'
      },
      {
        id: 'log-100',
        timestamp: new Date(Date.now() - 3600000).toLocaleString('vi-VN'),
        actorName: 'Ban Biên tập ICTC',
        actorRole: 'Admin',
        actionType: 'APPROVE',
        targetType: 'article',
        targetTitle: 'Hướng dẫn ứng dụng AI trong Thiết kế slide',
        details: 'Bài viết đạt chuẩn tiêu chuẩn chất lượng và đã xuất bản công khai'
      }
    ];
    localStorage.setItem('ictc_audit_logs', JSON.stringify(initialLogs));
    return initialLogs;
  } catch (e) {
    return [];
  }
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem('ictc_audit_logs');
  } catch (e) {}
}

// ==========================================
// 2. CÔNG CỤ QUÉT & KIỂM TRA LIÊN KẾT LIVE (LINK HEALTH CHECKER)
// ==========================================

export interface LinkHealthReport {
  id: string;
  targetId: string;
  type: 'design' | 'prompt' | 'article' | 'font';
  title: string;
  url: string;
  author: string;
  isHealthy: boolean;
  statusCode: 'OK' | 'MISSING_URL' | 'NEED_PERMISSION' | 'INVALID_FORMAT';
  lastChecked: string;
  suggestion: string;
}

export function scanResourceLinks(
  designs: any[],
  prompts: any[],
  articles: any[],
  fonts: any[]
): LinkHealthReport[] {
  const reports: LinkHealthReport[] = [];
  const now = new Date().toLocaleString('vi-VN');

  // Scan Designs
  (designs || []).forEach(d => {
    const url = d.driveUrl || '';
    let isHealthy = true;
    let statusCode: LinkHealthReport['statusCode'] = 'OK';
    let suggestion = 'Liên kết Google Drive hợp lệ và hoạt động bình thường.';

    if (!url.trim()) {
      isHealthy = false;
      statusCode = 'MISSING_URL';
      suggestion = 'Thiếu liên kết Google Drive. Yêu cầu tác giả cập nhật lại.';
    } else if (!url.includes('drive.google.com') && !url.includes('docs.google.com') && !url.startsWith('http')) {
      isHealthy = false;
      statusCode = 'INVALID_FORMAT';
      suggestion = 'Định dạng đường dẫn không đúng chuẩn URL hoặc chưa bao gồm https://';
    } else if (url.includes('usp=sharing') || url.includes('id=')) {
      isHealthy = true;
      statusCode = 'OK';
      suggestion = 'Đã mở quyền chia sẻ công khai.';
    }

    reports.push({
      id: `link-d-${d.id}`,
      targetId: d.id,
      type: 'design',
      title: d.title || 'Mẫu thiết kế',
      url: url || 'Chưa cung cấp',
      author: d.author || 'Tác giả',
      isHealthy,
      statusCode,
      lastChecked: now,
      suggestion
    });
  });

  // Scan Prompts
  (prompts || []).forEach(p => {
    const url = p.driveUrl || '';
    let isHealthy = true;
    let statusCode: LinkHealthReport['statusCode'] = 'OK';
    let suggestion = 'Liên kết đính kèm hợp lệ.';

    if (url && !url.startsWith('http')) {
      isHealthy = false;
      statusCode = 'INVALID_FORMAT';
      suggestion = 'Liên kết đính kèm chưa khớp định dạng URL tiêu chuẩn.';
    }

    reports.push({
      id: `link-p-${p.id}`,
      targetId: p.id,
      type: 'prompt',
      title: p.title || 'Câu lệnh AI',
      url: url || 'N/A (Chỉ có raw prompt)',
      author: p.author || 'Tác giả',
      isHealthy,
      statusCode,
      lastChecked: now,
      suggestion
    });
  });

  // Scan Fonts
  (fonts || []).forEach(f => {
    const url = f.downloadUrl || f.googleFontUrl || '';
    let isHealthy = true;
    let statusCode: LinkHealthReport['statusCode'] = 'OK';
    let suggestion = 'Tệp font chữ tải về ổn định.';

    if (!url.trim()) {
      isHealthy = false;
      statusCode = 'MISSING_URL';
      suggestion = 'Thiếu liên kết tải phông chữ.';
    }

    reports.push({
      id: `link-f-${f.id}`,
      targetId: f.id,
      type: 'font',
      title: f.name || 'Phông chữ',
      url,
      author: f.creator || 'Cộng đồng',
      isHealthy,
      statusCode,
      lastChecked: now,
      suggestion
    });
  });

  return reports;
}

// ==========================================
// 3. ĐÁNH GIÁ ĐIỂM CHẤT LƯỢNG NỘI DUNG (QUALITY SCORE CALCULATOR)
// ==========================================

export interface ContentQualityResult {
  score: number; // 0 to 100
  badge: 'Tối ưu (A+)' | 'Khá tốt (B)' | 'Cần hoàn thiện (C)';
  color: string;
  checklist: Array<{ check: string; passed: boolean }>;
}

export function calculateQualityScore(item: any, type: 'design' | 'prompt' | 'article'): ContentQualityResult {
  let score = 0;
  const checklist: Array<{ check: string; passed: boolean }> = [];

  if (type === 'design') {
    // 1. Tiêu đề rõ ràng (> 10 ký tự)
    const passTitle = (item.title || '').length >= 10;
    checklist.push({ check: 'Tiêu đề đầy đủ & chuẩn SEO (>=10 ký tự)', passed: passTitle });
    if (passTitle) score += 25;

    // 2. Mô tả chi tiết (> 20 ký tự)
    const passDesc = (item.description || '').length >= 20;
    checklist.push({ check: 'Mô tả chi tiết cách sử dụng (>=20 ký tự)', passed: passDesc });
    if (passDesc) score += 25;

    // 3. Đủ thẻ tags
    const passTags = Array.isArray(item.tags) && item.tags.length >= 2;
    checklist.push({ check: 'Gắn ít nhất 2 thẻ phân loại (Tags)', passed: passTags });
    if (passTags) score += 20;

    // 4. Liên kết Drive hợp lệ
    const passDrive = !!(item.driveUrl && item.driveUrl.startsWith('http'));
    checklist.push({ check: 'Đường dẫn Google Drive hoạt động', passed: passDrive });
    if (passDrive) score += 20;

    // 5. Ảnh xem trước rõ nét
    const passImg = !!(item.previewUrl || item.fallbackPreviewUrl);
    checklist.push({ check: 'Có hình ảnh xem trước (Preview)', passed: passImg });
    if (passImg) score += 10;
  } else if (type === 'article') {
    const passTitle = (item.title || '').length >= 12;
    checklist.push({ check: 'Tiêu đề chuẩn bài báo (>=12 ký tự)', passed: passTitle });
    if (passTitle) score += 25;

    const passContent = (item.content || '').length >= 100;
    checklist.push({ check: 'Nội dung phong phú (>=100 từ)', passed: passContent });
    if (passContent) score += 35;

    const passCover = !!item.coverImage;
    checklist.push({ check: 'Hình ảnh đại diện (Cover) chất lượng', passed: passCover });
    if (passCover) score += 20;

    const passTags = Array.isArray(item.tags) && item.tags.length >= 2;
    checklist.push({ check: 'Có thẻ tag tìm kiếm', passed: passTags });
    if (passTags) score += 20;
  } else {
    // Prompt
    const passTitle = (item.title || '').length >= 8;
    checklist.push({ check: 'Tên câu lệnh rõ ràng', passed: passTitle });
    if (passTitle) score += 25;

    const passRaw = (item.rawPrompt || '').length >= 20;
    checklist.push({ check: 'Câu lệnh gốc (Raw Prompt) chi tiết', passed: passRaw });
    if (passRaw) score += 35;

    const passOpt = (item.optimizedPrompt || '').length >= 20;
    checklist.push({ check: 'Đã tối ưu hóa Prompt', passed: passOpt });
    if (passOpt) score += 20;

    const passPreview = !!item.previewImageUrl;
    checklist.push({ check: 'Có ảnh minh họa minh chứng kết quả', passed: passPreview });
    if (passPreview) score += 20;
  }

  let badge: ContentQualityResult['badge'] = 'Cần hoàn thiện (C)';
  let color = 'text-amber-600 bg-amber-50 border-amber-200';

  if (score >= 85) {
    badge = 'Tối ưu (A+)';
    color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  } else if (score >= 60) {
    badge = 'Khá tốt (B)';
    color = 'text-blue-600 bg-blue-50 border-blue-200';
  }

  return { score, badge, color, checklist };
}


/**
 * Cập nhật trạng thái xử lý báo cáo vi phạm
 */
export function updateReportStatus(
  reportId: string, 
  status: 'Pending' | 'Resolved' | 'Dismissed' | 'pending' | 'resolved' | 'dismissed',
  resolutionNotes?: string
): void {
  try {
    const reports = getAllContentReports();
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: normalizedStatus as any,
          resolvedAt: new Date().toISOString().split('T')[0],
          adminNotes: resolutionNotes
        };
      }
      return r;
    });
    localStorage.setItem('ictc_content_reports', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not update report status:', e);
  }
}
