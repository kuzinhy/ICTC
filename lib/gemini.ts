// Helper file for interacting with Gemini API safely on client side
// Handles missing keys gracefully by falling back to high-quality rule-based simulations.

export const getGeminiApiKey = (): string | null => {
  // Try retrieving from process.env (defined in vite.config.ts)
  const key = (process.env.GEMINI_API_KEY || process.env.API_KEY) as string | undefined;
  if (key && key !== 'undefined' && key.trim() !== '') {
    return key;
  }
  return null;
};

export const isGeminiAvailable = (): boolean => {
  return getGeminiApiKey() !== null;
};

// Interface for Design Preview schema
export interface DesignLayoutPreview {
  title: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontStyle: 'Sans-serif' | 'Serif' | 'Monospace' | 'Display';
  layoutType: 'Bento Grid' | 'Split Screen' | 'Minimalist Center' | 'Hero Header' | 'Card Grid';
  sections: { name: string; description: string }[];
  visualAssets: string[];
  vibes: string[];
}

// Fallback rule-based simulator for Prompt Optimization
export const simulateOptimizePrompt = (rawPrompt: string, category: string, toolType: string): string => {
  const lowercasePrompt = rawPrompt.toLowerCase();
  
  let additions = '';
  if (lowercasePrompt.includes('phông') || lowercasePrompt.includes('đại hội') || lowercasePrompt.includes('hội nghị')) {
    additions = 'Phông nền sân khấu hội nghị đại hội trang trọng chuẩn phong cách Việt Nam, cờ Đảng búa liềm và cờ Tổ quốc đỏ tươi bay phấp phới ở góc trái, hoa văn Trống đồng Đông Sơn mạ vàng kim khắc chìm tinh xảo ở tâm giữa, cụm hoa sen hồng nở rộ thanh khiết, dải lụa đỏ uốn lượn sắc sảo, dải ruy băng mạ vàng, bố cục cân đối hoàn hảo cho chữ tiêu đề trung tâm, ánh sáng sân khấu studio rực rỡ, độ phân giải 8K, chất lượng dựng hình đồ họa vector sắc nét.';
  } else if (lowercasePrompt.includes('băng rôn') || lowercasePrompt.includes('banner') || lowercasePrompt.includes('standee')) {
    additions = 'Bố cục đồ họa truyền thông chuẩn Việt Nam, tỷ lệ chuẩn xác, dải cờ đỏ sao vàng uốn lượn mềm mại, hoa văn trống đồng Đông Sơn chìm tinh tế, màu sắc tươi sáng trang nhã, không gian thoáng đãng chừa vị trí đặt tiêu đề, đồ họa vector sắc nét, ánh sáng tự nhiên rực rỡ, độ phân giải siêu nét 8k.';
  } else if (lowercasePrompt.includes('thiệp') || lowercasePrompt.includes('giấy khen') || lowercasePrompt.includes('bằng khen')) {
    additions = 'Khung viền hoa văn trang trí hoàng gia mạ vàng kim dập nổi tỉ mỉ trên nền đỏ đô hoặc kem ngà cao cấp, biểu tượng Quốc huy hoặc hoa sen cách điệu tinh xảo, bố cục trang nghiêm chuẩn nghi thức ngoại giao và vinh danh Nhà nước Việt Nam, chất lượng in ấn nghệ thuật cao cấp, hiệu ứng ánh kim lấp lánh, độ chi tiết 8K.';
  } else {
    additions = 'Thiết kế đồ họa chuẩn quy chuẩn truyền thông và văn hóa Việt Nam, màu sắc rực rỡ tương phản hài hòa, hoa văn trống đồng Đông Sơn và hoa sen biểu trưng truyền thống, ánh sáng studio nghệ thuật, chiều sâu không gian ấn tượng, độ phân giải 8K siêu nét, chi tiết tỉ mỉ.';
  }

  return `[${toolType}] Câu lệnh tạo ảnh: Thiết kế "${rawPrompt}". Yêu cầu chi tiết: ${additions}`;
};

// Fallback rule-based simulator for Design Layout Previews
export const simulateDesignLayout = (prompt: string): DesignLayoutPreview => {
  const lowercasePrompt = prompt.toLowerCase();
  
  if (lowercasePrompt.includes('3d') || lowercasePrompt.includes('isometric') || lowercasePrompt.includes('giao diện')) {
    return {
      title: 'Hệ Thống Quản Lý Giáo Dục Số 3D',
      primaryColor: '#6366f1', // Indigo
      secondaryColor: '#06b6d4', // Cyan
      backgroundColor: '#0f172a', // Slate 900
      textColor: '#f8fafc', // Slate 50
      fontStyle: 'Sans-serif',
      layoutType: 'Bento Grid',
      sections: [
        { name: 'Khu Vực Học Tập Trực Quan', description: 'Bảng điều khiển chứa các thẻ glassmorphic nổi hiển thị tiến trình học và bài kiểm tra 3D sinh động.' },
        { name: 'Phòng Thí Nghiệm Ảo', description: 'Trình mô phỏng phòng thí nghiệm vật lý hóa học bằng mô hình không gian 3 chiều tương tác trực tiếp.' },
        { name: 'Trung Tâm Thảo Luận AI', description: 'Hộp thoại chat thông minh hỗ trợ giải bài tập và gợi ý lộ trình nghiên cứu bằng trí tuệ nhân tạo.' }
      ],
      visualAssets: [
        'Mô hình quả cầu Hologram xoay chậm ở trung tâm màn hình',
        'Các thẻ thông số bán trong suốt với viền sáng neon tinh tế',
        'Nền gradient mượt chuyển động từ xanh chàm sang xanh ngọc'
      ],
      vibes: ['Futuristic', 'Innovative', 'Interactive']
    };
  }

  if (lowercasePrompt.includes('poster') || lowercasePrompt.includes('hội thảo') || lowercasePrompt.includes('banner')) {
    return {
      title: 'Hội Thảo Khoa Học: Kiến Tạo Tương Lai Số',
      primaryColor: '#ec4899', // Pink
      secondaryColor: '#8b5cf6', // Violet
      backgroundColor: '#0b0f19', // Cool Dark Grey
      textColor: '#ffffff',
      fontStyle: 'Display',
      layoutType: 'Split Screen',
      sections: [
        { name: 'Khu Vực Diễn Giả', description: 'Ảnh chân dung nghệ thuật tương phản cao lồng ghép hiệu ứng glitch phơi sáng kép độc đáo.' },
        { name: 'Lịch Trình Seminar', description: 'Trình bày theo cột dạng Swiss typography sạch sẽ, gọn gàng và dễ theo dõi.' },
        { name: 'Thông Tin Đăng Ký', description: 'Nút CTA kích thước lớn màu gradient hồng tím nổi bật kèm mã QR đăng ký nhanh.' }
      ],
      visualAssets: [
        'Cấu trúc mạng lưới neuron phát sáng mờ ảo ở một bên màn hình',
        'Typography tiêu đề khổ lớn căn chỉnh lưới bất đối xứng',
        'Các vệt sáng dạng hạt ánh sáng chuyển động chậm'
      ],
      vibes: ['Academic', 'Tech-Forward', 'Bold']
    };
  }

  // General default fallback
  return {
    title: 'Nền Tảng Sáng Tạo & Chia Sẻ ICTC',
    primaryColor: '#8b5cf6', // Violet
    secondaryColor: '#f43f5e', // Rose
    backgroundColor: '#111827', // Gray 900
    textColor: '#f9fafb', // Gray 50
    fontStyle: 'Sans-serif',
    layoutType: 'Hero Header',
    sections: [
      { name: 'Thư Viện Tài Nguyên', description: 'Hiển thị danh sách các file thiết kế chất lượng cao từ Drive chỉ định dạng lưới.' },
      { name: 'Trợ Lý Prompt AI', description: 'Nơi người dùng nhập từ khóa sáng tạo và tối ưu hóa câu lệnh bằng Gemini.' },
      { name: 'Hộp Cát Trực Quan (Sandbox)', description: 'Hiển thị mô phỏng trực tiếp kết quả giao diện thiết kế dựa trên AI Prompt.' }
    ],
    visualAssets: [
      'Giao diện thẻ bọc viền mượt với hiệu ứng trỏ chuột hover đổ bóng',
      'Đồ họa vector biểu trưng cho giáo dục và công nghệ hiện đại',
      'Background tối giản với hoa văn chấm lưới mang hơi hướng kỹ thuật'
    ],
    vibes: ['Modern', 'Educational', 'Inspiring']
  };
};

// API call to Optimize Prompt
export const optimizePrompt = async (
  rawPrompt: string, 
  category: string, 
  toolType: string
): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    // Graceful offline simulation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateOptimizePrompt(rawPrompt, category, toolType));
      }, 1000);
    });
  }

  try {
    const promptText = `Bạn là chuyên gia kỹ thuật viết prompt (Prompt Engineer) cho các AI tạo ảnh như Midjourney, DALL-E 3, Stable Diffusion và Gemini Imagen.
Hãy tối ưu hóa câu lệnh thiết kế sau đây thành một câu lệnh tạo ảnh (Prompt) hoàn chỉnh bằng TIẾNG VIỆT, cực kỳ chi tiết, chuẩn quy chuẩn đồ họa, văn hóa, biểu tượng và nghi thức Việt Nam (sử dụng cờ Tổ quốc Việt Nam, cờ Đảng Cộng sản Việt Nam, hoa sen, Trống đồng Đông Sơn, màu cờ đỏ sao vàng, phong cách trang trọng lịch sự).
Yêu cầu: thêm chi tiết cụ thể về bố cục thị giác, ánh sáng sân khấu/studio, phối màu chuẩn, hoa văn trang trí truyền thống, không gian chừa trống cho tiêu đề, tỷ lệ khung hình và chất lượng dựng hình 8K sắc nét.

Prompt thô cần tối ưu: "${rawPrompt}"
Loại thiết kế: ${category}
AI hướng tới: ${toolType}

Chỉ trả về duy nhất đoạn câu lệnh tiếng Việt đã tối ưu hóa, không thêm bất kỳ lời dẫn hay ghi chú nào khác.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (resultText) {
      return resultText.trim();
    }
    throw new Error('Empty response from Gemini');
  } catch (error) {
    console.error('Error optimizing prompt with Gemini:', error);
    return simulateOptimizePrompt(rawPrompt, category, toolType);
  }
};

// API call to Generate Design Mockup JSON
export const generateDesignPreview = async (prompt: string): Promise<DesignLayoutPreview> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateDesignLayout(prompt));
      }, 1500);
    });
  }

  try {
    const promptText = `Dựa vào prompt thiết kế sau: "${prompt}". Hãy đóng vai một chuyên gia hàng đầu về UI/UX và thiết kế đồ họa.
Phân tích ý tưởng và tạo ra một sơ đồ thiết kế chi tiết dưới dạng một đối tượng JSON chuẩn xác chứa các thông tin phối màu, cấu trúc và nội dung để hiển thị mô phỏng trong trình duyệt.

Yêu cầu định dạng JSON trả về PHẢI có cấu trúc chính xác như sau (không đổi tên trường):
{
  "title": "Tiêu đề thiết kế ngắn gọn, trực quan bằng tiếng Việt",
  "primaryColor": "Mã màu hex chủ đạo phù hợp nhất (ví dụ: #6366f1)",
  "secondaryColor": "Mã màu hex phụ làm điểm nhấn (ví dụ: #06b6d4)",
  "backgroundColor": "Mã màu hex nền tối hoặc sáng phù hợp (ví dụ: #0f172a hoặc #f8fafc)",
  "textColor": "Mã màu hex cho văn bản tương phản tốt với nền (ví dụ: #f8fafc hoặc #0f172a)",
  "fontStyle": "Chọn 1 trong 4 giá trị: 'Sans-serif' | 'Serif' | 'Monospace' | 'Display'",
  "layoutType": "Chọn 1 trong 5 giá trị: 'Bento Grid' | 'Split Screen' | 'Minimalist Center' | 'Hero Header' | 'Card Grid'",
  "sections": [
    { "name": "Tiêu đề phân mục 1", "description": "Mô tả chi tiết nội dung hiển thị trực quan của phân mục này" },
    { "name": "Tiêu đề phân mục 2", "description": "Mô tả chi tiết nội dung hiển thị trực quan của phân mục này" },
    { "name": "Tiêu đề phân mục 3", "description": "Mô tả chi tiết nội dung hiển thị trực quan của phân mục này" }
  ],
  "visualAssets": [
    "Gợi ý chi tiết về tài nguyên đồ họa 1 cần có",
    "Gợi ý chi tiết về tài nguyên đồ họa 2 cần có",
    "Gợi ý chi tiết về tài nguyên đồ họa 3 cần có"
  ],
  "vibes": ["Từ khóa cảm xúc 1", "Từ khóa cảm xúc 2", "Từ khóa cảm xúc 3"]
}

Chú ý quan trọng:
1. Trả về đúng định dạng JSON hợp lệ để hệ thống parse được.
2. Không bọc JSON trong bất kỳ ký tự nào khác kể cả dấu nháy đơn hay ba dấu nháy ngược \`\`\`json. Hãy bắt đầu trực tiếp bằng ký tự '{' và kết thúc bằng '}'.
3. Đảm bảo độ tương phản màu sắc giữa các màu được chọn đáp ứng tiêu chuẩn dễ đọc.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean potential markdown wrappers
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.substring(7);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.substring(0, cleanedText.length - 3);
    }
    cleanedText = cleanedText.trim();

    try {
      const parsed: DesignLayoutPreview = JSON.parse(cleanedText);
      // Validate structure basics
      if (parsed.title && parsed.primaryColor && parsed.sections && parsed.sections.length > 0) {
        return parsed;
      }
      throw new Error('Incomplete JSON schema returned');
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON directly. Attempting regex extraction...', parseError);
      // Fallback parse attempt using string matching or return default
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const matchedParsed: DesignLayoutPreview = JSON.parse(jsonMatch[0]);
          return matchedParsed;
        } catch (innerError) {
          console.error('Both direct and matched parses failed:', innerError);
        }
      }
      throw new Error('Parsing failed completely');
    }
  } catch (error) {
    console.error('Error generating preview with Gemini:', error);
    return simulateDesignLayout(prompt);
  }
};

export const generateLayoutMockup = async (prompt: string) => {
  const preview = await generateDesignPreview(prompt);
  return {
    colors: [preview.primaryColor, preview.secondaryColor, preview.backgroundColor, preview.textColor],
    layoutType: preview.layoutType,
    vibes: preview.vibes,
    elements: preview.sections.map(s => `${s.name}: ${s.description}`),
    fontFamily: preview.fontStyle
  };
};
