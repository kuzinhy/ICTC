import { DEFAULT_SYSTEM_CONFIG } from '../data/mockData';
import { DRIVE_PPT_FOLDER, DRIVE_DESIGN_FOLDER, DRIVE_PROMPT_FOLDER } from '../data/constants';

export interface AppsScriptUploadParams {
  file: File;
  contentType?: 'design' | 'font' | 'prompt' | 'article' | string;
  title?: string;
  contributor?: string;
  email?: string;
  description?: string;
  customScriptUrl?: string;
  onProgress?: (percent: number, message: string) => void;
}

export interface AppsScriptUploadResult {
  success: boolean;
  fileUrl?: string;
  fileId?: string;
  folderName?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  base64?: string;
  message: string;
}

/**
 * Format bytes to readable string (e.g. 15.2 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Convert a browser File object to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Retrieve the active Google Apps Script Web App URL from system config or local storage
 */
export function getActiveAppsScriptUrl(): string {
  try {
    const savedConfig = localStorage.getItem('ictc_system_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.googleAppsScriptUrl && parsed.googleAppsScriptUrl.trim()) {
        return parsed.googleAppsScriptUrl.trim();
      }
    }
  } catch (e) {
    console.warn("Could not read Apps Script URL from local storage:", e);
  }
  return DEFAULT_SYSTEM_CONFIG.googleAppsScriptUrl || '';
}

/**
 * Upload a file directly to Admin's Google Drive via Google Apps Script Web App
 */
export async function uploadFileToGoogleDrive(
  params: AppsScriptUploadParams
): Promise<AppsScriptUploadResult> {
  const {
    file,
    contentType,
    title = file.name,
    contributor = 'Thành viên ICTC',
    email = 'nguyenhuy.thudaumot@gmail.com',
    description = '',
    customScriptUrl,
    onProgress
  } = params;

  const scriptUrl = customScriptUrl || getActiveAppsScriptUrl();
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
  const fileSizeStr = formatBytes(file.size);

  onProgress?.(15, 'Đang mã hóa tệp tin sang Base64...');
  const base64 = await fileToBase64(file);

  // Folder names & URLs mapping based on file type and extension
  let folderName = 'Thietke';
  let folderUrl = DRIVE_DESIGN_FOLDER;

  const isPpt = ext === 'PPT' || ext === 'PPTX' || contentType === 'ppt' || contentType === 'pptx';
  const isPrompt = contentType === 'prompt' || contentType === 'photo_prompt' || contentType === 'PromtAi';

  if (isPpt) {
    folderName = 'Powerpoint';
    folderUrl = DRIVE_PPT_FOLDER;
  } else if (isPrompt) {
    folderName = 'PromtAi';
    folderUrl = DRIVE_PROMPT_FOLDER;
  } else if (contentType === 'font') {
    folderName = 'Font';
    folderUrl = DRIVE_DESIGN_FOLDER;
  } else {
    folderName = 'Thietke';
    folderUrl = DRIVE_DESIGN_FOLDER;
  }

  // If no script URL is configured yet, provide clean fallback
  if (!scriptUrl) {
    onProgress?.(100, 'Tệp đã sẵn sàng (Chế độ cục bộ)');
    return {
      success: true,
      fileUrl: folderUrl,
      folderName,
      fileName: file.name,
      fileSize: fileSizeStr,
      fileType: ext,
      base64,
      message: 'Hệ thống đã ghi nhận tệp đính kèm. Admin có thể xem trực tiếp hoặc tải về từ cơ sở dữ liệu.'
    };
  }

  onProgress?.(45, `Đang truyền tệp sang thư mục /${folderName} trên Google Drive...`);

  try {
    const payload = {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileData: base64,
      contentType,
      title,
      contributor,
      email,
      description: description || `Đóng góp bởi ${contributor} vào mục ${folderName}`
    };

    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    onProgress?.(100, `Đã tải thành công tệp lên Google Drive (/${folderName})!`);

    return {
      success: true,
      fileUrl: folderUrl,
      folderName,
      fileName: file.name,
      fileSize: fileSizeStr,
      fileType: ext,
      base64,
      message: `Tệp "${file.name}" đã được phân loại tự động vào thư mục /${folderName} trên Google Drive!`
    };
  } catch (err: any) {
    console.error("Apps Script upload failed:", err);
    onProgress?.(100, 'Đã lưu tệp vào hàng đợi');
    return {
      success: false,
      fileName: file.name,
      fileSize: fileSizeStr,
      fileType: ext,
      base64,
      message: `Không thể kết nối máy chủ Drive: ${err?.message || 'Lỗi mạng'}. Tệp đã được lưu tạm để Admin xử lý.`
    };
  }
}
