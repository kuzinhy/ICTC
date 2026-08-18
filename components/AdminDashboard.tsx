import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Settings, Shield, UserX, AlertTriangle, 
  Check, X, ToggleLeft, ToggleRight, Save, Database, Sparkles, Folder, Code
} from 'lucide-react';
import { User, DesignFile, AIPrompt, SystemConfig } from '../types';
import { DEFAULT_SYSTEM_CONFIG, INITIAL_USERS } from '../data/mockData';
import { DriveUploadResearch } from './DriveUploadResearch';
import { MemberManagement } from './MemberManagement';

interface AdminDashboardProps {
  currentUser: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'moderation' | 'settings' | 'uploadResearch'>('users');

  
  // States loaded from LocalStorage
  const [userList, setUserList] = useState<User[]>([]);
  const [pendingDesigns, setPendingDesigns] = useState<DesignFile[]>([]);
  const [pendingPrompts, setPendingPrompts] = useState<AIPrompt[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Admin Data
  useEffect(() => {
    // 1. Users list
    const savedUsers = localStorage.getItem('ictc_registered_users');
    if (savedUsers) {
      try {
        let parsed: User[] = JSON.parse(savedUsers);
        // Purge legacy auto-added mock emails
        parsed = parsed.filter(u => !['admin@ictc.io.vn', 'huy.design@ictc.io.vn', 'member@ictc.io.vn'].includes(u.email.toLowerCase()));
        if (parsed.length === 0) {
          parsed = INITIAL_USERS;
        }
        setUserList(parsed);
      } catch (e) {
        setUserList(INITIAL_USERS);
      }
    } else {
      setUserList(INITIAL_USERS);
      localStorage.setItem('ictc_registered_users', JSON.stringify(INITIAL_USERS));
    }

    // 2. Pending Content
    const savedDesigns = localStorage.getItem('ictc_design_files');
    if (savedDesigns) {
      try {
        const parsed: DesignFile[] = JSON.parse(savedDesigns);
        setPendingDesigns(parsed.filter(f => f.status === 'Pending'));
      } catch (e) {}
    }

    const savedPrompts = localStorage.getItem('ictc_ai_prompts');
    if (savedPrompts) {
      try {
        const parsed: AIPrompt[] = JSON.parse(savedPrompts);
        setPendingPrompts(parsed.filter(p => p.status === 'Pending'));
      } catch (e) {}
    }

    // 3. System Config
    const savedConfig = localStorage.getItem('ictc_system_config');
    if (savedConfig) {
      try { setSystemConfig(JSON.parse(savedConfig)); } catch (e) {}
    } else {
      localStorage.setItem('ictc_system_config', JSON.stringify(DEFAULT_SYSTEM_CONFIG));
    }
  }, [activeSubTab]);

  // Handle Content Approval
  const handleApproveContent = (id: string, type: 'design' | 'prompt') => {
    if (type === 'design') {
      const saved = localStorage.getItem('ictc_design_files');
      if (saved) {
        const parsed: DesignFile[] = JSON.parse(saved);
        const updated = parsed.map(f => f.id === id ? { ...f, status: 'Approved' as const } : f);
        localStorage.setItem('ictc_design_files', JSON.stringify(updated));
        setPendingDesigns(pendingDesigns.filter(f => f.id !== id));
      }
    } else {
      const saved = localStorage.getItem('ictc_ai_prompts');
      if (saved) {
        const parsed: AIPrompt[] = JSON.parse(saved);
        const updated = parsed.map(p => p.id === id ? { ...p, status: 'Approved' as const } : p);
        localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
        setPendingPrompts(pendingPrompts.filter(p => p.id !== id));
      }
    }
  };

  // Handle Content Rejection
  const handleRejectContent = (id: string, type: 'design' | 'prompt') => {
    if (type === 'design') {
      const saved = localStorage.getItem('ictc_design_files');
      if (saved) {
        const parsed: DesignFile[] = JSON.parse(saved);
        const updated = parsed.filter(f => f.id !== id);
        localStorage.setItem('ictc_design_files', JSON.stringify(updated));
        setPendingDesigns(pendingDesigns.filter(f => f.id !== id));
      }
    } else {
      const saved = localStorage.getItem('ictc_ai_prompts');
      if (saved) {
        const parsed: AIPrompt[] = JSON.parse(saved);
        const updated = parsed.filter(p => p.id !== id);
        localStorage.setItem('ictc_ai_prompts', JSON.stringify(updated));
        setPendingPrompts(pendingPrompts.filter(p => p.id !== id));
      }
    }
  };

  // Save System Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ictc_system_config', JSON.stringify(systemConfig));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl" id="admin-dashboard-root">
      {/* Upper navigation header */}
      <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100/60 rounded-xl text-blue-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Bảng điều khiển quản trị viên</h2>
            <p className="text-xs text-slate-500 font-medium">Xin chào, {currentUser.displayName} • Phân quyền tối cao</p>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thành viên</span>
          </button>
          <button
            onClick={() => setActiveSubTab('moderation')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors relative ${
              activeSubTab === 'moderation' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Duyệt bài đăng</span>
            {(pendingDesigns.length + pendingPrompts.length) > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-[8px] rounded-full font-bold animate-pulse">
                {pendingDesigns.length + pendingPrompts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cấu hình hệ thống</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('uploadResearch')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'uploadResearch' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Quy trình Upload Drive</span>
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-6 sm:p-8">
        
        {/* TAB 1: USER MANAGEMENT */}
        {activeSubTab === 'users' && (
          <div className="animate-fade-in">
            <MemberManagement 
              currentUser={currentUser} 
              users={userList} 
              onUsersChange={(updated) => {
                setUserList(updated);
                localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
              }} 
            />
          </div>
        )}

        {/* TAB 2: CONTENT MODERATION */}
        {activeSubTab === 'moderation' && (
          <div className="space-y-8 animate-fade-in">
            {/* Design Approval Segment */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Folder className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900">Yêu cầu duyệt file thiết kế ({pendingDesigns.length})</h3>
              </div>

              {pendingDesigns.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 py-4 italic">Không có đề xuất file thiết kế nào đang chờ duyệt.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingDesigns.map((file) => (
                    <div key={file.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                            {file.category}
                          </span>
                          <span className="text-[10px] text-slate-400">Người gửi: {file.author}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{file.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{file.description}</p>
                        <a 
                          href={file.driveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Xem link nguồn bài đăng
                          <Check className="w-3 h-3 ml-1" />
                        </a>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50">
                        <button
                          onClick={() => handleApproveContent(file.id, 'design')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Phê duyệt</span>
                        </button>
                        <button
                          onClick={() => handleRejectContent(file.id, 'design')}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center"
                          title="Từ chối"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Prompt Approval Segment */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-bold text-slate-900">Yêu cầu duyệt AI Prompt ({pendingPrompts.length})</h3>
              </div>

              {pendingPrompts.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-400 py-4 italic">Không có đề xuất AI Prompt nào đang chờ duyệt.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingPrompts.map((prompt) => (
                    <div key={prompt.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded uppercase">
                            {prompt.category} • {prompt.toolType}
                          </span>
                          <span className="text-[10px] text-slate-400">Người gửi: {prompt.author}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{prompt.title}</h4>
                        <div className="bg-slate-950/5 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 truncate">
                          {prompt.rawPrompt}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-200/50">
                        <button
                          onClick={() => handleApproveContent(prompt.id, 'prompt')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Phê duyệt</span>
                        </button>
                        <button
                          onClick={() => handleRejectContent(prompt.id, 'prompt')}
                          className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center justify-center"
                          title="Từ chối"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM CONFIGURATION */}
        {activeSubTab === 'settings' && (
          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-2xl animate-fade-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span>Cấu hình toàn hệ thống</span>
            </h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-xs font-semibold flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Cấu hình hệ thống đã được lưu trữ thành công và đồng bộ tức thì!</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên cổng thông tin (Site Name)</label>
                  <input
                    type="text"
                    required
                    value={systemConfig.siteName}
                    onChange={(e) => setSystemConfig({ ...systemConfig, siteName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model AI mặc định (Gemini)</label>
                  <select
                    value={systemConfig.defaultAIModel}
                    onChange={(e) => setSystemConfig({ ...systemConfig, defaultAIModel: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold"
                  >
                    <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Ổn định nhất)</option>
                    <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (Mới nhất)</option>
                    <option value="gemini-3.1-pro-preview">Google Gemini 3.1 Pro (Cao cấp)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slogan & Mô tả chi tiết trang web</label>
                <textarea
                  rows={2}
                  required
                  value={systemConfig.siteDescription}
                  onChange={(e) => setSystemConfig({ ...systemConfig, siteDescription: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thư mục Drive Slide thuyết trình (Chỉ định tải file)</label>
                <input
                  type="url"
                  required
                  value={systemConfig.driveDesignFolder}
                  onChange={(e) => setSystemConfig({ ...systemConfig, driveDesignFolder: e.target.value })}
                  className="w-full bg-slate-50 text-slate-600 font-mono text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thư mục Drive AI Prompt (Chỉ định xem prompt)</label>
                <input
                  type="url"
                  required
                  value={systemConfig.drivePromptFolder}
                  onChange={(e) => setSystemConfig({ ...systemConfig, drivePromptFolder: e.target.value })}
                  className="w-full bg-slate-50 text-slate-600 font-mono text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-900">Đăng bài công khai</p>
                    <p className="text-[10px] text-slate-400">Cho phép tất cả thành viên gửi bài thiết kế/prompt lên danh sách phê duyệt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystemConfig({ ...systemConfig, allowPublicUploads: !systemConfig.allowPublicUploads })}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {systemConfig.allowPublicUploads ? (
                      <ToggleRight className="w-10 h-10 stroke-[1.5]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-900">Bảo trì hệ thống</p>
                    <p className="text-[10px] text-slate-400">Chuyển trang web sang trạng thái chỉ cho phép tài khoản quản trị viên truy cập.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystemConfig({ ...systemConfig, maintenanceMode: !systemConfig.maintenanceMode })}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    {systemConfig.maintenanceMode ? (
                      <ToggleRight className="w-10 h-10 stroke-[1.5]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-blue-500/15"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình hệ thống</span>
              </button>
            </div>
          </form>
        )}

        {activeSubTab === 'uploadResearch' && (
          <DriveUploadResearch />
        )}
      </div>
    </div>
  );
};
