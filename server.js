const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware để đọc dữ liệu từ form (urlencoded)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware CORS - Cho phép mọi yêu cầu để đảm bảo không bị chặn
app.use(cors());
app.options('*', cors()); 

// Route trang chủ để kiểm tra server có hoạt động không
app.get('/', (req, res) => {
  res.send('Card Generator Server is ready!');
});

// Endpoint duy nhất để nhận dữ liệu từ form và trả về file ảnh
app.post('/generate-image', (req, res) => {
  try {
    const imageData = req.body.imageData; 
    const name = req.body.name || 'dai-bieu';

    if (!imageData) {
      return res.status(400).send('Lỗi: Server không nhận được dữ liệu ảnh.');
    }
    
    // Tạo buffer ảnh từ base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Tạo tên file
    const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeName}-${uuidv4().substring(0, 8)}.png`;
    
    // Thiết lập headers để trình duyệt hiểu đây là một file cần tải xuống
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    
    // Gửi dữ liệu ảnh về cho client
    res.send(imageBuffer);

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).send('Đã có lỗi xảy ra trên server.');
  }
});

// Xuất app để Vercel có thể sử dụng (Cách làm chuẩn)
module.exports = app;
