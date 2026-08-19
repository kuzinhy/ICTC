import React, { useState } from 'react';
import { 
  Camera, Sparkles, Copy, Check, Upload, Wand2, 
  Heart, Layers, HelpCircle, FileText, Search, Plus, X
} from 'lucide-react';
import { User } from '../types';
import { useToast } from '../context/ToastContext';

interface PersonalPhotoPromptHubProps {
  currentUser: User | null;
  onRequireAuth?: (reason: string) => void;
}

export interface PersonalPhotoPromptItem {
  id: string;
  title: string;
  category: 'Doanh nhân' | 'Điện ảnh' | '3D & Anime' | 'Thời trang' | 'Cổ điển / Vintage' | 'Nghệ thuật & Hội họa' | 'Cyberpunk & Sci-Fi';
  description: string;
  promptTemplate: string;
  negativePrompt?: string;
  recommendedTool: 'ChatGPT (GPT-4o)' | 'Midjourney v6' | 'Claude 3.5' | 'Gemini Advanced';
  tips: string[];
  likesCount: number;
  author: string;
  imageUrl: string;
}

const INITIAL_PERSONAL_PROMPTS: PersonalPhotoPromptItem[] = [
  {
    id: 'p1',
    title: 'Chân dung Doanh nhân & Lịch lãm (Corporate Headshot)',
    category: 'Doanh nhân',
    description: 'Biến ảnh selfie thông thường thành bức ảnh chân dung doanh nhân chuyên nghiệp, lịch thiệp trên nền văn phòng mờ ảo.',
    promptTemplate: 'Act as a professional portrait photographer. Using the uploaded photo of my face, generate a hyper-realistic corporate executive headshot. Subject wearing a sharp dark navy tailored blazer with a crisp white shirt. Natural warm studio lighting, soft key light, elegant modern office interior blurred background (bokeh), professional posture, confident and friendly expression, 8k resolution, shot on 85mm lens, f/1.8, photorealistic --ar 4:5',
    recommendedTool: 'ChatGPT (GPT-4o)',
    tips: [
      'Tải ảnh chân dung rõ mặt, ánh sáng đều lên ChatGPT (GPT-4o).',
      'Copy đoạn prompt trên và dán kèm yêu cầu.',
      'Yêu cầu AI giữ nguyên nét mặt đặc trưng của bạn.'
    ],
    likesCount: 142,
    author: 'Nguyễn Huy (ICTC)',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p2',
    title: 'Phong cách Điện ảnh Hollywood (Cinematic Moody Portrait)',
    category: 'Điện ảnh',
    description: 'Tạo hiệu ứng ánh sáng điện ảnh kịch tính với tông màu teal & orange, phong cách phim bom tấn Hollywood.',
    promptTemplate: 'Transform the uploaded face into a cinematic moody portrait. Dramatic neon and shadow lighting (teal and orange color grading), cinematic atmosphere, wearing stylish contemporary streetwear, moody expression, shot on anamorphic lens, film grain, photorealistic, masterful composition, 8k --ar 16:9',
    recommendedTool: 'Midjourney v6',
    tips: [
      'Thích hợp dùng làm ảnh bìa hoặc ảnh đại diện cá tính.',
      'Đảm bảo ảnh gốc không bị tối quá để AI giữ chi tiết gương mặt.'
    ],
    likesCount: 98,
    author: 'Huy Design',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p3',
    title: 'Avatar Hoạt hình 3D Pixar / Disney Dễ Thương',
    category: '3D & Anime',
    description: 'Biến hình thành nhân vật hoạt hình 3D Pixar cực kỳ sống động, đáng yêu với đôi mắt lớn và biểu cảm sinh động.',
    promptTemplate: 'Convert the person in the uploaded image into a high-end 3D animated character in Pixar and Disney animation style. Expressive big friendly eyes, detailed stylized hair, warm vibrant lighting, studio clay render style, cute and charming expression, solid soft pastel background, 8k, Unreal Engine 5 render',
    recommendedTool: 'ChatGPT (GPT-4o)',
    tips: [
      'Rất được ưa chuộng làm avatar Facebook, Zalo, TikTok.',
      'Bạn có thể yêu cầu đổi màu áo hoặc thêm phụ kiện kính mắt.'
    ],
    likesCount: 215,
    author: 'Đội ngũ Sáng tạo ICTC',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p4',
    title: 'Thời trang Lookbook & Streetwear Tối giản',
    category: 'Thời trang',
    description: 'Tạo bối cảnh chụp ảnh lookbook thời trang đường phố cao cấp như các người mẫu tạp chí Vogue.',
    promptTemplate: 'High-end fashion lookbook photography of the person in the uploaded photo. Editorial style, wearing minimalist luxury autumn streetwear, walking down a clean European urban street during golden hour, natural posing, high fashion magazine aesthetic, sharp focus, 8k resolution',
    recommendedTool: 'Claude 3.5',
    tips: [
      'Phù hợp với các bạn trẻ yêu thích thời trang và nhiếp ảnh đường phố.',
      'Kết hợp với ảnh toàn thân hoặc nửa người để đạt kết quả tốt nhất.'
    ],
    likesCount: 87,
    author: 'Thành viên ICTC',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p5',
    title: 'Hoài niệm Thập niên 90 (Vintage Film Photo)',
    category: 'Cổ điển / Vintage',
    description: 'Hiệu ứng ảnh phim nhựa cổ điển thập niên 90 với hạt film hoài niệm, màu sắc ấm áp và ánh sáng dịu nhẹ.',
    promptTemplate: 'A nostalgic 1990s vintage film photograph of the person in the uploaded image. Authentic retro aesthetic, warm analogue color palette, subtle light leaks, soft focus edges, shot on vintage 35mm film camera (Kodak Portra 400), authentic grain, timeless vibe',
    recommendedTool: 'ChatGPT (GPT-4o)',
    tips: [
      'Tạo cảm giác hoài niệm, sâu lắng và nghệ thuật.',
      'Có thể yêu cầu thêm bối cảnh quán cà phê cũ hoặc góc phố xưa.'
    ],
    likesCount: 110,
    author: 'Nguyễn Huy',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p6',
    title: 'Chân dung Sơn dầu Nghệ thuật Phục Hưng (Renaissance Oil Painting)',
    category: 'Nghệ thuật & Hội họa',
    description: 'Biến bức ảnh cá nhân thành kiệt tác tranh sơn dầu cổ điển theo phong cách danh họa Phục Hưng.',
    promptTemplate: 'A masterpiece oil painting portrait of the person in the uploaded image in the style of 17th-century Renaissance oil painting (Rembrandt style). Dramatic chiaroscuro lighting, rich textured canvas brushstrokes, deep moody background, elegant historic attire, museum-quality fine art',
    recommendedTool: 'Midjourney v6',
    tips: [
      'Tạo ấn tượng cực mạnh với nét đẹp nghệ thuật cổ điển.',
      'Thích hợp làm tranh treo tường hoặc ảnh đại diện độc đáo.'
    ],
    likesCount: 156,
    author: 'Trần Văn Minh',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'p7',
    title: 'Cyberpunk Tương lai & Ánh sáng Neon Đô thị (Sci-Fi Portrait)',
    category: 'Cyberpunk & Sci-Fi',
    description: 'Hòa mình vào thế giới tương lai Cyberpunk với ánh đèn neon rực rỡ, áo khoác công nghệ và không gian viễn tưởng.',
    promptTemplate: 'A futuristic cyberpunk portrait of the person in the uploaded photo. Cybernetic enhancements, glowing neon reflections on the face, futuristic urban night city background with flying cars and holographic ads, cinematic cyberpunk color grading, hyper-detailed, 8k',
    recommendedTool: 'ChatGPT (GPT-4o)',
    tips: [
      'Màu sắc rực rỡ, mang phong cách khoa học viễn tưởng hiện đại.',
      'Rất phù hợp cho game thủ và người yêu thích công nghệ.'
    ],
    likesCount: 174,
    author: 'Huy AI',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop'
  }
];

export const PersonalPhotoPromptHub: React.FC<PersonalPhotoPromptHubProps> = ({
  currentUser,
  onRequireAuth
}) => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [prompts, setPrompts] = useState<PersonalPhotoPromptItem[]>(() => {
    const saved = localStorage.getItem('ictc_personal_photo_prompts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PERSONAL_PROMPTS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewingPrompt, setViewingPrompt] = useState<PersonalPhotoPromptItem | null>(null);

  // Contribute Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newPromptForm, setNewPromptForm] = useState({
    title: '',
    category: 'Doanh nhân' as PersonalPhotoPromptItem['category'],
    description: '',
    promptTemplate: '',
    recommendedTool: 'ChatGPT (GPT-4o)' as PersonalPhotoPromptItem['recommendedTool'],
    tips: '',
    imageUrl: ''
  });

  // Custom Generator State
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Chân dung Doanh nhân & Lịch lãm');
  const [customPromptOutput, setCustomPromptOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toastSuccess('Đã sao chép câu lệnh prompt thành công!', 'Sao chép Prompt');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = prompts.map(p => p.id === id ? { ...p, likesCount: p.likesCount + 1 } : p);
    setPrompts(updated);
    localStorage.setItem('ictc_personal_photo_prompts', JSON.stringify(updated));
    toastSuccess('Đã thích câu lệnh này!', 'Thả tim');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn tệp hình ảnh hợp lệ!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImagePreview(event.target?.result as string);
        toastSuccess('Đã tải ảnh cá nhân lên thành công!', 'Tải ảnh');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCustomPrompt = () => {
    if (!uploadedImagePreview) {
      toastInfo('Vui lòng tải lên bức ảnh cá nhân của bạn trước để tạo prompt tùy chỉnh!', 'Chưa có ảnh');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const basePrompt = prompts.find(p => p.title === selectedStyle)?.promptTemplate || prompts[0].promptTemplate;
      const enhanced = `[Attached Image URL / Reference]: Use the uploaded personal portrait as the exact face and identity reference. ${basePrompt}, ultra-detailed facial consistency, natural skin texture preservation, professional lighting harmony --v 6.0`;
      setCustomPromptOutput(enhanced);
      setIsGenerating(false);
      toastSuccess('Đã tạo câu lệnh tối ưu hóa cho bức ảnh của bạn!', 'Thành công');
    }, 600);
  };

  const handleSubmitNewPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Vui lòng đăng nhập để đóng góp prompt ảnh cá nhân cho cộng đồng!');
      return;
    }
    if (!newPromptForm.title.trim() || !newPromptForm.promptTemplate.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung prompt!');
      return;
    }

    const newItem: PersonalPhotoPromptItem = {
      id: `p-user-${Date.now()}`,
      title: newPromptForm.title.trim(),
      category: newPromptForm.category,
      description: newPromptForm.description.trim() || 'Prompt sáng tạo cá nhân hóa từ thành viên ICTC.',
      promptTemplate: newPromptForm.promptTemplate.trim(),
      recommendedTool: newPromptForm.recommendedTool,
      tips: newPromptForm.tips ? newPromptForm.tips.split('\n').filter(Boolean) : ['Giữ nguyên tỉ lệ ảnh gốc', 'Sử dụng ảnh có độ nét cao'],
      likesCount: 1,
      author: currentUser.displayName,
      imageUrl: newPromptForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'
    };

    const updated = [newItem, ...prompts];
    setPrompts(updated);
    localStorage.setItem('ictc_personal_photo_prompts', JSON.stringify(updated));
    setIsSubmitModalOpen(false);
    setNewPromptForm({ title: '', category: 'Doanh nhân', description: '', promptTemplate: '', recommendedTool: 'ChatGPT (GPT-4o)', tips: '', imageUrl: '' });
    toastSuccess('Đã đóng góp prompt mới thành công!', 'Đóng góp');
  };

  const filteredPrompts = prompts.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.promptTemplate.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-violet-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Thư viện Prompt Mẫu • Ảnh Cá Nhân Đỉnh Cao</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Kho Thư Viện Prompt Ảnh Cá Nhân Chuyên Sâu
          </h1>
          <p className="text-base sm:text-lg text-violet-100/90 leading-relaxed">
            Khám phá bộ sưu tập hàng chục câu lệnh mẫu kèm ảnh minh họa trực quan. Chọn ngay phong cách yêu thích hoặc tự tải ảnh lên để biến hóa bức ảnh chân dung của bạn thành tác phẩm nghệ thuật.
          </p>
          <div className="pt-2 flex items-center space-x-4">
            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Vui lòng đăng nhập để đóng góp prompt!');
                } else {
                  setIsSubmitModalOpen(true);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Đóng Góp Prompt Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Custom Photo Prompt Generator Section */}
      <div className="bg-white rounded-3xl border border-slate-200/85 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Wand2 className="w-6 h-6 text-violet-600" />
              <span>Trình Tạo Prompt Biến Hóa Ảnh Cá Nhân Nhanh</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Tải ảnh của bạn lên, chọn phong cách mong muốn và nhận ngay bộ lệnh chuẩn xác.</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100">
            <Camera className="w-4 h-4" />
            <span>Hỗ trợ ChatGPT & Midjourney</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">1. Tải ảnh chân dung cá nhân của bạn</label>
              <div 
                onClick={() => document.getElementById('personal-photo-upload')?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-violet-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-violet-50/30 group"
              >
                <input 
                  id="personal-photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                {uploadedImagePreview ? (
                  <div className="space-y-3">
                    <img src={uploadedImagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-2xl mx-auto shadow-md border border-slate-200" />
                    <p className="text-xs font-medium text-emerald-600 flex items-center justify-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã tải ảnh thành công! Bấm để đổi ảnh khác</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Bấm để tải ảnh hoặc kéo thả vào đây</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (Tối ưu ảnh rõ mặt)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">2. Chọn phong cách nghệ thuật mong muốn</label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {prompts.map(p => (
                  <option key={p.id} value={p.title}>{p.title} ({p.category})</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateCustomPrompt}
              disabled={isGenerating}
              className="w-full py-3.5 px-6 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-200 transition-all flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang tổng hợp Prompt AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Tạo Prompt Tối Ưu Ngay</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-inner flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Kết quả Prompt AI chuyên sâu</span>
                {customPromptOutput && (
                  <button
                    onClick={() => handleCopy(customPromptOutput, 'custom-out')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-violet-600/30 hover:bg-violet-600 text-violet-200 hover:text-white text-xs font-semibold transition-colors border border-violet-500/30"
                  >
                    {copiedId === 'custom-out' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'custom-out' ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                )}
              </div>

              {customPromptOutput ? (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-sm text-violet-200 leading-relaxed whitespace-pre-wrap">
                  {customPromptOutput}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <FileText className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm font-medium">Hãy tải ảnh của bạn lên và bấm "Tạo Prompt Tối Ưu Ngay" để nhận câu lệnh hoàn chỉnh.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-2">
              <p className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Hướng dẫn sử dụng nhanh trên ChatGPT:</span>
              </p>
              <ol className="text-xs text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
                <li>Mở ChatGPT (GPT-4o) hoặc Claude 3.5 Sonnet.</li>
                <li>Đính kèm bức ảnh chân dung cá nhân của bạn vào khung chat.</li>
                <li>Dán đoạn prompt vừa tạo ở trên và gửi đi để AI tái tạo ảnh.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Thư Viện Prompt Mẫu Chọn Lọc ({filteredPrompts.length})</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">Kèm ảnh minh họa thực tế</span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Doanh nhân', 'Điện ảnh', '3D & Anime', 'Thời trang', 'Cổ điển / Vintage', 'Nghệ thuật & Hội họa', 'Cyberpunk & Sci-Fi'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'All' ? 'Tất cả danh mục' : cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm prompt mẫu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Prompts Grid with Illustration Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.map(item => (
          <div 
            key={item.id}
            onClick={() => setViewingPrompt(item)}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-lg hover:shadow-xl transition-all p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              {/* Illustration Image & Header Badge */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-md">
                    {item.recommendedTool}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="relative bg-slate-900 text-slate-200 rounded-2xl p-3.5 font-mono text-xs leading-relaxed max-h-24 overflow-y-auto border border-slate-800">
                <p className="line-clamp-3">{item.promptTemplate}</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleLike(item.id, e)}
                  className="flex items-center space-x-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{item.likesCount}</span>
                </button>
                <span className="text-xs text-slate-400">| {item.author}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStyle(item.title);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors"
                  title="Dùng mẫu này"
                >
                  Dùng mẫu
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.promptTemplate, item.id);
                  }}
                  className="inline-flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md shadow-violet-200 transition-all"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Details Modal with Illustration */}
      {viewingPrompt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingPrompt(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Illustration Image */}
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
              <img 
                src={viewingPrompt.imageUrl} 
                alt={viewingPrompt.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold">
                  {viewingPrompt.category}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {viewingPrompt.recommendedTool}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{viewingPrompt.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{viewingPrompt.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nội dung Câu lệnh Prompt:</label>
              <div className="bg-slate-900 text-violet-200 p-4 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 select-all">
                {viewingPrompt.promptTemplate}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mẹo tối ưu chất lượng:</label>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {viewingPrompt.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Tác giả: <strong className="text-slate-800">{viewingPrompt.author}</strong></span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedStyle(viewingPrompt.title);
                    setViewingPrompt(null);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition-colors"
                >
                  Sử dụng mẫu này
                </button>
                <button
                  onClick={() => handleCopy(viewingPrompt.promptTemplate, viewingPrompt.id)}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao chép Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit New Prompt Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-slate-900">Đóng Góp Prompt Mẫu Ảnh Cá Nhân</h2>
              <p className="text-xs text-slate-500 mt-1">Chia sẻ câu lệnh sáng tạo của bạn để giúp cộng đồng ICTC tạo nên những bức ảnh tuyệt đẹp.</p>
            </div>

            <form onSubmit={handleSubmitNewPrompt} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tiêu đề phong cách</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chân dung phong cách Cyberpunk 2077..."
                  value={newPromptForm.title}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Danh mục</label>
                  <select
                    value={newPromptForm.category}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="Doanh nhân">Doanh nhân</option>
                    <option value="Điện ảnh">Điện ảnh</option>
                    <option value="3D & Anime">3D & Anime</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Cổ điển / Vintage">Cổ điển / Vintage</option>
                    <option value="Nghệ thuật & Hội họa">Nghệ thuật & Hội họa</option>
                    <option value="Cyberpunk & Sci-Fi">Cyberpunk & Sci-Fi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Công cụ khuyên dùng</label>
                  <select
                    value={newPromptForm.recommendedTool}
                    onChange={(e) => setNewPromptForm({ ...newPromptForm, recommendedTool: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    <option value="ChatGPT (GPT-4o)">ChatGPT (GPT-4o)</option>
                    <option value="Midjourney v6">Midjourney v6</option>
                    <option value="Claude 3.5">Claude 3.5</option>
                    <option value="Gemini Advanced">Gemini Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Link ảnh minh họa (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPromptForm.imageUrl}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="VD: Tạo hiệu ứng ánh sáng neon lung linh..."
                  value={newPromptForm.description}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nội dung Prompt (tiếng Anh hoặc tiếng Việt)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập câu lệnh prompt chuẩn..."
                  value={newPromptForm.promptTemplate}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, promptTemplate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mẹo tối ưu (mỗi dòng 1 mẹo)</label>
                <textarea
                  rows={2}
                  placeholder="Mẹo 1&#10;Mẹo 2"
                  value={newPromptForm.tips}
                  onChange={(e) => setNewPromptForm({ ...newPromptForm, tips: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-lg transition-all"
                >
                  Đăng Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
