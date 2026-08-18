import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }
    return new GoogleGenerativeAI(apiKey);
  };

  // API Routes
  app.post('/api/gemini/optimize-prompt', async (req, res) => {
    try {
      const { rawPrompt, category, toolType } = req.body;
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const promptText = `Bạn là chuyên gia kỹ thuật viết prompt (Prompt Engineer) cho các AI tạo ảnh như Midjourney, DALL-E 3, Stable Diffusion và Gemini Imagen.
Hãy tối ưu hóa câu lệnh thiết kế sau đây thành một câu lệnh tạo ảnh (Prompt) hoàn chỉnh bằng TIẾNG VIỆT, cực kỳ chi tiết, chuẩn quy chuẩn đồ họa, văn hóa, biểu tượng và nghi thức Việt Nam (sử dụng cờ Tổ quốc Việt Nam, cờ Đảng Cộng sản Việt Nam, hoa sen, Trống đồng Đông Sơn, màu cờ đỏ sao vàng, phong cách trang trọng lịch sự).
Yêu cầu: thêm chi tiết cụ thể về bố cục thị giác, ánh sáng sân khấu/studio, phối màu chuẩn, hoa văn trang trí truyền thống, không gian chừa trống cho tiêu đề, tỷ lệ khung hình và chất lượng dựng hình 8K sắc nét.

Prompt thô cần tối ưu: "${rawPrompt}"
Loại thiết kế: ${category}
AI hướng tới: ${toolType}

Chỉ trả về duy nhất đoạn câu lệnh tiếng Việt đã tối ưu hóa, không thêm bất kỳ lời dẫn hay ghi chú nào khác.`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      res.json({ result: response.text().trim() });
    } catch (error: any) {
      console.error('Gemini Optimization Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gemini/generate-preview', async (req, res) => {
    try {
      const { prompt } = req.body;
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const promptText = `Dựa vào prompt thiết kế sau: "${prompt}". Hãy đóng vai một chuyên gia hàng đầu về UI/UX và thiết kế đồ họa.
Phân tích ý tưởng và tạo ra một sơ đồ thiết kế chi tiết dưới dạng một đối tượng JSON chuẩn xác chứa các thông tin phối màu, cấu trúc và nội dung để hiển thị mô phỏng trong trình duyệt.

Yêu cầu định dạng JSON trả về PHẢI có cấu trúc chính xác như sau:
{
  "title": "Tiêu đề thiết kế ngắn gọn, trực quan bằng tiếng Việt",
  "primaryColor": "Mã màu hex chủ đạo phù hợp nhất",
  "secondaryColor": "Mã màu hex phụ làm điểm nhấn",
  "backgroundColor": "Mã màu hex nền tối hoặc sáng phù hợp",
  "textColor": "Mã màu hex cho văn bản tương phản tốt với nền",
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
}`;

      const result = await model.generateContent(promptText);
      const response = await result.response;
      res.json(JSON.parse(response.text()));
    } catch (error: any) {
      console.error('Gemini Preview Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
