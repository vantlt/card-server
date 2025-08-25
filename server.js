const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// === Cấu hình CORS ===
// Danh sách các trang web được phép truy cập vào server
const allowedOrigins = [
  'https://daihoihsvviii.wixsite.com', // Trang Wix chính thức
  'https://app.onecompiler.com'          // Trang bạn dùng để test
];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như Postman, app di động) hoặc các origin trong danh sách
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));


// Middleware để đọc JSON body
app.use(express.json({ limit: '10mb' })); // Tăng giới hạn để chứa ảnh base64

// Route trang chủ để kiểm tra server có hoạt động không
app.get('/', (req, res) => {
  res.send('Server is running and ready to receive requests!');
});


// Tạo thư mục 'downloads' nếu chưa có (Vercel sẽ xử lý việc này trong môi trường tạm thời)
const downloadsDir = path.join('/tmp', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Endpoint để nhận base64 và tạo link download
app.post('/generate-download', (req, res) => {
  try {
    const { imageData, name } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh.' });
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const uniqueId = uuidv4();
    
    const safeName = name ? name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'dai-bieu';
    const filename = `${safeName}-${uniqueId}.png`;
    const filePath = path.join(downloadsDir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');

    const downloadUrl = `${req.protocol}://${req.get('host')}/download/${filename}`;

    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }, 300000); 

    res.json({ downloadUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi xử lý ảnh phía server.' });
  }
});

// Endpoint để thực hiện việc tải file
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(downloadsDir, filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Lỗi khi gửi file:", err);
      }
    });
  } else {
    res.status(404).send('Không tìm thấy file hoặc file đã hết hạn. Vui lòng thử lại.');
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
