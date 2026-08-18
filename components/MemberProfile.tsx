import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, Shield, Star, Award, Sparkles, Folder, CheckCircle, 
  Clock, Heart, Download, Edit2, Trash2, Calendar, Trophy, Zap, 
  Camera, Upload, Save, Check, X, RefreshCw, Phone, Mail, Building, FileText, Image as ImageIcon
} from 'lucide-react';
import { User, DesignFile, AIPrompt } from '../types';
import { UserAvatar, compressAndResizeImage } from './UserAvatar';
import { saveUserToDb } from '../lib/db';
import { useToast } from '../context/ToastContext';

interface MemberProfileProps {
  currentUser: User;
  onUpdateUser?: (updatedUser: User) => void;
  onEditDesign?: (file: DesignFile) => void;
  onEditPrompt?: (prompt: AIPrompt) => void;
}

export const MemberProfile: React.FC<MemberProfileProps> = ({ 
  currentUser,
  onUpdateUser,
  onEditDesign,
  onEditPrompt
}) => {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [userFiles, setUserFiles] = useState<DesignFile[]>([]);
  const [userPrompts, setUserPrompts] = useState<AIPrompt[]>([]);
  const [contributionPoints, setContributionPoints] = useState(0);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayName(currentUser.displayName || '');
    setDepartment(currentUser.department || '');
    setPhoneNumber(currentUser.phoneNumber || '');
    setBio(currentUser.bio || '');
  }, [currentUser]);

  useEffect(() => {
    // 1. Get user contributed designs
    const savedDesigns = localStorage.getItem('ictc_design_files');
    if (savedDesigns) {
      try {
        const parsed = JSON.parse(savedDesigns) as DesignFile[];
        const filtered = parsed.filter(f => f.authorId === currentUser.id || f.author?.includes(currentUser.displayName));
        setUserFiles(filtered);
      } catch (e) {}
    }

    // 2. Get user contributed prompts
    const savedPrompts = localStorage.getItem('ictc_ai_prompts');
    if (savedPrompts) {
      try {
        const parsed = JSON.parse(savedPrompts) as AIPrompt[];
        const filtered = parsed.filter(p => p.authorId === currentUser.id || p.author?.includes(currentUser.displayName));
        setUserPrompts(filtered);
      } catch (e) {}
    }
  }, [currentUser.id, currentUser.displayName]);

  // Calculate dynamic gamification points
  useEffect(() => {
    const fileScore = userFiles.length * 50;
    const promptScore = userPrompts.length * 30;
    const popularityScore = userFiles.reduce((acc, f) => acc + (f.downloadsCount || 0), 0) * 2 +
                           userPrompts.reduce((acc, p) => acc + (p.likesCount || 0), 0) * 1;
    
    setContributionPoints(fileScore + promptScore + popularityScore + 100);
  }, [userFiles, userPrompts]);

  // Handle avatar file upload
  const processAvatarFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF, SVG)');
      return;
    }

    try {
      setIsSaving(true);
      // Resize & compress to ~400px to maintain quality and optimal speed
      const compressedDataUrl = await compressAndResizeImage(file, 400, 0.88);
      
      const updatedUser: User = {
        ...currentUser,
        avatarUrl: compressedDataUrl
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        // Fallback local update
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        saveUserToDb(updatedUser).catch(console.warn);
      }

      toastSuccess('Đã cập nhật ảnh đại diện thành công!', 'Ảnh đại diện');
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
      toastError('Không thể xử lý tệp ảnh này. Vui lòng thử lại với ảnh khác.', 'Lỗi tải ảnh');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
    // Reset file input value so selecting the same file again triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentUser.avatarUrl) return;
    if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện và quay về biểu tượng chữ cái mặc định?')) {
      setIsSaving(true);
      const updatedUser: User = {
        ...currentUser,
        avatarUrl: ''
      };

      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        saveUserToDb(updatedUser).catch(console.warn);
      }
      setIsSaving(false);
      toastInfo('Đã gỡ ảnh đại diện và chuyển về mặc định.', 'Gỡ ảnh đại diện');
    }
  };

  // Drag & drop handlers for avatar area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
  };

  // Save profile information
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toastError('Vui lòng nhập đầy đủ họ và tên!', 'Thiếu thông tin');
      return;
    }

    setIsSaving(true);
    const updatedUser: User = {
      ...currentUser,
      displayName: displayName.trim(),
      department: department.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      bio: bio.trim() || undefined
    };

    try {
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      } else {
        localStorage.setItem('ictc_logged_in_user', JSON.stringify(updatedUser));
        await saveUserToDb(updatedUser);
      }
      setIsEditingProfile(false);
      toastSuccess('Đã lưu thông tin cá nhân thành công!', 'Hồ sơ thành viên');
    } catch (e) {
      console.warn('Lưu thông tin thất bại:', e);
      toastSuccess('Đã cập nhật thông tin trong phiên làm việc!', 'Hồ sơ thành viên');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đóng góp thiết kế này?')) {
      const savedDesigns = localStorage.getItem('ictc_design_files');
      if (savedDesigns) {
        try {
          const parsed = JSON.parse(savedDesigns) as DesignFile[];
          const updated = parsed.filter(f => f.id !== fileId);
          localStorage.setItem('ictc_design_files', JSON.stringify(updated));
          setUserFiles(userFiles.filter(f => f.id !== fileId));
          window.dispatchEvent(new Event('storage'));
          toastInfo('Đã xóa bài đóng góp thiết kế.', 'Đã xóa');
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
          window.dispatchEvent(new Event('storage'));
          toastInfo('Đã xóa bài đóng góp câu lệnh AI.', 'Đã xóa');
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
    <div className="space-y-8 animate-fade-in relative" id="member-profile-root">
      
      {/* Hidden Global File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Profile Cover & Header card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm relative">
        {/* Cover banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full stroke-white/10 [mask-image:radial-gradient(100%_100%_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="cover-grid" width="30" height="30" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M.5 30V.5H30" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cover-grid)" />
          </svg>
          <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-[11px] font-bold text-white flex items-center space-x-1.5 border border-white/15">
            <Calendar className="w-3.5 h-3.5" />
            <span>Gia nhập: {currentUser.joinedDate}</span>
          </div>
        </div>

        {/* User profile layout row */}
        <div className="px-6 pb-6 pt-0 sm:px-8 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6">
            
            {/* Interactive Avatar Card with Drag & Drop & Upload Button */}
            <div 
              className={`relative group rounded-full p-1 bg-white shadow-lg shrink-0 transition-all ${
                isDragging ? 'ring-4 ring-blue-500 scale-105' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <UserAvatar 
                user={currentUser} 
                size="2xl" 
                className={`border-4 bg-white ${badgeConfig.ring}`}
              />

              {/* Upload trigger button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-md border-2 border-white transition-all group-hover:scale-110"
                title="Tải ảnh đại diện mới từ máy tính / điện thoại"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User details */}
            <div className="space-y-1.5 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {currentUser.displayName}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-gradient-to-r ${badgeConfig.color} border border-white/10 shadow-sm self-center sm:self-auto`}>
                  {currentUser.role}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 font-semibold">{currentUser.email}</p>
              
              {currentUser.department && (
                <p className="text-xs text-slate-600 font-medium flex items-center justify-center sm:justify-start">
                  <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {currentUser.department}
                </p>
              )}

              <p className="text-xs text-blue-600 font-extrabold flex items-center justify-center sm:justify-start">
                <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                Danh hiệu: <span className="ml-1 underline decoration-2 decoration-blue-200">{badgeConfig.title}</span>
              </p>
            </div>
          </div>

          {/* Action buttons and summary */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Avatar quick actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200/60 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh lên</span>
              </button>

              {currentUser.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center justify-center p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                  title="Xóa ảnh và dùng chữ cái mặc định"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 font-bold text-xs rounded-xl border transition-colors shadow-xs ${
                  isEditingProfile 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Đóng chỉnh sửa' : 'Sửa thông tin'}</span>
              </button>
            </div>

            {/* Points summary bubble */}
            <div className="flex bg-slate-50 border border-slate-150 p-3.5 rounded-2xl justify-around gap-5 w-full sm:w-auto text-center">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Điểm đóng góp</p>
                <p className="text-lg font-black text-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-0.5" />
                  {contributionPoints.toLocaleString()}
                </p>
              </div>
              <div className="border-l border-slate-200 h-8 self-center"></div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sản phẩm</p>
                <p className="text-lg font-black text-slate-900">{(userFiles.length + userPrompts.length)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio row if present */}
        {currentUser.bio && !isEditingProfile && (
          <div className="px-6 pb-6 sm:px-8 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600 italic bg-slate-50 p-3.5 rounded-2xl border border-slate-150">
              "{currentUser.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Form (Expanded view) */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Chỉnh sửa hồ sơ cá nhân</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cập nhật thông tin hiển thị của bạn trên hệ thống ICTC</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên hiển thị *</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Huy"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phòng ban / Chuyên ngành</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Khoa Công nghệ thông tin / Ban Quản trị"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại / Zalo</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0912 345 678"
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email (Cố định)</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-slate-100 text-slate-500 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiểu sử / Giới thiệu bản thân</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ đôi nét về bạn, sở thích thiết kế hoặc mục tiêu học tập..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditingProfile(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Badges and milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
