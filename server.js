const express = require('express');
const cors = require('cors');

const app = express();

// Middleware để đọc dữ liệu JSON
app.use(express.json({ limit: '10mb' }));

// Middleware CORS
app.use(cors());
app.options('*', cors()); 

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Card Generator Server with Imgur is ready!');
});

// Endpoint duy nhất
app.post('/upload-and-get-link', async (req, res) => {
  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh.' });
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    
    // Client ID công khai của Imgur - không cần giữ bí mật
    const IMGUR_CLIENT_ID = 'e18bca875424527';

    // Gửi yêu cầu đến API của Imgur
    const imgurResponse = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        type: 'base64',
      }),
    });

    const imgurData = await imgurResponse.json();

    if (!imgurData.success) {
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
