import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle, AlertCircle, X, 
  ExternalLink, Folder, ArrowUpRight, HardDrive, Sparkles,
  File, Film, Image as ImageIcon, Archive, Loader2, ArrowRight
} from 'lucide-react';
import { DRIVE_DESIGN_FOLDER } from '../data/mockData';
import { uploadFileToGoogleDrive, getActiveAppsScriptUrl } from '../lib/appsScriptUploader';

interface FileUploadZoneProps {
  onFileSelected: (fileData: { name: string; size: string; type: string; base64?: string; driveUrl?: string }) => void;
  onDriveUrlDetected?: (url: string) => void;
  sharedDriveFolderUrl?: string;
  selectedFileName?: string;
  selectedFileSize?: string;
  onClearFile?: () => void;
  accentColor?: string;
  contentType?: 'design' | 'font' | 'prompt' | 'article';
  itemTitle?: string;
  contributorName?: string;
  contributorEmail?: string;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFileSelected,
  onDriveUrlDetected,
  sharedDriveFolderUrl = DRIVE_DESIGN_FOLDER,
  selectedFileName,
  selectedFileSize,
  onClearFile,
  accentColor = 'blue',
  contentType = 'design',
  itemTitle = '',
  contributorName = 'Thành viên ICTC',
  contributorEmail = 'nguyenhuy.thudaumot@gmail.com',
  acceptedFormats = ['.pptx', '.ppt', '.ai', '.psd', '.canva', '.zip', '.rar', '.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg', '.svg', '.ttf', '.otf'],
  maxSizeMB = 50
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [driveUploadSuccessMessage, setDriveUploadSuccessMessage] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [currentFileObj, setCurrentFileObj] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scriptUrl = getActiveAppsScriptUrl();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (name: string): string => {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
  };

  const targetFolderMap: Record<string, string> = {
    design: 'Thietke',
    font: 'Font',
    prompt: 'Promt mẫu',
    article: 'Thietke'
  };
  const targetFolderName = targetFolderMap[contentType] || 'Thietke';

  const processFile = async (file: File) => {
    setUploadError(null);
    setDriveUploadSuccessMessage(null);
    setCurrentFileObj(file);

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`Tệp tin vượt quá ${maxSizeMB}MB. Với tệp lớn, vui lòng tải lên Thư mục Google Drive tiếp nhận bên dưới và dán liên kết.`);
      return;
    }

    const ext = getFileExtension(file.name);
    const sizeStr = formatFileSize(file.size);

    // Read base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;

      onFileSelected({
        name: file.name,
        size: sizeStr,
        type: ext,
        base64: base64Data
      });

      // If Apps Script Web App URL is present, perform automatic background Google Drive upload
      if (scriptUrl) {
        setIsUploadingToDrive(true);
        setUploadProgress(20);
        setProgressMessage(`Đang tải tệp tự động lên thư mục /${targetFolderName} trên Drive...`);

        try {
          const result = await uploadFileToGoogleDrive({
            file,
            contentType,
            title: itemTitle || file.name,
            contributor: contributorName,
            email: contributorEmail,
            onProgress: (percent, msg) => {
              setUploadProgress(percent);
              setProgressMessage(msg);
            }
          });

          if (result.fileUrl) {
            onDriveUrlDetected?.(result.fileUrl);
            setDriveUploadSuccessMessage(result.message);
          }
        } catch (err: any) {
          console.warn("Apps Script automatic upload notice:", err);
        } finally {
          setIsUploadingToDrive(false);
          setTimeout(() => setUploadProgress(null), 800);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualDriveSync = async () => {
    if (!currentFileObj) return;
    setIsUploadingToDrive(true);
    setUploadError(null);
    setDriveUploadSuccessMessage(null);

    try {
      const result = await uploadFileToGoogleDrive({
        file: currentFileObj,
        contentType,
        title: itemTitle || currentFileObj.name,
        contributor: contributorName,
        email: contributorEmail,
        onProgress: (percent, msg) => {
          setUploadProgress(percent);
          setProgressMessage(msg);
        }
      });

      if (result.fileUrl) {
        onDriveUrlDetected?.(result.fileUrl);
        setDriveUploadSuccessMessage(result.message);
      }
    } catch (err: any) {
      setUploadError(`Lỗi tải lên: ${err?.message || 'Vui lòng kiểm tra lại đường truyền mạng'}`);
    } finally {
      setIsUploadingToDrive(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const getFormatIcon = (ext?: string) => {
    if (!ext) return <FileText className="w-6 h-6 text-blue-600" />;
    const upper = ext.toUpperCase();
    if (['PPTX', 'PPT', 'KEY'].includes(upper)) return <FileText className="w-6 h-6 text-orange-600" />;
    if (['AI', 'PSD', 'CDR', 'SVG', 'EPS'].includes(upper)) return <Sparkles className="w-6 h-6 text-purple-600" />;
    if (['ZIP', 'RAR', '7Z'].includes(upper)) return <Archive className="w-6 h-6 text-emerald-600" />;
    if (['PNG', 'JPG', 'JPEG', 'WEBP'].includes(upper)) return <ImageIcon className="w-6 h-6 text-blue-600" />;
    return <File className="w-6 h-6 text-slate-600" />;
  };

  return (
    <div className="space-y-3">
      {/* Direct File Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99] shadow-inner' 
            : 'border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileInputChange} 
          className="hidden" 
          accept={acceptedFormats.join(',')}
        />

        {selectedFileName ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  {getFormatIcon(getFileExtension(selectedFileName))}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[220px] sm:max-w-xs">{selectedFileName}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium">
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold uppercase">
                      {getFileExtension(selectedFileName)}
                    </span>
                    <span>{selectedFileSize || 'Đã sẵn sàng'}</span>
                    <span className="text-emerald-600 flex items-center font-bold">
                      <CheckCircle className="w-3 h-3 mr-0.5 inline" /> Đã chọn
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentFileObj(null);
                    setDriveUploadSuccessMessage(null);
                    if (onClearFile) onClearFile();
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Gỡ bỏ tệp"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Google Apps Script Direct Pipeline Sync Badge */}
            <div className="flex items-center justify-between px-3 py-2 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Tự động lưu vào: <strong className="text-blue-700">Google Drive/{targetFolderName}</strong>
                </span>
              </div>

              {currentFileObj && !isUploadingToDrive && (
                <button
                  type="button"
                  onClick={handleManualDriveSync}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-xs flex items-center space-x-1"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>Đẩy lên Drive ngay</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-110">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Kéo thả tệp tin vào đây hoặc <span className="text-blue-600 hover:underline">Duyệt từ máy tính</span>
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Tự động tải &amp; phân loại vào thư mục <strong>/{targetFolderName}</strong> trên Google Drive (Tối đa {maxSizeMB}MB)
              </p>
            </div>
          </div>
        )}

        {/* Upload progress indicator */}
        {uploadProgress !== null && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 space-y-2 backdrop-blur-xs z-10">
            <div className="w-full max-w-xs bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{progressMessage || `Đang xử lý tải lên Google Drive (${uploadProgress}%)...`}</span>
            </div>
          </div>
        )}
      </div>

      {driveUploadSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start space-x-2 animate-fade-in font-medium">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{driveUploadSuccessMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start space-x-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Shared Google Drive Folder Access Button */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 border border-blue-200/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-slate-900">Thư mục Google Drive tiếp nhận tài nguyên</span>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-extrabold rounded">Chính thức</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Đối với tệp dung lượng lớn (&gt;{maxSizeMB}MB), vui lòng tải trực tiếp lên thư mục chung rồi dán link chia sẻ.
            </p>
          </div>
        </div>

        <a
          href={sharedDriveFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 whitespace-nowrap shrink-0"
        >
          <span>Mở Thư mục Drive</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
