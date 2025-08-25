const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// === Cấu hình CORS ===
// Cho phép request từ trang Wix của bạn
const corsOptions = {
  origin: 'https://daihoihsvviii.wixsite.com' // Đã cập nhật địa chỉ Wix của bạn
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

    // Tách phần header của base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const uniqueId = uuidv4();
    
    // Tạo tên file an toàn
    const safeName = name ? name.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'dai-bieu';
    const filename = `${safeName}-${uniqueId}.png`;
    const filePath = path.join(downloadsDir, filename);

    // Ghi file vào server
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Tạo link để client tải về
    const downloadUrl = `${req.protocol}://${req.get('host')}/download/${filename}`;

    // Lên lịch xóa file sau 1 thời gian ngắn (ví dụ 5 phút) để dọn dẹp
    setTimeout(() => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }, 300000); // 5 phút = 300000 ms

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
    // res.download() sẽ tự động set header Content-Disposition: attachment
    res.download(filePath, (err) => {
      if (err) {
        console.error("Lỗi khi gửi file:", err);
      }
      // File đã được gửi đi, không cần làm gì thêm
    });
  } else {
    res.status(404).send('Không tìm thấy file hoặc file đã hết hạn. Vui lòng thử lại.');
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
