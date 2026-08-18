import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Copy, Check, Heart, ExternalLink, RefreshCw, Eye, 
  Trash2, Edit, AlertCircle, PlayCircle, Layers, CheckSquare, PlusCircle, X
} from 'lucide-react';
import { AIPrompt, User } from '../types';
import { INITIAL_AI_PROMPTS, DRIVE_PROMPT_FOLDER } from '../data/mockData';
import { optimizePrompt, generateLayoutMockup } from '../lib/gemini';
import { savePromptToDb, deletePromptFromDb } from '../lib/db';

interface PromptHubProps {
  currentUser: User | null;
}

export const PromptHub: React.FC<PromptHubProps> = ({ currentUser }) => {
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<'All' | 'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini'>('All');
  
  // Custom prompt creator / editor form states
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<AIPrompt | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newTool, setNewTool] = useState<'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini'>('Midjourney');
  const [newCategory, setNewCategory] = useState('UI/UX Layout');
  const [newRawPrompt, setNewRawPrompt] = useState('');
  const [newOptimizedPrompt, setNewOptimizedPrompt] = useState('');
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

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedSandbox, setCopiedSandbox] = useState(false);

  // Load prompts from local storage
  useEffect(() => {
    const saved = localStorage.getItem('ictc_ai_prompts');
    if (saved) {
      try {
        setPrompts(JSON.parse(saved));
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

  const handleCopyText = (text: string, id: string | 'sandbox') => {
    navigator.clipboard.writeText(text);
    if (id === 'sandbox') {
      setCopiedSandbox(true);
      setTimeout(() => setCopiedSandbox(false), 2000);
    } else {
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    }
  };

  const handleLike = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = prompts.find(p => p.id === promptId);
    if (target) {
      const updatedItem = { ...target, likesCount: target.likesCount + 1 };
      savePromptToDb(updatedItem).catch(err => console.warn("Failed to sync like status to Firestore:", err));
    }
    const updated = prompts.map(p => {
      if (p.id === promptId) {
        return { ...p, likesCount: p.likesCount + 1 };
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
      : ['AI Prompt', newTool];

    const authorName = currentUser ? currentUser.displayName : 'Khách vãng lai';
    const authorId = currentUser ? currentUser.id : 'usr-guest';

    if (editingPrompt) {
      // Edit Mode
      const updatedItem = {
        ...editingPrompt,
        title: newTitle,
        toolType: newTool,
        category: newCategory,
        rawPrompt: newRawPrompt,
        optimizedPrompt: newOptimizedPrompt || newRawPrompt,
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
      const isCreatorOrAdmin = currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Creator');
      const newPrompt: AIPrompt = {
        id: `prm-custom-${Date.now()}`,
        title: newTitle,
        rawPrompt: newRawPrompt,
        optimizedPrompt: newOptimizedPrompt || newRawPrompt,
        category: newCategory,
        toolType: newTool,
        previewImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        tags: tagsArray,
        likesCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        author: authorName,
        authorId: authorId,
        status: isCreatorOrAdmin ? 'Approved' : 'Pending' // Admin/Creator post is approved instantly
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
      setNewTags('');
    }, 1200);
  };

  // Open Edit Form
  const triggerEdit = (prompt: AIPrompt, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrompt(prompt);
    setNewTitle(prompt.title);
    setNewTool(prompt.toolType as any);
    setNewCategory(prompt.category);
    setNewRawPrompt(prompt.rawPrompt);
    setNewOptimizedPrompt(prompt.optimizedPrompt);
    setNewTags(prompt.tags.join(', '));
    setIsSubmitOpen(true);
  };

  // Delete Prompt
  const handleDeletePrompt = (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa Prompt này không?')) {
      deletePromptFromDb(promptId).catch(err => {
        console.warn("Failed to delete prompt from Cloud Firestore:", err);
      });
      const updated = prompts.filter(p => p.id !== promptId);
      savePrompts(updated);
    }
  };

  // Call API to optimize raw prompt
  const handleOptimizePrompt = async () => {
    if (!sandboxInput.trim()) return;
    setIsOptimizing(true);
    try {
      const output = await optimizePrompt(sandboxInput, sandboxTool);
      setPlaygroundOutput(output);
    } catch (e) {
      setPlaygroundOutput('Có lỗi xảy ra trong quá trình gọi tối ưu hóa bằng Gemini. Hãy chắc chắn khóa API của bạn chính xác hoặc xem cấu hình!');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Call API to generate visual mockup metadata
  const handleVisualizeMockup = async () => {
    const textToAnalyze = playgroundOutput || sandboxInput;
    if (!textToAnalyze.trim()) return;

    setIsVisualizing(true);
    try {
      const layout = await generateLayoutMockup(textToAnalyze);
      setMockupResult(layout);
    } catch (e) {
      // Soft rules-based visualizer fallback
      setMockupResult({
        colors: ['#2563EB', '#3B82F6', '#93C5FD', '#F1F5F9'],
        layoutType: 'Bento Grid Dashboard',
        vibes: ['Tối giản', 'Chuyên nghiệp', 'Khoa học'],
        elements: ['Header banner', 'Sidebar navigation', '4 x Statistics Cards', 'User Activity Line Chart'],
        fontFamily: 'Plus Jakarta Sans'
      });
    } finally {
      setIsVisualizing(false);
    }
  };

  // Filter lists
  const tools = ['All', 'Midjourney', 'DALL-E 3', 'Stable Diffusion', 'Gemini'];

  const filteredPrompts = prompts.filter(prompt => {
    // Member/Guest only see APPROVED. Creator/Admin can see their own pending posts.
    const isVisible = prompt.status === 'Approved' || 
                      (currentUser && (currentUser.role === 'Admin' || currentUser.id === prompt.authorId));

    if (!isVisible) return false;

    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.rawPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prompt.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTool = selectedTool === 'All' || prompt.toolType === selectedTool;

    return matchesSearch && matchesTool;
  });

  return (
    <div className="space-y-8 animate-fade-in" id="prompt-hub-root">
      
      {/* Light Blue Header Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Thư Viện AI Prompt Cao Cấp</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kho Trực Quan AI Design Prompts</h2>
          <p className="text-slate-600 text-sm max-w-xl leading-relaxed font-medium">
            Tập hợp những câu lệnh tạo ảnh nghệ thuật, layout web, và giáo án số tuyệt đẹp. Bạn có thể sử dụng Sân chơi AI tích hợp để tối ưu và mô phỏng giao diện tức thì!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <a
            href={DRIVE_PROMPT_FOLDER}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-6 py-3 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-bold text-sm rounded-xl transition-all duration-200 shadow-sm"
          >
            Mở Drive Prompt
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
          <button
            onClick={() => {
              setEditingPrompt(null);
              setIsSubmitOpen(true);
            }}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            Đóng góp Prompt mới
            <PlusCircle className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* TWO SECTIONS: PLAYGROUND SANDBOX & GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE AI SANDBOX & PLAYGROUND */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <div className="p-2 bg-blue-100/60 rounded-xl text-blue-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sân chơi AI & Tối ưu Prompt</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Powered by Google Gemini</p>
              </div>
            </div>

            {/* Sandbox form input */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-500 uppercase tracking-wider">Ý tưởng thô của bạn (Ý tưởng tiếng Việt/Anh)</label>
                <select
                  value={sandboxTool}
                  onChange={(e) => setSandboxTool(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1 font-bold focus:outline-none"
                >
                  <option value="Midjourney">Midjourney</option>
                  <option value="DALL-E 3">DALL-E 3</option>
                  <option value="Stable Diffusion">Stable Diffusion</option>
                  <option value="Gemini">Gemini</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="Ví dụ: Thiết kế trang web trường học màu xanh dương trắng, bento grid phong cách hiện đại..."
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm leading-relaxed resize-none font-medium"
              />

              {/* Control triggers */}
              <div className="flex gap-2.5">
                <button
                  onClick={handleOptimizePrompt}
                  disabled={isOptimizing || !sandboxInput.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-sm"
                >
                  {isOptimizing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Tối ưu hóa Prompt</span>
                </button>

                <button
                  onClick={handleVisualizeMockup}
                  disabled={isVisualizing || (!sandboxInput.trim() && !playgroundOutput.trim())}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-600 disabled:bg-slate-50 disabled:text-slate-300 disabled:border-slate-100 font-bold rounded-xl transition-all flex items-center justify-center space-x-1"
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
                  <h4 className="font-bold text-slate-500 uppercase tracking-wider">Kết quả Prompt tối ưu bằng tiếng Anh:</h4>
                  <button
                    onClick={() => handleCopyText(playgroundOutput, 'sandbox')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center space-x-1"
                  >
                    {copiedSandbox ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-bold">{copiedSandbox ? 'Đã copy' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl leading-relaxed font-mono text-[11px] max-h-[140px] overflow-y-auto no-scrollbar">
                  {playgroundOutput}
                </div>
              </div>
            )}

            {/* MOCKUP VISUALIZATION INTERACTIVE CANVAS */}
            {isVisualizing && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl animate-pulse">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs font-bold text-slate-500">AI đang dựng mô phỏng bản vẽ thiết kế...</p>
              </div>
            )}

            {mockupResult && !isVisualizing && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-4 animate-fade-in text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <div className="flex items-center space-x-1 text-slate-800">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-xs sm:text-sm">Bản vẽ phác thảo UI</span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded uppercase">
                    {mockupResult.layoutType}
                  </span>
                </div>

                {/* Colors palette bar */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bảng màu khuyên dùng</p>
                  <div className="flex gap-2">
                    {mockupResult.colors.map((col, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full h-8 rounded-lg border border-slate-300 shadow-xs" style={{ backgroundColor: col }} />
                        <span className="text-[9px] font-mono text-slate-500 uppercase">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulated Wireframe Canvas Component */}
                <div className="border border-slate-200 bg-white rounded-xl p-3.5 space-y-2.5 shadow-inner">
                  {/* Mock browser header */}
                  <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-[9px] text-slate-300 font-semibold pl-2 italic">ictc-simulation-tab</span>
                  </div>

                  {/* Wireframe simulated elements */}
                  <div className="space-y-1.5">
                    {mockupResult.elements.map((el, idx) => (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border flex items-center justify-between transition-colors ${
                          idx === 0 ? 'bg-blue-50 border-blue-100 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200/60 text-slate-600'
                        }`}
                      >
                        <span className="font-semibold text-[10px]">{el}</span>
                        <CheckSquare className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood boards / vibes */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cảm xúc thiết kế (Vibes)</p>
                  <div className="flex flex-wrap gap-1">
                    {mockupResult.vibes.map((vb) => (
                      <span key={vb} className="px-2 py-0.5 bg-slate-200/50 text-slate-600 text-[9px] font-bold rounded">
                        #{vb}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SEARCHABLE PROMPT GRID GALLERY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm prompt, thẻ tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 text-slate-900 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-semibold placeholder-slate-400"
              />
            </div>

            {/* Filter */}
            <div className="overflow-x-auto w-full sm:w-auto flex gap-1 no-scrollbar">
              {tools.map((tl) => (
                <button
                  key={tl}
                  onClick={() => setSelectedTool(tl as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${
                    selectedTool === tl
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-250'
                  }`}
                >
                  {tl === 'All' ? 'Tất cả' : tl}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts list */}
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-800 font-bold">Không tìm thấy AI prompt nào</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">Hãy nhập từ khóa khác hoặc lọc theo công cụ vẽ ảnh AI khác.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => {
                const isOwner = currentUser && (currentUser.id === prompt.authorId || currentUser.role === 'Admin');
                
                return (
                  <div
                    key={prompt.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {prompt.toolType}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {prompt.category}
                        </span>

                        {prompt.status === 'Pending' && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-[9px] font-extrabold rounded">
                            Chờ duyệt
                          </span>
                        )}
                      </div>

                      {/* Controls for Owner */}
                      {isOwner && (
                        <div className="flex space-x-1 shrink-0">
                          <button
                            onClick={(e) => triggerEdit(prompt, e)}
                            className="p-1.5 bg-slate-50 hover:bg-blue-500 hover:text-white border border-slate-200 rounded-lg transition-colors"
                            title="Sửa prompt"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-500 hover:text-inherit" />
                          </button>
                          <button
                            onClick={(e) => handleDeletePrompt(prompt.id, e)}
                            className="p-1.5 bg-slate-50 hover:bg-red-500 hover:text-white border border-slate-200 rounded-lg transition-colors"
                            title="Xóa prompt"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-inherit" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{prompt.title}</h3>
                      <p className="text-xs text-slate-400 font-semibold">Được đăng bởi {prompt.author}</p>
                    </div>

                    {/* Prompts comparison */}
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-600 font-medium">
                        <span className="font-bold text-blue-600 uppercase text-[9px] tracking-wider block mb-1">Mô tả ý tưởng (Raw):</span>
                        {prompt.rawPrompt}
                      </div>

                      <div className="relative group/copy">
                        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl leading-relaxed text-slate-200 font-mono text-[11px] max-h-[120px] overflow-y-auto no-scrollbar">
                          <span className="font-bold text-yellow-400 uppercase text-[9px] tracking-wider block mb-1">Câu lệnh hoàn chỉnh (Optimized):</span>
                          {prompt.optimizedPrompt}
                        </div>
                        <button
                          onClick={() => handleCopyText(prompt.optimizedPrompt, prompt.id)}
                          className="absolute bottom-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1"
                        >
                          {copiedPromptId === prompt.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[9px] font-bold">{copiedPromptId === prompt.id ? 'Đã sao chép' : 'Sao chép câu lệnh'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions and Tags footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {prompt.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-500 font-semibold rounded">
                            #{t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={(e) => handleLike(prompt.id, e)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100/50 rounded-xl font-bold transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 fill-rose-600 stroke-none" />
                        <span>{prompt.likesCount.toLocaleString()} thích</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload/Contribution Form Modal */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingPrompt ? 'Cập nhật câu lệnh AI' : 'Chia sẻ AI Prompt của bạn'}
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
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-full border border-emerald-100">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Đã lưu thành công!</h3>
                  <p className="text-xs text-slate-500 text-center max-w-xs">
                    Prompt thiết kế AI của bạn đã được cập nhật thành công vào hệ thống.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tiêu đề thiết kế Prompt *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mẫu Logo 3D Mascot, Vẽ slide tối giản chuyên nghiệp..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Công cụ vẽ AI</label>
                      <select
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value as any)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                      >
                        <option value="Midjourney">Midjourney</option>
                        <option value="DALL-E 3">DALL-E 3</option>
                        <option value="Stable Diffusion">Stable Diffusion</option>
                        <option value="Gemini">Gemini</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Danh mục</label>
                      <input
                        type="text"
                        placeholder="UI/UX Layout, 3D Character..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ý tưởng mô tả ngắn / Từ khóa gắn thẻ</label>
                    <input
                      type="text"
                      placeholder="Ngắn gọn, cách nhau bằng dấu phẩy (vd: 3D, Minimalist, Tech)"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ý tưởng thô tiếng Việt (Raw Prompt) *</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Ví dụ: Cảnh thư viện ảo hiện đại năm 2050..."
                      value={newRawPrompt}
                      onChange={(e) => setNewRawPrompt(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Câu lệnh tiếng Anh hoàn chỉnh (Optimized Prompt) *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Nếu không có, bạn có thể copy nguyên Raw Prompt hoặc tự dịch sang tiếng Anh để nạp..."
                      value={newOptimizedPrompt}
                      onChange={(e) => setNewOptimizedPrompt(e.target.value)}
                      className="w-full bg-slate-50 text-slate-950 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-400 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitOpen(false);
                        setEditingPrompt(null);
                      }}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl text-xs font-bold transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all"
                    >
                      {editingPrompt ? 'Lưu chỉnh sửa' : 'Chia sẻ ngay'}
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
