import React, { useState, useEffect } from 'react';
import { 
  Search, Download, Star, Tag, FileText, X, Edit, Trash2,
  UploadCloud, Check, ExternalLink, Calendar, User, Eye, Sparkles 
} from 'lucide-react';
import { DesignFile, User as UserType } from '../types';
import { INITIAL_DESIGN_FILES, DRIVE_DESIGN_FOLDER } from '../data/mockData';
import { saveDesignToDb, deleteDesignFromDb } from '../lib/db';

interface DesignHubProps {
  currentUser: UserType | null;
}

export const DesignHub: React.FC<DesignHubProps> = ({ currentUser }) => {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedFile, setSelectedFile] = useState<DesignFile | null>(null);
  
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
  const [formSuccess, setFormSuccess] = useState(false);

  // Load files from storage
  useEffect(() => {
    const saved = localStorage.getItem('ictc_design_files');
    if (saved) {
      try {
        setFiles(JSON.parse(saved));
      } catch (e) {
        setFiles(INITIAL_DESIGN_FILES);
      }
    } else {
      setFiles(INITIAL_DESIGN_FILES);
      localStorage.setItem('ictc_design_files', JSON.stringify(INITIAL_DESIGN_FILES));
    }
  }, []);

  const saveFiles = (updatedFiles: DesignFile[]) => {
    setFiles(updatedFiles);
    localStorage.setItem('ictc_design_files', JSON.stringify(updatedFiles));
  };

  const handleDownload = (fileId: string) => {
    const target = files.find(f => f.id === fileId);
    if (target) {
      const updatedItem = { ...target, downloadsCount: target.downloadsCount + 1 };
      saveDesignToDb(updatedItem).catch(err => console.warn("Failed to update download count in Firestore:", err));
    }
    const updated = files.map(f => {
      if (f.id === fileId) {
        return { ...f, downloadsCount: f.downloadsCount + 1 };
      }
      return f;
    });
    saveFiles(updated);
  };

  // Create or Update File Submit
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDriveUrl) return;

    const tagsArray = newTags
      ? newTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : ['Community', newCategory.split(' ')[0]];

    const authorName = currentUser ? currentUser.displayName : 'Khách vãng lai';
    const authorId = currentUser ? currentUser.id : 'usr-guest';

    if (editingFile) {
      // Edit mode
      const updatedItem = {
        ...editingFile,
        title: newTitle,
        category: newCategory,
        fileType: newFileType,
        fileSize: newFileSize || editingFile.fileSize,
        driveUrl: newDriveUrl,
        description: newDescription,
        tags: tagsArray
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
      saveFiles(updated);
    } else {
      // Create mode
      const isCreatorOrAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Creator');
      const newFile: DesignFile = {
        id: `des-custom-${Date.now()}`,
        title: newTitle,
        description: newDescription || 'Tài nguyên đóng góp từ thành viên cộng đồng ICTC.',
        category: newCategory,
        fileType: newFileType,
        fileSize: newFileSize || '10 MB',
        driveUrl: newDriveUrl.startsWith('http') ? newDriveUrl : DRIVE_DESIGN_FOLDER,
        previewUrl: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80',
        tags: tagsArray,
        downloadsCount: 0,
        rating: 5.0,
        createdAt: new Date().toISOString().split('T')[0],
        author: authorName,
        authorId: authorId,
        status: isCreatorOrAdmin ? 'Approved' : 'Pending' // Admin & Creator bypass queue
      };

      saveDesignToDb(newFile).catch(err => {
        console.warn("Failed to sync new design to Cloud Firestore:", err);
      });

      saveFiles([newFile, ...files]);
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsUploadOpen(false);
      setEditingFile(null);
      setNewTitle('');
      setNewDescription('');
      setNewDriveUrl('');
      setNewFileSize('');
      setNewTags('');
    }, 1200);
  };

  // Trigger edit mode form
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

  // Delete file
  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng thiết kế này không?')) {
      deleteDesignFromDb(fileId).catch(err => {
        console.warn("Failed to delete design from Cloud Firestore:", err);
      });
      const updated = files.filter(f => f.id !== fileId);
      saveFiles(updated);
    }
  };

  // Filtering criteria
  const categories = ['All', 'PowerPoint Templates', 'Tài liệu Nghiên cứu', 'UI/UX Kits', 'Poster & Infographics', 'Canva Templates', 'Vector & Assets'];

  const filteredFiles = files.filter(file => {
    // Guest or regular Member only sees APPROVED files. Author/Admin sees their PENDING files too!
    const isVisible = file.status === 'Approved' || 
                      (currentUser && (currentUser.role === 'Admin' || currentUser.id === file.authorId));

    if (!isVisible) return false;

    const matchesSearch = file.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8" id="design-hub-root">
      {/* Blue and White Header Drive Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Thư Viện Đồng Bộ Google Drive</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kho File Thiết Kế Sáng Tạo</h2>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-medium">
            Tất cả tài nguyên học tập được lưu trữ tại thư mục Google Drive chính thức. Bạn có thể duyệt, tải xuống miễn phí hoặc đóng góp bài giảng mới cho cộng đồng.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <a
            href={DRIVE_DESIGN_FOLDER}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            Mở Google Drive
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          <button
            onClick={() => {
              setEditingFile(null);
              setIsUploadOpen(true);
            }}
            className="flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-bold text-sm rounded-xl transition-all duration-200 shadow-sm"
          >
            Đóng góp tài liệu
            <UploadCloud className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

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
                className="group bg-white border border-slate-200/80 rounded-3xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg flex flex-col justify-between"
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
                  <span className="flex items-center text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    {file.downloadsCount.toLocaleString()} tải về
                  </span>
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
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0 justify-end">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-sm font-bold transition-colors"
              >
                Đóng lại
              </button>
              <a
                href={selectedFile.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleDownload(selectedFile.id)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm"
              >
                Tải file về Google Drive
                <Download className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingFile ? 'Chỉnh sửa tài nguyên thiết kế' : 'Đóng góp tài nguyên học tập'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsUploadOpen(false);
                  setEditingFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission form body */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto no-scrollbar text-sm">
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Đã lưu thông tin!</h3>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Tài nguyên thiết kế của bạn đã được cập nhật thành công vào hệ thống dữ liệu.
                  </p>
                </div>
              ) : (
                <>
                  {/* Drive sharing tutorial banner */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl space-y-1.5 shadow-xs">
                    <p className="text-xs font-black text-blue-800 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-600 animate-pulse" />
                      Quy trình đóng góp tệp Google Drive
                    </p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                      Để đóng góp mẫu Slide hoặc thiết kế mới, bạn hãy tải tệp của mình lên Google Drive cá nhân, sau đó chuột phải vào tệp chọn <strong>"Chia sẻ" &rarr; Chọn "Bất kỳ ai có đường liên kết đều có thể Xem"</strong>. Copy liên kết đó dán vào ô bên dưới để Admin duyệt đăng lên ICTC nhé!
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề tài nguyên *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mẫu Slide, Template Canva, Báo cáo Đồ án..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                      >
                        {categories.slice(1).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Định dạng</label>
                      <input
                        type="text"
                        placeholder="PPTX, Figma, PSD..."
                        value={newFileType}
                        onChange={(e) => setNewFileType(e.target.value)}
                        className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dung lượng file</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: 15 MB, N/A"
                        value={newFileSize}
                        onChange={(e) => setNewFileSize(e.target.value)}
                        className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Từ khóa (Tags)</label>
                      <input
                        type="text"
                        placeholder="Ngắn gọn, cách nhau bằng dấu phẩy"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link tải xuống Google Drive *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={newDriveUrl}
                      onChange={(e) => setNewDriveUrl(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả tóm tắt tài nguyên</label>
                    <textarea
                      rows={3}
                      placeholder="Nêu đặc điểm nổi bật hoặc hướng dẫn sử dụng tài nguyên..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadOpen(false);
                        setEditingFile(null);
                      }}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {editingFile ? 'Lưu chỉnh sửa' : 'Đăng tải ngay'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
