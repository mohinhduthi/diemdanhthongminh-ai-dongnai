@echo off
chcp 65001 >nul
echo ========================================================
echo   AI SMARTATTEND ĐỒNG NAI - ĐIỂM DANH VÀ CẤP CHỨNG NHẬN ĐIỆN TỬ BẰNG AI
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Khởi chạy Backend Gateway API...
start "SmartAttend-Backend" cmd /k "node backend\server.js || agy-node backend\server.js"

echo [2/2] Mở giao diện ứng dụng AI SmartAttend Đồng Nai...
start "" index.html

echo.
echo Hệ thống đã sẵn sàng: Điểm danh và cấp chứng nhận điện tử bằng AI!
pause
