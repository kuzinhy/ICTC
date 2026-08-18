import React, { useState } from 'react';
import { 
  X, ShieldCheck, Scale, AlertTriangle, FileText, CheckCircle2, 
  Copyright, Sparkles, HelpCircle, Mail, ExternalLink, Award 
} from 'lucide-react';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown';
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'ip_policy'
}) => {
  const [activeTab, setActiveTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Quy Chuẩn Pháp Lý & Sở Hữu Trí Tuệ ICTC
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tuân thủ Luật Sở hữu trí tuệ Việt Nam & Nguyên tắc cộng đồng học thuật
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-white overflow-x-auto space-x-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('ip_policy')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'ip_policy'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Copyright className="w-4 h-4" />
            <span>Chính sách Bản quyền & SHTT</span>
          </button>
          <button
            onClick={() => setActiveTab('community_rules')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'community_rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Nguyên tắc Cộng đồng</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_ethics')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'ai_ethics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Đạo đức AI & Minh bạch</span>
          </button>
          <button
            onClick={() => setActiveTab('dmca_takedown')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeTab === 'dmca_takedown'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Báo cáo Vi phạm (24h)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {activeTab === 'ip_policy' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 space-y-1">
                  <p className="font-bold">Cam kết tuân thủ Pháp luật Việt Nam:</p>
                  <p>Mọi tài nguyên được đăng tải trên nền tảng ICTC Share & Design đều tuân thủ nghiêm ngặt Luật Sở hữu Trí tuệ số 50/2005/QH11 (sửa đổi, bổ sung 2022) và Nghị định 17/2023/NĐ-CP về quyền tác giả.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>1. Giấy phép Sử dụng & Chia sẻ Tài nguyên (Creative Commons)</span>
                </h3>
                <p>
                  Các mẫu Slide, Vector, Poster và Template được chia sẻ trên ICTC thuộc giấy phép <strong>Creative Commons CC BY-NC-SA 4.0</strong> (Ghi công - Phi thương mại - Chia sẻ tương tự).
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li><strong>Cho phép:</strong> Tải về, tùy chỉnh, tái sử dụng cho mục đích học tập, nghiên cứu khoa học, thuyết trình đồ án, hoạt động đoàn thể cơ quan phi thương mại.</li>
                  <li><strong>Nghiêm cấm:</strong> Đóng gói thương mại hóa, rao bán lại trên các sàn TMĐT hoặc phân phối tệp tin gốc nhằm mục đích trục lợi bất chính.</li>
                  <li><strong>Ghi nhận công lao (Attribution):</strong> Khuyến khích giữ lại thông tin tác giả hoặc dẫn nguồn ICTC Share & Design.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>2. Trách nhiệm của Thành viên Đóng góp (Uploaders)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Khi người dùng gửi tệp lên thư mục chung hoặc đăng bài lên ICTC, người đóng góp cam kết:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900">Quyền sở hữu chính chủ</p>
                    <p className="text-slate-500 mt-1">Là tác giả hoặc đã được chủ sở hữu ủy quyền chia sẻ công khai vì mục đích giáo dục.</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="font-bold text-slate-900">Không đính kèm tệp độc hại</p>
                    <p className="text-slate-500 mt-1">Cam kết tệp tin sạch 100%, không chứa mã độc (malware), macro ẩn hay liên kết lừa đảo (phishing).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'community_rules' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Bộ Quy tắc Hành xử & Chuẩn mực Nội dung ICTC</h3>
                <p className="text-xs text-slate-600">
                  Nhằm xây dựng môi trường học thuật văn minh và an toàn cho sinh viên, giảng viên và cán bộ cơ quan toàn quốc:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-emerald-200 bg-emerald-50/60 rounded-2xl flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-1">
                    <p className="font-bold">Nội dung được hoan nghênh & khuyến khích:</p>
                    <p>Mẫu thiết kế đồ họa chất lượng cao chuẩn quy cách Việt Nam (Phông hội nghị, Băng rôn, Thiệp mời, Giáo án, Slide luận văn, Bài viết hướng dẫn thực hành kỹ năng số).</p>
                  </div>
                </div>

                <div className="p-4 border border-rose-200 bg-rose-50/60 rounded-2xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-950 space-y-1">
                    <p className="font-bold">Các hành vi & nội dung bị nghiêm cấm tuyệt đối:</p>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                      <li>Vi phạm an ninh quốc gia, xuyên tạc lịch sử, thuần phong mỹ tục hoặc xúc phạm biểu tượng Quốc gia.</li>
                      <li>Phát tán tài liệu mật của cơ quan, tổ chức, trường học khi chưa được giải mật hoặc cho phép.</li>
                      <li>Spam link quảng cáo cờ bạc, tiền ảo, dịch vụ viết thuê đồ án luận văn trái quy định học thuật.</li>
                      <li>Ngôn từ công kích cá nhân, xúc phạm danh dự hoặc kỳ thị vùng miền.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai_ethics' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Nguyên tắc Sử dụng Trí tuệ Nhân tạo (Generative AI Ethics)</h3>
                <p className="text-xs text-slate-600">
                  Kho AI Prompt của ICTC được biên soạn có trách nhiệm, hỗ trợ nâng cao hiệu suất làm việc mà không thay thế tư duy sáng tạo con người:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-blue-600 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Chuẩn mực Văn hóa Việt Nam</span>
                  </div>
                  <p className="text-slate-600">
                    Toàn bộ 100 câu lệnh AI được kiểm định nghiêm ngặt, sử dụng chính xác các biểu trưng văn hóa (trống đồng Đông Sơn, hoa sen, cờ Tổ quốc) và trang phục truyền thống Việt Nam.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Minh bạch Nguồn gốc & Không Deepfake</span>
                  </div>
                  <p className="text-slate-600">
                    Nghiêm cấm tạo prompt nhằm giả mạo hình ảnh, khuôn mặt, chữ ký hoặc phát tán thông tin sai sự thật (disinformation/deepfake).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dmca_takedown' && (
            <div className="space-y-5 animate-fade-in">
              <div className="space-y-3">
                <h3 className="font-black text-slate-900 text-base">Quy trình Tiếp nhận & Xử lý Khiếu nại Bản quyền (24h)</h3>
                <p className="text-xs text-slate-600">
                  ICTC tôn trọng quyền sở hữu trí tuệ của mọi cá nhân, tác giả và tổ chức. Nếu phát hiện tệp tin nào vi phạm bản quyền của bạn, vui lòng liên hệ ngay với Ban Quản trị:
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <p className="font-bold text-slate-900">Kênh tiếp nhận trực tiếp:</p>
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email tiếp nhận: <strong>nguyenhuy.thudaumot@gmail.com</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Zalo hỗ trợ trực tiếp: <strong>Zalo Cộng đồng ICTC (0982...)</strong></span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  * Sau khi nhận được thông tin chứng minh quyền tác giả hợp lệ, Ban Quản trị cam kết tạm gỡ bỏ tệp tin tranh chấp trong vòng <strong>24 giờ làm việc</strong> để thẩm định.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Phiên bản hiệu lực: 2026.1 • Ban Quản Trị ICTC Share & Design
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all shadow-sm shadow-blue-500/10"
          >
            Đã hiểu & Đồng ý
          </button>
        </div>

      </div>
    </div>
  );
};
