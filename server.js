const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware để đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware CORS
app.use(cors());
app.options('*', cors()); 

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Server is running in Vercel-optimized mode!');
});

// Endpoint duy nhất
app.post('/generate-download-from-form', (req, res) => {
  try {
    const imageData = req.body.imageData; 
    const name = req.body.name || 'dai-bieu';

    if (!imageData) {
      return res.status(400).send('Lỗi: Server không nhận được dữ liệu ảnh từ form.');
    }
    
    // Tạo buffer ảnh từ base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Tạo tên file
    const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeName}-${uuidv4().substring(0, 8)}.png`;
    
    // Thiết lập headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    
    // Gửi dữ liệu ảnh về cho client
    res.send(imageBuffer);

  } catch (error) {
    console.error('SERVER CRITICAL ERROR:', error);
    res.status(500).send('Đã có lỗi nghiêm trọng xảy ra trên server.');
  }
});

// =========================================================================
// === THAY ĐỔI QUAN TRỌNG: Xuất app để Vercel tự quản lý vòng đời server ===
module.exports = app;
// =========================================================================
