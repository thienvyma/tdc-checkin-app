# 🎫 Webapp Check-in Sự Kiện TDC

Webapp đơn giản để check-in bằng QR code hoặc nhập mã vé thủ công.

## 📁 Cấu trúc Files

```
checkin-app/
├── index.html              # Frontend HTML
├── style.css               # Styling
├── script.js               # Logic frontend
├── config.js               # Cấu hình API URL
├── backend/
│   └── CheckinBackend.gs   # Backend Google Apps Script
├── HUONG_DAN_DEPLOY.md     # Hướng dẫn deploy chi tiết
└── README.md               # File này
```

## 🚀 Quick Start

### 1. Deploy Backend (Google Apps Script)
1. Mở https://script.google.com
2. Tạo project mới
3. Copy code từ `backend/CheckinBackend.gs`
4. Deploy → Web App → Copy URL

### 2. Cấu hình Frontend
1. Copy `config.example.js` thành `config.js`
2. Mở `config.js`
3. Thay `YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` bằng URL từ bước 1

### 3. Deploy Frontend
- **Vercel**: Kéo thả folder `checkin-app` vào Vercel
- **Netlify**: Upload folder lên Netlify
- **GitHub Pages**: Push lên GitHub và enable Pages

## 📖 Chi tiết

Xem file **`HUONG_DAN_DEPLOY.md`** để có hướng dẫn chi tiết từng bước.

## ✨ Tính năng

- ✅ Quét QR code bằng camera
- ✅ Nhập mã vé thủ công
- ✅ Validate format mã vé
- ✅ Tự động cập nhật Google Sheets
- ✅ Responsive design (mobile & desktop)
- ✅ Giao diện đẹp, dễ sử dụng

## 🔧 Yêu cầu

- Google Sheet có sheet "Mã Vé" với cấu trúc đúng
- Google Apps Script (miễn phí)
- Hosting (Vercel/Netlify/GitHub Pages - miễn phí)

## 📝 License

Free to use for your event.

