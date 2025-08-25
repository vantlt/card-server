const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để đọc dữ liệu từ form
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware CORS
app.use(cors());
app.options('*', cors()); 

// Route trang chủ để kiểm tra
app.get('/', (req, res) => {
  console.log("Accessed root route /");
  res.send('Server is running and correctly configured for form data!');
});

// Endpoint duy nhất
app.post('/generate-download-from-form', (req, res) => {
  console.log("Received POST request on /generate-download-from-form");
  try {
    const imageData = req.body.imageData; 
    const name = req.body.name || 'dai-bieu';
    console.log(`Received name: ${name}`);

    if (!imageData) {
      console.error("Error: Image data is missing.");
      return res.status(400).send('Lỗi: Server không nhận được dữ liệu ảnh từ form.');
    }
    console.log("Image data received successfully.");
    
    // Tạo buffer ảnh từ base64
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log(`Image buffer created with length: ${imageBuffer.length}`);
    
    // Tạo tên file
    const safeName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `${safeName}-${uuidv4().substring(0, 8)}.png`;
    console.log(`Generated filename: ${filename}`);
    
    // Thiết lập headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    
    // Gửi dữ liệu ảnh về cho client
    console.log("Sending image response to client...");
    res.send(imageBuffer);

  } catch (error) {
    console.error('SERVER CRITICAL ERROR:', error);
    res.status(500).send('Đã có lỗi nghiêm trọng xảy ra trên server.');
  }
});

// =================================================================
// === THAY ĐỔI QUAN TRỌNG: Dùng app.listen để đảm bảo server chạy ===
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
// =================================================================

// Không cần module.exports nữa
// module.exports = app;
