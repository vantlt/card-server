const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================================
// === BƯỚC GỠ LỖI QUAN TRỌNG: Tạm thời cho phép TẤT CẢ các origin ===
app.use(cors());
// ======================================================================

// Middleware để xử lý các yêu cầu preflight OPTIONS một cách tường minh
app.options('*', cors()); 

// Middleware để đọc JSON body
app.use(express.json({ limit: '10mb' }));

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  res.send('Server is running in DEBUG mode (CORS enabled for all).');
});

const downloadsDir = path.join('/tmp', 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Endpoint để nhận base64
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
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }, 300000);
    res.json({ downloadUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi xử lý ảnh phía server.' });
  }
});

// Endpoint để tải file
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(downloadsDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Không tìm thấy file hoặc file đã hết hạn.');
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
