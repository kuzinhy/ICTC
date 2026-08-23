import { AIPrompt } from '../types';
import { generateFull100VietnamPrompts, BASE_VIETNAM_PROMPTS } from './vietnam100DesignPrompts';
import { SENCAM_BACKGROUND_PROMPTS } from './sencamPromptsData';

export const INITIAL_AI_PROMPTS: AIPrompt[] = [
  ...SENCAM_BACKGROUND_PROMPTS,
  ...generateFull100VietnamPrompts()
];

export const PROMPT_CATEGORIES = [
  'Tất cả',
  'Phông Nền Sáng Tạo',
  'Phông Bục Sản Phẩm',
  'Phông Hội Nghị',
  'Băng Rôn & Khẩu Hiệu',
  'Banner Sự Kiện',
  'Standee Triển Lãm',
  'Thiệp Mời & Giấy Mời',
  'Poster & Infographic',
  'Bìa Sổ & Kỷ Yếu'
] as const;

export { BASE_VIETNAM_PROMPTS, SENCAM_BACKGROUND_PROMPTS };

