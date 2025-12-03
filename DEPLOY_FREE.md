# 🆓 HƯỚNG DẪN DEPLOY MIỄN PHÍ

Dự án đã vượt quá hạn mức Netlify. Dưới đây là các lựa chọn miễn phí tốt nhất:

## 🥇 LỰA CHỌN TỐT NHẤT: GitHub Pages (Khuyến nghị)

### ✅ Ưu điểm:
- **Hoàn toàn miễn phí** - Phù hợp cho dự án cá nhân/nhỏ
- **Tích hợp với GitHub** - Code đã có sẵn trên GitHub
- **HTTPS tự động** - Bảo mật miễn phí
- **Custom domain** - Có thể dùng domain riêng
- **Giới hạn rộng rãi** - Đủ cho hầu hết các dự án

### ⚠️ Giới hạn sử dụng:
- **Bandwidth**: 100GB/tháng (soft limit - giới hạn mềm)
- **Repository size**: Khuyến nghị không quá 1GB
- **Site size**: Không nên quá 1GB
- **Builds**: 10 builds/giờ (soft limit)
- **Lưu ý**: Nếu vượt quá giới hạn, GitHub có thể liên hệ để đề xuất giải pháp

### 📋 Cách deploy:

#### Bước 1: Tạo file `_config.yml` (nếu chưa có)
Tạo file `_config.yml` trong thư mục `checkin-app`:
```yaml
theme: jekyll-theme-minimal
```

#### Bước 2: Enable GitHub Pages
1. Vào repository trên GitHub: `https://github.com/thienvyma/tdc-checkin-app`
2. Click **Settings** → **Pages**
3. Trong phần **Source**, chọn:
   - **Branch**: `main`
   - **Folder**: `/` (root)
4. Click **Save**

#### Bước 3: Đợi deploy (1-2 phút)
GitHub sẽ tự động deploy và cung cấp URL:
- URL mặc định: `https://thienvyma.github.io/tdc-checkin-app/`

#### Bước 4: Cập nhật config.js (nếu cần)
URL sẽ thay đổi, nhưng backend API URL vẫn giữ nguyên.

---

## 🥈 LỰA CHỌN 2: Vercel

### ✅ Ưu điểm:
- **Miễn phí** - 100GB bandwidth/tháng
- **Deploy nhanh** - Tự động từ GitHub
- **HTTPS tự động**
- **Custom domain** miễn phí
- **CDN toàn cầu**

### 📋 Cách deploy:

1. Truy cập: https://vercel.com
2. Đăng nhập bằng GitHub
3. Click **Add New Project**
4. Chọn repository: `thienvyma/tdc-checkin-app`
5. **Root Directory**: `checkin-app`
6. Click **Deploy**
7. Vercel sẽ tự động deploy và cung cấp URL

---

## 🥉 LỰA CHỌN 3: Cloudflare Pages

### ✅ Ưu điểm:
- **Miễn phí** - Không giới hạn bandwidth
- **CDN toàn cầu** - Tốc độ nhanh
- **HTTPS tự động**
- **Custom domain** miễn phí

### 📋 Cách deploy:

1. Truy cập: https://pages.cloudflare.com
2. Đăng nhập bằng GitHub
3. Click **Create a project**
4. Chọn repository: `thienvyma/tdc-checkin-app`
5. **Build command**: (để trống - static site)
6. **Build output directory**: `checkin-app`
7. Click **Save and Deploy**

---

## 🎯 SO SÁNH NHANH

| Platform | Bandwidth | Build Time | Custom Domain | Dễ sử dụng |
|----------|-----------|------------|---------------|------------|
| **GitHub Pages** | ⚠️ 100GB/tháng | ⚠️ 10 builds/giờ | ✅ Free | ⭐⭐⭐⭐⭐ |
| **Vercel** | ✅ 100GB/tháng | ✅ 100 giờ/tháng | ✅ Free | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | ✅ Unlimited | ✅ Unlimited | ✅ Free | ⭐⭐⭐⭐ |

---

## 💡 KHUYẾN NGHỊ

**Chọn GitHub Pages** vì:
1. ✅ Code đã có trên GitHub
2. ✅ Hoàn toàn miễn phí với giới hạn rộng rãi (100GB/tháng)
3. ✅ Setup đơn giản nhất (chỉ cần enable)
4. ✅ Tích hợp sẵn với repository
5. ✅ Không cần cấu hình phức tạp

**Lưu ý về giới hạn:**
- 100GB bandwidth/tháng thường đủ cho hàng nghìn lượt truy cập
- Nếu vượt quá, GitHub sẽ liên hệ để đề xuất giải pháp (không tự động tắt)
- Dự án check-in thường không tốn nhiều bandwidth (chỉ HTML/CSS/JS)

---

## 🚀 HƯỚNG DẪN CHI TIẾT: GitHub Pages

### Bước 1: Tạo file `_config.yml`

Tạo file mới trong thư mục `checkin-app/_config.yml`:
```yaml
theme: jekyll-theme-minimal
```

### Bước 2: Commit và push

```bash
cd checkin-app
git add _config.yml
git commit -m "Add _config.yml for GitHub Pages"
git push
```

### Bước 3: Enable GitHub Pages

1. Vào: https://github.com/thienvyma/tdc-checkin-app/settings/pages
2. **Source**: Chọn `main` branch, folder `/` (root)
3. Click **Save**
4. Đợi 1-2 phút

### Bước 4: Truy cập webapp

URL sẽ là: `https://thienvyma.github.io/tdc-checkin-app/`

### Bước 5: Cập nhật Custom Domain (Tùy chọn)

1. Trong GitHub Pages settings
2. Thêm domain của bạn vào **Custom domain**
3. Cập nhật DNS records theo hướng dẫn

---

## ⚠️ LƯU Ý

1. **Backend API URL**: Không thay đổi, vẫn dùng Google Apps Script URL
2. **config.js**: Không cần thay đổi
3. **HTTPS**: Tự động có HTTPS
4. **Custom Domain**: Có thể dùng domain riêng miễn phí

---

## 🆘 HỖ TRỢ

Nếu gặp vấn đề:
1. Kiểm tra file `_config.yml` đã có chưa
2. Kiểm tra branch `main` có code chưa
3. Đợi 2-3 phút sau khi enable Pages
4. Clear cache browser và thử lại

