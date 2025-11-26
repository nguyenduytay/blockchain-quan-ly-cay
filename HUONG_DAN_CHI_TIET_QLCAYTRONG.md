# Hướng Dẫn Chi Tiết - Hệ Thống Quản Lý Cây Trồng Blockchain



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
- nvm install 18
- nvm install 12
Kiểm tra cài đặt:

```bash
npm list fabric-contract-api fabric-shim
```

### 1.4. Khởi Động Network (Nếu Chưa Chạy)

```bash
cd /fabric-samples/test-network
# khởi động lại docker
sudo systemctl restart docker

# Dừng network nếu đang chạy
./network.sh down

# Khởi động network với CA
./network.sh up createChannel -c

# Tạo channel
./network.sh createChannel
```
**Phải thấy:**
```
Creating channel 'mychannel'...
Channel 'mychannel' created
```

### 1.5. Package và Deploy Chaincode
# copy các file từ thư mục `chaincode/javascript/` của dự án:

- `qlcaytrong.js`
- `index.js`
- `package.json`

# cài đặt môi trường
npm install

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

curl -X POST http://192.168.80.10:3006/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\",\"fullName\":\"Administrator\",\"email\":\"admin@example.com\",\"role\":\"admin\"}"
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

# Lỗi CLI Container
docker exec -it cli bash

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

# kiểm tra lại 
ls $CORE_PEER_MSPCONFIGPATH

# chay lại query chaincode 
peer lifecycle chaincode querycommitted -C mychannel
