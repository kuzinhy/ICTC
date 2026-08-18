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
