import React, { useState } from 'react';
import { 
  X, Check, Crown, CreditCard, ShieldCheck, Copy, Sparkles, AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface VipUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSuccessNotice?: () => void;
}

export const VipUpgradeModal: React.FC<VipUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccessNotice
}) => {
  const [selectedPackage, setSelectedPackage] = useState<'3months' | '1year' | 'lifetime'>('1year');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [transactionCode, setTransactionCode] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const packages = {
    '3months': {
      id: '3months',
      name: 'Thành viên Đồng (3 Tháng)',
      price: 99000,
      priceFormatted: '99.000 đ',
      savings: 'Thích hợp dùng thử',
      features: [
        'Tải không giới hạn toàn bộ Slide VIP',
        'Tải không giới hạn AI Prompts VIP',
        'Hỗ trợ kỹ thuật 24/7 từ Admin',
        'Cập nhật tài nguyên mới hàng ngày'
      ]
    },
    '1year': {
      id: '1year',
      name: 'Thành viên Vàng (1 Năm)',
      price: 249000,
      priceFormatted: '249.000 đ',
      savings: 'Tiết kiệm 30%',
      features: [
        'Tải không giới hạn toàn bộ Slide VIP',
        'Tải không giới hạn AI Prompts VIP',
        'Mở khóa các bài nghiên cứu học thuật VIP',
        'Yêu cầu Admin thiết kế Slide riêng biệt (1 lần/tháng)',
        'Hỗ trợ kỹ thuật ưu tiên 24/7'
      ]
    },
    'lifetime': {
      id: 'lifetime',
      name: 'Thành viên Kim Cương (Vĩnh Viễn)',
      price: 499000,
      priceFormatted: '499.000 đ',
      savings: 'Tiết kiệm nhất',
      features: [
        'Sở hữu tài khoản VIP trọn đời',
        'Tải không giới hạn toàn bộ Slide VIP',
        'Tải không giới hạn AI Prompts VIP',
        'Mở khóa các bài nghiên cứu học thuật VIP',
        'Yêu cầu Admin thiết kế Slide theo ý muốn (Không giới hạn)',
        'Hỗ trợ kỹ thuật VIP trực tiếp qua Zalo/SĐT'
      ]
    }
  };

  const activePkg = packages[selectedPackage];
  const bankName = 'MB Bank (Ngân hàng Quân Đội)';
  const accountNumber = '0933565080913';
  const accountHolder = 'NGUYEN HUY';
  
  // Format transfer content: VIP <EMAIL> <PACKAGE_ID>
  const userEmailClean = currentUser ? currentUser.email.split('@')[0].toUpperCase() : 'ANHDANH';
  const transferContent = `ICTC VIP ${userEmailClean} ${selectedPackage.toUpperCase()}`;

  // VietQR URL builder
  const qrUrl = `https://img.vietqr.io/image/MB-${accountNumber}-compact2.png?amount=${activePkg.price}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountHolder)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCode.trim()) return;
    
    // In a real application, this saves to Firestore. We will update the user status or save it in localStorage.
    if (currentUser) {
      const savedRequests = localStorage.getItem('ictc_vip_requests') || '[]';
      try {
        const parsed = JSON.parse(savedRequests);
        const newRequest = {
          id: `req-${Date.now()}`,
          userId: currentUser.id,
          email: currentUser.email,
          displayName: currentUser.displayName,
          packageId: selectedPackage,
          packageName: activePkg.name,
          price: activePkg.price,
          transferContent: transferContent,
          transactionCode: transactionCode,
          requestedAt: new Date().toISOString(),
          status: 'Pending'
        };
        localStorage.setItem('ictc_vip_requests', JSON.stringify([newRequest, ...parsed]));
      } catch (e) {
        console.warn(e);
      }
    }
    
    setIsSubmitted(true);
    if (onSuccessNotice) {
      setTimeout(() => {
        onSuccessNotice();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="font-black text-slate-900 text-base">
              Nâng Cấp Tài Khoản VIP Hội Viên ICTC
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 no-scrollbar">
          
          {/* Left Column: Package Options */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Bước 1: Chọn gói nâng cấp VIP</h4>
              <p className="text-xs text-slate-500 font-medium">Chọn thời hạn phù hợp để mở khóa tải kho tài nguyên Slide, Canvas và vẽ AI đỉnh cao không giới hạn.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {Object.values(packages).map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => {
                      if (!isSubmitted) setSelectedPackage(pkg.id as any);
                    }}
                    disabled={isSubmitted}
                    className={`p-4.5 rounded-2xl border text-left transition-all relative flex items-center justify-between ${
                      isSelected 
                        ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-400/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span className="font-black text-slate-800 text-sm">{pkg.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        {pkg.savings}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block font-extrabold text-slate-900 text-base">{pkg.priceFormatted}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Thanh toán một lần</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Features list */}
            <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-150 space-y-3">
              <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
                Quyền lợi độc quyền của {activePkg.name}
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                {activePkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                    <span className="leading-snug">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Payment via VietQR */}
          <div className="lg:col-span-5 flex flex-col">
            {!isSubmitted ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Bước 2: Quét mã QR thanh toán</h4>
                  <p className="text-xs text-slate-500 font-medium">Sử dụng ứng dụng ngân hàng bất kỳ (Momo, Vietcombank, MB...) quét mã QR để chuyển khoản tự động.</p>
                </div>

                {/* QR Code Container */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs relative">
                  <img
                    src={qrUrl}
                    alt="VietQR Transfer code"
                    className="w-44 h-44 object-contain bg-white p-2 rounded-xl border border-slate-150 shadow-2xs animate-fade-in"
                  />
                  <div className="mt-2 text-center space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chủ tài khoản: NGUYEN HUY</p>
                    <p className="text-xs font-extrabold text-blue-600">MB Bank: 0933565080913</p>
                  </div>
                </div>

                {/* Copy info details */}
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 text-[11px]">Nội dung chuyển khoản:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="font-mono text-slate-900 font-bold flex items-center space-x-1 hover:text-blue-600"
                    >
                      <span>{transferContent}</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  {copiedText && (
                    <p className="text-[10px] text-emerald-600 font-bold text-center animate-pulse">
                      Đã copy thông tin sao chép thành công!
                    </p>
                  )}
                </div>

                {/* Submission Form */}
                <form onSubmit={handleSubmitTransaction} className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Nhập mã giao dịch (mã FT / mã bút toán sau khi chuyển khoản)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        required
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        placeholder="FT2612838923... hoặc mã GD"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-md shadow-amber-500/10 active:scale-95 transition-all"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-emerald-50/40 border border-emerald-100 rounded-3xl">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-900 text-base">Gửi Yêu Cầu Thành Công!</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Hệ thống đã ghi nhận mã giao dịch <span className="font-mono font-bold text-slate-900">"{transactionCode}"</span> nâng cấp VIP của bạn.
                  </p>
                </div>
                <div className="p-3.5 bg-white border border-emerald-100 rounded-2xl text-[11px] text-emerald-800 text-left leading-relaxed">
                  <strong className="font-bold">Thời gian phê duyệt:</strong> Ban Quản Trị sẽ đối chiếu bút toán ngân hàng và kích hoạt trạng thái VIP cho tài khoản của bạn trong vòng 5-10 phút. Cảm ơn bạn đã đóng góp duy trì cộng đồng!
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Hoàn tất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
