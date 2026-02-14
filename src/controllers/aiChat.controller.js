const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');

function getTokenFromReq(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice('Bearer '.length);

  const cookieHeader = req.headers.cookie || '';
  const m = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);

  return null;
}

function loginRequiredResponse(res) {
  return res.status(401).json({
    message:
      'Untuk menggunakan fitur AI Chat, kamu perlu login dulu. Silakan login, lalu coba lagi ya.'
  });
}

function getSystemInstruction() {
  return [
    'Kamu adalah agen Customer Service yang ramah dari EzCommerce (aplikasi top-up game).',
    'Gunakan bahasa Indonesia yang sopan dan ringkas.',
    'Jawab SELALU dalam teks biasa (plain text). Jangan gunakan Markdown atau formatting apa pun.',
    'Jangan gunakan tanda seperti **bold**, *italic*, bullet list, heading (#), tabel, atau code block/backtick.',
    'Jika perlu membuat daftar langkah, tulis sebagai kalimat bernomor biasa (contoh: 1) ... 2) ...), tanpa bullet.',
    'Fokus menjawab: cara top up, cara bayar BCA, upload bukti bayar, dan cara cek status transaksi (kode TRX).',
    'Kalau user minta cek status, minta kode TRX atau arahkan ke menu Transaksi.',
    'Jangan minta password atau OTP.'
  ].join(' ');
}

function normalizeToPlainText(text) {
  let t = String(text || '');

  // Remove common Markdown markers (best-effort)
  t = t.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''));
  t = t.replace(/`([^`]+)`/g, '$1');
  t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
  t = t.replace(/\*([^*]+)\*/g, '$1');
  t = t.replace(/__([^_]+)__/g, '$1');
  t = t.replace(/_([^_]+)_/g, '$1');

  // Headings / bullets at line start
  t = t.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  t = t.replace(/^\s*[-*+]\s+/gm, '');

  // Collapse excessive whitespace
  t = t.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  return t;
}

exports.chat = async (req, res, next) => {
  try {
    // Login only
    const token = getTokenFromReq(req);
    if (!token) return loginRequiredResponse(res);

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return loginRequiredResponse(res);
    }

    const userMessage = String(req.body?.message || '').trim();
    if (!userMessage) return res.status(400).json({ message: 'Pesan tidak boleh kosong.' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'GEMINI_API_KEY belum diset di .env. Tambahkan dulu agar chat AI bisa dipakai.'
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
      systemInstruction: getSystemInstruction()
    });

    try {
      // Stateless chat (simple). If you want memory, we can send history from client later.
      const result = await model.generateContent(userMessage);
      const response = await result.response;
      const rawReply = String(response.text() || '').trim();
      const reply = normalizeToPlainText(rawReply) || 'Maaf, aku belum punya jawaban untuk itu.';
      return res.json({ reply });
    } catch (err) {
      const msg = String(err?.message || err || 'Gemini error');

      if (msg.includes('[429') || msg.includes('429') || msg.toLowerCase().includes('quota')) {
        return res.status(429).json({
          message:
            'Kuota/rate limit Gemini kamu sudah habis (429). Coba lagi nanti, atau cek billing/limit di Google AI Studio. Sementara kamu bisa pakai jawaban CS template (tanpa AI) kalau mau.'
        });
      }

      if (msg.includes('models/') && msg.includes('not found')) {
        return res.status(500).json({
          message:
            'Model Gemini tidak ditemukan/ tidak didukung untuk API key ini. Coba ganti `GEMINI_MODEL` di .env, lalu restart server.'
        });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
};
