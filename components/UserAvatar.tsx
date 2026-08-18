import React, { useState } from 'react';
import { User as UserIcon, Camera, Upload, Trash2 } from 'lucide-react';

interface UserAvatarProps {
  user?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
  } | null;
  src?: string;
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  editable?: boolean;
  onAvatarChange?: (base64Url: string) => void;
  onAvatarRemove?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl'
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12'
};

export const getInitials = (name?: string, email?: string): string => {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.slice(0, 2).toUpperCase();
  }
  return 'U';
};

export const getRoleGradient = (role?: string) => {
  switch (role) {
    case 'Admin':
      return 'from-rose-500 via-pink-500 to-purple-600 text-white shadow-rose-500/20';
    case 'Creator':
      return 'from-purple-500 via-indigo-500 to-blue-600 text-white shadow-purple-500/20';
    case 'Member':
    default:
      return 'from-blue-500 via-cyan-500 to-teal-500 text-white shadow-blue-500/20';
  }
};

export const compressAndResizeImage = (file: File, maxWidth = 400, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  src,
  name,
  role,
  size = 'md',
  className = '',
  showBadge = false,
  editable = false,
  onAvatarChange,
  onAvatarRemove
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const avatarSrc = src || user?.avatarUrl;
  const displayName = name || user?.displayName;
  const displayRole = role || user?.role;
  const displayEmail = user?.email;

  const hasValidImage = Boolean(avatarSrc && avatarSrc.trim() !== '' && !imageError);
  const initials = getInitials(displayName, displayEmail);
  const gradientClass = getRoleGradient(displayRole);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP, GIF)');
      return;
    }

    try {
      const compressedDataUrl = await compressAndResizeImage(file, 400, 0.88);
      setImageError(false);
      if (onAvatarChange) {
        onAvatarChange(compressedDataUrl);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh:', err);
    }
  };

  return (
    <div 
      className={`relative inline-block rounded-full select-none ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center font-black shadow-sm ${
        hasValidImage ? 'bg-slate-100' : `bg-gradient-to-tr ${gradientClass}`
      }`}>
        {hasValidImage ? (
          <img
            src={avatarSrc}
            alt={displayName || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="tracking-tight drop-shadow-xs font-black">
            {initials}
          </span>
        )}
      </div>

      {/* Editable Overlay (e.g. inside Member Profile) */}
      {editable && (
        <label 
          htmlFor="user-avatar-file-input"
          className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[2px] opacity-0 hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200"
          title="Nhấp để tải ảnh đại diện từ máy tính hoặc điện thoại"
        >
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-md" />
          <span className="text-[9px] font-bold mt-1 drop-shadow-md hidden sm:block">Đổi ảnh</span>
          <input
            id="user-avatar-file-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      )}

      {/* Role dot badge */}
      {showBadge && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${
            size === '2xl' ? 'w-5 h-5' : size === 'xl' ? 'w-4 h-4' : 'w-2.5 h-2.5'
          } ${
            displayRole === 'Admin' ? 'bg-rose-500' :
            displayRole === 'Creator' ? 'bg-purple-500' : 'bg-blue-500'
          }`}
          title={`Vai trò: ${displayRole || 'Thành viên'}`}
        />
      )}
    </div>
  );
};
