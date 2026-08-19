import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, Sparkles, ThumbsUp, Plus, X, Check, Heart, MessageSquare, 
  Tag, Send, CheckCircle2, Clock, Zap, ArrowRight, Shield, Award, Filter
} from 'lucide-react';
import { CommunityIdea, User } from '../types';
import { INITIAL_COMMUNITY_IDEAS } from '../data/mockData';
import { useToast } from '../context/ToastContext';

interface IdeaHubModalProps {
  currentUser: User | null;
  onClose: () => void;
  onOpenCreateDesign?: (initialTitle?: string, initialCategory?: string) => void;
  onRequireAuth?: (reason?: string) => void;
}

export const IdeaHubModal: React.FC<IdeaHubModalProps> = ({
  currentUser,
  onClose,
  onOpenCreateDesign,
  onRequireAuth
}) => {
  const { success: toastSuccess, info: toastInfo } = useToast();
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);

  // New Idea Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityIdea['category']>('Mẫu Slide & Thiết kế');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  // Load ideas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ictc_community_ideas');
    if (saved) {
      try {
        setIdeas(JSON.parse(saved));
      } catch (e) {
        setIdeas(INITIAL_COMMUNITY_IDEAS);
      }
    } else {
      setIdeas(INITIAL_COMMUNITY_IDEAS);
      localStorage.setItem('ictc_community_ideas', JSON.stringify(INITIAL_COMMUNITY_IDEAS));
    }
  }, []);

  const saveIdeas = (updated: CommunityIdea[]) => {
    setIdeas(updated);
    localStorage.setItem('ictc_community_ideas', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleVote = (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Vui lòng đăng nhập để bình chọn ý tưởng!');
      return;
    }

    const updated = ideas.map(idea => {
      if (idea.id === ideaId) {
        const votedUsers = idea.votedUserIds || [];
        const isVoted = votedUsers.includes(currentUser.id);
        if (isVoted) {
          return {
            ...idea,
            votesCount: Math.max(0, idea.votesCount - 1),
            votedUserIds: votedUsers.filter(id => id !== currentUser.id)
          };
        } else {
          return {
            ...idea,
            votesCount: idea.votesCount + 1,
            votedUserIds: [...votedUsers, currentUser.id]
          };
        }
      }
      return idea;
    });

    saveIdeas(updated);
    toastSuccess('Đã cập nhật bình chọn cho ý tưởng sáng kiến!', 'Bình chọn ý tưởng');
  };

  const handleSubmitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth('Vui lòng đăng nhập để đóng góp ý tưởng!');
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      toastInfo('Vui lòng điền đầy đủ tiêu đề và nội dung ý tưởng.', 'Thiếu thông tin');
      return;
    }

    const created: CommunityIdea = {
      id: `idea-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      author: currentUser.displayName || currentUser.email.split('@')[0],
      authorEmail: currentUser.email,
      authorAvatar: currentUser.avatarUrl,
      createdAt: new Date().toISOString().split('T')[0],
      votesCount: 1,
      votedUserIds: [currentUser.id],
      status: 'Mới tiếp nhận',
      adminNotes: 'Đang đợi Ban Quản Trị xem xét đánh giá tính khả thi.',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    const updated = [created, ...ideas];
    saveIdeas(updated);

    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setIsSubmitFormOpen(false);

    toastSuccess('Đã gửi đóng góp ý tưởng thành công! Cảm ơn sáng kiến của bạn.', 'Gửi ý tưởng thành công');
  };

  const handleUpgradeIdea = (idea: CommunityIdea, e: React.MouseEvent) => {
    e.stopPropagation();
    // Update idea status to "Đã nâng cấp"
    const updated = ideas.map(i => i.id === idea.id ? { 
      ...i, 
      status: 'Đã nâng cấp' as const,
      adminNotes: 'Ý tưởng đã được Ban Quản Trị phê duyệt và nâng cấp thành dự án thiết kế chính thức!' 
    } : i);
    saveIdeas(updated);

    toastSuccess(`Đã nâng cấp ý tưởng "${idea.title}" thành dự án thiết kế!`, 'Nâng cấp thành công');

    if (onOpenCreateDesign) {
      onOpenCreateDesign(idea.title, idea.category === 'Mẫu Slide & Thiết kế' ? 'PowerPoint Templates' : 'Infographics & Posters');
      onClose();
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    if (selectedCategory === 'All') return true;
    return idea.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <Lightbulb className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Ngân Hàng Ý Tưởng & Đóng Góp Sáng Kiến</h2>
              <p className="text-xs text-amber-100 font-medium">Đóng góp và bình chọn ý tưởng phát triển slide, công cụ AI và phong trào Đoàn - Hội</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top banner / CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-amber-50 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">Bạn có ý tưởng thiết kế hoặc tính năng mới?</h3>
                <p className="text-xs text-amber-800 mt-0.5">Mọi đóng góp thiết thực sẽ được BQT ghi nhận điểm thưởng và nâng cấp thành tệp tin chia sẻ công khai.</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser && onRequireAuth) {
                  onRequireAuth('Vui lòng đăng nhập để đóng góp ý tưởng!');
                } else {
                  setIsSubmitFormOpen(!isSubmitFormOpen);
                }
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-amber-500/20 shrink-0 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitFormOpen ? 'Đóng form' : 'Gửi Ý tưởng mới'}</span>
            </button>
          </div>

          {/* New Idea Form Modal inside */}
          {isSubmitFormOpen && (
            <form onSubmit={handleSubmitIdea} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4 animate-fade-in">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Send className="w-3.5 h-3.5 text-amber-600" />
                <span>Form Đóng Góp Sáng Kiến Mới</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Tên ý tưởng / Sáng kiến <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Thêm bộ Template Slide Báo cáo Đồ án Chuyên ngành..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Danh mục ý tưởng</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Mẫu Slide & Thiết kế">Mẫu Slide & Thiết kế</option>
                    <option value="Tính năng mới">Tính năng mới</option>
                    <option value="Bộ Prompt AI">Bộ Prompt AI</option>
                    <option value="Học thuật & Đồ án">Học thuật & Đồ án</option>
                    <option value="Sáng kiến Đoàn - Hội">Sáng kiến Đoàn - Hội</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả chi tiết ý tưởng <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mô tả bối cảnh, lý do cần phát triển và kết quả mong muốn thu được..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Từ khóa / Tags (ngăn cách bởi dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="Slide, Đoàn thanh niên, AI, Báo cáo..."
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSubmitFormOpen(false)}
                    className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md shadow-amber-500/20"
                  >
                    Gửi Ý Tưởng
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Filter Categories */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              {['All', 'Mẫu Slide & Thiết kế', 'Tính năng mới', 'Bộ Prompt AI', 'Sáng kiến Đoàn - Hội'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả sáng kiến' : cat}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-bold shrink-0">{filteredIdeas.length} ý tưởng</span>
          </div>

          {/* Ideas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdeas.map(idea => {
              const isVoted = currentUser && idea.votedUserIds?.includes(currentUser.id);
              const isAdmin = currentUser?.role === 'Admin';

              return (
                <div 
                  key={idea.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg uppercase">
                        {idea.category}
                      </span>

                      {/* Status badge */}
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg flex items-center space-x-1 ${
                        idea.status === 'Đã nâng cấp'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : idea.status === 'Đang phát triển'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idea.status === 'Đã nâng cấp' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{idea.status}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                      {idea.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {idea.description}
                    </p>

                    {idea.adminNotes && (
                      <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 space-y-0.5">
                        <span className="font-bold text-amber-700 block">Phản hồi từ Ban Quản Trị:</span>
                        <p>{idea.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Bởi {idea.author.split(' ')[0]} • {idea.createdAt}
                    </span>

                    <div className="flex items-center space-x-2">
                      {/* Vote Button */}
                      <button
                        onClick={(e) => handleVote(idea.id, e)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                          isVoted
                            ? 'bg-rose-500 text-white shadow-xs shadow-rose-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Bình chọn cho ý tưởng này"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isVoted ? 'fill-white' : 'text-slate-400'}`} />
                        <span>{idea.votesCount}</span>
                      </button>

                      {/* Admin Upgrade Button */}
                      {isAdmin && idea.status !== 'Đã nâng cấp' && (
                        <button
                          onClick={(e) => handleUpgradeIdea(idea, e)}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center space-x-1"
                          title="Nâng cấp ý tưởng thành tệp thiết kế chính thức"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Nâng cấp</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center space-x-1 font-medium">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>ICTC Share & Design • Hệ thống đổi mới sáng tạo học thuật</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
