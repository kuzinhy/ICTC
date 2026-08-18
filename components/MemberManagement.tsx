import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Filter, Shield, Sparkles, Check, X, 
  Trash2, Edit3, CheckCircle2, Clock, AlertCircle, RefreshCw, 
  Phone, Building2, UserCheck, UserX, MoreVertical, Crown, 
  Palette, User as UserIcon, ShieldAlert, Mail, ArrowRight, 
  CheckCircle, Ban, Camera, Upload
} from 'lucide-react';
import { User } from '../types';
import { saveUserToDb, deleteUserFromDb, fetchUsersFromDb } from '../lib/db';
import { INITIAL_USERS } from '../data/mockData';
import { UserAvatar, compressAndResizeImage } from './UserAvatar';

interface MemberManagementProps {
  currentUser: User;
  users: User[];
  onUsersChange: (updatedUsers: User[]) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ 
  currentUser, 
  users, 
  onUsersChange 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'Admin' | 'Creator' | 'Member'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Suspended'>('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<{
    displayName: string;
    email: string;
    role: 'Admin' | 'Creator' | 'Member';
    status: 'Active' | 'Pending' | 'Suspended';
    department: string;
    phoneNumber: string;
    bio: string;
    avatarUrl: string;
  }>({
    displayName: '',
    email: '',
    role: 'Member',
    status: 'Active',
    department: '',
    phoneNumber: '',
    bio: '',
    avatarUrl: ''
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => {
      setActionNotice(null);
    }, 3000);
  };

  // Sync users with Cloud Firestore
  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      const cloudUsers = await fetchUsersFromDb();
      // Filter legacy test emails
      const cleanUsers = cloudUsers.filter(u => !['admin@ictc.io.vn', 'huy.design@ictc.io.vn', 'member@ictc.io.vn'].includes(u.email.toLowerCase()));
      const finalUsers = cleanUsers.length > 0 ? cleanUsers : INITIAL_USERS;
      onUsersChange(finalUsers);
      localStorage.setItem('ictc_registered_users', JSON.stringify(finalUsers));
      showNotification('Đã đồng bộ danh sách thành viên mới nhất từ Cloud Firestore!', 'success');
    } catch (e) {
      showNotification('Không thể kết nối Firestore, đang sử dụng dữ liệu cục bộ.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Clean all fake accounts and reset to authentic master admin
  const handleCleanLegacyUsers = () => {
    const cleanList = users.filter(u => !['admin@ictc.io.vn', 'huy.design@ictc.io.vn', 'member@ictc.io.vn'].includes(u.email.toLowerCase()));
    const finalUsers = cleanList.length > 0 ? cleanList : INITIAL_USERS;
    onUsersChange(finalUsers);
    localStorage.setItem('ictc_registered_users', JSON.stringify(finalUsers));
    showNotification('Đã làm sạch toàn bộ các tài khoản mẫu thử nghiệm!', 'success');
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => (u.status || 'Active') === 'Active').length;
    const pending = users.filter(u => u.status === 'Pending').length;
    const admins = users.filter(u => u.role === 'Admin').length;
    const creators = users.filter(u => u.role === 'Creator').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;
    return { total, active, pending, admins, creators, suspended };
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchRole = roleFilter === 'All' || user.role === roleFilter;
      const userStatus = user.status || 'Active';
      const matchStatus = statusFilter === 'All' || userStatus === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setFormData({
      displayName: '',
      email: '',
      role: 'Member',
      status: 'Active',
      department: 'Thành viên ICTC',
      phoneNumber: '',
      bio: '',
      avatarUrl: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status || 'Active',
      department: user.department || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || ''
    });
  };

  // Submit Add Member
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.displayName.trim()) {
      showNotification('Vui lòng điền họ tên và email hợp lệ!', 'error');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
      showNotification('Email này đã tồn tại trong danh sách thành viên!', 'error');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      displayName: formData.displayName.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      department: formData.department.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      avatarUrl: formData.avatarUrl || '',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newUser, ...users];
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
    setIsAddModalOpen(false);

    // Save to Cloud Firestore
    try {
      await saveUserToDb(newUser);
      showNotification(`Đã thêm thành viên "${newUser.displayName}" thành công!`, 'success');
    } catch (err) {
      showNotification(`Đã thêm thành viên "${newUser.displayName}" vào bộ nhớ!`, 'info');
    }
  };

  // Submit Edit Member
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUser: User = {
      ...editingUser,
      displayName: formData.displayName.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      department: formData.department.trim() || undefined,
      phoneNumber: formData.phoneNumber.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      avatarUrl: formData.avatarUrl
    };

    const updated = users.map(u => u.id === editingUser.id ? updatedUser : u);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));
    setEditingUser(null);

    // Save to Cloud Firestore
    try {
      await saveUserToDb(updatedUser);
      showNotification(`Đã cập nhật thông tin "${updatedUser.displayName}" thành công!`, 'success');
    } catch (err) {
      showNotification(`Đã lưu thay đổi vào bộ nhớ hệ thống!`, 'info');
    }
  };

  // Quick Role Change
  const handleQuickRoleChange = async (userId: string, newRole: 'Admin' | 'Creator' | 'Member') => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com' && newRole !== 'Admin') {
      showNotification('Không thể giáng cấp tài khoản Quản trị viên tối cao!', 'error');
      return;
    }

    const updatedUser = { ...targetUser, role: newRole };
    const updated = users.map(u => u.id === userId ? updatedUser : u);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));

    try {
      await saveUserToDb(updatedUser);
      showNotification(`Đã chuyển vai trò của ${updatedUser.displayName} thành ${newRole}!`, 'success');
    } catch (e) {
      showNotification(`Đã cập nhật vai trò ${newRole}!`, 'info');
    }
  };

  // Approve a pending user
  const handleApproveUser = async (user: User) => {
    const updatedUser: User = { ...user, status: 'Active' };
    const updated = users.map(u => u.id === user.id ? updatedUser : u);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));

    try {
      await saveUserToDb(updatedUser);
      showNotification(`Đã phê duyệt thành viên "${user.displayName}" hoạt động!`, 'success');
    } catch (e) {
      showNotification(`Đã phê duyệt thành viên "${user.displayName}"!`, 'info');
    }
  };

  // Toggle user active / suspended status
  const handleToggleStatus = async (user: User) => {
    if (user.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com') {
      showNotification('Không thể khóa tài khoản Quản trị viên tối cao!', 'error');
      return;
    }

    const newStatus: 'Active' | 'Suspended' = (user.status || 'Active') === 'Active' ? 'Suspended' : 'Active';
    const updatedUser: User = { ...user, status: newStatus };
    const updated = users.map(u => u.id === user.id ? updatedUser : u);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));

    try {
      await saveUserToDb(updatedUser);
      showNotification(newStatus === 'Active' ? `Đã kích hoạt lại "${user.displayName}"!` : `Đã tạm khóa tài khoản "${user.displayName}"!`, 'info');
    } catch (e) {}
  };

  // Approve all pending users
  const handleApproveAllPending = async () => {
    const pendingList = users.filter(u => u.status === 'Pending');
    if (pendingList.length === 0) return;

    const updated = users.map(u => u.status === 'Pending' ? { ...u, status: 'Active' as const } : u);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));

    for (const u of pendingList) {
      try {
        await saveUserToDb({ ...u, status: 'Active' });
      } catch (e) {}
    }
    showNotification(`Đã duyệt đồng loạt ${pendingList.length} thành viên thành công!`, 'success');
  };

  // Delete User Confirmation & Action
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (userToDelete.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com') {
      showNotification('Bảo mật: Không thể xóa tài khoản Quản trị viên gốc!', 'error');
      setUserToDelete(null);
      return;
    }

    if (currentUser.id === userToDelete.id || currentUser.email.toLowerCase() === userToDelete.email.toLowerCase()) {
      showNotification('Bạn không thể tự xóa tài khoản của chính mình!', 'error');
      setUserToDelete(null);
      return;
    }

    const updated = users.filter(u => u.id !== userToDelete.id);
    onUsersChange(updated);
    localStorage.setItem('ictc_registered_users', JSON.stringify(updated));

    try {
      await deleteUserFromDb(userToDelete.id);
      showNotification(`Đã xóa vĩnh viễn thành viên "${userToDelete.displayName}"!`, 'success');
    } catch (e) {
      showNotification(`Đã xóa thành viên "${userToDelete.displayName}" khỏi hệ thống!`, 'info');
    } finally {
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200/60 uppercase tracking-wider shadow-xs">
            <Crown className="w-3 h-3 text-rose-500" />
            <span>Quản trị viên</span>
          </span>
        );
      case 'Creator':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 border border-purple-200/60 uppercase tracking-wider shadow-xs">
            <Palette className="w-3 h-3 text-purple-500" />
            <span>Nhà sáng tạo</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider shadow-xs">
            <UserIcon className="w-3 h-3 text-blue-500" />
            <span>Thành viên</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Chờ duyệt</span>
          </span>
        );
      case 'Suspended':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
            <Ban className="w-3 h-3 text-red-500" />
            <span>Tạm khóa</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Hoạt động</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast notification banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in ${
          actionNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          actionNotice.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            {actionNotice.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Trung tâm Quản trị Thành viên</h3>
            <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[11px] font-black rounded-full shadow-xs">
              {users.length} tài khoản
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Quản lý, phân quyền vai trò, phê duyệt và giám sát hoạt động thành viên toàn hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            title="Đồng bộ lại từ Cloud Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Đám mây'}</span>
          </button>

          <button
            onClick={handleCleanLegacyUsers}
            className="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-rose-200 transition-all flex items-center space-x-1.5 shadow-xs"
            title="Xóa bỏ tài khoản mẫu thử nghiệm nếu có"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Làm sạch dữ liệu mẫu</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm thành viên mới</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'All' ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng thành viên</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold">tài khoản</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Active')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Active' ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang hoạt động</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">{stats.active}</span>
            <span className="text-[10px] text-emerald-600/70 font-semibold">đã kích hoạt</span>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'Pending' ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chờ phê duyệt</span>
            <Clock className={`w-4 h-4 ${stats.pending > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-black ${stats.pending > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{stats.pending}</span>
            <span className="text-[10px] text-amber-600/70 font-semibold">yêu cầu mới</span>
          </div>
        </div>

        <div 
          onClick={() => { setRoleFilter('Admin'); setStatusFilter('All'); }}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            roleFilter === 'Admin' ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ban Quản trị & Creator</span>
            <Crown className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-purple-600">{stats.admins + stats.creators}</span>
            <span className="text-[10px] text-purple-600/70 font-semibold">{stats.admins} Admin • {stats.creators} Creator</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, phòng ban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
          
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tất cả ({users.length})
            </button>
            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 ${statusFilter === 'Pending' ? 'bg-white text-amber-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <span>Chờ duyệt</span>
              {stats.pending > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[9px] rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter('Active')}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'Active' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Hoạt động
            </button>
            <button
              onClick={() => setStatusFilter('Suspended')}
              className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'Suspended' ? 'bg-white text-rose-700 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Tạm khóa
            </button>
          </div>

          {/* Role Filter Selector */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Admin">Quản trị viên (Admin)</option>
            <option value="Creator">Nhà sáng tạo (Creator)</option>
            <option value="Member">Thành viên (Member)</option>
          </select>
        </div>
      </div>

      {/* If there are pending users and user is on Pending tab, show Batch Action Bar */}
      {statusFilter === 'Pending' && stats.pending > 0 && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="text-xs font-black text-amber-900">Có {stats.pending} yêu cầu tham gia đang chờ phê duyệt</h4>
              <p className="text-[11px] text-amber-700">Bạn có thể duyệt nhanh tất cả hoặc kiểm tra từng thành viên bên dưới.</p>
            </div>
          </div>
          <button
            onClick={handleApproveAllPending}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-sm flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Phê duyệt tất cả ({stats.pending})</span>
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Thành viên</th>
                <th className="py-3.5 px-4">Email & Liên hệ</th>
                <th className="py-3.5 px-4">Phòng ban / Chuyên môn</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày tham gia</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 stroke-[1.5] text-slate-300" />
                      <p className="font-bold text-sm text-slate-500">Không tìm thấy thành viên nào phù hợp</p>
                      <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isPrimaryAdmin = user.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com';
                  const isCurrent = currentUser.id === user.id || currentUser.email.toLowerCase() === user.email.toLowerCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* Avatar & Display Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar 
                            user={user} 
                            size="md" 
                            className="border border-slate-200 shadow-xs flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-black text-slate-900 text-sm">{user.displayName}</span>
                              {isPrimaryAdmin && (
                                <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[9px] font-black rounded-md uppercase">
                                  Gốc
                                </span>
                              )}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 text-[9px] font-black rounded-md uppercase">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">ID: {user.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-slate-700 font-mono font-medium">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phoneNumber && (
                            <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 text-slate-600 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.department || 'Chung'}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(user.status)}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {user.joinedDate}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          
                          {/* Approval button if Pending */}
                          {user.status === 'Pending' && (
                            <button
                              onClick={() => handleApproveUser(user)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                              title="Phê duyệt thành viên ngay"
                            >
                              <Check className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}

                          {/* Quick Role Switch dropdown / toggle */}
                          {!isPrimaryAdmin && (
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[10px] font-bold">
                              <button
                                onClick={() => handleQuickRoleChange(user.id, 'Member')}
                                className={`px-1.5 py-0.5 rounded-md transition-all ${user.role === 'Member' ? 'bg-white text-blue-600 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
                                title="Chuyển thành Thành viên"
                              >
                                M
                              </button>
                              <button
                                onClick={() => handleQuickRoleChange(user.id, 'Creator')}
                                className={`px-1.5 py-0.5 rounded-md transition-all ${user.role === 'Creator' ? 'bg-white text-purple-600 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
                                title="Chuyển thành Nhà sáng tạo (Creator)"
                              >
                                C
                              </button>
                              <button
                                onClick={() => handleQuickRoleChange(user.id, 'Admin')}
                                className={`px-1.5 py-0.5 rounded-md transition-all ${user.role === 'Admin' ? 'bg-white text-rose-600 shadow-xs font-black' : 'text-slate-400 hover:text-slate-700'}`}
                                title="Chuyển thành Quản trị viên (Admin)"
                              >
                                A
                              </button>
                            </div>
                          )}

                          {/* Status toggle (Active / Suspended) */}
                          {!isPrimaryAdmin && !isCurrent && (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                (user.status || 'Active') === 'Active' 
                                  ? 'bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border-slate-200' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                              title={(user.status || 'Active') === 'Active' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {(user.status || 'Active') === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Edit Details Button */}
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Chỉnh sửa thông tin chi tiết"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          {!isPrimaryAdmin && !isCurrent && (
                            <button
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                              title="Xóa thành viên khỏi hệ thống"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: ADD NEW MEMBER MODAL */}
      {/* ============================================================ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Thêm thành viên mới</h4>
                  <p className="text-[11px] text-slate-500">Tạo tài khoản và phân quyền trực tiếp</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lê Minh Hoàng"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@ictc.io.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phân quyền (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Member">Thành viên (Member)</option>
                    <option value="Creator">Nhà sáng tạo (Creator)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái ban đầu</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  >
                    <option value="Active">Đang hoạt động (Kích hoạt ngay)</option>
                    <option value="Pending">Chờ phê duyệt (Pending)</option>
                    <option value="Suspended">Tạm khóa (Suspended)</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phòng ban / Chuyên môn</label>
                  <input
                    type="text"
                    placeholder="Ban Thiết kế / Ban Công nghệ..."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    placeholder="0912 345 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mô tả / Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú về năng lực, nhiệm vụ hoặc mô tả ngắn..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận thêm thành viên</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: EDIT MEMBER MODAL */}
      {/* ============================================================ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Chỉnh sửa thành viên</h4>
                  <p className="text-[11px] text-slate-500">{editingUser.displayName} ({editingUser.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phân quyền (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    disabled={editingUser.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com'}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50"
                  >
                    <option value="Member">Thành viên (Member)</option>
                    <option value="Creator">Nhà sáng tạo (Creator)</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    disabled={editingUser.email.toLowerCase() === 'nguyenhuy.thudaumot@gmail.com'}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white disabled:opacity-50"
                  >
                    <option value="Active">Đang hoạt động (Active)</option>
                    <option value="Pending">Chờ phê duyệt (Pending)</option>
                    <option value="Suspended">Tạm khóa (Suspended)</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phòng ban / Chuyên môn</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Giới thiệu / Bio</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up">
            
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Xóa thành viên vĩnh viễn</h4>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex items-center space-x-3">
              <UserAvatar 
                user={userToDelete} 
                size="lg" 
                className="border border-slate-200"
              />
              <div className="truncate">
                <h5 className="text-xs font-bold text-slate-900 truncate">{userToDelete.displayName}</h5>
                <p className="text-[11px] text-slate-500 font-mono truncate">{userToDelete.email}</p>
                <div className="mt-1">{getRoleBadge(userToDelete.role)}</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có chắc chắn muốn xóa thành viên <span className="font-bold text-slate-900">{userToDelete.displayName}</span> khỏi hệ thống ICTC Share & Design? Tài khoản này sẽ mất mọi quyền truy cập và dữ liệu liên quan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-500/20 flex items-center space-x-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
