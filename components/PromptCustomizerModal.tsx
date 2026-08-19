import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Copy, Check, Sliders, Users, MessageSquare } from 'lucide-react';
import { AIPrompt } from '../types';

interface PromptCustomizerModalProps {
  promptItem: AIPrompt;
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

export const PromptCustomizerModal: React.FC<PromptCustomizerModalProps> = ({
  promptItem,
  isOpen,
  onClose,
  onCopySuccess
}) => {
  if (!isOpen || !promptItem) return null;

  const [audience, setAudience] = useState<string>('Sinh viên');
  const [tone, setTone] = useState<string>('Sáng tạo & Dễ hiểu');
  const [context, setContext] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate tailored prompt
  const generatedPrompt = `[DÀNH CHO: ${audience.toUpperCase()}]
[TÔNG GIỌNG: ${tone}]
${context ? `[NGỮ CẢNH BỔ SUNG: ${context}]\n` : ''}
${promptItem.promptText}

---
YÊU CẦU ĐẦU RA:
- Trả lời bằng tiếng Việt chuẩn xác, mạch lạc.
- Sử dụng danh sách đánh dấu đầu dòng nếu có nhiều ý chính.
- Đưa ra ví dụ minh họa cụ thể phù hợp cho ${audience}.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    if (onCopySuccess) onCopySuccess('Đã sao chép AI Prompt đã được tinh chỉnh vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">Trình tinh chỉnh AI Prompt Thông minh</h3>
              <p className="text-xs text-slate-400 font-medium">Tùy biến đối tượng, tông giọng & ngữ cảnh trước khi sử dụng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customizer Controls */}
        <div className="p-6 space-y-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Audience */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1 mb-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Đối tượng tiếp nhận:</span>
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Sinh viên">Sinh viên / Học sinh</option>
                <option value="Giảng viên">Giảng viên / Nghiên cứu sinh</option>
                <option value="Designer / Đồ họa">Designer / Đồ họa viên</option>
                <option value="Doanh nghiệp">Doanh nghiệp / Quản lý</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="text-xs font-bold text-slate-700 flex items-center space-x-1 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>Tông giọng câu trả lời:</span>
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="Sáng tạo & Dễ hiểu">Sáng tạo & Dễ hiểu</option>
                <option value="Trang trọng & Học thuật">Trang trọng & Học thuật</option>
                <option value="Súc tích & Trọng tâm">Súc tích & Trọng tâm</option>
                <option value="Chi tiết Hướng dẫn theo bước">Chi tiết & Hướng dẫn từng bước</option>
              </select>
            </div>
          </div>

          {/* Context Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Bổ sung ngữ cảnh dự án/bài tập của bạn (Không bắt buộc):</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="VD: Bài thuyết trình chuyên ngành CNTT về Điện toán đám mây..."
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generated Output Preview */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Kết quả Prompt đã tinh chỉnh:</span>
            <button
              onClick={handleCopy}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                copied ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép Prompt này'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 text-purple-200 font-mono text-xs rounded-2xl max-h-56 overflow-y-auto whitespace-pre-wrap border border-slate-800 leading-relaxed">
            {generatedPrompt}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
