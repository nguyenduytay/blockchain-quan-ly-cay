# Hướng Dẫn Chi Tiết - Hệ Thống Quản Lý Hồ Sơ Cán Bộ Blockchain

## 📖 Tổng Quan

Hệ thống quản lý hồ sơ cán bộ hiện đại được xây dựng trên nền tảng **Hyperledger Fabric Blockchain** với giao diện web chuyên nghiệp. Hệ thống bao gồm 3 thành phần chính:

1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ và quản lý user trên blockchain
2. **Backend API Server** - Cung cấp REST API với authentication JWT
3. **Frontend Web App** - Giao diện người dùng React chuyên nghiệp với nhiều tính năng

### Quy Ước URL

- **URL_BACK_END** = `http://localhost:3007` hoặc `http://192.168.80.10:3007`
- **URL_FRONT_END** = `http://localhost:8007` hoặc `http://192.168.80.10:8007`

---

## ✨ Tính Năng Chính

### 🔐 Authentication & Authorization
- ✅ Đăng nhập/Đăng xuất với JWT
- ✅ Đăng ký tài khoản mới
- ✅ Phân quyền Admin và User
- ✅ Quản lý session an toàn
- ✅ Password hashing với bcrypt

### 👔 Quản Lý Hồ Sơ Cán Bộ
- ✅ Thêm, sửa, xóa hồ sơ cán bộ
- ✅ Theo dõi thông tin nhân sự
- ✅ Cập nhật lương và chức vụ
- ✅ Lọc và tìm kiếm theo nhiều tiêu chí (phòng ban, chức vụ, trình độ)
- ✅ Thống kê tổng quan
- ✅ Khởi tạo dữ liệu mẫu

### 👥 Quản Lý Người Dùng (Admin)
- ✅ Xem danh sách tất cả user
- ✅ Sửa thông tin user
- ✅ Xóa user
- ✅ Phân quyền admin/user

### 📊 Báo Cáo & Thống Kê
- ✅ Tạo báo cáo tự động
- ✅ Thống kê theo phòng ban
- ✅ Thống kê theo chức vụ
- ✅ Thống kê theo trình độ
- ✅ Thống kê theo giới tính
- ✅ Xuất báo cáo CSV

### 🏠 Trang Chủ Chuyên Nghiệp
- ✅ Giao diện hiện đại với HTML5/CSS
- ✅ Responsive design
- ✅ Animation và hiệu ứng đẹp mắt
- ✅ Thông tin tổng quan hệ thống
- ✅ Gradient backgrounds màu xanh dương/tím (khác với QLCayTrong)

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
- **HTML5/CSS3** - Modern styling với màu xanh dương/tím

### Blockchain
- **Hyperledger Fabric** 2.x
- **Chaincode** (Smart Contract) - JavaScript
- **fabric-contract-api** 2.2.0
- **fabric-shim** 2.2.0

---

## 📁 Cấu Trúc Dự Án

```
qlcay/
├── chaincode_qlhscb/          # Smart Contract
│   └── javascript/
│       ├── qlhscb.js         # Main chaincode logic
│       ├── index.js          # Entry point
│       └── package.json
│
├── backend_qlhscb/            # API Server
│   ├── server.js             # Main server file
│   ├── enrollAdmin.js        # Enroll admin user
│   ├── registerUser.js       # Register app user
│   ├── package.json
│   └── wallet/               # Fabric wallet (tự động tạo)
│
├── frontend_qlhscb/           # React App
│   ├── src/
│   │   ├── App.js            # Main app component
│   │   ├── App.css           # Global styles (màu xanh dương/tím)
│   │   ├── index.js          # Entry point
│   │   ├── components/
│   │   │   ├── Login.js      # Login page
│   │   │   ├── Login.css     # Login styles
│   │   │   ├── Register.js   # Register page
│   │   │   ├── Navigation.js # Navigation bar
│   │   │   ├── Navigation.css # Navigation styles
│   │   │   ├── HomePage.js   # Home page
│   │   │   ├── HomePage.css  # Home page styles
│   │   │   ├── HoSoCanBoTable.js # Hồ sơ cán bộ management
│   │   │   ├── UserManagement.js # User management
│   │   │   ├── ReportPage.js # Reports page
│   │   │   ├── ReportPage.css # Report styles
│   │   │   └── AccountPage.js # Account page
│   │   └── services/
│   │       └── api.js        # API service
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── HUONG_DAN_CHI_TIET_QLHSCB.md  # File này
└── HUONG_DAN_TRIEN_KHAI_QLHSCB.md # Hướng dẫn triển khai cơ bản
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
mkdir -p qlhscb/javascript
cd qlhscb/javascript
```

### 1.2. Copy Các File Chaincode

Copy các file từ thư mục `chaincode_qlhscb/javascript/` của dự án:

- `qlhscb.js` - Logic chính của chaincode (đã có user management)
- `index.js` - Entry point
- `package.json` - Dependencies

**Có thể dùng scp hoặc copy trực tiếp:**

```bash
# Nếu đã có file trên máy local, dùng scp
scp -P 15 chaincode_qlhscb/javascript/* sv102102666@wandertour.ddns.net:/fabric-samples/chaincode/qlhscb/javascript/
```

### 1.3. Cài Đặt Dependencies

```bash
cd /fabric-samples/chaincode/qlhscb/javascript
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
./network.sh up createChannel -ca

# Tạo channel
./network.sh createChannel
```

**Phải thấy:**
```
Creating channel 'mychannel'...
Channel 'mychannel' created
```

### 1.5. Package và Deploy Chaincode

```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
```

**Lưu ý:** 
- `-ccn qlhscb`: Tên chaincode
- `-ccp`: Đường dẫn đến thư mục chaincode
- `-ccl javascript`: Ngôn ngữ chaincode

**Phải thấy:**
```
Chaincode qlhscb installed on peer0.org1.example.com
Chaincode qlhscb installed on peer0.org2.example.com
Chaincode qlhscb committed to channel mychannel
```

### 1.6. Kiểm Tra Chaincode Đã Deploy

```bash
docker ps | grep chaincode
```

**Phải thấy containers chaincode đang chạy:**
```
dev-peer0.org1.example.com-qlhscb-1.0-xxx
dev-peer0.org2.example.com-qlhscb-1.0-xxx
```

---

## 🖥️ Bước 2: Cài Đặt Backend API Server

### 2.1. Tạo Thư Mục Backend

```bash
cd ~
mkdir -p qlhscb/qlhscb-backend
cd qlhscb/qlhscb-backend
```

### 2.2. Copy Các File Backend

Copy các file từ thư mục `backend_qlhscb/` của dự án:

- `server.js` - Main server file (đã có authentication, user management, reports)
- `enrollAdmin.js` - Enroll admin user
- `registerUser.js` - Register app user
- `package.json` - Dependencies (đã có jsonwebtoken và bcryptjs)

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
🚀 QLHoSoCanBo API Server đang chạy trên port 3007
📡 Health check: http://localhost:3007/health
🌐 API Base URL: http://localhost:3007/api
```

Server sẽ chạy trên port **3007** (mặc định).

### 2.7. Kiểm Tra Server

Mở terminal mới và test:

```bash
curl http://localhost:3007/health
```

**Phải trả về:**
```json
{"status":"OK","message":"QLHoSoCanBo API Server is running","timestamp":"..."}
```

---

## 🎨 Bước 3: Cài Đặt Frontend React App

### 3.1. Tạo Thư Mục Frontend

```bash
cd ~
mkdir -p qlhscb/qlhscb-frontend
cd qlhscb/qlhscb-frontend
```

### 3.2. Copy Các File Frontend

Copy toàn bộ thư mục `frontend_qlhscb/` của dự án, bao gồm:
- `src/` - Source code (đã có authentication, user management, reports)
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

### 3.4. Cấu Hình API URL

Tạo file `.env` trong thư mục `frontend_qlhscb/`:

```bash
cd qlhscb/qlhscb-frontend
cat > .env << EOF
REACT_APP_API_URL=http://localhost:3007/api
PORT=8007
EOF
```

**Hoặc nếu chạy trên server khác:**

```bash
REACT_APP_API_URL=http://192.168.80.10:3007/api
PORT=8007
```

### 3.5. Chạy Frontend

```bash
npm start
```

Frontend sẽ chạy trên port **8007** (mặc định).

Truy cập ứng dụng tại: `http://localhost:8007` hoặc `http://192.168.80.10:8007`

---

## 🚀 Bước 4: Sử Dụng Ứng Dụng

### 4.1. Tạo Tài Khoản Đầu Tiên

**QUAN TRỌNG:** Bạn phải tạo tài khoản trước khi đăng nhập!

**Cách 1: Dùng Trang Đăng Ký trên Web (Dễ dàng)**

1. Mở trình duyệt và truy cập `http://localhost:8007`
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
curl -X POST http://localhost:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "role": "admin"
  }'

# Hoặc từ máy khác
curl -X POST http://192.168.80.10:3007/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\",\"fullName\":\"Administrator\",\"email\":\"admin@example.com\",\"role\":\"admin\"}"
```

**Nếu thành công sẽ thấy:**
```json
{"success":true,"message":"Đăng ký thành công"}
```

### 4.2. Đăng Nhập

1. Mở trình duyệt và truy cập `http://localhost:8007`
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
- **Giao diện màu xanh dương/tím** (khác với QLCayTrong)

### 4.4. Quản Lý Hồ Sơ Cán Bộ

**Truy cập:** Click tab **"Quản lý hồ sơ cán bộ"**

**Thêm hồ sơ mới:**
1. Click nút **"Thêm hồ sơ mới"**
2. Điền đầy đủ thông tin:
   - Mã cán bộ (duy nhất, ví dụ: CB006)
   - Họ tên (ví dụ: Nguyễn Văn Mới)
   - Ngày sinh (chọn từ date picker)
   - Giới tính (Nam/Nữ)
   - Chức vụ (Trưởng phòng, Phó phòng, Nhân viên)
   - Phòng ban (ví dụ: Phòng IT)
   - Ngày vào làm (chọn từ date picker)
   - Trình độ (Trung cấp, Cao đẳng, Đại học, Thạc sĩ, Tiến sĩ)
   - Lương (VND, ví dụ: 13000000)
   - Địa chỉ (ví dụ: 123 Đường Mới, Quận 1, TP.HCM)
3. Click **"Lưu"**

**Sửa hồ sơ cán bộ:**
1. Click nút **"Sửa"** trên dòng hồ sơ cần sửa
2. Chỉnh sửa thông tin (trừ mã cán bộ - không thể thay đổi)
3. Click **"Lưu"**

**Xóa hồ sơ cán bộ:**
1. Click nút **"Xóa"** trên dòng hồ sơ cần xóa
2. Xác nhận xóa trong modal

**Thay đổi chức vụ:**
1. Click nút **"CV"** (Chức vụ)
2. Nhập chức vụ mới

**Cập nhật lương:**
1. Click nút **"💰 Lương"**
2. Nhập lương mới (VND)

**Lọc hồ sơ cán bộ:**
- Chọn phòng ban từ dropdown "Tất cả phòng ban"
- Chọn chức vụ từ dropdown "Tất cả chức vụ"

**Thống kê:**
- Tổng số cán bộ
- Tổng lương (VND)
- Lương trung bình (VND)

**Khởi tạo dữ liệu mẫu:**
- Click nút **"Khởi tạo dữ liệu"** để tạo 5 hồ sơ cán bộ mẫu

### 4.5. Báo Cáo & Thống Kê

**Truy cập:** Click tab **"Báo cáo"**

**Tính năng:**
1. Hệ thống tự động tạo báo cáo khi vào trang
2. Xem thống kê theo:
   - Phòng ban (số lượng, tổng lương)
   - Chức vụ (số lượng)
   - Trình độ (số lượng)
   - Giới tính (số lượng)
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
  "message": "QLHoSoCanBo API Server is running",
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

### Hồ Sơ Cán Bộ

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

#### Lấy Tất Cả Hồ Sơ Cán Bộ

```
GET /api/hosocanbo
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "Key": "CB001",
      "Record": {
        "docType": "hosocanbo",
        "maCanBo": "CB001",
        "hoTen": "Nguyễn Văn An",
        "ngaySinh": "1985-05-15",
        "gioiTinh": "Nam",
        "chucVu": "Trưởng phòng",
        "phongBan": "Phòng Nhân sự",
        "ngayVaoLam": "2010-03-01",
        "trinhDo": "Đại học",
        "luong": 15000000,
        "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
      }
    }
  ]
}
```

#### Lấy Hồ Sơ Cán Bộ Theo Mã

```
GET /api/hosocanbo/:maCanBo
```

**Ví dụ:** `GET /api/hosocanbo/CB001`

#### Tạo Hồ Sơ Cán Bộ Mới

```
POST /api/hosocanbo
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "maCanBo": "string (required, unique)",
  "hoTen": "string (required)",
  "ngaySinh": "string (required, YYYY-MM-DD)",
  "gioiTinh": "string (required, 'Nam' or 'Nữ')",
  "chucVu": "string (required)",
  "phongBan": "string (required)",
  "ngayVaoLam": "string (required, YYYY-MM-DD)",
  "trinhDo": "string (required)",
  "luong": "number (required)",
  "diaChi": "string (required)"
}
```

#### Cập Nhật Hồ Sơ Cán Bộ

```
PUT /api/hosocanbo/:maCanBo
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "hoTen": "string",
  "ngaySinh": "string",
  "gioiTinh": "string",
  "chucVu": "string",
  "phongBan": "string",
  "ngayVaoLam": "string",
  "trinhDo": "string",
  "luong": "number",
  "diaChi": "string"
}
```

#### Xóa Hồ Sơ Cán Bộ

```
DELETE /api/hosocanbo/:maCanBo
Authorization: Bearer <token>
```

#### Tìm Hồ Sơ Cán Bộ Theo Phòng Ban

```
GET /api/hosocanbo/phongban/:phongBan
```

**Ví dụ:** `GET /api/hosocanbo/phongban/Phòng Nhân sự`

#### Tìm Hồ Sơ Cán Bộ Theo Chức Vụ

```
GET /api/hosocanbo/chucvu/:chucVu
```

**Ví dụ:** `GET /api/hosocanbo/chucvu/Trưởng phòng`

#### Thay Đổi Chức Vụ

```
PATCH /api/hosocanbo/:maCanBo/thaydoichucvu
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "chucVuMoi": "string (required)"
}
```

#### Cập Nhật Lương

```
PATCH /api/hosocanbo/:maCanBo/luong
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "luongMoi": "number (required)"
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
  "role": "string (only admin can change role)",
  "isActive": "boolean (only admin can change)"
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
      "totalCanBo": 5,
      "totalLuong": 75000000,
      "avgLuong": 15000000,
      "byPhongBan": {
        "Phòng Nhân sự": {
          "count": 1,
          "totalLuong": 15000000
        }
      },
      "byChucVu": {
        "Trưởng phòng": 2,
        "Nhân viên": 2
      },
      "byTrinhDo": {
        "Đại học": 3,
        "Thạc sĩ": 2
      },
      "byGioiTinh": {
        "Nam": 3,
        "Nữ": 2
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
cd ~/qlhscb/qlhscb-backend
npm run enrollAdmin
npm run registerUser
```

**Kiểm tra:**
```bash
ls -la wallet/
# Phải thấy: admin/ và appUser/
```

### Lỗi: "Cannot connect to peer"

**Nguyên nhân:** Fabric network chưa khởi động

**Giải pháp:** Kiểm tra `docker ps` và khởi động lại network

### Lỗi: "Chaincode not found"

**Nguyên nhân:** Chaincode chưa được deploy

**Giải pháp:** Deploy lại chaincode bằng `./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript`

### Lỗi: "CORS error" trong frontend

**Nguyên nhân:** Backend không cho phép CORS

**Giải pháp:** Kiểm tra `cors()` middleware trong `server.js`

### Lỗi: "Connection refused" trong frontend

**Nguyên nhân:** Backend server chưa chạy hoặc sai port

**Giải pháp:** Kiểm tra backend đang chạy trên port 3007

### Lỗi: "Peer endorsements do not match"

**Nguyên nhân:** Chaincode chưa được deploy đúng hoặc network chưa chạy

**Giải pháp:**
```bash
cd /fabric-samples/test-network
./network.sh down
./network.sh up createChannel -ca
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
```

### Lỗi: "Access denied" trong discovery

**Nguyên nhân:** Discovery service không hoạt động đúng

**Giải pháp:** Backend đã có fallback tự động, nhưng có thể tắt discovery bằng cách set `DISCOVERY_ENABLED=false` trong environment variables

---

## 🎨 Khác Biệt Về Giao Diện

Hệ thống QLHSCB sử dụng **màu sắc xanh dương/tím** để phân biệt với QLCayTrong (màu xanh lá):

- **Navigation bar:** Gradient xanh dương/tím (`#667eea` → `#764ba2`)
- **Buttons:** Gradient xanh dương/tím
- **Loading screen:** Gradient xanh dương (`#4facfe` → `#00f2fe`)
- **Hero section:** Gradient xanh dương (`#4facfe` → `#00f2fe`)
- **Stats section:** Gradient xanh dương/tím
- **Table headers:** Gradient xanh dương/tím
- **Cards:** Gradient xanh dương/tím cho headers

---

## 📊 Cấu Trúc Dữ Liệu

### Hồ Sơ Cán Bộ

```javascript
{
  docType: 'hosocanbo',
  maCanBo: 'CB001',                    // Mã cán bộ (unique)
  hoTen: 'Nguyễn Văn An',              // Họ tên
  ngaySinh: '1985-05-15',              // Ngày sinh (YYYY-MM-DD)
  gioiTinh: 'Nam',                     // Giới tính: Nam, Nữ
  chucVu: 'Trưởng phòng',              // Chức vụ: Trưởng phòng, Phó phòng, Nhân viên
  phongBan: 'Phòng Nhân sự',           // Phòng ban
  ngayVaoLam: '2010-03-01',            // Ngày vào làm (YYYY-MM-DD)
  trinhDo: 'Đại học',                  // Trình độ: Trung cấp, Cao đẳng, Đại học, Thạc sĩ, Tiến sĩ
  luong: 15000000,                     // Lương (VND)
  diaChi: '123 Đường ABC, Quận 1, TP.HCM'  // Địa chỉ
}
```

### User

```javascript
{
  docType: 'user',
  username: 'admin',                    // Tên đăng nhập (unique)
  password: 'hashed_password',          // Mật khẩu đã hash
  fullName: 'Administrator',           // Họ tên
  email: 'admin@example.com',          // Email
  role: 'admin',                        // Vai trò: 'admin' hoặc 'user'
  createdAt: '2024-01-01T00:00:00.000Z', // Ngày tạo
  isActive: true                        // Trạng thái hoạt động
}
```

---

## 🎯 So Sánh Với QLCayTrong

| Tính năng | QLCayTrong | QLHSCB |
|-----------|------------|--------|
| **Màu sắc** | Xanh lá (`#11998e`, `#38ef7d`) | Xanh dương/tím (`#667eea`, `#764ba2`, `#4facfe`) |
| **Icon** | 🌳 | 👔 |
| **Port Backend** | 3006 | 3007 |
| **Port Frontend** | 3000 | 8007 |
| **Chaincode** | qlcaytrong | qlhscb |
| **Dữ liệu chính** | Cây trồng | Hồ sơ cán bộ |
| **Thống kê** | Theo loại cây, giai đoạn, vị trí | Theo phòng ban, chức vụ, trình độ, giới tính |
| **Tính năng** | Tương tự | Tương tự |

---

## 📝 Tổng Kết

Sau khi hoàn thành các bước trên, bạn sẽ có:

- ✅ Chaincode đã được deploy lên Fabric network với user management
- ✅ Backend API server chạy trên port 3007 với authentication JWT
- ✅ Frontend React app chạy trên port 8007 với giao diện màu xanh dương/tím
- ✅ Hệ thống quản lý hồ sơ cán bộ hoàn chỉnh trên blockchain
- ✅ Đầy đủ tính năng: Login/Logout, User Management, Reports, Account Management

## 🎨 Lưu Ý Về Màu Sắc

Hệ thống QLHSCB được thiết kế với **màu sắc xanh dương/tím** để phân biệt rõ ràng với QLCayTrong (màu xanh lá). Tất cả các component, buttons, và backgrounds đều sử dụng gradient xanh dương/tím thay vì xanh lá.

Chúc bạn thành công! 👔

