import React from 'react';
import { motion } from 'motion/react';
import { X, Award, Medal, Crown, Star, Sparkles, Heart, Folder, CheckCircle } from 'lucide-react';
import { User, DesignFile, AIPrompt, Article } from '../types';

interface LeaderboardModalProps {
  users: User[];
  designFiles: DesignFile[];
  aiPrompts: AIPrompt[];
  articles: Article[];
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  users,
  designFiles,
  aiPrompts,
  articles,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  // Calculate scores and ranks for users
  const leaderboardData = users.map(user => {
    const userDesigns = designFiles.filter(d => d.authorName?.toLowerCase() === user.displayName?.toLowerCase());
    const userPrompts = aiPrompts.filter(p => p.authorName?.toLowerCase() === user.displayName?.toLowerCase());
    const userArticles = articles.filter(a => a.authorName?.toLowerCase() === user.displayName?.toLowerCase());

    const totalContributions = userDesigns.length + userPrompts.length + userArticles.length;
    const totalLikes = userDesigns.reduce((acc, curr) => acc + (curr.likesCount || 0), 0) +
                       userArticles.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);

    let badge = 'Thành viên Tích cực';
    let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
    let rankIcon = <Star className="w-4 h-4 text-blue-600" />;

    if (totalContributions >= 5 || user.role === 'Admin') {
      badge = 'Tác giả Kim Cương';
      badgeColor = 'bg-purple-100 text-purple-900 border-purple-300';
      rankIcon = <Crown className="w-4 h-4 text-amber-500" />;
    } else if (totalContributions >= 2) {
      badge = 'Chuyên gia Đóng góp';
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
      rankIcon = <Medal className="w-4 h-4 text-amber-600" />;
    }

    return {
      user,
      totalContributions,
      totalLikes,
      badge,
      badgeColor,
      rankIcon
    };
  }).sort((a, b) => b.totalContributions - a.totalContributions || b.totalLikes - a.totalLikes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500 rounded-2xl text-slate-950 shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">Bảng Xếp Hạng & Huy Hiệu Đóng Góp</h3>
              <p className="text-xs text-slate-300 font-medium">Tuyên dương các tác giả tích cực đóng góp tài nguyên cho cộng đồng ICTC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {leaderboardData.map((item, index) => (
            <div
              key={item.user.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                index === 0
                  ? 'bg-amber-50/80 border-amber-200/90 shadow-sm'
                  : index === 1
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-slate-200/70'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {/* Rank Badge Number */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                  index === 0 ? 'bg-amber-500 text-slate-950' : index === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  #{index + 1}
                </div>

                {/* Avatar */}
                <img
                  src={item.user.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${item.user.email}`}
                  alt={item.user.displayName}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                />

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-sm text-slate-900 truncate">{item.user.displayName}</span>
                    <span className={`px-2 py-0.5 border text-[10px] font-black rounded-full flex items-center space-x-1 ${item.badgeColor}`}>
                      {item.rankIcon}
                      <span>{item.badge}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Tham gia: {item.user.joinedDate || '2025'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4 shrink-0 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-500">Đóng góp</p>
                  <p className="text-sm font-black text-blue-600">{item.totalContributions} bài</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">Thích</p>
                  <p className="text-sm font-black text-rose-600 flex items-center justify-end space-x-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>{item.totalLikes}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
