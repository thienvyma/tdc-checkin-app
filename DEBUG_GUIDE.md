# 🔍 HƯỚNG DẪN DEBUG WEBAPP CHECK-IN

## ❌ Vấn đề: Không có phản hồi khi quét QR hoặc nhập mã

### Bước 1: Mở Developer Console

1. **Chrome/Edge**: Nhấn `F12` hoặc `Ctrl+Shift+I`
2. **Firefox**: Nhấn `F12` hoặc `Ctrl+Shift+K`
3. Chuyển sang tab **"Console"**

### Bước 2: Kiểm tra lỗi trong Console

Sau khi mở webapp, bạn sẽ thấy các log:
- ✅ `🚀 Webapp Check-in đã khởi động` → OK
- ✅ `📋 CONFIG: {...}` → Kiểm tra API_URL có đúng không
- ❌ Nếu có lỗi màu đỏ → Ghi lại lỗi đó

### Bước 3: Test thủ công

1. Mở tab **"Network"** trong Developer Tools
2. Thử quét QR hoặc nhập mã
3. Xem có request nào được gửi đi không:
   - Nếu **KHÔNG có request** → Lỗi ở frontend (JavaScript)
   - Nếu **CÓ request nhưng failed** → Lỗi ở backend hoặc CORS

### Bước 4: Kiểm tra API URL

1. Mở Console
2. Gõ: `CONFIG.API_URL`
3. Kiểm tra URL có đúng không:
   ```
   https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec
   ```

### Bước 5: Test API trực tiếp

Mở URL này trong trình duyệt (thay `YOUR_TICKET_CODE` bằng mã vé thật):
```
https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec?ticketCode=YOUR_TICKET_CODE&action=checkin
```

Nếu thấy JSON response → API hoạt động tốt
Nếu lỗi → Vấn đề ở backend

---

## 🔧 CÁC LỖI THƯỜNG GẶP

### 1. "CONFIG không được load"

**Nguyên nhân**: File `config.js` không được tải

**Giải pháp**:
- Kiểm tra file `config.js` có tồn tại không
- Kiểm tra đường dẫn trong `index.html`: `<script src="config.js"></script>`
- Nếu deploy trên Vercel/Netlify: Đảm bảo file `config.js` được upload

### 2. "CORS policy" hoặc "Access-Control-Allow-Origin"

**Nguyên nhân**: Google Apps Script chưa cho phép CORS

**Giải pháp**:
- Kiểm tra backend đã deploy với quyền "Anyone" chưa
- Code đã có CORS headers trong `createResponse()`

### 3. "Network error" hoặc "Failed to fetch"

**Nguyên nhân**: 
- Không có internet
- API URL sai
- Server không phản hồi

**Giải pháp**:
- Kiểm tra kết nối internet
- Kiểm tra API URL đúng chưa
- Test API trực tiếp trong trình duyệt

### 4. "Mã vé không đúng định dạng"

**Nguyên nhân**: Format mã vé sai

**Giải pháp**:
- Format đúng: `EV-YYYYMMDD-HHMMSS-XXX`
- Ví dụ: `EV-20251204-014944-DRI`
- Tự động uppercase và trim

### 5. Không có phản hồi gì cả

**Nguyên nhân**: 
- JavaScript bị lỗi
- Event listener không hoạt động
- Console bị tắt

**Giải pháp**:
1. Mở Console (F12)
2. Xem có lỗi JavaScript không
3. Kiểm tra các log messages:
   - `🚀 Bắt đầu check-in:` → Function được gọi
   - `📡 Gửi request đến:` → Request được gửi
   - `📥 Response received:` → Nhận được response

---

## 🧪 TEST TỪNG BƯỚC

### Test 1: Kiểm tra config.js

Mở Console và gõ:
```javascript
console.log(CONFIG);
```

Kết quả mong đợi:
```javascript
{
  API_URL: "https://script.google.com/macros/s/.../exec",
  EVENT_NAME: "Sự Kiện TDC"
}
```

### Test 2: Test API trực tiếp

Mở URL này (thay mã vé):
```
https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec?ticketCode=EV-20251204-014944-DRI&action=checkin
```

Kết quả mong đợi: JSON response

### Test 3: Test trong Console

Gõ trong Console:
```javascript
processCheckin('EV-20251204-014944-DRI', 'manual');
```

Xem có log messages và kết quả không.

---

## 📞 BÁO CÁO LỖI

Khi báo cáo lỗi, vui lòng cung cấp:

1. **Screenshot Console** (F12 → Console tab)
2. **Screenshot Network tab** (nếu có request)
3. **Mã vé đã test**
4. **Trình duyệt và version** (Chrome 120, Firefox 121, v.v.)
5. **URL webapp** (nếu đã deploy)

---

## ✅ CHECKLIST DEBUG

- [ ] Mở Developer Console (F12)
- [ ] Kiểm tra có lỗi JavaScript không
- [ ] Kiểm tra CONFIG.API_URL có đúng không
- [ ] Test API trực tiếp trong trình duyệt
- [ ] Kiểm tra Network tab khi gửi request
- [ ] Xem Console logs khi click check-in
- [ ] Kiểm tra Google Sheets có cập nhật không

---

**Nếu vẫn không giải quyết được, vui lòng cung cấp thông tin trên để được hỗ trợ!**

