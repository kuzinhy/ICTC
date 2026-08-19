import React from 'react';

export interface SubLink {
  title: string;
  url: string;
}

export interface Platform {
  name: string;
  description: string;
  logo: React.FC<{ className?: string }>;
  mainLink: string;
  accentColor: string;
  accentBorderColor: string;
  subLinks: SubLink[];
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'Admin' | 'Creator' | 'Member';
  status?: 'Active' | 'Pending' | 'Suspended';
  avatarUrl: string;
  joinedDate: string;
  department?: string;
  phoneNumber?: string;
  bio?: string;
  isVip?: boolean;
  vipExpiry?: string;
}

export interface ContentReport {
  id: string;
  targetId: string;
  targetType: 'design' | 'prompt' | 'article' | 'comment' | 'font';
  targetTitle: string;
  reason: string;
  details?: string;
  reporterName: string;
  reporterEmail?: string;
  reportedAt: string;
  status: 'Pending' | 'Resolved' | 'Dismissed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFlagged?: boolean;
  actionTaken?: string;
}

export interface DesignFile {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  driveUrl: string;
  previewUrl: string;
  fallbackPreviewUrl?: string;
  tags: string[];
  downloadsCount: number;
  rating: number;
  createdAt: string;
  author: string;
  authorId?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  rejectionReason?: string;
  attachedFileName?: string;
  attachedFileSize?: string;
  attachedFileData?: string;
  autoFlaggedViolation?: boolean;
  violationReason?: string;
  isVip?: boolean;
}

export interface AIPrompt {
  id: string;
  title: string;
  rawPrompt: string;
  optimizedPrompt: string;
  category: string;
  toolType: 'Midjourney' | 'DALL-E 3' | 'Stable Diffusion' | 'Gemini' | 'All';
  previewImageUrl: string;
  tags: string[];
  likesCount: number;
  createdAt: string;
  author: string;
  authorId?: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  rejectionReason?: string;
  autoFlaggedViolation?: boolean;
  violationReason?: string;
  isVip?: boolean;
  driveUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  fallbackCoverImage?: string;
  category: 'Mẹo thiết kế' | 'Nghiên cứu & Đồ án' | 'Thủ thuật AI' | 'Kỹ năng thuyết trình' | 'Thông báo & Sự kiện';
  author: string;
  authorId?: string;
  authorAvatar?: string;
  publishedAt: string;
  readTimeMinutes: number;
  viewsCount: number;
  likesCount: number;
  commentsCount?: number;
  tags: string[];
  isPinned?: boolean;
  status: 'Published' | 'Draft' | 'Pending' | 'Rejected';
  rejectionReason?: string;
  autoFlaggedViolation?: boolean;
  violationReason?: string;
}

export interface ArticleComment {
  id: string;
  articleId: string;
  author: string;
  authorId?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likesCount?: number;
}

export interface BookmarkItem {
  id: string;
  targetId: string;
  type: 'design' | 'prompt' | 'article';
  title: string;
  category: string;
  previewUrl?: string;
  savedAt: string;
}

export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  driveDesignFolder: string;
  drivePromptFolder: string;
  driveFontFolder?: string;
  sharedUploadDriveUrl: string;
  sharedUploadInstructions?: string;
  autoApproveCreators: boolean;
  allowPublicUploads: boolean;
  maintenanceMode: boolean;
  defaultAIModel: string;
  googleAppsScriptUrl?: string;
}

export type { VietnameseFont } from './data/vietnamFontsData';
