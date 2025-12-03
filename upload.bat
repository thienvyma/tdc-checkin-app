@echo off
echo ========================================
echo UPLOAD CODE LEN GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo [1/7] Khoi tao Git...
git init

echo.
echo [2/7] Them tat ca files...
git add .

echo.
echo [3/7] Commit...
git commit -m "Initial commit: Check-in webapp"

echo.
echo [4/7] Ket noi voi GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/thienvyma/tdc-checkin-app.git

echo.
echo [5/7] Chuyen sang branch main...
git branch -M main

echo.
echo [6/7] Push code len GitHub...
echo.
echo LUU Y: Neu yeu cau dang nhap:
echo - Username: thienvyma
echo - Password: Su dung Personal Access Token (khong phai password)
echo.
git push -u origin main

echo.
echo ========================================
echo HOAN TAT!
echo ========================================
echo.
echo Kiem tra: https://github.com/thienvyma/tdc-checkin-app
echo.
pause

