import { AIPrompt } from '../types';
import { generateFull100VietnamPrompts, BASE_VIETNAM_PROMPTS } from './vietnam100DesignPrompts';

export const INITIAL_AI_PROMPTS: AIPrompt[] = generateFull100VietnamPrompts();

export const PROMPT_CATEGORIES = [
  'Tất cả',
  'Phông Hội Nghị',
  'Băng Rôn & Khẩu Hiệu',
  'Banner Sự Kiện',
  'Standee Triển Lãm',
  'Thiệp Mời & Giấy Mời',
  'Poster & Infographic',
  'Bìa Sổ & Kỷ Yếu'
] as const;

export { BASE_VIETNAM_PROMPTS };
