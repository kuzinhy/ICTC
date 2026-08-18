import React, { useState } from 'react';
import { 
  AlertTriangle, X, ShieldAlert, CheckCircle2, 
  Send, Flag, Lock, Info, ExternalLink 
} from 'lucide-react';
import { REPORT_REASONS, submitContentReport } from '../lib/contentModeration';
import { ContentReport } from '../types';

interface ReportViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'design' | 'prompt' | 'article' | 'comment' | 'font';
  targetTitle: string;
  currentUser?: { displayName?: string; email?: string } | null;
  onReportSuccess?: (report: ContentReport) => void;
}

export const ReportViolationModal: React.FC<ReportViolationModalProps> = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
  currentUser,
  onReportSuccess
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState(REPORT_REASONS[0].id);
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState(currentUser?.displayName || '');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const foundReason = REPORT_REASONS.find(r => r.id === selectedReasonId);
    const reasonText = foundReason ? foundReason.label : selectedReasonId;

    const report = submitContentReport({
      targetId,
      targetType,
      targetTitle,
      reason: reasonText,
      details: details.trim(),
      reporterName: reporterName.trim() || 'Người dùng ẩn danh',
      reporterEmail: reporterEmail.trim() || undefined,
      severity: selectedReasonId === 'broken_or_malicious_link' || selectedReasonId === 'inappropriate_content' ? 'high' : 'medium',
      autoFlagged: false
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    if (onReportSuccess) {
      onReportSuccess(report);
    }

    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 2200);
  };

  const getTargetTypeLabel = () => {
    switch (targetType) {
      case 'design': return 'Mẫu Thiết Kế';
      case 'prompt': return 'Câu Lệnh AI (Prompt)';
      case 'article': return 'Bài Viết / Bản Tin';
      case 'font': return 'Bộ Font Chữ';
      case 'comment': return 'Bình Luận';
      default: return 'Tài Nguyên';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Báo Cáo Vi Phạm Nội Dung
              </h3>
              <p className="text-xs text-rose-700 font-semibold">
                Bảo vệ cộng đồng học tập & chia sẻ lành mạnh ICTC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-all"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Báo cáo đã được tiếp nhận!</h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Cảm ơn bạn đã đóng góp xây dựng môi trường an toàn. Ban Quản Trị ICTC sẽ kiểm duyệt và xử lý nội dung này trong vòng <strong>24 giờ</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Target Item Overview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
              <div className="p-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-[10px] shrink-0 uppercase tracking-wider">
                {getTargetTypeLabel()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-500 text-[10px] font-medium">Nội dung bị báo cáo:</p>
                <h5 className="text-xs font-bold text-slate-900 truncate">{targetTitle}</h5>
              </div>
            </div>

            {/* Violation Reasons Radio List */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Lý do báo cáo vi phạm <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-start space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedReasonId === reason.id
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="violationReason"
                      value={reason.id}
                      checked={selectedReasonId === reason.id}
                      onChange={() => setSelectedReasonId(reason.id)}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{reason.label}</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{reason.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Details Field */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Chi tiết bổ sung (tùy chọn)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Mô tả cụ thể bằng chứng hoặc liên kết nguồn gốc để BQT đối chiếu nhanh nhất..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            {/* Reporter Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <label className="font-semibold text-slate-600 text-[10px]">Người gửi báo cáo</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Họ tên hoặc Nickname"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 text-[10px]">Email phản hồi (tùy chọn)</label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center space-x-2 text-[10px] text-amber-900 font-medium">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Hệ thống ghi nhận báo cáo an toàn và bảo mật danh tính người gửi 100%.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md shadow-rose-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Flag className="w-3.5 h-3.5 fill-white" />
                <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
