const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// === Cấu hình CORS an toàn cho sản phẩm ===
const allowedOrigins = [
  'https://daihoihsvviii.wixsite.com', // Trang Wix chính thức
  'https://app.onecompiler.com',      // Trang bạn dùng để test
  'null' // Cho phép test trực tiếp từ file HTML mở trên máy
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// Middleware để đọc JSON body
app.use(express.json({ limit: '10mb' }));

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Server is running and ready for direct download generation!');
});

// Endpoint duy nhất: Nhận base64 và trả về file ảnh trực tiếp
app.post('/generate-download', (req, res) => {
  try {
    const { imageData, name } = req.body;
    if (!imageData) {
      return res.status(400).send('Không tìm thấy dữ liệu ảnh.');
    }
    
    // Tạo buffer ảnh từ base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Tạo tên file
    const safeName = name ? name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'dai-bieu';
    const filename = `${safeName}-${uuidv4().substring(0, 8)}.png`;
    
    // Thiết lập headers để trình duyệt hiểu đây là một file cần tải xuống
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    
    // Gửi dữ liệu ảnh về cho client
    res.send(imageBuffer);

  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi xử lý ảnh phía server.');
  }
});

// Xuất app để Vercel có thể sử dụng
module.exports = app;
