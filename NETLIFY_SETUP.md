# 🌐 HƯỚNG DẪN CẤU HÌNH NETLIFY

## ⚙️ CẤU HÌNH QUAN TRỌNG CHO NETLIFY

### 1. Tạo file `config.js` trên Netlify

**Vấn đề**: File `config.js` không được commit lên GitHub (vì có trong `.gitignore`), nên Netlify không có file này.

**Giải pháp**:

#### Cách 1: Tạo file trực tiếp trên Netlify (Khuyến nghị)

1. Vào Netlify Dashboard
2. Chọn site của bạn
3. Vào **"Deploys"** → **"Deploy settings"**
4. Click **"Add build command"** (nếu chưa có)
5. Hoặc vào **"Site settings"** → **"Build & deploy"** → **"Environment variables"**

#### Cách 2: Tạo file `netlify.toml`

Tạo file `netlify.toml` trong thư mục gốc:

```toml
[build]
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Cách 3: Tạo file `config.js` qua Netlify UI

1. Vào **"Deploys"** → Chọn deploy mới nhất
2. Click **"Browse published files"**
3. Tìm và edit file `config.js` (nếu có)
4. Hoặc tạo mới với nội dung:

```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec',
    EVENT_NAME: 'Sự Kiện TDC'
};
```

### 2. Sử dụng Environment Variables (Tốt nhất)

1. Vào Netlify Dashboard → Site → **"Site settings"**
2. **"Build & deploy"** → **"Environment variables"**
3. Thêm biến:
   - **Key**: `API_URL`
   - **Value**: `https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec`

4. Sửa `config.js` để đọc từ environment:

```javascript
const CONFIG = {
    API_URL: window.API_URL || 'https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec',
    EVENT_NAME: 'Sự Kiện TDC'
};
```

### 3. Kiểm tra Build Settings

1. Vào **"Site settings"** → **"Build & deploy"** → **"Build settings"**
2. Đảm bảo:
   - **Build command**: (để trống hoặc không có)
   - **Publish directory**: `.` hoặc `./` (root)

### 4. Redeploy

Sau khi cấu hình xong:
1. Vào **"Deploys"**
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## 🔍 KIỂM TRA SAU KHI DEPLOY

### 1. Kiểm tra file `config.js`

Mở URL: `https://YOUR-SITE.netlify.app/config.js`

Phải thấy:
```javascript
const CONFIG = {
    API_URL: 'https://script.google.com/...',
    EVENT_NAME: 'Sự Kiện TDC'
};
```

### 2. Kiểm tra Console

1. Mở webapp
2. Nhấn F12 (hoặc chạm và giữ trên mobile → Inspect)
3. Xem Console:
   - ✅ `🚀 Webapp Check-in đã khởi động`
   - ✅ `📋 CONFIG: {...}` với API_URL đúng
   - ❌ Nếu thấy lỗi → Ghi lại

### 3. Test Tab Switching

1. Click vào tab "⌨️ Nhập mã"
2. Xem Console có log: `👆 Tab clicked: manual`
3. Tab phải chuyển được

### 4. Test API

1. Nhập mã vé test
2. Click "Check-in"
3. Xem Console:
   - `📡 Gửi request đến: ...`
   - `📥 Response status: 200`
   - `✅ Parsed result: {...}`

---

## 🐛 TROUBLESHOOTING NETLIFY

### Lỗi: "config.js not found"

**Giải pháp**:
- Tạo file `config.js` trực tiếp trên Netlify
- Hoặc commit file `config.js` (bỏ khỏi `.gitignore` tạm thời)

### Lỗi: "CORS policy"

**Giải pháp**:
- Đảm bảo Google Apps Script đã deploy với quyền "Anyone"
- Kiểm tra CORS headers trong backend

### Lỗi: Tab không click được

**Giải pháp**:
- Clear cache trình duyệt
- Kiểm tra Console có lỗi JavaScript không
- Thử trên trình duyệt khác

### Lỗi: Không có phản hồi trên mobile

**Giải pháp**:
- Kiểm tra HTTPS (Netlify tự động có)
- Kiểm tra Console trên mobile (remote debugging)
- Kiểm tra network tab xem có request không

---

## 📱 TEST TRÊN MOBILE

### Chrome Remote Debugging

1. Kết nối điện thoại với PC qua USB
2. Mở Chrome trên PC: `chrome://inspect`
3. Chọn device và tab webapp
4. Xem Console và Network tabs

### Safari Web Inspector (iOS)

1. Settings → Safari → Advanced → Web Inspector (ON)
2. Kết nối iPhone với Mac
3. Mac: Safari → Develop → [Your iPhone] → [Your Site]
4. Xem Console

---

## ✅ CHECKLIST NETLIFY

- [ ] File `config.js` đã được tạo trên Netlify
- [ ] API_URL đúng trong `config.js`
- [ ] Site đã được redeploy
- [ ] Test tab switching hoạt động
- [ ] Test check-in hoạt động
- [ ] Test trên mobile hoạt động
- [ ] Console không có lỗi

---

**Nếu vẫn gặp vấn đề, vui lòng cung cấp:**
1. Screenshot Console (F12)
2. Screenshot Network tab
3. URL Netlify site
4. Mã vé đã test

