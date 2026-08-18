import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Download, Star, Tag, FileText, X, Edit, Trash2,
  UploadCloud, Check, ExternalLink, Calendar, User, Eye, Sparkles,
  Lock, Shield, ArrowRight, LogIn, Palette, Scale, ShieldCheck, Flag, AlertTriangle,
  Crown, Clock
} from 'lucide-react';
import { DesignFile, User as UserType } from '../types';
import { VipUpgradeModal } from './VipUpgradeModal';
import { INITIAL_DESIGN_FILES, DRIVE_DESIGN_FOLDER } from '../data/mockData';
import { saveDesignToDb, deleteDesignFromDb } from '../lib/db';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';
import { NewProductsShowcase } from './NewProductsShowcase';
import { FileUploadZone } from './FileUploadZone';
import { VietnamDesignPaletteModal } from './VietnamDesignPaletteModal';
import { LegalComplianceModal } from './LegalComplianceModal';
import { ReportViolationModal } from './ReportViolationModal';
import { useToast } from '../context/ToastContext';

interface DesignHubProps {
  currentUser: UserType | null;
  files: DesignFile[];
  onFilesUpdate: (updatedFiles: DesignFile[]) => void;
  selectedSpecialty?: string;
  onRequireAuth?: (reason?: string) => void;
}

export const DesignHub: React.FC<DesignHubProps> = ({ currentUser, files, onFilesUpdate, selectedSpecialty, onRequireAuth }) => {
  const { success: toastSuccess, info: toastInfo, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
  
  // Modals
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ip_policy');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Contribution/Editor Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<DesignFile | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('PowerPoint Templates');
  const [newFileType, setNewFileType] = useState('PPTX');
  const [newFileSize, setNewFileSize] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; base64?: string } | null>(null);
  const [complianceAgreed, setComplianceAgreed] = useState(true);
  const [previewCoverUrl, setPreviewCoverUrl] = useState('https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  // Report Modal State
  const [reportingItem, setReportingItem] = useState<{ id: string; title: string } | null>(null);

  const handleDownload = (fileId: string) => {
    // Security verification: Only members can download
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập hoặc đăng ký thành viên miễn phí để tải file thiết kế này!');
      }
      return;
    }

    const target = files.find(f => f.id === fileId);
    if (target) {
      const updatedItem = { ...target, downloadsCount: target.downloadsCount + 1 };
      saveDesignToDb(updatedItem).catch(err => console.warn("Failed to update download count in Firestore:", err));
      toastSuccess(`Đang tải file "${target.title}"... Chúc bạn có ấn phẩm thiết kế tuyệt đẹp!`, 'Bắt đầu tải xuống');
    }
    const updated = files.map(f => {
      if (f.id === fileId) {
        return { ...f, downloadsCount: f.downloadsCount + 1 };
      }
      return f;
    });
    onFilesUpdate(updated);
  };

  const handleOpenDriveFolder = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập tài khoản thành viên để truy cập toàn bộ thư mục Google Drive học thuật!');
      }
      return;
    }
    window.open(DRIVE_DESIGN_FOLDER, '_blank', 'noopener,noreferrer');
  };

  const handleOpenUploadModal = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập thành viên để đóng góp tài liệu và file thiết kế mới cho cộng đồng!');
      }
      return;
    }
    setEditingFile(null);
    setIsUploadOpen(true);
  };

  // Create or Update File Submit
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const tagsArray = newTags
      ? newTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : ['Community', newCategory.split(' ')[0]];

    const authorName = currentUser ? currentUser.displayName : 'Khách vãng lai';
    const authorId = currentUser ? currentUser.id : 'usr-guest';
    const isAdmin = currentUser?.role === 'Admin';
    const isCreatorOrAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Creator');

    const finalDriveUrl = newDriveUrl.trim() || DRIVE_DESIGN_FOLDER;

    if (editingFile) {
      // Edit mode
      const updatedItem: DesignFile = {
        ...editingFile,
        title: newTitle,
        category: newCategory,
        fileType: newFileType,
        fileSize: newFileSize || editingFile.fileSize,
        driveUrl: finalDriveUrl,
        previewUrl: previewCoverUrl || editingFile.previewUrl,
        description: newDescription,
        tags: tagsArray,
        attachedFileName: attachedFile?.name || editingFile.attachedFileName,
        attachedFileSize: attachedFile?.size || editingFile.attachedFileSize,
        attachedFileData: attachedFile?.base64 || editingFile.attachedFileData
      };
      
      saveDesignToDb(updatedItem).catch(err => {
        console.warn("Failed to sync design update to Cloud Firestore:", err);
      });

      const updated = files.map(f => {
        if (f.id === editingFile.id) {
          return updatedItem;
        }
        return f;
      });
      onFilesUpdate(updated);
      setFormSuccessMessage('Cập nhật tài nguyên thành công!');
    } else {
      // Run hidden safety moderation scan
      const safetyCheck = scanContentSafety({
        title: newTitle,
        description: newDescription,
        tags: tagsArray,
        author: authorName,
        url: finalDriveUrl
      });

      const isAutoFlagged = !safetyCheck.isSafe;

      if (isAutoFlagged) {
        // Automatically submit moderation report
        submitContentReport({
          targetId: `des-custom-${Date.now()}`,
          targetType: 'design',
          targetTitle: newTitle,
          reason: `Phát hiện từ khóa nghi vấn (${safetyCheck.matchedKeywords.join(', ')})`,
          details: `Nội dung bị hệ thống tự động gắn cờ cảnh báo rủi ro ${safetyCheck.riskLevel.toUpperCase()}.`,
          reporterName: 'Hệ Thống Tự Động (Hidden Scanner)',
          severity: safetyCheck.riskLevel === 'severe' ? 'high' : 'medium',
          autoFlagged: true
        });
      }

      // Create mode: Unsafe or non-admin posts are placed into Pending
      const newFile: DesignFile = {
        id: `des-custom-${Date.now()}`,
        title: newTitle,
        description: newDescription || 'Tài nguyên đóng góp từ thành viên cộng đồng ICTC.',
        category: newCategory,
        fileType: newFileType,
        fileSize: newFileSize || attachedFile?.size || '15 MB',
        driveUrl: finalDriveUrl,
        previewUrl: previewCoverUrl || 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
        tags: tagsArray,
        downloadsCount: 0,
        rating: 5.0,
        createdAt: new Date().toISOString().split('T')[0],
        author: authorName,
        authorId: authorId,
        status: (isAdmin && !isAutoFlagged) ? 'Approved' : 'Pending',
        attachedFileName: attachedFile?.name,
        attachedFileSize: attachedFile?.size,
        attachedFileData: attachedFile?.base64,
        autoFlaggedViolation: isAutoFlagged,
        violationReason: isAutoFlagged ? `Chứa từ khóa nhạy cảm: ${safetyCheck.matchedKeywords.join(', ')}` : undefined
      };

      saveDesignToDb(newFile).catch(err => {
        console.warn("Failed to sync new design to Cloud Firestore:", err);
      });

      onFilesUpdate([newFile, ...files]);

      if (isAutoFlagged) {
        setFormSuccessMessage('CẢNH BÁO KIỂM DUYỆT: Bài đăng chứa từ ngữ cần xem xét. Nội dung đã được chuyển sang hàng chờ Ban Quản Trị thẩm định trước khi công khai!');
        toastInfo('Nội dung đã được ghi nhận và đang chờ BQT phê duyệt theo nguyên tắc an toàn.', 'Chờ phê duyệt');
      } else {
        const msg = isAdmin 
          ? 'Tài nguyên của Quản trị viên đã được xuất bản trực tiếp thành công!' 
          : 'Tài nguyên đã được gửi thành công! Bài đăng đang ở trạng thái "Chờ duyệt" và sẽ được Ban Quản trị kiểm duyệt.';
        setFormSuccessMessage(msg);
        toastSuccess(isAdmin ? 'Tài nguyên đã được xuất bản trực tiếp!' : 'Đã gửi tài liệu! Chờ Ban Quản Trị kiểm duyệt.', 'Đóng góp thành công');
      }
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsUploadOpen(false);
      // Reset form
      setNewTitle('');
      setNewDriveUrl('');
      setNewDescription('');
      setNewFileSize('');
      setNewTags('');
      setAttachedFile(null);
      setEditingFile(null);
    }, 2000);
  };

  const triggerEdit = (file: DesignFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFile(file);
    setNewTitle(file.title);
    setNewCategory(file.category);
    setNewFileType(file.fileType);
    setNewFileSize(file.fileSize);
    setNewDriveUrl(file.driveUrl);
    setNewDescription(file.description);
    setNewTags(file.tags.join(', '));
    setIsUploadOpen(true);
  };

  const handleDeleteFile = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa file thiết kế này khỏi hệ thống?")) {
      const updated = files.filter(f => f.id !== fileId);
      onFilesUpdate(updated);
      try {
        await deleteDesignFromDb(fileId);
      } catch (err) {
        console.warn("Could not delete from Firestore:", err);
      }
      toastInfo('Đã xóa tệp thiết kế khỏi hệ thống.', 'Đã xóa file');
    }
  };

  const categories = [
    'All',
    'PowerPoint Templates',
    'UI/UX Kits',
    'Poster & Infographics',
    'Canva Templates',
    'Research Documents'
  ];

  // Filtering: Public visitors see approved files; Admins see all; Members see approved + their own pending/rejected items
  const filteredFiles = useMemo(() => {
    return files.filter(f => {
      const isOwner = currentUser && (f.authorId === currentUser.id || f.author === currentUser.displayName);
      const canView = f.status === 'Approved' || currentUser?.role === 'Admin' || isOwner;
      if (!canView) return false;
      
      const matchesSearch = searchTerm === '' || 
        f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        f.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;

      let matchesSpecialty = true;
      if (selectedSpecialty && selectedSpecialty !== 'all') {
        const allText = `${f.title} ${f.description} ${f.category} ${f.tags.join(' ')}`.toLowerCase();
        if (selectedSpecialty === 'design') {
          matchesSpecialty = f.category === 'UI/UX Kits' || f.category === 'PowerPoint Templates' || f.category === 'Poster & Infographics' || f.category === 'Canva Templates' || /thiết kế|design|đồ họa|poster|banner|canva|figma|photoshop|vector|typography|slide/i.test(allText);
        } else if (selectedSpecialty === 'code') {
          matchesSpecialty = f.category === 'UI/UX Kits' || /lập trình|code|dev|cntt|web|react|python|html|css|it|khoa học máy tính|frontend|backend|database/i.test(allText);
        } else if (selectedSpecialty === 'research') {
          matchesSpecialty = f.category === 'Research Documents' || f.category === 'PowerPoint Templates' || /nghiên cứu|học thuật|báo cáo|tiểu luận|luận văn|khoa học|research|hội thảo|academic/i.test(allText);
        } else if (selectedSpecialty === 'marketing') {
          matchesSpecialty = /marketing|kinh tế|thương mại|quảng cáo|truyền thông|sale|pitch|kinh doanh|tài chính|kế hoạch/i.test(allText) || f.category === 'Poster & Infographics' || f.category === 'PowerPoint Templates';
        } else if (selectedSpecialty === 'youth') {
          matchesSpecialty = /đo đoàn|hội|thanh niên|tình nguyện|sinh viên|phong trào|hội nghị|đại hội|mùa hè xanh|tiếp sức/i.test(allText) || f.category === 'Poster & Infographics';
        }
      }

      return matchesSearch && matchesCategory && matchesSpecialty;
    });
  }, [files, searchTerm, selectedCategory, selectedSpecialty, currentUser]);

  return (
    <div className="space-y-8" id="design-hub-root">
      {/* Blue and White Header Drive Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Thư Viện Đồng Bộ Google Drive</span>
            {!currentUser && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Chỉ tải khi là thành viên</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kho File Thiết Kế Sáng Tạo</h2>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-medium">
            Tất cả tài nguyên học tập được lưu trữ tại thư mục Google Drive chính thức. Đăng nhập thành viên để duyệt và tải xuống tốc độ cao hoàn toàn miễn phí.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleOpenUploadModal}
            className="flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-bold text-sm rounded-xl transition-all duration-200 shadow-sm active:scale-95 w-full sm:w-auto"
          >
            Đóng góp tài liệu
            <UploadCloud className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Vietnam Standards & Legal Tools Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-slate-100/80 border border-slate-200/80 rounded-2xl text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-bold">Quy chuẩn kỹ thuật:</span>
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Bảng mã màu & Tỷ lệ chuẩn VN</span>
          </button>
          <button
            onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <Scale className="w-3.5 h-3.5 text-blue-600" />
            <span>Bản quyền SHTT (CC BY-NC-SA 4.0)</span>
          </button>
        </div>
        <button
          onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }}
          className="text-slate-500 hover:text-slate-800 text-[11px] underline flex items-center space-x-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nguyên tắc kiểm duyệt nội dung</span>
        </button>
      </div>

      {/* Khung thể hiện sản phẩm, file thiết kế mới */}
      {!searchTerm && selectedCategory === 'All' && (
        <NewProductsShowcase 
          designFiles={files} 
          currentUser={currentUser}
          onSelectFile={(f) => setSelectedFile(f)}
          onRequireAuth={onRequireAuth}
          variant="grid"
        />
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm slide thuyết trình, tài liệu chuyên sâu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-medium placeholder-slate-400"
          />
        </div>

        {/* Categories slider */}
        <div className="w-full md:w-auto overflow-x-auto flex gap-1.5 no-scrollbar py-1 md:py-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {cat === 'All' ? 'Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-800 font-bold">Không tìm thấy tài nguyên nào</p>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">Hãy nhập từ khóa khác hoặc tìm trong các danh mục còn lại của hệ thống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => {
            const isOwner = currentUser && (currentUser.id === file.authorId || currentUser.role === 'Admin');
            
            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`group rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                  file.isVip 
                    ? 'bg-white border-transparent ring-2 ring-amber-400/90 shadow-md shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10' 
                    : 'bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                      src={file.previewUrl}
                      alt={file.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* File type badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100 shadow-sm">
                      {file.fileType}
                    </div>

                    {/* VIP badge or Member Lock Indicator */}
                    {file.isVip ? (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white text-[9px] font-black rounded-lg shadow-md shadow-amber-500/20 flex items-center space-x-1 border border-amber-300">
                        <Crown className="w-3 h-3 fill-white" />
                        <span>VIP</span>
                      </div>
                    ) : !currentUser ? (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold rounded-lg shadow-sm flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Thành viên</span>
                      </div>
                    ) : null}

                    {/* Status badge for contributor */}
                    {file.status === 'Pending' && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-yellow-500 text-white text-[9px] font-extrabold rounded shadow">
                        Chờ duyệt
                      </div>
                    )}

                    {/* Owner post controls */}
                    {isOwner && (
                      <div className="absolute bottom-3 right-3 flex space-x-1">
                        <button
                          onClick={(e) => triggerEdit(file, e)}
                          className="p-1.5 bg-white/90 hover:bg-blue-500 text-slate-700 hover:text-white rounded-lg border border-slate-200/60 shadow-sm transition-colors"
                          title="Sửa bài viết"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFile(file.id, e)}
                          className="p-1.5 bg-white/90 hover:bg-red-500 text-slate-700 hover:text-white rounded-lg border border-slate-200/60 shadow-sm transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Main contents */}
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">
                      {file.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-snug">
                      {file.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {file.description}
                    </p>
                  </div>
                </div>

                {/* Card footer info */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center font-medium">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {file.author.split(' ')[0]}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                      {currentUser ? <Download className="w-3.5 h-3.5 mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1 text-amber-500" />}
                      {file.downloadsCount.toLocaleString()} tải về
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal pop */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="relative aspect-[21/9] overflow-hidden bg-slate-100 shrink-0 border-b border-slate-100">
              <img
                src={selectedFile.previewUrl}
                alt={selectedFile.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedFile(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-slate-100 text-slate-500 rounded-full border border-slate-200 shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {selectedFile.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-2 line-clamp-1 drop-shadow-md">
                  {selectedFile.title}
                </h2>
              </div>
            </div>

            {/* Scrollable specs */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto no-scrollbar text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Định dạng</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedFile.fileType}</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Dung lượng</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedFile.fileSize}</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Lượt tải về</p>
                  <p className="text-sm font-bold text-blue-600 mt-0.5">{selectedFile.downloadsCount.toLocaleString()}</p>
                </div>
                <div className="border-l border-slate-200">
                  <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Đánh giá</p>
                  <p className="text-sm font-bold text-yellow-500 flex items-center justify-center space-x-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 stroke-none" />
                    <span>{selectedFile.rating.toFixed(1)}</span>
                  </p>
                </div>
              </div>

              {/* Security Member Banner inside Details */}
              {!currentUser && (
                <div className="p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start space-x-3 text-left">
                    <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">🔒 Yêu cầu tài khoản thành viên để tải file gốc</h5>
                      <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                        Tài nguyên này được bảo mật trên Google Drive. Vui lòng đăng nhập hoặc tạo tài khoản miễn phí để mở khóa liên kết tải về.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onRequireAuth) {
                        onRequireAuth('Vui lòng đăng nhập hoặc tạo tài khoản miễn phí để tải file thiết kế này!');
                      }
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-md shadow-blue-500/20 transition-all shrink-0 flex items-center space-x-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập để tải</span>
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chi tiết tài nguyên</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-150">
                  {selectedFile.description}
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Từ khóa tìm kiếm</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFile.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
                <span className="flex items-center font-medium">
                  <User className="w-4 h-4 mr-1.5 text-slate-400" />
                  Người đăng: <strong className="text-slate-700 ml-1 font-bold">{selectedFile.author}</strong>
                </span>
                <span className="flex items-center font-medium">
                  <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                  Ngày đăng: <strong className="text-slate-700 ml-1 font-bold">{selectedFile.createdAt}</strong>
                </span>
              </div>
            </div>

            {/* Action footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setReportingItem({ id: selectedFile.id, title: selectedFile.title })}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                title="Báo cáo nội dung vi phạm hoặc liên kết hỏng"
              >
                <Flag className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Báo cáo vi phạm</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  Đóng lại
                </button>
                
                {selectedFile.isVip ? (
                  currentUser ? (
                    currentUser.role === 'Admin' || currentUser.isVip ? (
                      <a
                        href={selectedFile.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleDownload(selectedFile.id)}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-amber-500/20 animate-pulse"
                      >
                        <Crown className="w-4 h-4 mr-2 fill-white" />
                        Tải VIP Tốc Độ Cao
                      </a>
                    ) : (
                      <button
                        onClick={() => setIsVipModalOpen(true)}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-amber-500/20"
                      >
                        <Crown className="w-4 h-4 mr-2 fill-white" />
                        Nâng Cấp VIP Để Tải
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        if (onRequireAuth) {
                          onRequireAuth('Tài nguyên thiết kế này được gắn nhãn VIP. Vui lòng đăng nhập để kiểm tra quyền tải xuống!');
                        }
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-amber-500/20"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Đăng Nhập Để Tải VIP
                    </button>
                  )
                ) : currentUser ? (
                  <a
                    href={selectedFile.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleDownload(selectedFile.id)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Tải về ngay
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      if (onRequireAuth) {
                        onRequireAuth('Vui lòng đăng nhập hoặc đăng ký thành viên miễn phí để tải file thiết kế này!');
                      }
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-md shadow-blue-500/20"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Đăng nhập để tải về
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal (Only for logged-in members/creators) */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingFile ? 'Chỉnh sửa tài nguyên' : 'Đóng góp tài nguyên học tập'}
                </h3>
              </div>
              <button 
                onClick={() => setIsUploadOpen(false)} 
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              {/* Role-based Moderation Banner */}
              {currentUser?.role === 'Admin' ? (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start space-x-2.5 text-xs text-indigo-900">
                  <span className="p-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shrink-0">Admin</span>
                  <div className="leading-snug">
                    <strong className="font-bold text-indigo-950">Chế độ Quản trị viên:</strong> Tệp tài nguyên của bạn sẽ được <strong>Tự động xuất bản trực tiếp</strong> lên hệ thống mà không cần qua khâu kiểm duyệt.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-bold text-amber-950">Chế độ Thành viên:</strong> Tệp tài nguyên đóng góp sẽ được chuyển vào hàng đợi <strong>chờ Ban Quản trị kiểm duyệt</strong> trước khi hiển thị cho cộng đồng.
                  </div>
                </div>
              )}

              {formSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-emerald-800 text-xs font-bold animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{formSuccessMessage}</span>
                </div>
              )}

              {/* Enhanced File Upload Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Tệp tin đóng góp (Kéo thả hoặc duyệt file)
                </label>
                <FileUploadZone
                  onFileSelected={(fileData) => {
                    setAttachedFile(fileData);
                    if (!newTitle) {
                      // remove extension from title
                      const cleanName = fileData.name.replace(/\.[^/.]+$/, "");
                      setNewTitle(cleanName);
                    }
                    if (fileData.type) {
                      setNewFileType(fileData.type);
                    }
                    if (fileData.size) {
                      setNewFileSize(fileData.size);
                    }
                  }}
                  acceptedFormats={['.pptx', '.ppt', '.fig', '.pdf', '.zip', '.rar', '.canva', '.png', '.jpg', '.svg']}
                  maxSizeMB={50}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên tài liệu / Mẫu thiết kế *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phông Hội Nghị Trao Quyết Định Công Tác Cán Bộ 2025"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Phông Hội Nghị">Phông Hội Nghị</option>
                    <option value="Băng Rôn & Banner">Băng Rôn & Banner</option>
                    <option value="Thiệp Mời & Thư Cảm Ơn">Thiệp Mời & Thư Cảm Ơn</option>
                    <option value="PowerPoint Templates">PowerPoint Templates</option>
                    <option value="Poster & Infographics">Poster & Infographics</option>
                    <option value="UI/UX Kits">UI/UX Kits</option>
                    <option value="Canva Templates">Canva Templates</option>
                    <option value="Research Documents">Research Documents</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Định dạng file</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="PPTX">PowerPoint (.pptx)</option>
                    <option value="FIG">Figma (.fig)</option>
                    <option value="AI">Illustrator (.ai)</option>
                    <option value="PSD">Photoshop (.psd)</option>
                    <option value="CANVA">Canva Link</option>
                    <option value="PDF">Tài liệu PDF</option>
                    <option value="ZIP">Bộ thư viện (ZIP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Dung lượng ước tính</label>
                  <input
                    type="text"
                    placeholder="VD: 15 MB"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Liên kết Google Drive (nếu có)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={newDriveUrl}
                    onChange={(e) => setNewDriveUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả quy cách thiết kế & hướng dẫn sử dụng</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả kích thước thực tế, font chữ chuẩn, màu sắc chủ đạo và các lưu ý kỹ thuật..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Từ khóa tìm kiếm (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  placeholder="Hội nghị, Cán bộ, Đảng bộ, Banner ngang, Đỏ cờ"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Intellectual Property & Community Guidelines Agreement */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-2xl flex items-start space-x-2.5">
                <input
                  type="checkbox"
                  id="complianceCheck"
                  required
                  checked={complianceAgreed}
                  onChange={(e) => setComplianceAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="complianceCheck" className="text-[11px] text-slate-600 leading-snug cursor-pointer select-none">
                  Tôi cam kết tệp tin này tuân thủ{' '}
                  <button 
                    type="button" 
                    onClick={() => { setLegalTab('ip_policy'); setIsLegalOpen(true); }} 
                    className="text-blue-600 font-bold underline hover:text-blue-800 inline"
                  >
                    Luật Sở hữu trí tuệ
                  </button>
                  {' '}và{' '}
                  <button 
                    type="button" 
                    onClick={() => { setLegalTab('community_rules'); setIsLegalOpen(true); }} 
                    className="text-blue-600 font-bold underline hover:text-blue-800 inline"
                  >
                    Nguyên tắc cộng đồng ICTC
                  </button>
                  , chia sẻ phi thương mại và không chứa mã độc hại.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!complianceAgreed}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingFile ? 'Lưu thay đổi' : 'Gửi tài liệu duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vietnam Design Palette & Standards Modal */}
      <VietnamDesignPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Legal & Intellectual Property Compliance Modal */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      {/* Report Violation Modal */}
      {reportingItem && (
        <ReportViolationModal
          isOpen={!!reportingItem}
          onClose={() => setReportingItem(null)}
          targetId={reportingItem.id}
          targetType="design"
          targetTitle={reportingItem.title}
          currentUser={currentUser}
        />
      )}

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        currentUser={currentUser}
        onSuccessNotice={() => {
          // Visual alert feedback of submission
        }}
      />
    </div>
  );
};
