# 📚 HƯỚNG DẪN DEPLOY VÀ SETTING WEBAPP CHECK-IN

## 📋 MỤC LỤC

1. [Chuẩn bị](#chuẩn-bị)
2. [Deploy Backend (Google Apps Script)](#deploy-backend-google-apps-script)
3. [Deploy Frontend (Web App)](#deploy-frontend-web-app)
4. [Cấu hình và Test](#cấu-hình-và-test)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 CHUẨN BỊ

### Yêu cầu:
- ✅ Tài khoản Google (để sử dụng Google Apps Script)
- ✅ Google Sheet đã có sheet "Mã Vé" với cấu trúc đúng
- ✅ Tài khoản hosting (Vercel/Netlify/GitHub Pages) - miễn phí
- ✅ Tên miền riêng (tùy chọn, có thể dùng subdomain miễn phí)

### Files cần có:
```
checkin-app/
├── index.html          (Frontend HTML)
├── style.css           (Styling)
├── script.js           (Logic frontend)
├── config.js           (Cấu hình API URL)
├── backend/
│   └── CheckinBackend.gs  (Backend Apps Script)
└── HUONG_DAN_DEPLOY.md    (File này)
```

---

## 🔧 DEPLOY BACKEND (GOOGLE APPS SCRIPT)

### Bước 1: Tạo Google Apps Script Project

1. Mở trình duyệt, truy cập: https://script.google.com
2. Click **"New Project"** (Dự án mới)
3. Đổi tên project: Click vào "Untitled project" → Đổi thành **"Check-in Backend"**

### Bước 2: Copy Code Backend

1. Mở file `backend/CheckinBackend.gs`
2. Copy **TOÀN BỘ** nội dung
3. Paste vào Google Apps Script Editor (xóa code mẫu có sẵn)
4. Kiểm tra lại:
   - `SPREADSHEET_ID`: Đúng ID của Google Sheet
   - `TICKET_SHEET_NAME`: "Mã Vé"
   - `LOG_SHEET_NAME`: "Log"

### Bước 3: Lưu và Chạy thử

1. Click **💾 Save** (Ctrl+S)
2. **Lần đầu sẽ yêu cầu Authorization:**
   - Click **▶️ Run** (chọn hàm `doGet` hoặc bất kỳ hàm nào)
   - Click **"Review permissions"**
   - Chọn tài khoản Google
   - Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
   - Click **"Allow"**
3. **Sau khi authorize xong:**
   - Chạy lại hàm `doGet` (hoặc không cần, có thể bỏ qua bước test này)
   - Nếu có lỗi "Cannot read properties of undefined" → **Bình thường**, vì đang test không có request thực tế
   - **Bỏ qua lỗi này** và tiếp tục bước Deploy

### Bước 4: Deploy Web App

1. Click **"Deploy"** → **"New deployment"**
2. Click icon **⚙️ Settings** (bên cạnh "Select type")
3. Chọn **"Web app"**
4. Cấu hình:
   - **Description**: "Check-in API Backend"
   - **Execute as**: **"Me"** (chính bạn)
   - **Who has access**: **"Anyone"** (quan trọng!)
5. Click **"Deploy"**
6. **Copy URL** được tạo ra (ví dụ: `https://script.google.com/macros/s/AKfycby.../exec`)
   - ⚠️ **LƯU LẠI URL NÀY** - sẽ cần dùng ở bước sau!

### Bước 5: Test Backend

1. Mở URL vừa copy trong trình duyệt
2. Nếu thấy JSON response: `{"success":true,"message":"Check-in API is running"}` → ✅ Thành công!
3. Nếu lỗi → Xem phần [Troubleshooting](#troubleshooting)

---

## 🌐 DEPLOY FRONTEND (WEB APP)

Bạn có thể chọn 1 trong 3 cách sau:

### **CÁCH 1: Vercel (Khuyến nghị - Dễ nhất)**

#### Bước 1: Tạo tài khoản Vercel
1. Truy cập: https://vercel.com
2. Click **"Sign Up"** → Đăng nhập bằng GitHub/Google

#### Bước 2: Upload code
1. Tạo repository GitHub mới:
   - Vào https://github.com/new
   - Tên repo: `tdc-checkin-app`
   - Click **"Create repository"**
2. Upload files lên GitHub:
   ```bash
   # Nếu có Git
   git clone https://github.com/YOUR_USERNAME/tdc-checkin-app.git
   cd tdc-checkin-app
   # Copy tất cả files từ checkin-app/ vào đây
   git add .
   git commit -m "Initial commit"
   git push
   ```
   Hoặc upload trực tiếp qua GitHub web interface

#### Bước 3: Deploy trên Vercel
1. Vào https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import repository `tdc-checkin-app`
4. Cấu hình:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (mặc định)
5. Click **"Deploy"**
6. Đợi 1-2 phút → Vercel sẽ tạo URL: `https://tdc-checkin-app.vercel.app`

#### Bước 4: Cấu hình Custom Domain (Tùy chọn)
1. Vào **Settings** → **Domains**
2. Nhập tên miền của bạn
3. Làm theo hướng dẫn để cấu hình DNS

---

### **CÁCH 2: Netlify**

#### Bước 1: Tạo tài khoản Netlify
1. Truy cập: https://netlify.com
2. Click **"Sign up"** → Đăng nhập bằng GitHub/Google

#### Bước 2: Deploy
1. Click **"Add new site"** → **"Import an existing project"**
2. Chọn GitHub repository `tdc-checkin-app`
3. Cấu hình:
   - **Build command**: (để trống)
   - **Publish directory**: `./`
4. Click **"Deploy site"**
5. Đợi deploy xong → URL: `https://random-name.netlify.app`

#### Bước 3: Cấu hình Custom Domain
1. Vào **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Nhập tên miền và làm theo hướng dẫn

---

### **CÁCH 3: GitHub Pages (Đơn giản nhất, nhưng không có HTTPS cho custom domain miễn phí)**

#### Bước 1: Upload lên GitHub
1. Tạo repository như ở Cách 1
2. Upload tất cả files

#### Bước 2: Enable GitHub Pages
1. Vào repository → **Settings** → **Pages**
2. **Source**: Chọn **"main"** branch
3. **Folder**: `/ (root)`
4. Click **"Save"**
5. Đợi vài phút → URL: `https://YOUR_USERNAME.github.io/tdc-checkin-app`

---

## ⚙️ CẤU HÌNH VÀ TEST

### Bước 1: Cấu hình API URL

1. Mở file `config.js` trong project
2. Thay đổi:
   ```javascript
   API_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE'
   ```
   Thành URL bạn đã copy ở bước Deploy Backend:
   ```javascript
   API_URL: 'https://script.google.com/macros/s/AKfycby.../exec'
   ```
3. **Lưu file** và commit/push lại lên GitHub (nếu dùng Git)

### Bước 2: Test Local (Trước khi deploy)

1. Mở `index.html` trong trình duyệt (double-click)
2. Mở **Developer Tools** (F12)
3. Thử:
   - Quét QR code
   - Nhập mã vé thủ công
4. Kiểm tra Console xem có lỗi không

### Bước 3: Test trên Production

1. Truy cập URL webapp đã deploy
2. Test các tính năng:
   - ✅ Quét QR code (cần HTTPS và quyền camera)
   - ✅ Nhập mã vé thủ công
   - ✅ Validate format mã vé
   - ✅ Hiển thị kết quả check-in
3. Kiểm tra Google Sheet:
   - Sheet "Mã Vé": Cột F = "Đã check-in", Cột G có thời gian
   - Sheet "Log": Có log mới

---

## 🔍 TROUBLESHOOTING

### ❌ Lỗi: "Cannot access camera"
**Nguyên nhân**: 
- Chưa có HTTPS
- Chưa cấp quyền camera

**Giải pháp**:
- ✅ Deploy lên Vercel/Netlify (có HTTPS tự động)
- ✅ Cho phép quyền camera khi trình duyệt hỏi

---

### ❌ Lỗi: "CORS policy" hoặc "Network error"
**Nguyên nhân**: 
- Google Apps Script chưa cho phép CORS
- URL API sai

**Giải pháp**:
1. Kiểm tra lại URL trong `config.js`
2. Đảm bảo Apps Script đã deploy với quyền **"Anyone"**
3. Thử mở URL Apps Script trực tiếp trong trình duyệt

---

### ❌ Lỗi: "Mã vé không tồn tại" (dù mã đúng)
**Nguyên nhân**: 
- Sheet "Mã Vé" không tồn tại
- Tên sheet sai
- Mã vé format không khớp

**Giải pháp**:
1. Kiểm tra trong Apps Script:
   - `TICKET_SHEET_NAME = 'Mã Vé'` (đúng tên sheet)
   - `SPREADSHEET_ID` đúng
2. Kiểm tra format mã vé: `EV-YYYYMMDD-HHMMSS-XXX`
3. Kiểm tra trong sheet: Mã vé có đúng ở cột A không?

---

### ❌ Lỗi: "Không thể khởi động camera"
**Nguyên nhân**: 
- Trình duyệt không hỗ trợ
- Chưa có HTTPS
- Camera bị chặn

**Giải pháp**:
- ✅ Dùng Chrome/Edge (hỗ trợ tốt nhất)
- ✅ Đảm bảo có HTTPS
- ✅ Cho phép quyền camera

---

### ❌ QR code không quét được
**Nguyên nhân**: 
- QR code bị mờ
- Ánh sáng không đủ
- Camera không focus

**Giải pháp**:
- ✅ Tăng độ sáng màn hình
- ✅ Đưa QR code gần camera hơn
- ✅ Dùng chế độ nhập thủ công thay thế

---

## 📱 TỐI ƯU CHO MOBILE

### PWA (Progressive Web App) - Tùy chọn

Để app có thể cài đặt trên điện thoại như app thật:

1. Tạo file `manifest.json`:
```json
{
  "name": "TDC Check-in",
  "short_name": "Check-in",
  "description": "Check-in sự kiện TDC",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

2. Thêm vào `index.html`:
```html
<link rel="manifest" href="manifest.json">
```

---

## 🔐 BẢO MẬT

### Khuyến nghị:
1. ✅ **Rate Limiting**: Thêm giới hạn số lần check-in/giây
2. ✅ **Validation**: Luôn validate mã vé ở cả frontend và backend
3. ✅ **HTTPS**: Bắt buộc (Vercel/Netlify tự động có)
4. ✅ **Logging**: Ghi log tất cả check-in để audit

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra **Console** (F12) để xem lỗi
2. Kiểm tra **Google Apps Script Logs** (View → Logs)
3. Kiểm tra sheet "Log" trong Google Sheets

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Backend Apps Script đã deploy
- [ ] URL API đã copy và cấu hình vào `config.js`
- [ ] Frontend đã deploy lên hosting
- [ ] Test quét QR code thành công
- [ ] Test nhập mã thủ công thành công
- [ ] Kiểm tra Google Sheet cập nhật đúng
- [ ] Test trên mobile
- [ ] Cấu hình custom domain (nếu có)

---

**Chúc bạn deploy thành công! 🎉**

