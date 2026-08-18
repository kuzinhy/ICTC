// Helper file for interacting with Gemini API safely through the backend
// Handles missing keys or server errors by falling back to high-quality simulations.

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
      primaryColor: '#6366f1',
      secondaryColor: '#06b6d4',
      backgroundColor: '#0f172a',
      textColor: '#f8fafc',
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

  return {
    title: 'Nền Tảng Sáng Tạo & Chia Sẻ ICTC',
    primaryColor: '#8b5cf6',
    secondaryColor: '#f43f5e',
    backgroundColor: '#111827',
    textColor: '#f9fafb',
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

// API call to Optimize Prompt through backend
export const optimizePrompt = async (
  rawPrompt: string, 
  category: string, 
  toolType: string
): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/optimize-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawPrompt, category, toolType }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || simulateOptimizePrompt(rawPrompt, category, toolType);
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return simulateOptimizePrompt(rawPrompt, category, toolType);
  }
};

// API call to Generate Design Mockup through backend
export const generateDesignPreview = async (prompt: string): Promise<DesignLayoutPreview> => {
  try {
    const response = await fetch('/api/gemini/generate-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating preview:', error);
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
