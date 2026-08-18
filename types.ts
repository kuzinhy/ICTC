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
  tags: string[];
  downloadsCount: number;
  rating: number;
  createdAt: string;
  author: string;
  authorId?: string;
  status: 'Approved' | 'Pending';
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
  status: 'Approved' | 'Pending';
}

export interface SystemConfig {
  siteName: string;
  siteDescription: string;
  driveDesignFolder: string;
  drivePromptFolder: string;
  allowPublicUploads: boolean;
  maintenanceMode: boolean;
  defaultAIModel: string;
}
