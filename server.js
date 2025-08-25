const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data'); // Import "phiên dịch viên"

const app = express();

// Middleware để đọc JSON từ client (Wix)
app.use(express.json({ limit: '10mb' }));

// Middleware CORS
app.use(cors());
app.options('*', cors()); 

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Card Generator Server with Imgur is ready! (Final Fix)');
});

// Endpoint duy nhất
app.post('/upload-and-get-link', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh.' });
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    
    const IMGUR_CLIENT_ID = 'e18bca875424527';

    // =========================================================================
    // === SỬA LỖI CUỐI CÙNG: Dùng FormData để tạo đúng định dạng multipart/form-data ===
    // =========================================================================
    const form = new FormData();
    form.append('image', base64Data);
    form.append('type', 'base64');

    // Gửi yêu cầu đến API của Imgur với đúng định dạng
    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        ...form.getHeaders() // Để thư viện tự điền header multipart
      },
      body: form, // Gửi form làm body
    });
    // =========================================================================

    const imgurData = await imgurResponse.json(); // Bây giờ Imgur chắc chắn sẽ trả về JSON

    if (!imgurData.success) {
      console.error('Imgur API Error:', imgurData);
      throw new Error('Tải ảnh lên Imgur thất bại.');
    }

    // Trả về link ảnh từ Imgur
    res.json({ imageUrl: imgurData.data.link });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ error: 'Đã có lỗi xảy ra trên server.' });
  }
});

// Xuất app để Vercel sử dụng
module.exports = app;
