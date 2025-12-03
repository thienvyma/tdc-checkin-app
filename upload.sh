#!/bin/bash

echo "========================================"
echo "UPLOAD CODE LEN GITHUB"
echo "========================================"
echo ""

# Di chuyển vào thư mục script
cd "$(dirname "$0")"

echo "[1/7] Khởi tạo Git..."
git init

echo ""
echo "[2/7] Thêm tất cả files..."
git add .

echo ""
echo "[3/7] Commit..."
git commit -m "Initial commit: Check-in webapp"

echo ""
echo "[4/7] Kết nối với GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/thienvyma/tdc-checkin-app.git

echo ""
echo "[5/7] Chuyển sang branch main..."
git branch -M main

echo ""
echo "[6/7] Push code lên GitHub..."
echo ""
echo "LƯU Ý: Nếu yêu cầu đăng nhập:"
echo "- Username: thienvyma"
echo "- Password: Sử dụng Personal Access Token (không phải password)"
echo ""
git push -u origin main

echo ""
echo "========================================"
echo "HOÀN TẤT!"
echo "========================================"
echo ""
echo "Kiểm tra: https://github.com/thienvyma/tdc-checkin-app"
echo ""

