import React, { useState } from 'react';
import { X, Palette, Copy, Check, Info, Sparkles, Layers, BookOpen } from 'lucide-react';

interface VietnamDesignPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VN_STANDARD_COLORS = [
  {
    name: 'Đỏ Quốc Kỳ & Cờ Đảng',
    hex: '#DA251D',
    rgb: 'RGB(218, 37, 29)',
    cmyk: 'C:0 M:95 Y:100 K:0',
    usage: 'Cờ Tổ quốc, Phông Đại hội Đảng, Băng rôn ngày lễ 2/9, 30/4',
    badge: 'Chuẩn Nhà Nước'
  },
  {
    name: 'Vàng Sao Năm Cánh & Búa Liềm',
    hex: '#FFFF00',
    rgb: 'RGB(255, 255, 0)',
    cmyk: 'C:0 M:0 Y:100 K:0',
    usage: 'Ngôi sao vàng, Biểu tượng Búa Liềm, Quốc huy, Chữ tiêu đề đỏ nền vàng',
    badge: 'Chuẩn Nhà Nước'
  },
  {
    name: 'Vàng Kim Ép Nhũ Khánh Tiết',
    hex: '#D4AF37',
    rgb: 'RGB(212, 175, 55)',
    cmyk: 'C:20 M:30 Y:90 K:5',
    usage: 'Hoa văn Trống đồng Đông Sơn, Thiệp mời cao cấp, Chữ 3D Hội nghị',
    badge: 'Khánh Tiết'
  },
  {
    name: 'Xanh Dương Thanh Niên Việt Nam',
    hex: '#0055A5',
    rgb: 'RGB(0, 85, 165)',
    cmyk: 'C:100 M:60 Y:0 K:5',
    usage: 'Huy hiệu Đoàn TNCS Hồ Chí Minh, Hội Sinh viên, Chiến dịch Tình nguyện',
    badge: 'Đoàn Thể'
  },
  {
    name: 'Xanh Navy Hội Nghị & Doanh Nghiệp',
    hex: '#0B2545',
    rgb: 'RGB(11, 37, 69)',
    cmyk: 'C:100 M:80 Y:40 K:50',
    usage: 'Phông nền Hội thảo Quốc tế, Chuyển đổi số, Kỷ niệm Thành lập Trường',
    badge: 'Hội Thảo'
  },
  {
    name: 'Hồng Sen Thắm Dân Tộc',
    hex: '#E05A88',
    rgb: 'RGB(224, 90, 136)',
    cmyk: 'C:5 M:80 Y:20 K:0',
    usage: 'Họa tiết hoa sen chìm, Hội Liên hiệp Phụ nữ, Sự kiện Văn hóa & Nghệ thuật',
    badge: 'Văn Hóa'
  },
  {
    name: 'Xanh Lá Tự Nhiên & Nông Nghiệp',
    hex: '#1A7A44',
    rgb: 'RGB(26, 122, 68)',
    cmyk: 'C:85 M:20 Y:90 K:10',
    usage: 'Chương trình OCOP, Môi trường Xanh, Nông thôn mới, Kinh tế tuần hoàn',
    badge: 'Môi Trường'
  },
  {
    name: 'Đỏ Ruby Quý Phái Hội Trường',
    hex: '#8B0000',
    rgb: 'RGB(139, 0, 0)',
    cmyk: 'C:20 M:100 Y:100 K:40',
    usage: 'Rèm nhung hội trường, Phông lễ trao giải thưởng, Bìa sổ Nghị quyết',
    badge: 'Trang Trọng'
  }
];

const STANDARD_RATIOS = [
  {
    ratio: '16:9',
    title: 'Màn hình LED Sân khấu & Hội trường',
    dimension: '1920 x 1080 px (hoặc 3840 x 2160 px)',
    desc: 'Tỷ lệ chuẩn cho tất cả các hội nghị trình chiếu LED, phông sân khấu hiện đại.'
  },
  {
    ratio: '3:1',
    title: 'Băng rôn Ngang Tuyến phố & Cổng chào',
    dimension: '300 x 100 cm (hoặc 600 x 200 cm)',
    desc: 'Treo qua đường phố, hàng rào cơ quan, cổng trường học trong các dịp lễ.'
  },
  {
    ratio: '1:2',
    title: 'Standee Cuộn Đứng (Roll-up Banner)',
    dimension: '80 x 180 cm (hoặc 60 x 160 cm)',
    desc: 'Đặt tại sảnh đón tiếp đại biểu, triển lãm OCOP, ngày hội việc làm sinh viên.'
  },
  {
    ratio: 'A4 / A5',
    title: 'Giấy Mời & Thiệp Mừng Khánh Tiết',
    dimension: 'A5: 14.8 x 21.0 cm | A4: 21.0 x 29.7 cm',
    desc: 'Khổ in ấn offset chuẩn mực có độ phân giải tối thiểu 300 DPI hệ màu CMYK.'
  }
];

export const VietnamDesignPaletteModal: React.FC<VietnamDesignPaletteModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-amber-500 text-white rounded-2xl shadow-md shadow-red-500/20">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Quy Chuẩn Bảng Màu & Kích Thước Thiết Kế Việt Nam
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Thông số màu HEX, RGB, CMYK & tỷ lệ in ấn phông hội nghị, băng rôn, standee chuẩn
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Section 1: Standard Colors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. Bảng mã màu chuẩn nhận diện Cơ quan & Đoàn thể Việt Nam</span>
              </h3>
              <span className="text-xs text-slate-400">Click để sao chép mã HEX</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {VN_STANDARD_COLORS.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleCopy(item.hex)}
                  className="group p-3.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md space-y-2.5 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {item.badge}
                    </span>
                    <button className="p-1 rounded-md text-slate-400 group-hover:text-blue-600 transition-colors">
                      {copiedHex === item.hex ? (
                        <Check className="w-4 h-4 text-emerald-600 animate-scale-in" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="h-12 w-full rounded-xl shadow-inner border border-black/5 flex items-end p-2 transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: item.hex }}>
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 bg-black/40 backdrop-blur-xs text-white rounded">
                      {item.hex}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {item.usage}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{item.rgb}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Standard Ratios & Dimensions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>2. Kích thước & Tỷ lệ thiết kế in ấn tiêu chuẩn</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {STANDARD_RATIOS.map((r, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-black rounded-md font-mono">
                      {r.ratio}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {r.title}
                    </h4>
                  </div>
                  <p className="text-xs font-mono font-semibold text-blue-600">
                    {r.dimension}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Professional Tips */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start space-x-3 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Lưu ý khi xuất file in ấn và trình chiếu:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-amber-900">
                <li><strong>In ấn bạt Hiflex / Decal</strong>: Xuất file hệ màu <code>CMYK</code>, độ phân giải 100 - 150 DPI cho bạt khổ lớn trên 2m, hoặc 300 DPI cho giấy in A4/A5.</li>
                <li><strong>Trình chiếu màn hình LED</strong>: Xuất file hệ màu <code>RGB</code>, định dạng <code>JPG/PNG</code> chất lượng tối đa 100%, tỷ lệ chuẩn 16:9 để tránh bị kéo dãn hình ảnh.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Bộ tài liệu quy chuẩn kỹ thuật ICTC Share & Design
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-all shadow-sm shadow-blue-500/10"
          >
            Đóng bảng tra cứu
          </button>
        </div>

      </div>
    </div>
  );
};
