const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình CORS để cho phép yêu cầu từ trang Wix của bạn
// Thay '*' bằng tên miền Wix của bạn để bảo mật hơn, ví dụ: 'https://ten-mien-cua-ban.wixsite.com'
app.use(cors({
  origin: '*' 
}));

// Middleware để xử lý dữ liệu JSON gửi lên
// Tăng giới hạn kích thước payload vì chuỗi base64 có thể rất lớn
app.use(express.json({ limit: '10mb' }));

// Định nghĩa endpoint để xử lý việc tải ảnh
app.post('/download-image', (req, res) => {
  try {
    const { imageData, filename } = req.body;

    // Kiểm tra xem dữ liệu ảnh có được gửi lên không
    if (!imageData) {
      return res.status(400).json({ error: 'Không có dữ liệu ảnh (imageData)' });
    }

    // Loại bỏ phần đầu của chuỗi base64 ("data:image/png;base64,")
    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

    // Chuyển đổi chuỗi base64 thành buffer (dữ liệu nhị phân)
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Lấy tên tệp, nếu không có thì đặt tên mặc định
    const downloadFilename = filename || 'the-dai-hoi.png';

    // Thiết lập headers để trình duyệt hiểu đây là một tệp cần tải xuống
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
    res.setHeader('Content-Length', imageBuffer.length);

    // Gửi dữ liệu ảnh về cho trình duyệt
    res.send(imageBuffer);

  } catch (error) {
    console.error('Lỗi xử lý ảnh:', error);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
