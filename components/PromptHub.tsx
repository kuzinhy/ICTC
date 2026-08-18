import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Copy, Check, Heart, ExternalLink, RefreshCw,
  Trash2, Edit, PlayCircle, Layers, CheckSquare, PlusCircle, X,
  Filter, Tag, ChevronLeft, ChevronRight, Bookmark, ArrowUpRight,
  Palette, Scale, ShieldCheck, Maximize2, LayoutGrid, Columns,
  Download, Image as ImageIcon, Ratio, Eye, Share2, Flag,
  Crown, Lock
} from 'lucide-react';
import { AIPrompt, User } from '../types';
import { VipUpgradeModal } from './VipUpgradeModal';
import { INITIAL_AI_PROMPTS, PROMPT_CATEGORIES, DRIVE_PROMPT_FOLDER } from '../data/mockData';
import { optimizePrompt, generateLayoutMockup } from '../lib/gemini';
import { savePromptToDb, deletePromptFromDb } from '../lib/db';
import { scanContentSafety, submitContentReport } from '../lib/contentModeration';
import { VietnamDesignPaletteModal } from './VietnamDesignPaletteModal';
import { LegalComplianceModal } from './LegalComplianceModal';
import { ReportViolationModal } from './ReportViolationModal';
import { useToast } from '../context/ToastContext';

interface PromptHubProps {
  currentUser: User | null;
  selectedSpecialty?: string;
  onRequireAuth?: (reason?: string) => void;
}

const QUICK_TAGS = [
  'Tất cả',
  'Đại hội Đảng',
  'Trống đồng',
  'Chuyển đổi số',
  'Thanh niên Đoàn',
  'Quốc khánh 2/9',
  '20/11',
  '27/2',
  'Hoa sen',
  'An toàn giao thông',
  'Biển đảo',
  'OCOP',
  'Giấy khen',
  'Kỷ yếu'
];

const SAMPLE_PREVIEW_IMAGES = [
  { label: 'Phông Đại hội / Hội nghị Đỏ - Vàng', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Phông Đoàn Thanh niên / Hội nghị Xanh', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hội nghị Cơ quan / Hội trường Đẳng cấp', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Công nghệ / Chuyển đổi số Quốc gia', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Băng rôn Cờ Đỏ Sao Vàng / Quốc khánh', url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Standee Triển lãm Nông nghiệp / Tự nhiên', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Thiệp mời Sang trọng Ép kim Vàng', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Bìa Sổ Kỷ yếu / Học thuật / Bằng khen', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80' }
];

const ITEMS_PER_PAGE = 8;

export const PromptHub: React.FC<PromptHubProps> = ({ currentUser, selectedSpecialty, onRequireAuth }) => {
  const { success: toastSuccess, info: toastInfo, vip: toastVip, error: toastError } = useToast();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedTag, setSelectedTag] = useState<string>('Tất cả');
  const [selectedTool, setSelectedTool] = useState<'All' | 'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini'>('All');
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Custom prompt creator / editor form states
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newTool, setNewTool] = useState<'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini'>('Midjourney');
  const [newCategory, setNewCategory] = useState<string>('Phông Hội Nghị');
  const [newRawPrompt, setNewRawPrompt] = useState('');
  const [newOptimizedPrompt, setNewOptimizedPrompt] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Playground Sandbox states
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxTool, setSandboxTool] = useState<'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini'>('Midjourney');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  
  // Mockup Canvas States (Gemini analysis output)
  const [mockupResult, setMockupResult] = useState<{
    colors: string[];
    layoutType: string;
    vibes: string[];
    elements: string[];
    fontFamily?: string;
  } | null>(null);

  // Lightbox Modal state
  const [lightboxPrompt, setLightboxPrompt] = useState<AIPrompt | null>(null);

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedRawId, setCopiedRawId] = useState<string | null>(null);
  const [copiedSandbox, setCopiedSandbox] = useState(false);

  // Modals
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'ip_policy' | 'community_rules' | 'ai_ethics' | 'dmca_takedown'>('ai_ethics');
  const [reportingItem, setReportingItem] = useState<{ id: string; title: string } | null>(null);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  // Load prompts from local storage and sync
  useEffect(() => {
    const saved = localStorage.getItem('ictc_ai_prompts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_AI_PROMPTS.length) {
          // Normalize previewImageUrl
          const normalized = parsed.map((p: any) => ({
            ...p,
            previewImageUrl: p.previewImageUrl || p.previewUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
            optimizedPrompt: p.optimizedPrompt || p.rawPrompt || '',
            rawPrompt: p.rawPrompt || p.description || p.title || ''
          }));
          setPrompts(normalized);
        } else {
          setPrompts(INITIAL_AI_PROMPTS);
          localStorage.setItem('ictc_ai_prompts', JSON.stringify(INITIAL_AI_PROMPTS));
        }
      } catch (e) {
        setPrompts(INITIAL_AI_PROMPTS);
      }
    } else {
      setPrompts(INITIAL_AI_PROMPTS);
      localStorage.setItem('ictc_ai_prompts', JSON.stringify(INITIAL_AI_PROMPTS));
    }
  }, []);

  const savePrompts = (updatedPrompts: AIPrompt[]) => {
    setPrompts(updatedPrompts);
    localStorage.setItem('ictc_ai_prompts', JSON.stringify(updatedPrompts));
  };

  const handleCopyText = (text: string, id: string | 'sandbox', type: 'optimized' | 'raw' = 'optimized') => {
    if (id !== 'sandbox') {
      const promptObj = prompts.find(p => p.id === id);
      if (promptObj?.isVip) {
        if (!currentUser) {
          if (onRequireAuth) {
            onRequireAuth('Mẫu câu lệnh AI này được gắn nhãn VIP. Vui lòng đăng nhập để kiểm tra quyền sao chép!');
          }
          return;
        }
        if (currentUser.role !== 'Admin' && !currentUser.isVip) {
          setIsVipModalOpen(true);
          return;
        }
      }
    }

    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập thành viên miễn phí để sao chép câu lệnh AI Prompt chuẩn!');
      }
      return;
    }

    navigator.clipboard.writeText(text);
    if (id === 'sandbox') {
      setCopiedSandbox(true);
      toastSuccess('Đã sao chép câu lệnh từ AI Sandbox vào clipboard!', 'Sao chép thành công');
      setTimeout(() => setCopiedSandbox(false), 2000);
    } else if (type === 'raw') {
      setCopiedRawId(id);
      toastInfo('Đã sao chép ý tưởng đồ họa tiếng Việt chuẩn vào clipboard!', 'Ý tưởng tiếng Việt');
      setTimeout(() => setCopiedRawId(null), 2000);
    } else {
      setCopiedPromptId(id);
      const promptObj = prompts.find(p => p.id === id);
      if (promptObj?.isVip) {
        toastVip(`Đã sao chép câu lệnh VIP "${promptObj.title}" chất lượng cao!`, 'Đặc quyền VIP');
      } else {
        toastSuccess('Đã sao chép câu lệnh AI Prompt chuẩn vào clipboard!', 'Sao chép thành công');
      }
      setTimeout(() => setCopiedPromptId(null), 2000);
    }
  };

  const handleLike = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth('Vui lòng đăng nhập thành viên để yêu thích Prompt này!');
      }
      return;
    }
    const target = prompts.find(p => p.id === promptId);
    if (target) {
      const updatedItem = { ...target, likesCount: (target.likesCount || 0) + 1 };
      savePromptToDb(updatedItem).catch(err => console.warn("Failed to sync like status to Firestore:", err));
      toastSuccess(`Cảm ơn bạn đã yêu thích câu lệnh "${target.title}"!`, 'Thả tim thành công');
    }
    const updated = prompts.map(p => {
      if (p.id === promptId) {
        return { ...p, likesCount: (p.likesCount || 0) + 1 };
      }
      return p;
    });
    savePrompts(updated);
  };

  // Submit new prompt or edit existing
  const handleSubmitPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRawPrompt) return;

    const tagsArray = newTags 
      ? newTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : ['Thiết kế Việt Nam', newTool, newCategory];

    const authorName = currentUser ? currentUser.displayName : 'Khách vãng lai';
    const authorId = currentUser ? currentUser.id : 'usr-guest';
    const finalImageUrl = newImageUrl.trim() || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';

    if (editingPrompt) {
      // Edit Mode
      const updatedItem: AIPrompt = {
        ...editingPrompt,
        title: newTitle,
        toolType: newTool,
        category: newCategory,
        rawPrompt: newRawPrompt,
        optimizedPrompt: newOptimizedPrompt || newRawPrompt,
        previewImageUrl: finalImageUrl,
        tags: tagsArray
      };
      
      savePromptToDb(updatedItem).catch(err => {
        console.warn("Failed to sync prompt update to Cloud Firestore:", err);
      });

      const updated = prompts.map(p => {
        if (p.id === editingPrompt.id) {
          return updatedItem;
        }
        return p;
      });
      savePrompts(updated);
    } else {
      // Create Mode
      const isAdmin = currentUser?.role === 'Admin';

      // Run safety check
      const safetyCheck = scanContentSafety({
        title: newTitle,
        description: newRawPrompt + " " + newOptimizedPrompt,
        tags: tagsArray,
        author: authorName
      });

      const isAutoFlagged = !safetyCheck.isSafe;

      if (isAutoFlagged) {
        submitContentReport({
          targetId: `prm-custom-${Date.now()}`,
          targetType: 'prompt',
          targetTitle: newTitle,
          reason: `Phát hiện từ khóa nghi vấn (${safetyCheck.matchedKeywords.join(', ')})`,
          details: `Prompt bị tự động gắn cờ kiểm duyệt rủi ro ${safetyCheck.riskLevel.toUpperCase()}.`,
          reporterName: 'Hệ Thống Tự Động (Hidden Scanner)',
          severity: safetyCheck.riskLevel === 'severe' ? 'high' : 'medium',
          autoFlagged: true
        });
      }

      const newPrompt: AIPrompt = {
        id: `prm-custom-${Date.now()}`,
        title: newTitle,
        rawPrompt: newRawPrompt,
        optimizedPrompt: newOptimizedPrompt || newRawPrompt,
        category: newCategory,
        toolType: newTool,
        previewImageUrl: finalImageUrl,
        tags: tagsArray,
        likesCount: 1,
        createdAt: new Date().toISOString().split('T')[0],
        author: authorName,
        authorId: authorId,
        status: (isAdmin && !isAutoFlagged) ? 'Approved' : 'Pending',
        autoFlaggedViolation: isAutoFlagged,
        violationReason: isAutoFlagged ? `Từ khóa nhạy cảm: ${safetyCheck.matchedKeywords.join(', ')}` : undefined
      };

      savePromptToDb(newPrompt).catch(err => {
        console.warn("Failed to sync new prompt to Cloud Firestore:", err);
      });

      savePrompts([newPrompt, ...prompts]);
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setIsSubmitOpen(false);
      setEditingPrompt(null);
      setNewTitle('');
      setNewRawPrompt('');
      setNewOptimizedPrompt('');
      setNewImageUrl('');
      setNewTags('');
    }, 1200);
  };

  const triggerEdit = (prompt: AIPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrompt(prompt);
    setNewTitle(prompt.title);
    setNewTool(prompt.toolType as any);
    setNewCategory(prompt.category);
    setNewRawPrompt(prompt.rawPrompt);
    setNewOptimizedPrompt(prompt.optimizedPrompt);
    setNewImageUrl(prompt.previewImageUrl || (prompt as any).previewUrl || '');
    setNewTags(prompt.tags.join(', '));
    setIsSubmitOpen(true);
  };

  const handleDeletePrompt = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa Prompt này khỏi thư viện?")) return;
    deletePromptFromDb(promptId).catch(err => console.warn("Failed to delete prompt in db:", err));
    const updated = prompts.filter(p => p.id !== promptId);
    savePrompts(updated);
  };

  const handleOptimizePrompt = async () => {
    if (!sandboxInput.trim()) return;
    setIsOptimizing(true);
    try {
      const optimized = await optimizePrompt(sandboxInput, 'Tổng hợp', sandboxTool);
      setPlaygroundOutput(optimized);
    } catch (e) {
      console.error(e);
      setPlaygroundOutput(`Official Vietnamese professional graphic design for ${sandboxInput}, featuring authentic cultural symbols: red and gold gradient, Dong Son bronze drum, blooming lotus, studio lighting, 8k resolution --ar 16:9 --v 6.0`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleVisualizeMockup = async () => {
    const textToAnalyze = playgroundOutput || sandboxInput;
    if (!textToAnalyze.trim()) return;
    setIsVisualizing(true);
    try {
      const result = await generateLayoutMockup(textToAnalyze);
      setMockupResult(result);
    } catch (e) {
      setMockupResult({
        colors: ['#DA251D', '#FFCD00', '#005BAA', '#D4AF37'],
        layoutType: 'Phông Sân Khấu Tiêu Chuẩn 16:9',
        vibes: ['Trang nghiêm', 'Vàng kim', 'Trống đồng', 'Đồ họa Việt Nam'],
        elements: ['Quốc huy / Búa Liềm trung tâm', 'Cờ Đảng & Cờ Tổ quốc bay lượn', 'Hoa sen chìm góc dưới', 'Khoảng trống chữ hội nghị']
      });
    } finally {
      setIsVisualizing(false);
    }
  };

  const sendPromptToSandbox = (prompt: AIPrompt) => {
    setSandboxInput(prompt.rawPrompt);
    setSandboxTool(prompt.toolType as any);
    setPlaygroundOutput(prompt.optimizedPrompt);
    toastInfo(`Đã nạp câu lệnh "${prompt.title}" vào sân chơi AI Sandbox!`, 'AI Sandbox');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const tools = ['All', 'Midjourney', 'Gemini', 'DALL-E 3', 'Stable Diffusion'];

  const filteredPrompts = prompts.filter(prompt => {
    const isVisible = prompt.status === 'Approved' || 
                      (currentUser && (currentUser.role === 'Admin' || currentUser.id === prompt.authorId));

    if (!isVisible) return false;

    const matchesSearch = 
      prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prompt.rawPrompt && prompt.rawPrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prompt.optimizedPrompt && prompt.optimizedPrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prompt.tags && prompt.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesTool = selectedTool === 'All' || prompt.toolType === selectedTool || (selectedTool === 'Gemini' && (prompt.toolType as any) === 'Gemini Imagen 3');
    const matchesCategory = selectedCategory === 'Tất cả' || prompt.category === selectedCategory;
    const matchesTag = selectedTag === 'Tất cả' || (prompt.tags && prompt.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())));

    let matchesSpecialty = true;
    if (selectedSpecialty && selectedSpecialty !== 'all') {
      const allText = `${prompt.title} ${prompt.category} ${prompt.rawPrompt} ${prompt.optimizedPrompt} ${(prompt.tags || []).join(' ')}`.toLowerCase();
      if (selectedSpecialty === 'design') {
        matchesSpecialty = prompt.toolType !== 'Gemini' || /thiết kế|đồ họa|poster|banner|phông|backdrop|avatar|3d|vector|màu sắc|kiến trúc/i.test(allText);
      } else if (selectedSpecialty === 'code') {
        matchesSpecialty = prompt.toolType === 'Gemini' || /code|lập trình|cntt|web|script|python|react|thuật toán|sql|ai/i.test(allText);
      } else if (selectedSpecialty === 'research') {
        matchesSpecialty = /nghiên cứu|học thuật|báo cáo|tiểu luận|luận văn|khoa học|dịch thuật|tóm tắt|phân tích dữ liệu/i.test(allText);
      } else if (selectedSpecialty === 'marketing') {
        matchesSpecialty = /marketing|truyền thông|slogan|quảng cáo|content|chiến dịch|thương hiệu|bán hàng/i.test(allText);
      } else if (selectedSpecialty === 'youth') {
        matchesSpecialty = prompt.category === 'Phông Hội Nghị' || /đoàn|hội|thanh niên|tình nguyện|sinh viên|phong trào|đại hội|mùa hè xanh/i.test(allText);
      }
    }

    return matchesSearch && matchesTool && matchesCategory && matchesTag && matchesSpecialty;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTag, selectedTool, selectedSpecialty]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE) || 1;
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Helper for Tool Badges styling
  const getToolBadge = (tool: string) => {
    switch (tool) {
      case 'Midjourney':
      case 'Midjourney v6':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Midjourney v6' };
      case 'Gemini':
      case 'Gemini Imagen 3':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Gemini Imagen 3' };
      case 'DALL-E 3':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'DALL-E 3' };
      case 'Stable Diffusion':
      case 'Stable Diffusion XL':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Stable Diffusion XL' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: tool || 'AI Tool' };
    }
  };

  // Helper for Category Palette chips
  const getCategoryThemeColors = (category: string) => {
    switch (category) {
      case 'Phông Hội Nghị':
        return ['#DA251D', '#FFCD00', '#8B0000', '#D4AF37'];
      case 'Băng Rôn & Khẩu Hiệu':
        return ['#E60000', '#FFFF00', '#005BAA', '#FFFFFF'];
      case 'Banner Sự Kiện':
        return ['#005BAA', '#00A859', '#7928CA', '#00D2FF'];
      case 'Standee Triển Lãm':
        return ['#00843D', '#F4B223', '#2C3E50', '#ECF0F1'];
      case 'Thiệp Mời & Giấy Mời':
        return ['#1A2B4C', '#D4AF37', '#800020', '#FAF9F6'];
      case 'Poster & Infographic':
        return ['#E63946', '#1D3557', '#457B9D', '#F1FAEE'];
      case 'Bìa Sổ & Kỷ Yếu':
        return ['#7A1C1C', '#C5A059', '#1E293B', '#F8FAFC'];
      default:
        return ['#DA251D', '#FFCD00', '#005BAA', '#D4AF37'];
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="prompt-hub-root">
      
      {/* Header Banner - Kho Thư Viện Mở Không Giới Hạn */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider text-amber-200 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kho Thư Viện Mở • Cập nhật liên tục</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Thư Viện AI Prompts Thiết Kế Chuẩn Việt Nam
            </h1>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed font-medium">
              Thiết kế trực quan <strong className="text-white">1 bên là Prompt lệnh chi tiết, 1 bên là Ảnh minh họa thực tế</strong>. Chuẩn hóa toàn bộ biểu tượng Quốc huy, cờ Đảng, cờ Tổ quốc, hoa sen và trống đồng Đông Sơn cho Midjourney v6, Gemini Imagen 3, DALL-E 3 & Stable Diffusion.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-rose-100">
              <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Layers className="w-4 h-4 text-amber-300" />
                <span>{prompts.length}+ Mẫu câu lệnh sẵn có</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Ratio className="w-4 h-4 text-emerald-300" />
                <span>Chuẩn tỷ lệ: 16:9 • 3:1 • 1:2 • 1:1</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-sky-300" />
                <span>100% Chuẩn thuần phong mỹ tục</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0 z-10">
            <a
              href={DRIVE_PROMPT_FOLDER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-sm rounded-2xl transition-all duration-200 backdrop-blur-md shadow-sm"
            >
              <ExternalLink className="w-4 h-4 mr-2 text-amber-200" />
              Mở Drive Prompt
            </a>
            <button
              onClick={() => {
                setEditingPrompt(null);
                setNewTitle('');
                setNewRawPrompt('');
                setNewOptimizedPrompt('');
                setNewImageUrl('');
                setNewTags('');
                setIsSubmitOpen(true);
              }}
              className="flex items-center justify-center px-6 py-3.5 bg-white hover:bg-amber-50 text-red-700 font-extrabold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-black/10 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 mr-2 text-red-600" />
              Đóng góp Prompt mới
            </button>
          </div>
        </div>
      </div>

      {/* Vietnam AI Guidelines & Standards Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quy chuẩn đồ họa:</span>
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl border border-slate-200/80 transition-all font-bold"
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Mã màu & Tỷ lệ chuẩn (16:9, 3:1, 1:2)</span>
          </button>
          <button
            onClick={() => { setLegalTab('ai_ethics'); setIsLegalOpen(true); }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200/80 transition-all font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Đạo đức AI & Biểu trưng Việt Nam</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-[11px] font-bold">Chế độ xem:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'split' 
                  ? 'bg-white text-red-600 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="1 bên là Prompt, 1 bên là Ảnh minh họa"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Thẻ Chia Cột (Side-by-Side)</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white text-red-600 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng lưới thẻ bento"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới (Grid)</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS BAR */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {PROMPT_CATEGORIES.map(category => {
            const count = category === 'Tất cả' 
              ? prompts.filter(p => p.status === 'Approved').length 
              : prompts.filter(p => p.category === category && p.status === 'Approved').length;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedTag('Tất cả');
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-sm shadow-red-500/20'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200'
                }`}
              >
                <span>{category}</span>
                <span className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK TAGS PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 shrink-0 pr-2 border-r border-slate-200">
          <Tag className="w-3.5 h-3.5 text-red-500" />
          <span>Chủ đề nhanh:</span>
        </div>
        {QUICK_TAGS.map(tag => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      {/* MAIN TWO COLUMNS: PLAYGROUND SANDBOX (LEFT) & PROMPT GALLERY (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE AI SANDBOX & PLAYGROUND */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="p-2 bg-red-100/60 rounded-xl text-red-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sân chơi AI & Tối ưu Prompt</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Powered by Google Gemini 2.5</p>
              </div>
            </div>

            {/* Sandbox form input */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-500 uppercase tracking-wider">Mô tả ý tưởng (Tiếng Việt)</label>
                <select
                  value={sandboxTool}
                  onChange={(e) => setSandboxTool(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1 font-bold focus:outline-none"
                >
                  <option value="Midjourney">Midjourney v6</option>
                  <option value="Gemini">Gemini Imagen 3</option>
                  <option value="DALL-E 3">DALL-E 3</option>
                  <option value="Stable Diffusion">Stable Diffusion XL</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="Ví dụ: Phông sân khấu kỷ niệm 80 năm thành lập trường đại học, màu đỏ và vàng kim, hoa sen chìm, trống đồng..."
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-sm leading-relaxed resize-none font-medium"
              />

              {/* Control triggers */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizing || !sandboxInput.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-sm"
                >
                  {isOptimizing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Tối ưu câu lệnh</span>
                </button>

                <button
                  onClick={handleVisualizeMockup}
                  disabled={isVisualizing || (!sandboxInput.trim() && !playgroundOutput.trim())}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
                  title="Dựng bản vẽ mô phỏng"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Dựng Mockup</span>
                </button>
              </div>
            </div>

            {/* AI Output section */}
            {playgroundOutput && (
              <div className="space-y-2.5 text-xs animate-fade-in pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider">Prompt tiếng Anh tối ưu:</h4>
                  <button
                    onClick={() => handleCopyText(playgroundOutput, 'sandbox')}
                    className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center space-x-1"
                  >
                    {copiedSandbox ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copiedSandbox ? 'Đã copy' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-900 text-amber-200 border border-slate-800 rounded-xl leading-relaxed font-mono text-[11px] max-h-[140px] overflow-y-auto no-scrollbar">
                  {playgroundOutput}
                </div>
              </div>
            )}

            {/* MOCKUP VISUALIZATION INTERACTIVE CANVAS */}
            {isVisualizing && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl animate-pulse">
                <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                <p className="text-xs font-bold text-slate-500">AI đang dựng mô phỏng bản vẽ thiết kế...</p>
              </div>
            )}

            {mockupResult && !isVisualizing && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 animate-fade-in text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center space-x-1 text-slate-800">
                    <Layers className="w-4 h-4 text-red-500" />
                    <span className="font-bold text-xs">Bản vẽ phác thảo Layout</span>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[9px] font-bold rounded uppercase">
                    {mockupResult.layoutType}
                  </span>
                </div>

                {/* Colors palette bar */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bảng màu chuẩn</p>
                  <div className="flex gap-2">
                    {mockupResult.colors.map((col, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full h-7 rounded-lg border border-slate-300 shadow-xs" style={{ backgroundColor: col }} />
                        <span className="text-[8px] font-mono text-slate-500 uppercase">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Wireframe Canvas Component */}
                <div className="border border-slate-200 bg-white rounded-xl p-3 space-y-2 shadow-inner">
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[9px] text-slate-400 font-semibold pl-1 italic">layout-preview-stage</span>
                  </div>

                  <div className="space-y-1.5">
                    {mockupResult.elements.map((el, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                          idx === 0 ? 'bg-red-50 border-red-100 text-red-700 font-bold' : 'bg-slate-50 border-slate-200/60 text-slate-600'
                        }`}
                      >
                        <span className="font-semibold text-[10px]">{el}</span>
                        <CheckSquare className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood boards / vibes */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đặc trưng thẩm mỹ</p>
                  <div className="flex flex-wrap gap-1">
                    {mockupResult.vibes.map((vb) => (
                      <span key={vb} className="px-2 py-0.5 bg-slate-200/60 text-slate-700 text-[9px] font-bold rounded">
                        #{vb}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCHABLE PROMPT GALLERY (SIDE-BY-SIDE OR GRID VIEW) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Search */}
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm prompt, từ khóa (Trống đồng, Đại hội, 20/11...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs font-semibold placeholder-slate-400"
              />
            </div>

            {/* Filter by Tool */}
            <div className="overflow-x-auto w-full sm:w-auto flex gap-1 no-scrollbar">
              {tools.map((tl) => (
                <button
                  key={tl}
                  onClick={() => setSelectedTool(tl as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                    selectedTool === tl
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  {tl === 'All' ? 'Mọi công cụ' : tl}
                </button>
              ))}
            </div>
          </div>

          {/* RESULTS SUMMARY BAR */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
            <span>
              Hiển thị <strong className="text-slate-900">{filteredPrompts.length}</strong> tài nguyên AI prompt thiết kế chuẩn Việt Nam
            </span>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
          </div>

          {/* Prompts list */}
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-800 font-bold">Không tìm thấy AI prompt nào phù hợp</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">Hãy thử xóa bộ lọc hoặc tìm kiếm bằng từ khóa khác.</p>
            </div>
          ) : viewMode === 'split' ? (
            /* 1 BÊN LÀ PROMPT, 1 BÊN LÀ ẢNH MINH HỌA ĐI THEO (SPLIT SIDE-BY-SIDE VIEW) */
            <div className="space-y-6">
              {paginatedPrompts.map((prompt) => {
                const isOwner = currentUser && (currentUser.id === prompt.authorId || currentUser.role === 'Admin');
                const toolInfo = getToolBadge(prompt.toolType);
                const themeColors = getCategoryThemeColors(prompt.category);
                const imageUrl = prompt.previewImageUrl || (prompt as any).previewUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                
                return (
                  <div
                    key={prompt.id}
                    className="bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* TOP STATUS BAR */}
                    <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 bg-red-100/70 text-red-700 border border-red-200 text-[10px] font-black rounded-lg uppercase tracking-wider">
                          {prompt.category}
                        </span>
                        <span className={`px-2.5 py-1 border text-[10px] font-bold rounded-lg uppercase tracking-wider ${toolInfo.bg}`}>
                          {toolInfo.label}
                        </span>
                        {prompt.isVip && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center space-x-1 border border-amber-300 shadow-sm">
                            <Crown className="w-3 h-3 fill-white" />
                            <span>VIP</span>
                          </span>
                        )}
                        {prompt.status === 'Pending' && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-extrabold rounded">
                            Chờ duyệt
                          </span>
                        )}
                      </div>

                      {/* Owner controls */}
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-400 font-medium hidden sm:inline">Tác giả: <strong className="text-slate-700 font-semibold">{prompt.author}</strong></span>
                        {isOwner && (
                          <div className="flex space-x-1 shrink-0 ml-2">
                            <button
                              onClick={(e) => triggerEdit(prompt, e)}
                              className="p-1.5 bg-white hover:bg-blue-500 hover:text-white border border-slate-200 rounded-lg transition-colors"
                              title="Sửa prompt"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-500 hover:text-inherit" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePrompt(prompt.id, e)}
                              className="p-1.5 bg-white hover:bg-red-500 hover:text-white border border-slate-200 rounded-lg transition-colors"
                              title="Xóa prompt"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-inherit" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MAIN SPLIT BODY: 1 BÊN LÀ PROMPT, 1 BÊN LÀ ẢNH MINH HỌA */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                      
                      {/* CỘT TRÁI (7/12): PROMPT & THÔNG SỐ KỸ THUẬT */}
                      <div className="md:col-span-7 p-6 space-y-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between">
                        <div className="space-y-3.5">
                          {/* Title */}
                          <h3 className="font-black text-slate-900 text-lg leading-snug tracking-tight">
                            {prompt.title}
                          </h3>

                          {/* RAW VIETNAMESE CONCEPT */}
                          <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-red-600 uppercase text-[10px] tracking-wider flex items-center space-x-1">
                                <Sparkles className="w-3 h-3 text-red-500" />
                                <span>Ý tưởng & Quy chuẩn tiếng Việt:</span>
                              </span>
                              <button
                                onClick={() => handleCopyText(prompt.rawPrompt, prompt.id, 'raw')}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-md border border-slate-200 flex items-center space-x-1 text-[10px] font-bold transition-colors"
                              >
                                {copiedRawId === prompt.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedRawId === prompt.id ? 'Đã chép' : 'Chép ý tưởng'}</span>
                              </button>
                            </div>
                            <p className="text-slate-700 text-xs leading-relaxed font-medium">
                              {prompt.rawPrompt}
                            </p>
                          </div>

                          {/* OPTIMIZED AI PROMPT (CODE BLOCK) */}
                          <div className="relative group/copy">
                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl leading-relaxed text-amber-200/90 font-mono text-[11px] max-h-[160px] overflow-y-auto no-scrollbar space-y-2 shadow-inner">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px]">
                                <span className="font-bold text-amber-400 uppercase tracking-wider">
                                  Câu lệnh AI hoàn chỉnh:
                                </span>
                                <span className="text-slate-400 font-bold uppercase">
                                  {prompt.toolType}
                                </span>
                              </div>
                              <p className="leading-relaxed text-slate-100 selection:bg-red-600 selection:text-white">
                                {prompt.optimizedPrompt}
                              </p>
                            </div>

                            {/* Prominent Copy Button with VIP Protection */}
                            {prompt.isVip && (!currentUser || (currentUser.role !== 'Admin' && !currentUser.isVip)) ? (
                              <button
                                onClick={() => handleCopyText(prompt.optimizedPrompt, prompt.id, 'optimized')}
                                className="absolute bottom-3 right-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl shadow-md flex items-center space-x-1.5 transition-all font-extrabold text-[11px] active:scale-95 border border-amber-400"
                              >
                                <Crown className="w-3.5 h-3.5 fill-white" />
                                <span>Sao chép VIP</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleCopyText(prompt.optimizedPrompt, prompt.id, 'optimized')}
                                className="absolute bottom-3 right-3 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md flex items-center space-x-1.5 transition-all font-bold text-[11px] active:scale-95"
                              >
                                {copiedPromptId === prompt.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-white" />
                                    <span>Đã sao chép!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Sao chép Prompt</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                          <div className="flex flex-wrap gap-1">
                            {prompt.tags && prompt.tags.map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-md text-[11px] transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center space-x-2">
                            {prompt.driveUrl && (
                              <a
                                href={prompt.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1"
                                title="Tải tài nguyên đính kèm cho câu lệnh AI này"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tải tệp đính kèm</span>
                              </a>
                            )}

                            <button
                              onClick={() => sendPromptToSandbox(prompt)}
                              className="px-2.5 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1"
                              title="Tải prompt vào sân chơi AI để thử nghiệm và tinh chỉnh"
                            >
                              <PlayCircle className="w-3.5 h-3.5 text-red-500" />
                              <span>Thử trên AI Sandbox</span>
                            </button>

                            <button
                              onClick={(e) => handleLike(prompt.id, e)}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 rounded-lg font-bold text-[11px] transition-colors"
                            >
                              <Heart className="w-3 h-3 fill-rose-600 stroke-none" />
                              <span>{prompt.likesCount ? prompt.likesCount.toLocaleString() : 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CỘT PHẢI (5/12): ẢNH MINH HỌA ĐI THEO VÀ BẢNG MÀU */}
                      <div className="md:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>Ảnh kết quả AI minh họa:</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Preview Render</span>
                          </div>

                          {/* Image container with zoom overlay */}
                          <div 
                            onClick={() => setLightboxPrompt(prompt)}
                            className="relative group/img cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm aspect-video md:aspect-[4/3] flex items-center justify-center"
                          >
                            <img
                              src={imageUrl}
                              alt={prompt.title}
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 text-white">
                              <span className="text-xs font-bold flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md">
                                <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                                <span>Phóng to xem chi tiết</span>
                              </span>
                              <span className="text-[10px] font-mono bg-red-600/90 px-2 py-1 rounded-lg font-bold">
                                {prompt.toolType}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom visual info: Color palette chips & quick actions */}
                        <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã màu gợi ý:</span>
                            <div className="flex items-center space-x-1.5">
                              {themeColors.map((color, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(color);
                                  }}
                                  title={`Sao chép mã màu ${color}`}
                                  className="w-4 h-4 rounded-full border border-white shadow-xs hover:scale-125 transition-transform"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => setLightboxPrompt(prompt)}
                              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>So sánh Ảnh & Prompt phóng to</span>
                            </button>
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* GRID VIEW (BENTO CARDS) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {paginatedPrompts.map((prompt) => {
                const toolInfo = getToolBadge(prompt.toolType);
                const imageUrl = prompt.previewImageUrl || (prompt as any).previewUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80';
                
                return (
                  <div
                    key={prompt.id}
                    className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div 
                      onClick={() => setLightboxPrompt(prompt)}
                      className="relative cursor-pointer aspect-video bg-slate-900 overflow-hidden group/card"
                    >
                      <img
                        src={imageUrl}
                        alt={prompt.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase shadow-sm">
                          {prompt.category}
                        </span>
                        <span className={`px-2 py-1 text-[9px] font-bold rounded-lg uppercase shadow-sm ${toolInfo.bg}`}>
                          {toolInfo.label}
                        </span>
                        {prompt.isVip && (
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white text-[9px] font-black rounded-lg uppercase shadow-sm flex items-center space-x-0.5 border border-amber-300">
                            <Crown className="w-2.5 h-2.5 fill-white" />
                            <span>VIP</span>
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                        <Maximize2 className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{prompt.title}</h4>
                        <p className="text-slate-500 text-xs line-clamp-2">{prompt.rawPrompt}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        {prompt.isVip && (!currentUser || (currentUser.role !== 'Admin' && !currentUser.isVip)) ? (
                          <button
                            onClick={() => handleCopyText(prompt.optimizedPrompt, prompt.id, 'optimized')}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 border border-amber-400"
                          >
                            <Crown className="w-3.5 h-3.5 fill-white" />
                            <span>Sao Chép VIP</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleCopyText(prompt.optimizedPrompt, prompt.id, 'optimized')}
                            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm active:scale-95"
                          >
                            {copiedPromptId === prompt.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã sao chép!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Sao chép Prompt</span>
                              </>
                            )}
                          </button>
                        )}

                        {prompt.driveUrl && (
                          <a
                            href={prompt.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                            title="Tải tài nguyên đính kèm cho câu lệnh AI này"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tải tệp đính kèm</span>
                          </a>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <span>Tác giả: {prompt.author}</span>
                          <button
                            onClick={(e) => handleLike(prompt.id, e)}
                            className="flex items-center space-x-1 text-rose-600 font-bold"
                          >
                            <Heart className="w-3 h-3 fill-rose-600" />
                            <span>{prompt.likesCount || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/80">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL: XEM PHÓNG TO ẢNH & PROMPT SONG SONG */}
      {lightboxPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Lightbox Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-black rounded-lg uppercase">
                  {lightboxPrompt.category}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-md sm:max-w-xl">
                  {lightboxPrompt.title}
                </h3>
              </div>
              <button
                onClick={() => setLightboxPrompt(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Body: Left is Big Image, Right is Prompt Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto no-scrollbar">
              {/* BIG IMAGE (7/12) */}
              <div className="md:col-span-7 bg-black flex items-center justify-center p-4 relative group">
                <img
                  src={lightboxPrompt.previewImageUrl || (lightboxPrompt as any).previewUrl}
                  alt={lightboxPrompt.title}
                  className="max-h-[60vh] w-auto object-contain rounded-xl shadow-2xl"
                />
                <a
                  href={lightboxPrompt.previewImageUrl || (lightboxPrompt as any).previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-6 right-6 px-3 py-1.5 bg-black/70 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 flex items-center space-x-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Mở ảnh gốc</span>
                </a>
              </div>

              {/* PROMPT DETAILS (5/12) */}
              <div className="md:col-span-5 p-6 space-y-4 bg-slate-50/50 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Thông số AI:</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[10px]">
                      {lightboxPrompt.toolType}
                    </span>
                  </div>

                  {/* Raw Concept */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs space-y-1">
                    <h5 className="font-bold text-red-600 text-[10px] uppercase tracking-wider">Ý tưởng tiếng Việt:</h5>
                    <p className="text-slate-700 leading-relaxed">{lightboxPrompt.rawPrompt}</p>
                  </div>

                  {/* Optimized Prompt */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Câu lệnh tiếng Anh hoàn chỉnh:</span>
                      <button
                        onClick={() => handleCopyText(lightboxPrompt.optimizedPrompt, lightboxPrompt.id, 'optimized')}
                        className="text-red-600 hover:text-red-700 font-bold flex items-center space-x-1"
                      >
                        {copiedPromptId === lightboxPrompt.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPromptId === lightboxPrompt.id ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                    <div className="p-4 bg-slate-950 text-amber-200 border border-slate-800 rounded-2xl font-mono text-[11px] leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
                      {lightboxPrompt.optimizedPrompt}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {lightboxPrompt.tags && lightboxPrompt.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded text-[10px] font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button
                    onClick={() => {
                      sendPromptToSandbox(lightboxPrompt);
                      setLightboxPrompt(null);
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Thử nghiệm và tinh chỉnh trên Sandbox</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Contribution Form Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingPrompt ? 'Cập nhật câu lệnh AI' : 'Chia sẻ AI Prompt Thiết Kế Mới'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsSubmitOpen(false);
                  setEditingPrompt(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmitPrompt} className="p-6 space-y-4 overflow-y-auto no-scrollbar text-sm">
              {/* Role-based Moderation Banner */}
              {currentUser?.role === 'Admin' ? (
                <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start space-x-2.5 text-xs text-indigo-900">
                  <span className="p-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase shrink-0">Admin</span>
                  <div className="leading-snug">
                    <strong className="font-bold text-indigo-950">Chế độ Quản trị viên:</strong> Prompt AI của bạn sẽ được <strong>Tự động xuất bản trực tiếp</strong> lên thư viện mà không cần qua kiểm duyệt.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="font-bold text-amber-950">Chế độ Thành viên:</strong> Prompt đóng góp sẽ được chuyển vào hàng đợi <strong>chờ Ban Quản trị kiểm duyệt</strong> trước khi xuất bản.
                  </div>
                </div>
              )}

              {formSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Đã lưu thành công!</h3>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    {currentUser?.role === 'Admin' 
                      ? 'Prompt thiết kế AI đã được xuất bản trực tiếp lên hệ thống.'
                      : 'Prompt đã được gửi vào hàng đợi chờ Ban Quản trị kiểm duyệt.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tên mẫu thiết kế Prompt *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phông Đại hội Đảng bộ cơ sở nhiệm kỳ 2025 - 2030"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Công cụ AI tối ưu *</label>
                      <select
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                      >
                        <option value="Midjourney">Midjourney v6</option>
                        <option value="Gemini">Gemini Imagen 3</option>
                        <option value="DALL-E 3">DALL-E 3</option>
                        <option value="Stable Diffusion">Stable Diffusion XL</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Chuyên mục thiết kế *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                      >
                        {PROMPT_CATEGORIES.filter(c => c !== 'Tất cả').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Raw description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Ý tưởng & Quy chuẩn tiếng Việt *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mô tả các biểu tượng (hoa sen, cờ, trống đồng...), màu sắc chủ đạo và tỷ lệ khung hình..."
                      value={newRawPrompt}
                      onChange={(e) => setNewRawPrompt(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Optimized English Prompt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Câu lệnh tiếng Anh chi tiết (Prompt)</label>
                    <textarea
                      rows={3}
                      placeholder="Official Vietnamese stage backdrop, solemn red crimson gradient, golden 3D Communist Hammer and Sickle --ar 16:9 --v 6.0"
                      value={newOptimizedPrompt}
                      onChange={(e) => setNewOptimizedPrompt(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 text-amber-200 border border-slate-800 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>

                  {/* Preview Image URL */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">URL Ảnh minh họa kết quả (Image URL)</label>
                      <span className="text-[10px] text-slate-400 font-semibold">Tự động chọn nếu để trống</span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />

                    {/* Quick sample pickers */}
                    <div className="pt-1">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">Hoặc chọn nhanh ảnh mẫu có sẵn:</p>
                      <div className="flex flex-wrap gap-1">
                        {SAMPLE_PREVIEW_IMAGES.slice(0, 4).map((sample, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewImageUrl(sample.url)}
                            className="px-2 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-700 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 transition-colors"
                          >
                            {sample.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Thẻ tag tìm kiếm (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      placeholder="Đại hội Đảng, Trống đồng, 16:9, Màu đỏ"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsSubmitOpen(false)}
                      className="px-5 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95"
                    >
                      {editingPrompt 
                        ? 'Lưu chỉnh sửa' 
                        : currentUser?.role === 'Admin' 
                          ? 'Xuất bản Prompt ngay (Không cần duyệt)' 
                          : 'Gửi Prompt để Ban Quản trị duyệt'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Vietnam Design Palette Modal */}
      {isPaletteOpen && (
        <VietnamDesignPaletteModal isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
      )}

      {/* Legal & Standards Modal */}
      {isLegalOpen && (
        <LegalComplianceModal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          initialTab={legalTab}
        />
      )}

      {/* Report Violation Modal */}
      {reportingItem && (
        <ReportViolationModal
          isOpen={!!reportingItem}
          onClose={() => setReportingItem(null)}
          targetId={reportingItem.id}
          targetType="prompt"
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
          // Success callback
        }}
      />
    </div>
  );
};
