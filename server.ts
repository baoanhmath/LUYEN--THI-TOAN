import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// System instructions for AI math generator conforming to 2018 Vietnamese High School Math curriculum
const MATH_AI_SYSTEM_INSTRUCTION = `
Bạn là chuyên gia thẩm định và biên soạn đề thi môn Toán THPT Việt Nam theo Chương trình Giáo dục phổ thông (GDPT) 2018, đồng hành cùng Thầy Phạm Bảo Anh (Dạy học Toán PBA).
Nhiệm vụ của bạn là phân tích tài liệu Toán được cung cấp (giáo án, đề thi, chuyên đề PDF/DOCX) và tạo ra các câu hỏi toán học bám sát 100% nội dung, phương pháp, dạng bài và dữ kiện trong tài liệu đó.

NGUYÊN TẮC BẤT KHẢ XÂM PHẠM:
1. SỬ DỤNG TÀI LIỆU LÀM NGUỒN KIẾN THỨC VÀ DẠNG BÀI CHÍNH.
   - Các câu hỏi sinh ra PHẢI đúng chủ đề, đúng định lý, đúng dạng toán xuất hiện trong tài liệu giáo viên tải lên.
   - Tuyệt đối không sinh các câu hỏi thuộc chủ đề khác (ví dụ: nếu tài liệu về "Hình không gian Oxyz" thì KHÔNG được sinh bài về "Khảo sát hàm số" hay "Xác suất").
   - Kế thừa hệ thống giả thiết, phương pháp giải, bài toán thực tiễn hoặc mô hình bài tập có trong tài liệu.
2. CÔNG THỨC TOÁN HỌC:
   - Inline math bắt buộc bọc trong dấu $...$ (ví dụ: $y = f(x)$, $A(1; 2; 3)$, $\\vec{n} = (a; b; c)$).
   - Display/Block math bắt buộc bọc trong $$...$$.
3. CẤU TRÚC ĐÁNH GIÁ CHUẨN ĐỀ THI 2025 CỦA BỘ GIÁO DỤC:
   - Mỗi câu hỏi sinh ra PHẢI chứa:
     * context: Bối cảnh, giả thiết toán học rõ ràng bám sát tài liệu.
     * ask: Câu hỏi dành cho trắc nghiệm nhiều lựa chọn.
     * correctOption: 1 đáp án đúng chính xác về mặt toán học.
     * distractors: Đúng 3 phương án nhiễu sai hợp lý (dễ nhầm dấu, sai công thức, quên chia độ dài, v.v.).
     * tfStatements: Đúng 4 mệnh đề a, b, c, d (mỗi mệnh đề có text, isTrue: boolean, và explanation giải thích cặn kẽ).
     * shortAnswerPrompt: Yêu cầu điền đáp số ngắn (Phần III).
     * shortAnswer: Đáp số gọn (số nguyên, số thập phân hoặc phân số rút gọn).
     * solution: Lời giải chi tiết, sư phạm, bước giải tường minh.
     * lessonId: ID bài học tương ứng (nếu xác định được, ví dụ: "12-1", "12-14", "11-6").
     * diagram: type biểu đồ phù hợp nếu là đồ thị giải tích hoặc hình học.
`;

// Helper to get GoogleGenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong môi trường.');
  }
  return new GoogleGenAI({ apiKey });
}

// 1. Endpoint: Phân tích tài liệu (extract outline, chapters, key topics, formulas)
app.post('/api/ai/analyze-document', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, fileName, textContent } = req.body;

    if (!fileBase64 && !textContent) {
      return res.status(400).json({ error: 'Vui lòng cung cấp nội dung tài liệu hoặc file.' });
    }

    const ai = getGenAI();

    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }

    const promptText = `
Hãy đọc và phân tích kỹ tài liệu đính kèm (Tên file: ${fileName || 'Tài liệu Toán'}).
Trích xuất và tóm tắt cấu trúc sư phạm của tài liệu:
1. Xác định Khối lớp chính (10, 11 hoặc 12).
2. Tên chủ đề hoặc Chương bài chính.
3. Tóm tắt nội dung lý thuyết chính, các định lý, công thức trọng tâm có trong tài liệu.
4. Liệt kê các dạng bài tập / mức độ nhận thức xuất hiện trong tài liệu.
5. Đánh giá sơ bộ xem tài liệu có đầy đủ dữ kiện để sinh câu hỏi chất lượng cao không.
${textContent ? `\n\nNội dung văn bản bổ trợ:\n${textContent.slice(0, 8000)}` : ''}

Hãy trả về kết quả dưới dạng JSON theo schema:
{
  "detectedGrade": 10 | 11 | 12,
  "topicTitle": "string",
  "chapterName": "string",
  "summary": "string",
  "keyTheorems": ["string"],
  "identifiedTopics": [
    { "id": "string", "name": "string", "level": "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao" }
  ],
  "readinessAssessment": {
    "isSufficient": boolean,
    "notes": "string"
  }
}
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: MATH_AI_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error analyzing document:', err);
    return res.status(500).json({
      error: 'Không thể phân tích tài liệu: ' + (err.message || String(err)),
    });
  }
});

// 2. Endpoint: Sinh câu hỏi từ tài liệu theo đúng schema QuestionGenerated
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  try {
    const {
      fileBase64,
      mimeType,
      fileName,
      textContent,
      grade = 12,
      topicTitle = 'Chủ đề Toán THPT',
      count = 3,
      levels = ['Nhận biết', 'Thông hiểu', 'Vận dụng'],
      customInstructions = '',
    } = req.body;

    const ai = getGenAI();

    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType,
          data: fileBase64,
        },
      });
    }

    const promptText = `
DỰA TRÊN TÀI LIỆU TOÁN NGUỒN ĐÍNH KÈM (Tên file: ${fileName || 'Tài liệu nguồn'}):
YÊU CẦU BẮT BUỘC ĐỐI VỚI BỘ CÂU HỎI SINH RA:
- Khối lớp: Toán ${grade} (Chương trình GDPT 2018)
- Chủ đề mục tiêu: "${topicTitle}"
- Số lượng câu hỏi cần sinh: ${count} câu hỏi hoàn chỉnh.
- Mức độ nhận thức: ${levels.join(', ')}
${customInstructions ? `- Yêu cầu sư phạm bổ sung từ giáo viên: ${customInstructions}` : ''}
${textContent ? `\nTrích đoạn nội dung tài liệu nguồn:\n${textContent.slice(0, 10000)}` : ''}

QUY TẮC CỰC KỲ QUAN TRỌNG:
1. NỘI DUNG VÀ DẠNG BÀI: Phải bám sát chặt chẽ các bài toán, lý thuyết, định lý, công thức và dữ kiện trong tài liệu tải lên. Chủ đề câu hỏi sinh ra PHẢI là "${topicTitle}". Tuyệt đối không sinh sang bài toán thuộc chủ đề khác không có trong tài liệu.
2. MỖI CÂU HỎI LÀ MỘT BỘ ĐẦY ĐỦ 3 PHẦN THI THEO CẤU TRÚC 2025:
   - Phần I: Trắc nghiệm 4 lựa chọn (context + ask + correctOption + 3 distractors)
   - Phần II: Đúng/Sai gồm đúng 4 khẳng định a, b, c, d (mỗi khẳng định có text, isTrue: boolean, explanation)
   - Phần III: Trả lời ngắn (shortAnswerPrompt + shortAnswer)
   - Lời giải chi tiết sư phạm (solution)
   - lessonId: Gán mã bài học tương ứng nếu có (ví dụ '12-1', '12-14', '11-6'...)
3. CÔNG THỨC TOÁN: Bắt buộc dùng ký hiệu $...$ (inline) hoặc $$...$$ (display).
4. KHÔNG THAY ĐỔI DỮ KIỆN TỰ Ý LÀM SAI BẢN CHẤT TOÁN HỌC.

Schema JSON phản hồi là một mảng ARRAY chứa các QuestionGenerated:
`;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: MATH_AI_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              topicTitle: { type: Type.STRING },
              grade: { type: Type.INTEGER },
              context: { type: Type.STRING },
              ask: { type: Type.STRING },
              correctOption: { type: Type.STRING },
              distractors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tfStatements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    isTrue: { type: Type.BOOLEAN },
                    explanation: { type: Type.STRING },
                  },
                  required: ['text', 'isTrue'],
                },
              },
              shortAnswerPrompt: { type: Type.STRING },
              shortAnswer: { type: Type.STRING },
              solution: { type: Type.STRING },
              diagram: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                },
              },
            },
            required: [
              'id',
              'topicTitle',
              'grade',
              'context',
              'ask',
              'correctOption',
              'distractors',
              'tfStatements',
              'shortAnswer',
              'solution',
            ],
          },
        },
      },
    });

    const resultText = response.text || '[]';
    const parsedQuestions = JSON.parse(resultText);

    // Format & validate output
    const validatedQuestions = parsedQuestions.map((q: any, idx: number) => ({
      id: q.id || `ai-gen-${Date.now()}-${idx + 1}`,
      topicTitle: q.topicTitle || topicTitle,
      grade: Number(q.grade) || Number(grade),
      context: q.context || '',
      ask: q.ask || '',
      correctOption: q.correctOption || '',
      distractors: Array.isArray(q.distractors) ? q.distractors.slice(0, 3) : ['1', '2', '3'],
      tfStatements: Array.isArray(q.tfStatements) && q.tfStatements.length >= 4
        ? q.tfStatements.slice(0, 4)
        : [
            { text: 'Khẳng định a đúng theo định lý.', isTrue: true, explanation: 'Xem lời giải' },
            { text: 'Khẳng định b đúng với điều kiện.', isTrue: true, explanation: 'Xem lời giải' },
            { text: 'Khẳng định c sai do ngược chiều bất đẳng thức.', isTrue: false, explanation: 'Xem lời giải' },
            { text: 'Khẳng định d sai do thiếu tập xác định.', isTrue: false, explanation: 'Xem lời giải' },
          ],
      shortAnswerPrompt: q.shortAnswerPrompt || 'Tính giá trị biểu thức đã cho.',
      shortAnswer: q.shortAnswer || '0',
      solution: q.solution || 'Lời giải chi tiết đang được cập nhật.',
      diagram: q.diagram?.type ? { type: q.diagram.type } : undefined,
    }));

    return res.json({ success: true, count: validatedQuestions.length, data: validatedQuestions });
  } catch (err: any) {
    console.error('Error generating questions:', err);
    return res.status(500).json({
      error: 'Không thể sinh câu hỏi: ' + (err.message || String(err)),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dynamic import vite for dev server
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> PBA Math Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
