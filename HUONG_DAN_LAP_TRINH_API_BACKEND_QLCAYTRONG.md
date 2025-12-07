# Lập Trình API Backend Server Truy Xuất Chaincode QLCayTrong

Xây dựng ứng dụng backend server bằng Node.js để cung cấp các API truy xuất đến chaincode `qlcaytrong`

## Cấu Trúc Thư Mục

```
~/backend/                          
├── server.js
├── enrollAdmin.js
├── registerUser.js
├── package.json
├── checkNetwork.js
├── .env
└── wallet/                        
    ├── admin/
    └── appUser/
```

## Tạo Thư Mục API Server

```bash
cd ~
mkdir -p backend
cd backend
```

## 6.1. File: package.json

```bash
cd ~/backend
nano package.json
```

**Nội dung file `package.json`:**

```json
{
    "name": "qlcaytrong-backend",
    "version": "1.0.0",
    "description": "Backend API Server for QLCayTrong Blockchain",
    "main": "server.js",
    "scripts": {
        "start": "node server.js",
        "enrollAdmin": "node enrollAdmin.js",
        "registerUser": "node registerUser.js"
    },
    "dependencies": {
        "express": "^4.18.2",
        "fabric-network": "^2.2.0",
        "fabric-ca-client": "^2.2.0",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "jsonwebtoken": "^9.0.2",
        "bcryptjs": "^2.4.3",
        "multer": "^1.4.5-lts.1",
        "xlsx": "^0.18.5",
        "pdfkit": "^0.13.0",
        "nodemailer": "^6.9.7",
        "crypto": "^1.0.1",
        "node-cron": "^3.0.3"
    },
    "author": "Your Name",
    "license": "Apache-2.0"
}
```

## 6.2. File: server.js

```bash
cd ~/backend
nano server.js
```

**File `server.js` chứa:**
- Express.js server setup
- Fabric Gateway connection
- RESTful API endpoints cho cây trồng
- Authentication & Authorization (JWT)
- Error handling
- File upload/download (Excel, PDF)
- Import/Export functionality

**Các endpoint chính:**
- `GET /health` - Health check
- `POST /api/init` - Khởi tạo dữ liệu mẫu
- `GET /api/caytrong` - Lấy tất cả cây trồng
- `GET /api/caytrong/:maCay` - Lấy cây trồng theo mã
- `POST /api/caytrong` - Tạo cây trồng mới
- `PUT /api/caytrong/:maCay` - Cập nhật cây trồng
- `DELETE /api/caytrong/:maCay` - Xóa cây trồng
- `GET /api/caytrong/loai/:loaiCay` - Tìm cây trồng theo loại
- `GET /api/caytrong/giaidoan/:giaiDoan` - Tìm cây trồng theo giai đoạn
- `PATCH /api/caytrong/:maCay/chuyengiaidoan` - Chuyển giai đoạn
- `PATCH /api/caytrong/:maCay/nangsuat` - Cập nhật năng suất
- `GET /api/caytrong/search` - Tìm kiếm full-text
- `GET /api/caytrong/filter` - Lọc kết hợp nhiều tiêu chí
- `GET /api/caytrong/export/excel` - Xuất Excel
- `GET /api/caytrong/export/pdf` - Xuất PDF
- `POST /api/caytrong/import` - Import từ Excel/CSV

## 6.3. File Script Đăng Ký User

### 6.3.1. File: enrollAdmin.js

```bash
cd ~/backend
nano enrollAdmin.js
```

**Chức năng:**
- Enroll admin user từ Fabric CA
- Lưu identity vào wallet
- Tạo thư mục `wallet/admin/`

**Cách chạy:**
```bash
node enrollAdmin.js
```

**Kết quả mong đợi:**
```
Wallet path: /home/user/backend/wallet
Successfully enrolled admin user "admin" and imported it into the wallet
```

### 6.3.2. File: registerUser.js

```bash
cd ~/backend
nano registerUser.js
```

**Chức năng:**
- Đăng ký và enroll app user từ Fabric CA
- Sử dụng admin identity để register user mới
- Lưu identity vào wallet
- Tạo thư mục `wallet/appUser/`

**QUAN TRỌNG:** Sửa biến `USER_NAME` trong file nếu muốn dùng tên khác:

```javascript
const USER_NAME = "appUser"; // có thể đổi thành mã sinh viên
```

**Cách chạy:**
```bash
node registerUser.js
```

**Kết quả mong đợi:**
```
Wallet path: /home/user/backend/wallet
Successfully registered and enrolled user "appUser"
```

## 6.4. Cài Đặt và Chạy API Web Server

**Terminal 2 - API Server:**

### Bước 1: Chuyển vào thư mục và cài đặt

```bash
cd ~/backend
ls -a

# Tạo các file và cài đặt dependencies
npm install
```

### Bước 2: Đăng ký user

```bash
ls -a
nano .env
```

**Nội dung file `.env` (tùy chọn):**
```env
# JWT Secret
JWT_SECRET=qlcaytrong-secret-key-2024

# User name for Fabric
USER_NAME=appUser

# Email configuration (cho reset password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Enable scheduled reports
ENABLE_SCHEDULED_REPORTS=false
```

**Chạy enrollAdmin.js:**
```bash
node enrollAdmin.js
```

**Đăng ký user:**
```bash
node registerUser.js
```

### Bước 3: Khởi động server

```bash
node server.js
```

**Kết quả mong đợi:**
```
✅ Loaded connection profile from: /fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
🚀 QLCayTrong API Server đang chạy trên port 3006
📡 Health check: http://localhost:3006/health
🌐 API Base URL: http://localhost:3006/api
```

## 6.5. Test API với curl

### 1. Health Check

```bash
curl http://localhost:3006/health
```

### 2. Khởi Tạo Dữ Liệu

```bash
curl -X POST http://localhost:3006/api/init
```

### 3. Lấy Tất Cả Cây Trồng

```bash
curl http://localhost:3006/api/caytrong
```

### 4. Lấy Cây Trồng Theo Mã

```bash
curl http://localhost:3006/api/caytrong/CT001
```

### 5. Tạo Cây Trồng Mới

```bash
curl -X POST http://localhost:3006/api/caytrong \
  -H "Content-Type: application/json" \
  -d '{
    "maCay": "CT006",
    "tenCay": "Cà phê Robusta",
    "loaiCay": "Cây công nghiệp",
    "ngayTrong": "2023-01-15",
    "giaiDoan": "Đang phát triển",
    "nangSuat": 2.8,
    "dienTich": 1200,
    "viTri": "Lâm Đồng"
  }'
```

### 6. Cập Nhật Cây Trồng

```bash
curl -X PUT http://localhost:3006/api/caytrong/CT001 \
  -H "Content-Type: application/json" \
  -d '{
    "tenCay": "Cà phê Arabica Premium",
    "loaiCay": "Cây công nghiệp",
    "ngayTrong": "2020-01-15",
    "giaiDoan": "Trưởng thành",
    "nangSuat": 3.0,
    "dienTich": 1000,
    "viTri": "Đắk Lắk"
  }'
```

### 7. Tìm Cây Trồng Theo Loại

```bash
curl http://localhost:3006/api/caytrong/loai/Cây%20công%20nghiệp
```

### 8. Chuyển Giai Đoạn Cây Trồng

```bash
curl -X PATCH http://localhost:3006/api/caytrong/CT001/chuyengiaidoan \
  -H "Content-Type: application/json" \
  -d '{"giaiDoanMoi": "Thu hoạch"}'
```

### 9. Xóa Cây Trồng

```bash
curl -X DELETE http://localhost:3006/api/caytrong/CT006
```

## 6.6. API Endpoints Summary

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/health` | Health check |
| POST | `/api/init` | Khởi tạo dữ liệu |
| GET | `/api/caytrong` | Lấy tất cả cây trồng |
| GET | `/api/caytrong/:maCay` | Lấy cây trồng theo mã |
| POST | `/api/caytrong` | Tạo cây trồng mới |
| PUT | `/api/caytrong/:maCay` | Cập nhật cây trồng |
| DELETE | `/api/caytrong/:maCay` | Xóa cây trồng |
| GET | `/api/caytrong/loai/:loaiCay` | Tìm cây trồng theo loại |
| GET | `/api/caytrong/giaidoan/:giaiDoan` | Tìm cây trồng theo giai đoạn |
| PATCH | `/api/caytrong/:maCay/chuyengiaidoan` | Chuyển giai đoạn cây trồng |

Server API này cung cấp đầy đủ RESTful endpoints để tương tác với chaincode `qlcaytrong` trên blockchain!
