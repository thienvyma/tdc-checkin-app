# 📤 HƯỚNG DẪN UPLOAD CODE LÊN GITHUB

Repository: https://github.com/thienvyma/tdc-checkin-app

## 🚀 CÁCH 1: Sử dụng Git Command Line (Khuyến nghị)

### Bước 1: Mở Terminal/Command Prompt

- **Windows**: Mở Command Prompt hoặc PowerShell
- **Mac/Linux**: Mở Terminal

### Bước 2: Di chuyển vào thư mục project

```bash
cd D:\TDCscriptdangki\checkin-app
```

### Bước 3: Khởi tạo Git (nếu chưa có)

```bash
git init
```

### Bước 4: Thêm tất cả files

```bash
git add .
```

### Bước 5: Commit

```bash
git commit -m "Initial commit: Check-in webapp"
```

### Bước 6: Kết nối với GitHub repository

```bash
git remote add origin https://github.com/thienvyma/tdc-checkin-app.git
```

### Bước 7: Push code lên GitHub

```bash
git branch -M main
git push -u origin main
```

**Lưu ý**: Lần đầu sẽ yêu cầu đăng nhập GitHub:
- Nếu dùng HTTPS: Nhập username và Personal Access Token (không phải password)
- Hoặc dùng GitHub Desktop/Git Credential Manager

---

## 🌐 CÁCH 2: Upload qua GitHub Web Interface

### Bước 1: Chuẩn bị files

Đảm bảo bạn có tất cả files trong thư mục `checkin-app`:
- index.html
- style.css
- script.js
- config.js
- backend/CheckinBackend.gs
- HUONG_DAN_DEPLOY.md
- README.md

### Bước 2: Upload files

1. Truy cập: https://github.com/thienvyma/tdc-checkin-app
2. Click **"Add file"** → **"Upload files"**
3. Kéo thả tất cả files vào
4. Hoặc click **"choose your files"** và chọn files
5. Scroll xuống, nhập commit message: `Initial commit: Check-in webapp`
6. Click **"Commit changes"**

### Bước 3: Tạo thư mục backend (nếu cần)

1. Click **"Add file"** → **"Create new file"**
2. Tên file: `backend/CheckinBackend.gs`
3. Copy nội dung từ file `backend/CheckinBackend.gs` local
4. Paste vào
5. Click **"Commit new file"**

---

## 💻 CÁCH 3: Sử dụng GitHub Desktop

### Bước 1: Cài đặt GitHub Desktop

1. Download: https://desktop.github.com
2. Cài đặt và đăng nhập

### Bước 2: Clone repository

1. File → Clone repository
2. URL: `https://github.com/thienvyma/tdc-checkin-app.git`
3. Chọn thư mục local
4. Click **"Clone"**

### Bước 3: Copy files

1. Copy tất cả files từ `D:\TDCscriptdangki\checkin-app` vào thư mục vừa clone

### Bước 4: Commit và Push

1. Mở GitHub Desktop
2. Sẽ thấy tất cả files mới
3. Nhập commit message: `Initial commit: Check-in webapp`
4. Click **"Commit to main"**
5. Click **"Push origin"**

---

## ✅ KIỂM TRA SAU KHI UPLOAD

Sau khi upload xong, kiểm tra:

1. Truy cập: https://github.com/thienvyma/tdc-checkin-app
2. Xem có đầy đủ files:
   - ✅ index.html
   - ✅ style.css
   - ✅ script.js
   - ✅ config.js
   - ✅ backend/CheckinBackend.gs
   - ✅ HUONG_DAN_DEPLOY.md
   - ✅ README.md

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Authentication failed"

**Giải pháp**:
- Tạo Personal Access Token:
  1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token
  3. Chọn quyền: `repo`
  4. Copy token và dùng thay cho password

### Lỗi: "Repository not found"

**Giải pháp**:
- Kiểm tra URL repository đúng chưa
- Đảm bảo repository là public hoặc bạn có quyền truy cập

### Lỗi: "Nothing to commit"

**Giải pháp**:
- Kiểm tra đã add files chưa: `git add .`
- Kiểm tra files có trong thư mục không

---

## 📝 LƯU Ý

- ⚠️ **KHÔNG** commit file `config.js` với API URL thật (nếu có)
- ✅ Có thể tạo file `.gitignore` để bỏ qua file nhạy cảm
- ✅ Sau khi upload, có thể deploy lên Vercel/Netlify trực tiếp từ GitHub

