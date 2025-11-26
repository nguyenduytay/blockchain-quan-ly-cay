# Hướng Dẫn Chi Tiết - Hệ Thống Quản Lý Cây Trồng Blockchain

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Tính Năng](#tính-năng)
3. [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
4. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
5. [Chuẩn Bị Môi Trường](#chuẩn-bị-môi-trường)
6. [Cài Đặt Chaincode](#cài-đặt-chaincode)
7. [Cài Đặt Backend](#cài-đặt-backend)
8. [Cài Đặt Frontend](#cài-đặt-frontend)
9. [Sử Dụng Ứng Dụng](#sử-dụng-ứng-dụng)
10. [API Endpoints](#api-endpoints)
11. [Xử Lý Lỗi](#xử-lý-lỗi)
12. [Tùy Chỉnh](#tùy-chỉnh)

---

## 📖 Tổng Quan

Hệ thống quản lý cây trồng hiện đại được xây dựng trên nền tảng **Hyperledger Fabric Blockchain** với giao diện web chuyên nghiệp. Hệ thống bao gồm 3 thành phần chính:

1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ và quản lý user trên blockchain
2. **Backend API Server** - Cung cấp REST API với authentication JWT
3. **Frontend Web App** - Giao diện người dùng React chuyên nghiệp với nhiều tính năng

### Quy Ước URL

- **URL_BACK_END** = `http://localhost:3006` hoặc `http://16.19.0.15:3006`
- **URL_FRONT_END** = `http://localhost:3000` hoặc `http://16.19.0.15:3000`

---

## ✨ Tính Năng Chính

### 🔐 Authentication & Authorization
- ✅ Đăng nhập/Đăng xuất với JWT
- ✅ Đăng ký tài khoản mới
- ✅ Phân quyền Admin và User
- ✅ Quản lý session an toàn
- ✅ Password hashing với bcrypt

### 🌱 Quản Lý Cây Trồng
- ✅ Thêm, sửa, xóa cây trồng
- ✅ Theo dõi giai đoạn phát triển
- ✅ Cập nhật năng suất
- ✅ Lọc và tìm kiếm theo nhiều tiêu chí (loại cây, giai đoạn, vị trí)
- ✅ Thống kê tổng quan
- ✅ Khởi tạo dữ liệu mẫu

### 👥 Quản Lý Người Dùng (Admin)
- ✅ Xem danh sách tất cả user
- ✅ Sửa thông tin user
- ✅ Xóa user
- ✅ Phân quyền admin/user

### 📊 Báo Cáo & Thống Kê
- ✅ Tạo báo cáo tự động
- ✅ Thống kê theo loại cây
- ✅ Thống kê theo giai đoạn
- ✅ Thống kê theo vị trí
- ✅ Xuất báo cáo CSV

### 🏠 Trang Chủ Chuyên Nghiệp
- ✅ Giao diện hiện đại với HTML5/CSS
- ✅ Responsive design
- ✅ Animation và hiệu ứng đẹp mắt
- ✅ Thông tin tổng quan hệ thống
- ✅ Gradient backgrounds và modern UI

### 👤 Quản Lý Tài Khoản
- ✅ Xem thông tin cá nhân
- ✅ Cập nhật thông tin
- ✅ Đổi mật khẩu (sắp có)

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Node.js** >= 16.x (khuyến nghị >= 18.x)
- **Express.js** - Web framework
- **Hyperledger Fabric** 2.x - Blockchain platform
- **JWT** (jsonwebtoken) - Authentication
- **bcryptjs** - Password hashing
- **fabric-network** - Fabric SDK
- **fabric-ca-client** - CA client

### Frontend
- **React.js** 18.x
- **React Bootstrap** 2.8.0 - UI Components
- **Axios** 1.4.0 - HTTP Client
- **Bootstrap** 5.3.0 - CSS Framework
- **HTML5/CSS3** - Modern styling

### Blockchain
- **Hyperledger Fabric** 2.x
- **Chaincode** (Smart Contract) - JavaScript
- **fabric-contract-api** 2.2.0
- **fabric-shim** 2.2.0

---

## 📁 Cấu Trúc Dự Án

```
qlcay/
├── chaincode_qlcaytrong/          # Smart Contract
│   └── javascript/
│       ├── qlcaytrong.js         # Main chaincode logic
│       ├── index.js              # Entry point
│       └── package.json
│
├── backend/                       # API Server
│   ├── server.js                 # Main server file
│   ├── enrollAdmin.js           # Enroll admin user
│   ├── registerUser.js          # Register app user
│   ├── package.json
│   └── wallet/                   # Fabric wallet (tự động tạo)
│
├── frontend/                      # React App
│   ├── src/
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Global styles
│   │   ├── index.js             # Entry point
│   │   ├── components/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Login.css        # Login styles
│   │   │   ├── Register.js      # Register page
│   │   │   ├── Navigation.js    # Navigation bar
│   │   │   ├── Navigation.css   # Navigation styles
│   │   │   ├── HomePage.js      # Home page
│   │   │   ├── HomePage.css     # Home page styles
│   │   │   ├── CayTrongTable.js # Cây trồng management
│   │   │   ├── UserManagement.js # User management
│   │   │   ├── ReportPage.js    # Reports page
│   │   │   ├── ReportPage.css   # Report styles
│   │   │   └── AccountPage.js   # Account page
│   │   └── services/
│   │       └── api.js           # API service
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── HUONG_DAN_CHI_TIET_QLCAYTRONG.md  # File này
└── README_QLCAYTRONG.md          # README tổng quan
```

---

## 🔧 Chuẩn Bị Môi Trường

### Yêu Cầu Hệ Thống

- **Hyperledger Fabric** đã được cài đặt trên VMHyper
- **Node.js** >= 16.x (khuyến nghị >= 18.x để tương thích tốt nhất)
- **npm** hoặc yarn
- **Docker** và Docker Compose
- **Git** (để clone dự án)

**Lưu ý về phiên bản Node.js:**
- Node.js 16.x: Có thể gặp cảnh báo với fabric-contract-api@2.5.x, nên dùng phiên bản 2.2.x
- Node.js 18.x trở lên: Tương thích tốt với tất cả phiên bản fabric-contract-api

### Truy Cập VMHyper

**Cách 1: SSH từ Command Prompt (Windows)**

```bash
ssh -p 15 sv102102666@wandertour.ddns.net
# Password: 123456
```

**Cách 2: Sử dụng MobaXterm**

- Hostname: `wandertour.ddns.net`
- Port: `15`
- Username: `sv102102666` (thay bằng username của bạn)
- Password: `123456`

**Cách 3: SSH đến IP trực tiếp (nếu có)**

```bash
ssh hyperledger@192.168.1.15
# Password: 123456
```

### Kiểm Tra Môi Trường

```bash
# Kiểm tra Node.js
node --version
# Phải >= 16.x

# Kiểm tra npm
npm --version

# Kiểm tra Docker
docker --version

# Kiểm tra Fabric
cd /fabric-samples/test-network
ls -la
```

---

## 📦 Bước 1: Cài Đặt Chaincode

### 1.1. Tạo Thư Mục Chaincode

**Đặt tại `/fabric-samples/chaincode/` (thông thường)**

```bash
cd /fabric-samples/chaincode/
mkdir -p qlcaytrong/javascript
cd qlcaytrong/javascript
```

### 1.2. Copy Các File Chaincode

Copy các file từ thư mục `chaincode_qlcaytrong/javascript/` của dự án:

- `qlcaytrong.js` - Logic chính của chaincode
- `index.js` - Entry point
- `package.json` - Dependencies

**Có thể dùng scp hoặc copy trực tiếp:**

```bash
# Nếu đã có file trên máy local, dùng scp
scp -P 15 chaincode_qlcaytrong/javascript/* sv102102666@wandertour.ddns.net:/fabric-samples/chaincode/qlcaytrong/javascript/
```

### 1.3. Cài Đặt Dependencies

```bash
cd /fabric-samples/chaincode/qlcaytrong/javascript
npm install
```

**Nếu gặp cảnh báo về phiên bản Node.js:**
- Nếu dùng Node.js 16.x: Package.json đã được cấu hình để dùng fabric-contract-api@~2.2.0 (tương thích với Node.js 16)
- Nếu dùng Node.js 18.x trở lên: Có thể dùng phiên bản mới nhất

Kiểm tra cài đặt:

```bash
npm list fabric-contract-api fabric-shim
```

### 1.4. Khởi Động Network (Nếu Chưa Chạy)

```bash
cd /fabric-samples/test-network

# Dừng network cũ (nếu có)
./network.sh down

# Khởi động network
./network.sh up createChannel
```

**Phải thấy:**
```
Creating channel 'mychannel'...
Channel 'mychannel' created
```

### 1.5. Package và Deploy Chaincode

```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

**Lưu ý:** 
- `-ccn qlcaytrong`: Tên chaincode
- `-ccp`: Đường dẫn đến thư mục chaincode
- `-ccl javascript`: Ngôn ngữ chaincode

**Phải thấy:**
```
Chaincode qlcaytrong installed on peer0.org1.example.com
Chaincode qlcaytrong installed on peer0.org2.example.com
Chaincode qlcaytrong committed to channel mychannel
```

### 1.6. Kiểm Tra Chaincode Đã Deploy

```bash
docker ps | grep chaincode
```

**Phải thấy containers chaincode đang chạy:**
```
dev-peer0.org1.example.com-qlcaytrong-1.0-xxx
dev-peer0.org2.example.com-qlcaytrong-1.0-xxx
```

---

## 🖥️ Bước 2: Cài Đặt Backend API Server

### 2.1. Tạo Thư Mục Backend

```bash
cd ~
mkdir -p backend
cd backend
```

### 2.2. Copy Các File Backend

Copy các file từ thư mục `backend/` của dự án:

- `server.js` - Main server file
- `enrollAdmin.js` - Enroll admin user
- `registerUser.js` - Register app user
- `package.json` - Dependencies

### 2.3. Cài Đặt Dependencies

```bash
npm install
```

**Dependencies sẽ được cài:**
- `express` - Web framework
- `fabric-network` - Fabric SDK
- `fabric-ca-client` - CA client
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing

### 2.4. Đăng Ký Admin và User

**QUAN TRỌNG:** Phải chạy theo thứ tự:

```bash
# Bước 1: Enroll admin
npm run enrollAdmin
```

**Phải thấy:**
```
Successfully enrolled admin user "admin" and imported it into the wallet
```

```bash
# Bước 2: Register và enroll app user
npm run registerUser
```

**Phải thấy:**
```
Successfully registered and enrolled user "appUser"
```

### 2.5. Kiểm Tra Wallet

```bash
ls -la wallet/
```

**Phải thấy:**
- Thư mục `admin/`
- Thư mục `appUser/`

### 2.6. Chạy Backend Server

```bash
npm start
```

**Phải thấy:**
```
✅ Loaded connection profile from: /fabric-samples/test-network/...
🚀 QLCayTrong API Server đang chạy trên port 3006
📡 Health check: http://localhost:3006/health
🌐 API Base URL: http://localhost:3006/api
```

Server sẽ chạy trên port **3006** (mặc định).

### 2.7. Kiểm Tra Server

Mở terminal mới và test:

```bash
curl http://localhost:3006/health
```

**Phải trả về:**
```json
{"status":"OK","message":"QLCayTrong API Server is running","timestamp":"..."}
```

---

## 🎨 Bước 3: Cài Đặt Frontend React App

### 3.1. Tạo Thư Mục Frontend

```bash
cd ~
mkdir -p frontend
cd frontend
```

### 3.2. Copy Các File Frontend

Copy toàn bộ thư mục `frontend/` của dự án, bao gồm:
- `src/` - Source code
- `public/` - Public files
- `package.json` - Dependencies

### 3.3. Cài Đặt Dependencies

```bash
npm install
```

**Dependencies sẽ được cài:**
- `react` - React library
- `react-dom` - React DOM
- `react-scripts` - Create React App scripts
- `bootstrap` - Bootstrap CSS
- `react-bootstrap` - Bootstrap components
- `axios` - HTTP client
- `react-router-dom` - Routing (optional)

### 3.4. Cấu Hình API URL

Tạo file `.env` trong thư mục `frontend/`:

```bash
cd frontend
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3006/api
PORT=3000
EOF
```

**Hoặc nếu chạy trên server khác:**

```bash
REACT_APP_API_URL=http://192.168.80.10:3006/api
PORT=3000
```

### 3.5. Chạy Frontend

```bash
npm start
```

**Phải thấy:**
```
Compiled successfully!

You can now view qlcaytrong-react-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.80.10:3000
```

Frontend sẽ chạy trên port **3000** (mặc định).

Truy cập ứng dụng tại: `http://localhost:3000` hoặc `http://192.168.80.10:3000`

---

## 🚀 Bước 4: Sử Dụng Ứng Dụng

### 4.1. Tạo Tài Khoản Đầu Tiên

**QUAN TRỌNG:** Bạn phải tạo tài khoản trước khi đăng nhập!

**Cách 1: Dùng Trang Đăng Ký trên Web (Dễ dàng)**

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Click **"Đăng ký ngay"** ở cuối trang login
3. Điền thông tin:
   - Tên đăng nhập: `admin`
   - Họ tên: `Administrator`
   - Email: `admin@example.com`
   - Mật khẩu: `admin123`
   - Xác nhận mật khẩu: `admin123`
   - Vai trò: Chọn **"Quản trị viên"**
4. Click **"Đăng ký"**

**Cách 2: Dùng curl (Nhanh)**

```bash
curl -X POST http://localhost:3006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin"
  }'
```

**Nếu thành công sẽ thấy:**
```json
{"success":true,"message":"Đăng ký thành công"}
```

### 4.2. Đăng Nhập

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Trang đăng nhập sẽ hiển thị
3. Nhập thông tin:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Click **"Đăng nhập"**

Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang chủ.

### 4.3. Trang Chủ

Sau khi đăng nhập, bạn sẽ thấy:
- **Thông tin chào mừng** với tên người dùng
- **Tính năng nổi bật** của hệ thống
- **Thống kê hệ thống** (bảo mật, hoạt động, khả năng mở rộng, minh bạch)

### 4.4. Quản Lý Cây Trồng

**Truy cập:** Click tab **"Quản lý cây trồng"**

**Thêm cây mới:**
1. Click nút **"Thêm cây trồng mới"**
2. Điền đầy đủ thông tin:
   - Mã cây (duy nhất, ví dụ: CT001)
   - Tên cây (ví dụ: Cà phê Arabica)
   - Loại cây (ví dụ: Cây công nghiệp)
   - Ngày trồng (chọn từ date picker)
   - Giai đoạn (Mới trồng, Đang phát triển, Trưởng thành, Thu hoạch)
   - Năng suất (tấn/ha, ví dụ: 2.5)
   - Diện tích (ha, ví dụ: 1000)
   - Vị trí (ví dụ: Đắk Lắk)
3. Click **"Lưu"**

**Sửa cây trồng:**
1. Click nút **"Sửa"** trên dòng cây trồng cần sửa
2. Chỉnh sửa thông tin (trừ mã cây - không thể thay đổi)
3. Click **"Lưu"**

**Xóa cây trồng:**
1. Click nút **"Xóa"** trên dòng cây trồng cần xóa
2. Xác nhận xóa trong modal

**Chuyển giai đoạn:**
1. Click nút **"Chuyển giai đoạn"**
2. Chọn giai đoạn mới từ dropdown

**Cập nhật năng suất:**
1. Click nút **"Cập nhật năng suất"**
2. Nhập năng suất mới (tấn/ha)

**Lọc cây trồng:**
- Chọn loại cây từ dropdown "Tất cả loại cây"
- Chọn giai đoạn từ dropdown "Tất cả giai đoạn"

**Thống kê:**
- Tổng số cây trồng
- Tổng diện tích (ha)
- Năng suất trung bình (tấn/ha)

**Khởi tạo dữ liệu mẫu:**
- Click nút **"Khởi tạo dữ liệu"** để tạo 5 cây trồng mẫu

### 4.5. Báo Cáo & Thống Kê

**Truy cập:** Click tab **"Báo cáo"**

**Tính năng:**
1. Hệ thống tự động tạo báo cáo khi vào trang
2. Xem thống kê theo:
   - Loại cây (số lượng, diện tích)
   - Giai đoạn (số lượng)
   - Vị trí (số lượng)
3. Click **"Xuất CSV"** để tải báo cáo về máy
4. Click **"Làm mới báo cáo"** để tạo lại báo cáo mới nhất

### 4.6. Quản Lý Người Dùng (Admin Only)

**Truy cập:** Click tab **"Quản lý người dùng"** (chỉ admin thấy)

**Tính năng:**
1. Xem danh sách tất cả user trong hệ thống
2. Thông tin hiển thị:
   - Tên đăng nhập
   - Họ tên
   - Email
   - Vai trò (Admin/User)
   - Ngày tạo
   - Trạng thái (Hoạt động/Khóa)
3. **Sửa user:**
   - Click nút **"Sửa"**
   - Cập nhật họ tên, email, vai trò
   - Click **"Lưu"**
4. **Xóa user:**
   - Click nút **"Xóa"**
   - Xác nhận xóa
   - **Lưu ý:** Không thể xóa chính mình

### 4.7. Quản Lý Tài Khoản

**Truy cập:** Click tab **"Tài khoản"**

**Tính năng:**
1. Xem thông tin tài khoản:
   - Tên đăng nhập (không thể thay đổi)
   - Họ tên
   - Email
   - Vai trò
2. **Cập nhật thông tin:**
   - Sửa họ tên
   - Sửa email
   - Click **"Cập nhật thông tin"**

---

## 🔑 API Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "QLCayTrong API Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### Đăng ký User Mới

```
POST /api/auth/register
Content-Type: application/json

Body: {
  "username": "string (required)",
  "password": "string (required, min 6 chars)",
  "fullName": "string (required)",
  "email": "string (required, valid email)",
  "role": "string (optional, 'user' or 'admin', default: 'user')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công"
}
```

#### Đăng Nhập

```
POST /api/auth/login
Content-Type: application/json

Body: {
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Lấy Thông Tin User Hiện Tại

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Cây Trồng

#### Khởi Tạo Dữ Liệu Mẫu

```
POST /api/init
```

**Response:**
```json
{
  "success": true,
  "message": "Đã khởi tạo dữ liệu mẫu thành công"
}
```

#### Lấy Tất Cả Cây Trồng

```
GET /api/caytrong
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Key": "CT001",
      "Record": {
        "docType": "caytrong",
        "maCay": "CT001",
        "tenCay": "Cà phê Arabica",
        "loaiCay": "Cây công nghiệp",
        "ngayTrong": "2020-01-15",
        "giaiDoan": "Trưởng thành",
        "nangSuat": 2.5,
        "dienTich": 1000,
        "viTri": "Đắk Lắk"
      }
    }
  ]
}
```

#### Lấy Cây Trồng Theo Mã

```
GET /api/caytrong/:maCay
```

**Ví dụ:** `GET /api/caytrong/CT001`

#### Tạo Cây Trồng Mới

```
POST /api/caytrong
Content-Type: application/json

Body: {
  "maCay": "string (required, unique)",
  "tenCay": "string (required)",
  "loaiCay": "string (required)",
  "ngayTrong": "string (required, YYYY-MM-DD)",
  "giaiDoan": "string (required)",
  "nangSuat": "number (required)",
  "dienTich": "number (required)",
  "viTri": "string (required)"
}
```

#### Cập Nhật Cây Trồng

```
PUT /api/caytrong/:maCay
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "tenCay": "string",
  "loaiCay": "string",
  "ngayTrong": "string",
  "giaiDoan": "string",
  "nangSuat": "number",
  "dienTich": "number",
  "viTri": "string"
}
```

#### Xóa Cây Trồng

```
DELETE /api/caytrong/:maCay
Authorization: Bearer <token>
```

#### Tìm Cây Trồng Theo Loại

```
GET /api/caytrong/loai/:loaiCay
```

**Ví dụ:** `GET /api/caytrong/loai/Cây công nghiệp`

#### Tìm Cây Trồng Theo Giai Đoạn

```
GET /api/caytrong/giaidoan/:giaiDoan
```

**Ví dụ:** `GET /api/caytrong/giaidoan/Trưởng thành`

#### Chuyển Giai Đoạn Cây Trồng

```
PATCH /api/caytrong/:maCay/chuyengiaidoan
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "giaiDoanMoi": "string (required)"
}
```

#### Cập Nhật Năng Suất

```
PATCH /api/caytrong/:maCay/nangsuat
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "nangSuatMoi": "number (required)"
}
```

### User Management (Admin Only)

#### Lấy Tất Cả User

```
GET /api/users
Authorization: Bearer <token> (Admin only)
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Key": "USER_admin",
      "Record": {
        "docType": "user",
        "username": "admin",
        "fullName": "Administrator",
        "email": "admin@example.com",
        "role": "admin",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "isActive": true
      }
    }
  ]
}
```

#### Lấy User Theo Username

```
GET /api/users/:username
Authorization: Bearer <token>
```

**Lưu ý:** User chỉ có thể xem thông tin của chính mình, trừ admin có thể xem tất cả.

#### Cập Nhật User

```
PUT /api/users/:username
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "fullName": "string",
  "email": "string",
  "role": "string (only admin can change role)"
}
```

**Lưu ý:** User chỉ có thể cập nhật thông tin của chính mình, trừ admin có thể cập nhật tất cả.

#### Xóa User

```
DELETE /api/users/:username
Authorization: Bearer <token> (Admin only)
```

### Reports

#### Tạo Báo Cáo

```
GET /api/reports
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "report": {
    "generatedAt": "2024-01-01T00:00:00.000Z",
    "generatedBy": "admin",
    "statistics": {
      "totalCayTrong": 5,
      "totalDienTich": 5800,
      "avgNangSuat": 2.6,
      "byLoaiCay": {
        "Cây công nghiệp": {
          "count": 3,
          "dienTich": 4500
        }
      },
      "byGiaiDoan": {
        "Trưởng thành": 3,
        "Đang phát triển": 2
      },
      "byViTri": {
        "Đắk Lắk": 1,
        "Bình Phước": 1
      }
    },
    "data": [...]
  }
}
```

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### Lỗi: "User does not exist in wallet"

**Nguyên nhân:** Chưa đăng ký user trong Fabric wallet

**Giải pháp:**
```bash
cd ~/backend
npm run enrollAdmin
npm run registerUser
```

**Kiểm tra:**
```bash
ls -la wallet/
# Phải thấy: admin/ và appUser/
```

### Lỗi: "Cannot connect to Fabric network"

**Nguyên nhân:** Fabric network chưa chạy hoặc chaincode chưa được deploy

**Giải pháp:**
```bash
cd /fabric-samples/test-network

# Kiểm tra network
docker ps | grep peer

# Nếu không thấy, khởi động lại
./network.sh down
./network.sh up createChannel

# Deploy chaincode
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

### Lỗi: "DiscoveryService: mychannel error: access denied"

**Nguyên nhân:** User không có quyền truy cập channel hoặc discovery service lỗi

**Giải pháp 1: Re-enroll User**
```bash
cd ~/backend
rm -rf wallet
npm run enrollAdmin
npm run registerUser
npm start
```

**Giải pháp 2: Tắt Discovery Service**
```bash
cd ~/backend
echo "DISCOVERY_ENABLED=false" > .env
npm start
```

### Lỗi: "Peer endorsements do not match"

**Nguyên nhân:** Chaincode chưa được deploy đúng hoặc network chưa chạy

**Giải pháp:**
```bash
cd /fabric-samples/test-network
./network.sh down
./network.sh up createChannel
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

### Lỗi: "Token không hợp lệ"

**Nguyên nhân:** Token đã hết hạn hoặc không hợp lệ

**Giải pháp:** Đăng xuất và đăng nhập lại

### Lỗi: "Chỉ admin mới có quyền truy cập"

**Nguyên nhân:** Bạn đang đăng nhập với tài khoản user thường

**Giải pháp:** 
- Đăng nhập với tài khoản admin
- Hoặc yêu cầu admin cấp quyền admin cho tài khoản của bạn

### Lỗi: "Port already in use"

**Nguyên nhân:** Port đã được sử dụng bởi ứng dụng khác

**Giải pháp Backend:**
- Thay đổi port trong `server.js` hoặc `.env`:
```bash
PORT=3007 npm start
```

**Giải pháp Frontend:**
- Tạo file `.env`:
```bash
PORT=3001
```

### Lỗi: "CORS error" trong Frontend

**Nguyên nhân:** Backend không cho phép CORS từ frontend

**Giải pháp:** Đảm bảo `cors` đã được cài đặt và cấu hình trong `server.js`:
```javascript
app.use(cors());
```

### Lỗi: "Connection profile not found"

**Nguyên nhân:** Đường dẫn connection profile không đúng

**Giải pháp:**
1. Kiểm tra đường dẫn trong `server.js`
2. Hoặc set environment variable:
```bash
export CCP_PATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
```

### Lỗi: "User đã tồn tại" khi đăng ký

**Nguyên nhân:** Username đã được sử dụng

**Giải pháp:** Chọn username khác

### Lỗi: "Sai mật khẩu"

**Nguyên nhân:** Mật khẩu không đúng

**Giải pháp:** Kiểm tra lại username và password

---

## 🎛️ Tùy Chỉnh

### Thay Đổi Port Backend

**Cách 1: Environment Variable**

Tạo file `.env` trong `backend/`:
```bash
PORT=3007
```

**Cách 2: Sửa trong code**

Sửa trong `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3007; // Thay đổi số port
```

### Thay Đổi Port Frontend

Tạo file `.env` trong `frontend/`:
```bash
PORT=3001
```

Hoặc sửa trong `package.json`:
```json
"scripts": {
  "start": "PORT=3001 react-scripts start"
}
```

### Thay Đổi JWT Secret

Tạo file `.env` trong `backend/`:
```bash
JWT_SECRET=your-very-secure-secret-key-here
```

**Lưu ý:** Trong production, phải dùng secret key mạnh và bảo mật!

### Thay Đổi Connection Profile Path

Tạo file `.env` trong `backend/`:
```bash
CCP_PATH=/custom/path/to/connection-org1.json
```

### Thay Đổi User Name

Tạo file `.env` trong `backend/`:
```bash
USER_NAME=myCustomUser
```

Sau đó register user mới với tên đó:
```bash
# Sửa USER_NAME trong registerUser.js
npm run registerUser
```

### Tắt Discovery Service

Tạo file `.env` trong `backend/`:
```bash
DISCOVERY_ENABLED=false
```

### Thay Đổi API URL trong Frontend

Tạo file `.env` trong `frontend/`:
```bash
REACT_APP_API_URL=http://your-server-ip:3006/api
```

**Lưu ý:** Phải restart frontend sau khi thay đổi `.env`

---

## 📊 Kiểm Tra Hệ Thống

### Checklist Trước Khi Sử Dụng

- [ ] Network đã được khởi động (`docker ps | grep peer`)
- [ ] Chaincode đã được deploy (`docker ps | grep chaincode`)
- [ ] Backend đang chạy (`curl http://localhost:3006/health`)
- [ ] Frontend đang chạy (`http://localhost:3000` có thể truy cập)
- [ ] Wallet có admin và appUser (`ls ~/backend/wallet/`)
- [ ] Đã tạo tài khoản đầu tiên (qua API hoặc web)

### Kiểm Tra Logs

**Backend logs:**
```bash
cd ~/backend
npm start
# Xem output trong terminal
```

**Frontend logs:**
- Mở Developer Tools (F12) trong trình duyệt
- Tab Console để xem JavaScript logs
- Tab Network để xem API calls

**Chaincode logs:**
```bash
docker logs $(docker ps | grep chaincode | awk '{print $1}' | head -1)
```

**Peer logs:**
```bash
docker logs peer0.org1.example.com
```

---

## 🔒 Bảo Mật

### Best Practices

1. **JWT Secret:**
   - Không commit secret key vào git
   - Dùng environment variable
   - Dùng secret key mạnh trong production

2. **Password:**
   - Password được hash bằng bcrypt (10 rounds)
   - Không lưu plain text password

3. **Authentication:**
   - Tất cả API quan trọng yêu cầu JWT token
   - Token có thời hạn 24 giờ

4. **Authorization:**
   - Role-based access control
   - Admin có quyền cao hơn user

5. **Blockchain:**
   - Dữ liệu được lưu trên blockchain, không thể thay đổi
   - Mọi transaction đều được ghi lại

---

## 📝 Tài Liệu Tham Khảo

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Contract API](https://hyperledger.github.io/fabric-chaincode-node/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)
- [Bootstrap Documentation](https://getbootstrap.com/)

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:

1. **Logs của Backend Server** - Xem terminal nơi chạy `npm start`
2. **Logs của Frontend** - Console trong trình duyệt (F12)
3. **Logs của Chaincode** - Docker containers
4. **Logs của Network** - Docker containers của peers
5. **Đảm bảo tất cả services đang chạy:**
   - Network (peers, orderer, CA)
   - Chaincode containers
   - Backend server
   - Frontend server
6. **Kiểm tra token JWT có hợp lệ không**
7. **Kiểm tra wallet có identity không**

### Liên Hệ

Nếu vẫn không giải quyết được, hãy cung cấp:
- Thông báo lỗi đầy đủ
- Logs từ backend và frontend
- Môi trường đang sử dụng (OS, Node.js version, etc.)

---

## 🎉 Kết Luận

Hệ thống Quản Lý Cây Trồng Blockchain đã được thiết kế với:
- ✅ Giao diện chuyên nghiệp và hiện đại
- ✅ Tính năng đầy đủ (CRUD, Authentication, Reports)
- ✅ Bảo mật cao (JWT, Password hashing, Blockchain)
- ✅ Dễ sử dụng và triển khai
- ✅ Tài liệu chi tiết

**Chúc bạn triển khai và sử dụng thành công! 🚀**

---

**Made with ❤️ using Hyperledger Fabric & React**

