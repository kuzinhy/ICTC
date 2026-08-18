import React, { useState } from 'react';
import { 
  FileText, Shield, Sparkles, Check, Copy, ExternalLink, 
  HelpCircle, Code, Layers, FileUp, AlertTriangle, ArrowRight 
} from 'lucide-react';

export const DriveUploadResearch: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'native' | 'api'>('script');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const scriptCode = `/*
  GOOGLE APPS SCRIPT: UPLOAD FILES DIRECTLY TO OWNER'S DRIVE
  Hướng dẫn cài đặt:
  1. Truy cập https://script.google.com và tạo dự án mới.
  2. Dán đoạn mã này vào tệp script.
  3. Thay thế 'FOLDER_ID_CUA_BAN' bằng ID thư mục Google Drive của bạn.
  4. Nhấn "Triển khai" (Deploy) -> "Mới" (New deployment).
  5. Chọn loại là "Ứng dụng web" (Web app).
  6. Ở mục "Ai có quyền truy cập" (Who has access), chọn "Bất kỳ ai" (Anyone).
  7. Copy URL Web App nhận được và dán vào phần cấu hình Admin của ICTC!
*/

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.fileData.split(',')[1];
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, data.mimeType, data.fileName);
    
    // ĐỊNH NGHĨA ID THƯ MỤC DRIVE CỦA BẠN TẠI ĐÂY
    var folderId = "FOLDER_ID_CUA_BAN"; 
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    
    // Thêm mô tả và thông tin người đóng góp
    file.setDescription("Người đóng góp: " + (data.contributor || "Ẩn danh") + "\\nEmail: " + (data.email || "Không rõ"));
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileUrl: file.getUrl(),
      fileId: file.getId()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Nghiên cứu Kỹ thuật & Bảo mật</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Quy trình upload file lên Drive của Nguyễn Huy</h3>
          <p className="text-xs text-slate-500 font-medium">
            Phân tích giải pháp cho phép thành viên đóng góp tệp trực tiếp vào thư mục Google Drive của chủ sở hữu hệ thống.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('script')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'script' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Google Apps Script
          </button>
          <button
            onClick={() => setActiveSubTab('native')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'native' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Yêu cầu Tệp Native
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'api' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Google Drive API
          </button>
        </div>
      </div>

      {/* Tabs description content */}
      {activeSubTab === 'script' && (
        <div className="space-y-5 animate-fade-in text-sm">
          <div className="p-4.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-blue-800 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 animate-pulse" />
              Giải pháp tối ưu: Google Apps Script Web App (Tự động hóa hoàn toàn)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Đây là giải pháp **được khuyên dùng nhiều nhất** cho các dự án cộng đồng như ICTC. Bằng cách triển khai một script nhỏ làm Proxy API, thành viên của bạn có thể tải lên tệp trực tiếp thông qua form thiết kế của website mà không cần tài khoản Google, không cần quyền sửa đổi thư mục, và tệp được gom gọn gàng, bảo mật tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-150 p-4 rounded-xl space-y-1.5">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 font-extrabold rounded-lg flex items-center justify-center text-xs">1</div>
              <h5 className="font-bold text-slate-900">Không cần tài khoản</h5>
              <p className="text-xs text-slate-500 leading-normal">
                Bất kỳ ai cũng có thể upload, giúp giảm rào cản đóng góp đến mức tối đa cho sinh viên.
              </p>
            </div>
            <div className="border border-slate-150 p-4 rounded-xl space-y-1.5">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 font-extrabold rounded-lg flex items-center justify-center text-xs">2</div>
              <h5 className="font-bold text-slate-900">Bảo mật tuyệt đối</h5>
              <p className="text-xs text-slate-500 leading-normal">
                Người dùng không biết ID thư mục thực, không có quyền xóa hay chỉnh sửa các tệp của người khác đã đăng.
              </p>
            </div>
            <div className="border border-slate-150 p-4 rounded-xl space-y-1.5">
              <div className="w-8 h-8 bg-blue-100 text-blue-700 font-extrabold rounded-lg flex items-center justify-center text-xs">3</div>
              <h5 className="font-bold text-slate-900">Tự động gắn thông tin</h5>
              <p className="text-xs text-slate-500 leading-normal">
                Tên, email của thành viên đóng góp và mô tả tệp sẽ tự động được ghi nhận thẳng vào metadata của tệp Drive.
              </p>
            </div>
          </div>

          {/* Copyable code instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center">
                <Code className="w-4 h-4 mr-1 text-slate-400" />
                Đoạn mã Google Apps Script (Copy & triển khai)
              </span>
              <button
                onClick={() => copyToClipboard(scriptCode, 1)}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200"
              >
                {copiedIndex === 1 ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã copy!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-950 max-h-[250px] scrollbar-thin">
              {scriptCode}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'native' && (
        <div className="space-y-5 animate-fade-in text-sm">
          <div className="p-4.5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-indigo-800 flex items-center">
              <Layers className="w-4 h-4 mr-1.5" />
              Giải pháp không code: Google Drive "Yêu cầu tệp" (File Requests)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Google Drive cung cấp một tính năng cực kỳ bảo mật và hữu ích mang tên **File Requests (Yêu cầu tệp)**. Nguyễn Huy có thể tạo một liên kết thu thập tệp mà không cần viết bất kỳ dòng code nào. Người đóng góp chỉ cần nhấn vào link và tải tệp lên thẳng Drive của bạn.
            </p>
          </div>

          <div className="space-y-3.5">
            <h5 className="font-bold text-slate-900 uppercase text-xs tracking-wider">Cách thiết lập trên Google Drive:</h5>
            <ol className="space-y-2.5 list-decimal list-inside text-slate-600 pl-1.5">
              <li>Mở **Google Drive** của bạn (`nguyenhuy.thudaumot@gmail.com`).</li>
              <li>Nhấp chuột phải vào thư mục bạn muốn nhận file và chọn **"Yêu cầu tệp" (File request)**.</li>
              <li>Nhập mô tả yêu cầu (Ví dụ: *"Đóng góp slide thuyết trình ICTC"*). Nhấn **Tiếp tục**.</li>
              <li>Google Drive sẽ tạo cho bạn một đường liên kết có dạng: `https://upload.drive.google.com/drive-open?...`</li>
              <li>Dán đường liên kết này vào phần cấu hình Folder của **ICTC Share & Design**!</li>
            </ol>
          </div>

          <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl flex items-start space-x-3 text-xs leading-normal text-slate-600">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-yellow-800">Đánh giá đặc điểm:</p>
              <p>Giải pháp này hỗ trợ tệp dung lượng cực lớn (lên tới 10GB). Tuy nhiên, nhược điểm là quá trình tải tệp diễn ra trên giao diện của Google chứ không phải ngay bên trong form website của bạn, làm giảm tính liền mạch của trải nghiệm người dùng.</p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'api' && (
        <div className="space-y-5 animate-fade-in text-sm">
          <div className="p-4.5 bg-purple-50 border border-purple-100 rounded-2xl space-y-2.5">
            <h4 className="font-bold text-purple-800 flex items-center">
              <FileUp className="w-4 h-4 mr-1.5" />
              Giải pháp tích hợp sâu: Google Drive Rest API v3 (Sử dụng OAuth 2.0)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Sử dụng luồng xác thực Google OAuth 2.0 client-side. Khi thành viên nhấp đóng góp, ứng dụng sẽ yêu cầu quyền ghi tạm thời `https://www.googleapis.com/auth/drive.file` đối với tài khoản Google Drive của họ để tạo và chia sẻ file đó vào thư mục chung của bạn.
            </p>
          </div>

          <div className="border border-slate-150 p-4.5 rounded-2xl space-y-3">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Ưu & Nhược điểm kỹ thuật:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50 space-y-1">
                <p className="font-bold text-emerald-800">Ưu điểm:</p>
                <p className="text-slate-500 leading-normal">Tệp được tạo trực tiếp từ tài khoản Google của chính thành viên đóng góp nên dung lượng lưu trữ của Nguyễn Huy không bị ảnh hưởng (tệp được chia sẻ gián tiếp).</p>
              </div>
              <div className="bg-red-50/30 p-3 rounded-xl border border-red-100/50 space-y-1">
                <p className="font-bold text-red-800">Nhược điểm:</p>
                <p className="text-slate-500 leading-normal">Thành viên bắt buộc phải có tài khoản Google, phải chấp nhận các quyền truy cập ứng dụng (OAuth consent screen), gây lo ngại về quyền riêng tư đối với một số người dùng.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy Link reference to official tutorials */}
      <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <span className="font-semibold flex items-center text-slate-700">
          <HelpCircle className="w-4 h-4 mr-1.5 text-slate-400" />
          Cần hỗ trợ tích hợp trực tiếp lên Google Drive thực tế của bạn?
        </span>
        <a 
          href="https://developers.google.com/apps-script/guides/web" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white hover:bg-slate-100 text-blue-600 font-bold rounded-xl border border-slate-200 flex items-center shrink-0 shadow-xs transition-colors"
        >
          <span>Tài liệu Google Apps Script</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
        </a>
      </div>
    </div>
  );
};
