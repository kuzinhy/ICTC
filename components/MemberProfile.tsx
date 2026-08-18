import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, Shield, Star, Award, Sparkles, Folder, CheckCircle, 
  Clock, Heart, Download, Edit2, Trash2, Calendar, Trophy, Zap 
} from 'lucide-react';
import { User, DesignFile, AIPrompt } from '../types';

interface MemberProfileProps {
  currentUser: User;
  onEditDesign?: (file: DesignFile) => void;
  onEditPrompt?: (prompt: AIPrompt) => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({ currentUser }) => {
  const [userFiles, setUserFiles] = useState<DesignFile[]>([]);
  const [userPrompts, setUserPrompts] = useState<AIPrompt[]>([]);
  const [contributionPoints, setContributionPoints] = useState(0);

  useEffect(() => {
    // 1. Get user contributed designs
    const savedDesigns = localStorage.getItem('ictc_design_files');
    if (savedDesigns) {
      try {
        const parsed = JSON.parse(savedDesigns) as DesignFile[];
        const filtered = parsed.filter(f => f.authorId === currentUser.id);
        setUserFiles(filtered);
      } catch (e) {}
    }

    // 2. Get user contributed prompts
    const savedPrompts = localStorage.getItem('ictc_ai_prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts) as AIPrompt[];
        const filtered = parsed.filter(p => p.authorId === currentUser.id);
        setUserPrompts(filtered);
      } catch (e) {}
    }
  }, [currentUser.id]);

  // Calculate dynamic gamification points
  useEffect(() => {
    // Basic scoring algorithm:
    // +50 pts per design file
    // +30 pts per AI prompt
    // +5 pts per download/like (simulated)
    const fileScore = userFiles.length * 50;
    const promptScore = userPrompts.length * 30;
    const popularityScore = userFiles.reduce((acc, f) => acc + (f.downloadsCount || 0), 0) * 2 +
                           userPrompts.reduce((acc, p) => acc + (p.likesCount || 0), 0) * 1;
    
    setContributionPoints(fileScore + promptScore + popularityScore + 100); // 100 base points for registering
  }, [userFiles, userPrompts]);

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đóng góp thiết kế này?')) {
      const savedDesigns = localStorage.getItem('ictc_design_files');
      if (savedDesigns) {
        try {
          const parsed = JSON.parse(savedDesigns) as DesignFile[];
          const updated = parsed.filter(f => f.id !== fileId);
          localStorage.setItem('ictc_design_files', JSON.stringify(updated));
          setUserFiles(userFiles.filter(f => f.id !== fileId));
          // Emit local event to sync other tabs
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }
    }
  };

  const handleDeletePrompt = (promptId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đóng góp câu lệnh AI này?')) {
      const savedPrompts = localStorage.getItem('ictc_ai_prompts');
      if (savedPrompts) {
        try {
          const parsed = JSON.parse(savedPrompts) as AIPrompt[];
          const updated = parsed.filter(p => p.id !== promptId);
          localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
          setUserPrompts(userPrompts.filter(p => p.id !== promptId));
          // Emit local event to sync other tabs
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }
    }
  };

  // Determine user level & title
  const getDesignerTitle = () => {
    if (contributionPoints >= 1000) return { title: 'Đại sứ Sáng tạo (VIP)', color: 'from-amber-500 to-orange-600 text-white', ring: 'border-amber-400' };
    if (contributionPoints >= 500) return { title: 'Nhà thiết kế hạng Vàng', color: 'from-purple-500 to-indigo-600 text-white', ring: 'border-purple-400' };
    if (contributionPoints >= 250) return { title: 'Nhà thiết kế hạng Bạc', color: 'from-blue-500 to-teal-500 text-white', ring: 'border-blue-400' };
    return { title: 'Thành viên Tích cực', color: 'from-slate-100 to-slate-200 text-slate-800', ring: 'border-slate-300' };
  };

  const badgeConfig = getDesignerTitle();

  return (
    <div className="space-y-8 animate-fade-in" id="member-profile-root">
      
      {/* Profile Cover & Header card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm relative">
        {/* Cover banner design-oriented */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="cover-grid" width="30" height="30" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M.5 30V.5H30" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cover-grid)" />
          </svg>
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center space-x-1 border border-white/10">
            <Calendar className="w-3.5 h-3.5" />
            <span>Gia nhập ngày: {currentUser.joinedDate}</span>
          </div>
        </div>

        {/* User profile layout row */}
        <div className="px-6 pb-6 pt-0 sm:px-8 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-10 sm:-mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 bg-white shadow-md overflow-hidden shrink-0 ${badgeConfig.ring}`}>
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.displayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1.5 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">{currentUser.displayName}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-gradient-to-r ${badgeConfig.color} border border-white/10 shadow-sm`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-semibold">{currentUser.email}</p>
              <p className="text-xs text-blue-600 font-extrabold flex items-center justify-center sm:justify-start">
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Danh hiệu: <span className="ml-1 underline decoration-2 decoration-blue-200">{badgeConfig.title}</span>
              </p>
            </div>
          </div>

          {/* Points summary bubble */}
          <div className="flex bg-slate-50 border border-slate-150 p-4.5 rounded-2xl sm:self-end justify-around gap-6 w-full sm:w-auto text-center">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đóng góp</p>
              <p className="text-xl font-black text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-0.5 animate-bounce" />
                {contributionPoints.toLocaleString()}
              </p>
            </div>
            <div className="border-l border-slate-200 h-10"></div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng sản phẩm</p>
              <p className="text-xl font-black text-slate-900">{(userFiles.length + userPrompts.length)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and milestones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${contributionPoints >= 100 ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${contributionPoints >= 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thành viên Tiên phong</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đăng ký thành công</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${userFiles.length >= 1 ? 'border-blue-100 bg-blue-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${userFiles.length >= 1 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thiết kế đồng</p>
            <p className="text-[10px] text-slate-400 font-semibold">Có 1 đóng góp Slide/UI</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${userFiles.length >= 3 || userPrompts.length >= 3 ? 'border-purple-100 bg-purple-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${userFiles.length >= 3 || userPrompts.length >= 3 ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Thiết kế bạc</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đóng góp 3+ tài liệu</p>
          </div>
        </div>

        <div className={`p-4 bg-white border rounded-2xl flex items-center space-x-3 shadow-xs ${contributionPoints >= 1000 ? 'border-amber-100 bg-amber-50/20' : 'border-slate-200 opacity-60'}`}>
          <div className={`p-2.5 rounded-xl ${contributionPoints >= 1000 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Đại sứ Sáng tạo</p>
            <p className="text-[10px] text-slate-400 font-semibold">Đạt trên 1,000 điểm</p>
          </div>
        </div>
      </div>

      {/* Contribution lists layout */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-slate-900">Sản phẩm tôi đóng góp cho cộng đồng</h3>
          <p className="text-xs text-slate-400 mt-1">Các tài liệu, thiết kế đồ án, slide và câu lệnh AI cao cấp do bạn đóng góp sẽ được lưu trữ và kiểm duyệt tại đây.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* List 1: Slide & Design Files */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                <Folder className="w-4 h-4 mr-1.5 text-blue-500" />
                Mẫu Thiết kế / Tài liệu ({userFiles.length})
              </span>
            </div>

            {userFiles.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium italic">Bạn chưa đóng góp tài nguyên thiết kế nào.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userFiles.map(file => (
                  <div key={file.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          file.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {file.status === 'Approved' ? 'Đã duyệt' : 'Đang duyệt'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{file.fileType}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{file.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">Đăng vào: {file.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List 2: AI Prompts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-purple-500" />
                Câu lệnh AI Prompts ({userPrompts.length})
              </span>
            </div>

            {userPrompts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-medium italic">Bạn chưa đóng góp câu lệnh AI nào.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {userPrompts.map(prompt => (
                  <div key={prompt.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          prompt.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {prompt.status === 'Approved' ? 'Đã duyệt' : 'Đang duyệt'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{prompt.toolType}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{prompt.title}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">Đăng vào: {prompt.createdAt}</p>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg border border-slate-200 transition-colors"
                        title="Xóa bài đăng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
