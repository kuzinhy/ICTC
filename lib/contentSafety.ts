// Content Safety & Automatic Sensitive Keyword Scanner
export interface SafetyCheckResult {
  isClean: boolean;
  score: number; // 0 to 100
  flaggedWords: string[];
  warningMessage?: string;
}

const SENSITIVE_KEYWORDS = [
  'hack', 'crack', 'cheat', 'virus', 'malware', 'phishing',
  'lừa đảo', 'cờ bạc', 'cá độ', 'độc hại', 'xúc phạm',
  'phản động', 'bạo lực', 'khiêu dâm', 'chửi thề'
];

export function scanContentSafety(title: string, description: string = '', content: string = ''): SafetyCheckResult {
  const combinedText = `${title} ${description} ${content}`.toLowerCase();
  const flaggedWords: string[] = [];

  for (const word of SENSITIVE_KEYWORDS) {
    if (combinedText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  }

  const isClean = flaggedWords.length === 0;
  const score = Math.max(0, 100 - flaggedWords.length * 25);

  return {
    isClean,
    score,
    flaggedWords,
    warningMessage: isClean 
      ? undefined 
      : `Phát hiện từ khóa nhạy cảm/cần lưu ý: ${flaggedWords.join(', ')}. Lời nhắn: Nội dung sẽ qua bước kiểm duyệt Admin nghiêm ngặt.`
  };
}
