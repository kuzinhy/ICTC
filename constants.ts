// Fix: Replaced invalid placeholder content with the actual platform data structure.
import type { Platform } from './types';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { TikTokIcon } from './components/icons/TikTokIcon';
import { ZaloIcon } from './components/icons/ZaloIcon';
import { DesignIcon } from './components/icons/DesignIcon';

export const PLATFORMS: Platform[] = [
  {
    name: 'Facebook Fanpage',
    description: 'Cộng đồng chính thức trên Facebook. Nơi cập nhật thông tin nhanh nhất, thảo luận, và chia sẻ tài liệu học tập, nghiên cứu.',
    logo: FacebookIcon,
    mainLink: 'https://www.facebook.com/groups/313739042955897',
    accentColor: 'bg-blue-600 hover:bg-blue-700',
    accentBorderColor: 'hover:border-blue-500',
    subLinks: [
      { title: 'Group Thảo luận Chuyên sâu', url: 'https://www.facebook.com/groups/313739042955897' },
      { title: 'Chủ sở hữu: Nguyễn Huy', url: 'https://www.facebook.com/nguyenminhhuy.tdm' },
    ],
  },
  {
    name: 'TikTok Channel',
    description: 'Kênh chia sẻ prompt và hình ảnh sáng tạo. Khám phá những ý tưởng độc đáo và kỹ thuật thiết kế mới nhất.',
    logo: TikTokIcon,
    mainLink: 'https://www.tiktok.com/@huy.ng.m',
    accentColor: 'bg-black hover:bg-gray-800',
    accentBorderColor: 'hover:border-gray-500',
    subLinks: [
      { title: 'Chia sẻ promt và ảnh', url: 'https://www.tiktok.com/@huy.ng.m' },
      { title: 'Chủ sở hữu', url: 'https://www.tiktok.com/@ng.m.huy' },
      { title: 'Công cụ tiktok', url: 'https://ai.studio/apps/drive/1c1U9bSe3wKVvP7LTgwEvlwEZYMcSgdXY' },
    ],
  },
  {
    name: 'Zalo Community',
    description: 'Tham gia các cộng đồng Zalo của chúng tôi để thảo luận, nhận hỗ trợ và chia sẻ kiến thức về thiết kế và prompt.',
    logo: ZaloIcon,
    mainLink: 'https://zalo.me/g/kovwak924',
    accentColor: 'bg-sky-500 hover:bg-sky-600',
    accentBorderColor: 'hover:border-sky-400',
    subLinks: [
      { title: 'ICTC Share & Design', url: 'https://zalo.me/g/kovwak924' },
      { title: 'ICTC Share & Design 2', url: 'https://zalo.me/g/bexjwb708' },
      { title: 'ICTC promt', url: 'https://zalo.me/g/vpyefo623' },
    ],
  },
  {
    name: 'Chia sẻ Thiết kế',
    description: 'Nơi cộng đồng chia sẻ các mẫu thiết kế, templates, và tài nguyên sáng tạo để cùng nhau học hỏi và phát triển.',
    logo: DesignIcon,
    mainLink: 'https://aistudio.google.com/apps/drive/1yw4mP2_d8ZSn-fRk75bc2SJJbQFq0eow',
    accentColor: 'bg-purple-600 hover:bg-purple-700',
    accentBorderColor: 'hover:border-purple-500',
    subLinks: [
      { title: 'Thư viện Mẫu Powerpoint', url: 'https://aistudio.google.com/apps/drive/1yw4mP2_d8ZSn-fRk75bc2SJJbQFq0eow' },
      { title: 'Bộ sưu tập UI/UX Kits', url: 'https://aistudio.google.com/apps/drive/1yw4mP2_d8ZSn-fRk75bc2SJJbQFq0eow' },
      { title: 'Tài nguyên Đồ họa miễn phí', url: 'https://aistudio.google.com/apps/drive/1yw4mP2_d8ZSn-fRk75bc2SJJbQFq0eow' },
    ],
  },
];
