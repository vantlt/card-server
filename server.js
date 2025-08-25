const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware để đọc dữ liệu từ form (quan trọng!)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Không cần cors() vì form submission không bị kiểm tra CORS giống như fetch
// Nhưng chúng ta cứ để đó phòng trường hợp cần gỡ lỗi sau này
app.use(cors());

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Server is running and ready for form submission downloads!');
});

// Endpoint duy nhất: Nhận dữ liệu từ form và trả về file ảnh
app.post('/generate-download-from-form', (req, res) => {
  try {
    const { imageData } = req.body; // Lấy dữ liệu từ input có name="imageData"
    const name = req.body.name || 'dai-bieu'; // Lấy tên từ input có name="name"

    if (!imageData) {
      return res.status(400).send('Không tìm thấy dữ liệu ảnh.');
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
    console.error(error);
    res.status(500).send('Lỗi xử lý ảnh phía server.');
  }
});

// Xuất app để Vercel có thể sử dụng
module.exports = app;
