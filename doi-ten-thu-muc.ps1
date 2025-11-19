# Script đổi tên thư mục theo chuẩn tài liệu lab
# Chạy script này trong PowerShell với quyền Administrator

Write-Host "=== Đổi tên thư mục theo chuẩn tài liệu lab ===" -ForegroundColor Green

# Lấy đường dẫn hiện tại
$currentPath = Get-Location
Write-Host "Thư mục hiện tại: $currentPath" -ForegroundColor Yellow

# Đổi tên backend
if (Test-Path "backend") {
    Write-Host "Đang đổi tên: backend -> qlcaytrong-backend..." -ForegroundColor Cyan
    Rename-Item -Path "backend" -NewName "qlcaytrong-backend"
    Write-Host "✓ Đã đổi tên backend thành công" -ForegroundColor Green
} else {
    Write-Host "⚠ Không tìm thấy thư mục backend" -ForegroundColor Yellow
}

# Đổi tên frontend
if (Test-Path "frontend") {
    Write-Host "Đang đổi tên: frontend -> qlcaytrong-frontend..." -ForegroundColor Cyan
    Rename-Item -Path "frontend" -NewName "qlcaytrong-frontend"
    Write-Host "✓ Đã đổi tên frontend thành công" -ForegroundColor Green
} else {
    Write-Host "⚠ Không tìm thấy thư mục frontend" -ForegroundColor Yellow
}

Write-Host "`n=== Hoàn tất ===" -ForegroundColor Green
Write-Host "Cấu trúc thư mục sau khi đổi tên:" -ForegroundColor Cyan
Get-ChildItem -Directory | Select-Object Name

