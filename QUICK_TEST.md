# 🧪 HƯỚNG DẪN TEST NHANH

## ✅ URL ĐÚNG CẦN DÙNG

**Web App URL** (URL này để gọi API):
```
https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec
```

**Library URL** (URL này KHÔNG dùng để gọi API, chỉ để chia sẻ):
```
https://script.google.com/macros/library/d/1tIPaPL8j8Uhs7E9NvcgjaC_LVjACxpb78yEY_p3oTK-75J4UC_9SxNSm/1
```
→ **Bỏ qua URL này**, chỉ dùng Web App URL ở trên.

---

## 🔍 KIỂM TRA API HOẠT ĐỘNG

### Test 1: Kiểm tra API cơ bản

Mở URL này trong trình duyệt:
```
https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "message": "Check-in API is running",
  "version": "1.0",
  "parameters": {
    "action": "none",
    "ticketCode": "none"
  }
}
```

✅ Nếu thấy JSON này → API hoạt động tốt!

---

### Test 2: Test với mã vé thật

1. Mở Google Sheet → Sheet "Mã Vé"
2. Lấy một mã vé từ cột A (ví dụ: `EV-20251204-014944-DRI`)
3. Mở URL này (thay `YOUR_TICKET_CODE` bằng mã vé thật):
```
https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec?ticketCode=YOUR_TICKET_CODE&action=checkin
```

**Kết quả có thể:**
- ✅ `{"success":true,"message":"Check-in thành công!"}` → Check-in thành công
- ❌ `{"success":false,"message":"Mã vé không tồn tại"}` → Mã vé không có trong sheet
- ❌ `{"success":false,"message":"Mã vé này đã được check-in"}` → Đã check-in rồi

---

## 🌐 KIỂM TRA FRONTEND

### Bước 1: Kiểm tra config.js trên Netlify

1. Mở webapp trên Netlify
2. Mở Console (F12)
3. Gõ: `CONFIG.API_URL`
4. Phải thấy:
```
"https://script.google.com/macros/s/AKfycbytEKLbDCQ01OKD6fD-2-O3OFzr_czPnelv5PUG73D9oY4BhBKZnrCsXiZ94hom5sTSsw/exec"
```

### Bước 2: Test tab switching

1. Click tab "⌨️ Nhập mã"
2. Xem Console có log: `👆 Tab clicked: manual`
3. Tab phải chuyển được

### Bước 3: Test check-in

1. Nhập mã vé thật
2. Click "Check-in"
3. Xem Console logs:
   - `🚀 Bắt đầu check-in:`
   - `📡 Gửi request đến:`
   - `📥 XHR Response status:` hoặc `🔄 Trying JSONP method...`
   - `✅ Parsed result:`

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Web App URL** là URL đúng để dùng trong `config.js`
2. **Library URL** không dùng để gọi API
3. Nếu URL thay đổi sau khi deploy lại → Cập nhật lại trong `config.js`
4. Đảm bảo backend đã deploy với quyền **"Anyone"**

---

## 🔧 NẾU VẪN LỖI

1. **Kiểm tra Console** (F12) → Xem có lỗi gì
2. **Kiểm tra Network tab** → Xem request có được gửi không
3. **Test API trực tiếp** → Dùng URL ở Test 2
4. **Kiểm tra Google Sheet** → Mã vé có tồn tại không

---

**Chúc bạn test thành công! 🎉**

