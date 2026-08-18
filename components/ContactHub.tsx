import React from 'react';
import { 
  MessageSquare, Video, ExternalLink, Calendar, 
  MapPin, HelpCircle, Users, Award, ShieldAlert, BadgeCheck, Share2
} from 'lucide-react';

export const ContactHub: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in" id="contact-hub-root">
      
      {/* Upper Introduction Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Mạng Lưới Cộng Đồng Toàn Quốc</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kênh Truyền Thông & Hỗ Trợ</h2>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-medium">
            Hãy tham gia vào hệ sinh thái ICTC Việt Nam để nhận tin tức cập nhật mới nhất, trao đổi giáo trình thiết kế và thảo luận trực tiếp cùng hơn 50,000+ thành viên toàn quốc!
          </p>
        </div>
      </div>

      {/* Grid of contact links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Contact 1: Zalo Community */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-900 text-base">Cộng đồng Zalo ICTC</h3>
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/25 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Nhóm chia sẻ file slide gốc</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1 font-medium">
                Kênh liên lạc chính, cập nhật tài liệu thuyết trình khoa học, slide giảng dạy và file đồ án tốt nghiệp sớm nhất cho các bạn sinh viên.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-1 rounded uppercase tracking-wider">Kênh Zalo 1</span>
            <a
              href="https://zalo.me/g/kovwak924"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Tham gia nhóm Zalo
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Contact 2: Facebook Group */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-900 text-base">Group Facebook</h3>
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/25 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Diễn đàn thảo luận sáng tạo</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1 font-medium">
                Nơi đăng tải và giao lưu sản phẩm đồ họa, thiết kế thương hiệu, slide Powerpoint của hơn hàng chục ngàn nhà sáng tạo nội dung số tại Việt Nam.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-1 rounded uppercase tracking-wider">Group chính thức</span>
            <a
              href="https://www.facebook.com/groups/313739042955897"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Tham gia thảo luận
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Contact 3: TikTok Creator Channel */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Video className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-900 text-base">TikTok @huy.ng.m</h3>
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/25 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kênh hướng dẫn & mẹo thiết kế</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1 font-medium">
                Video ngắn hướng dẫn thiết kế slide Powerpoint siêu nhanh, cách viết AI prompts tạo ảnh cực đỉnh và chia sẻ tư duy thiết kế thực chiến hiệu quả.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-1 rounded uppercase tracking-wider">Video Creator</span>
            <a
              href="https://www.tiktok.com/@huy.ng.m"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Xem ngay trên TikTok
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Contact 4: Zalo Prompt Share group */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-900 text-base">Cộng đồng Zalo Prompt</h3>
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/25 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Kênh chia sẻ câu lệnh AI vẽ ảnh</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1 font-medium">
                Nơi tổng hợp các mẹo viết câu lệnh tạo ảnh nghệ thuật đẹp mắt, thử nghiệm các mô hình AI mới nhất như Midjourney v6, DALL-E 3 và Stable Diffusion.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-1 rounded uppercase tracking-wider">Kênh Zalo 2</span>
            <a
              href="https://zalo.me/g/kovwak924" // fallback drive link or group link as provided
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Tham gia nhóm Prompt
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Contact 5: Owner Profile Direct */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-blue-300 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-900 text-base">Liên hệ Ban Quản Trị</h3>
                <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/25 stroke-[2]" />
              </div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Người điều hành hệ thống</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1 font-medium">
                Kết nối trực tiếp với Quản trị viên Nguyễn Huy để giải quyết các vấn đề tài liệu học thuật, slide tốt nghiệp, đề xuất phê duyệt, và hợp tác phát triển cộng đồng.
              </p>
            </div>
          </div>
          <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
            <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-2 py-1 rounded uppercase tracking-wider">Sáng lập viên</span>
            <a
              href="https://zalo.me/g/kovwak924"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Gửi tin nhắn trực tiếp
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>
        </div>

        {/* Info Board */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-3 text-slate-700 text-xs">
            <div className="flex items-center space-x-1.5 text-blue-600 font-bold pb-2 border-b border-slate-200">
              <HelpCircle className="w-4 h-4" />
              <span>Cần hỗ trợ kỹ thuật?</span>
            </div>
            <p className="leading-relaxed font-semibold">
              Hệ thống chia sẻ slide và AI Prompt được vận hành phi lợi nhuận bởi cộng đồng sáng tạo trẻ. 
            </p>
            <p className="leading-relaxed text-slate-500">
              Mọi tài liệu đóng góp được kiểm duyệt kỹ càng và lưu trữ công khai trên Google Drive không có quảng cáo độc hại.
            </p>
          </div>
          <div className="pt-3 flex items-center text-[11px] text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            <span>Thành phố Hồ Chí Minh, Việt Nam</span>
          </div>
        </div>
      </div>
    </div>
  );
};
