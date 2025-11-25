# Hướng Dẫn Triển Khai Hệ Thống Quản Lý Cây Trồng Blockchain

## Tổng quan

Dự án xây dựng hệ thống quản lý cây trồng trên Hyperledger Fabric với các tính năng đầy đủ:

1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ và quản lý user
2. **Backend API Server** - Cung cấp REST API với authentication JWT
3. **Frontend Web App** - Giao diện người dùng React chuyên nghiệp với nhiều tính năng

## Tính năng chính

- ✅ **Đăng nhập/Đăng xuất** - Hệ thống authentication với JWT
- ✅ **Quản lý cây trồng** - CRUD đầy đủ cho cây trồng
- ✅ **Quản lý người dùng** - Admin có thể quản lý tất cả user
- ✅ **Báo cáo & Thống kê** - Tạo báo cáo chi tiết và xuất CSV
- ✅ **Trang chủ chuyên nghiệp** - Giao diện hiện đại với HTML5/CSS
- ✅ **Quản lý tài khoản** - User có thể cập nhật thông tin cá nhân
- ✅ **Responsive Design** - Tương thích mọi thiết bị

## Quy ước

### URL_BACK_END = http://localhost:3006 hoặc = http://16.19.0.15:3006
### URL_FRONT_END = http://localhost:3000 hoặc http://16.19.0.15:3000

## Bước 1: Chuẩn bị môi trường

### Yêu cầu hệ thống

- Hyperledger Fabric đã được cài đặt trên VMHyper
- Node.js >= 16.x (khuyến nghị >= 18.x)
- npm hoặc yarn
- Docker và Docker Compose

### Truy cập VMHyper

**Cách 1: SSH từ Command Prompt (Windows)**

```bash
ssh -p 15 sv102102666@wandertour.ddns.net
# Password: 123456
```

**Cách 2: Sử dụng MobaXterm**

- Hostname: `wandertour.ddns.net`
- Port: `15`
- Username: `sv102102666`
- Password: `123456`

### Kiểm tra môi trường

```bash
node --version
npm --version
docker --version
```

## Bước 2: Tạo và cài đặt Chaincode

### 2.1. Tạo thư mục chaincode

```bash
cd /fabric-samples/chaincode/
mkdir -p qlcaytrong/javascript
cd qlcaytrong/javascript
```

### 2.2. Copy các file chaincode

Copy các file từ thư mục `chaincode_qlcaytrong/javascript/` của dự án:

- `qlcaytrong.js`
- `index.js`
- `package.json`

### 2.3. Cài đặt dependencies

```bash
npm install
```

### 2.4. Package chaincode

```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

## Bước 3: Cài đặt Backend API Server

### 3.1. Tạo thư mục backend

```bash
cd ~
mkdir -p backend
cd backend
```

### 3.2. Copy các file backend

Copy các file từ thư mục `backend/` của dự án:

- `server.js`
- `enrollAdmin.js`
- `registerUser.js`
- `package.json`

### 3.3. Cài đặt dependencies

```bash
npm install
```

**Lưu ý:** Hệ thống mới yêu cầu các package bổ sung:
- `jsonwebtoken` - Cho JWT authentication
- `bcryptjs` - Cho password hashing

### 3.4. Đăng ký Admin và User

```bash
# Đăng ký admin
npm run enrollAdmin

# Đăng ký user
npm run registerUser
```

### 3.5. Chạy Backend Server

```bash
npm start
```

Server sẽ chạy trên port **3006** (mặc định).

Kiểm tra server:

```bash
curl http://localhost:3006/health
```

## Bước 4: Cài đặt Frontend React App

### 4.1. Tạo thư mục frontend

```bash
cd ~
mkdir -p frontend
cd frontend
```

### 4.2. Copy các file frontend

Copy toàn bộ thư mục `frontend/` của dự án.

### 4.3. Cài đặt dependencies

```bash
npm install
```

### 4.4. Cấu hình API URL (nếu cần)

Tạo file `.env` trong thư mục `frontend/`:

```bash
REACT_APP_API_URL=http://localhost:3006/api
```

Hoặc nếu chạy trên server khác:

```bash
REACT_APP_API_URL=http://16.19.0.15:3006/api
```

### 4.5. Chạy Frontend

```bash
npm start
```

Frontend sẽ chạy trên port **3000** (mặc định).

Truy cập ứng dụng tại: `http://localhost:3000`

## Bước 5: Sử dụng ứng dụng

### 5.1. Đăng nhập

1. Mở trình duyệt và truy cập `http://localhost:3000`
2. Trang đăng nhập sẽ hiển thị
3. **Lưu ý:** Bạn cần tạo tài khoản đầu tiên thông qua API hoặc chaincode

**Tạo tài khoản admin đầu tiên:**

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

Sau đó đăng nhập với:
- Username: `admin`
- Password: `admin123`

### 5.2. Trang chủ

Sau khi đăng nhập, bạn sẽ thấy trang chủ với:
- Thông tin chào mừng
- Tính năng nổi bật
- Thống kê hệ thống

### 5.3. Quản lý cây trồng

**Thêm cây mới:**
- Click tab **"Quản lý cây trồng"**
- Click nút **"Thêm cây trồng mới"**
- Điền đầy đủ thông tin và click **"Lưu"**

**Các thao tác khác:**
- Sửa cây trồng
- Xóa cây trồng
- Chuyển giai đoạn
- Cập nhật năng suất
- Lọc theo loại cây và giai đoạn

### 5.4. Báo cáo & Thống kê

1. Click tab **"Báo cáo"**
2. Hệ thống sẽ tự động tạo báo cáo
3. Click **"Xuất CSV"** để tải báo cáo về máy

### 5.5. Quản lý người dùng (Admin only)

1. Click tab **"Quản lý người dùng"** (chỉ admin thấy)
2. Xem danh sách tất cả user
3. Sửa hoặc xóa user

### 5.6. Quản lý tài khoản

1. Click tab **"Tài khoản"**
2. Cập nhật thông tin cá nhân
3. Xem thông tin tài khoản

## Bước 6: API Endpoints

### Authentication

```
POST /api/auth/register
Body: { username, password, fullName, email, role }

POST /api/auth/login
Body: { username, password }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
```

### User Management (Admin only)

```
GET /api/users
Headers: { Authorization: Bearer <token> }

GET /api/users/:username
Headers: { Authorization: Bearer <token> }

PUT /api/users/:username
Headers: { Authorization: Bearer <token> }
Body: { fullName, email, role }

DELETE /api/users/:username
Headers: { Authorization: Bearer <token> }
```

### Cây trồng

```
POST /api/init
POST /api/caytrong
GET /api/caytrong
GET /api/caytrong/:maCay
PUT /api/caytrong/:maCay
DELETE /api/caytrong/:maCay
GET /api/caytrong/loai/:loaiCay
GET /api/caytrong/giaidoan/:giaiDoan
PATCH /api/caytrong/:maCay/chuyengiaidoan
PATCH /api/caytrong/:maCay/nangsuat
```

### Reports

```
GET /api/reports
Headers: { Authorization: Bearer <token> }
```

## Bước 7: Xử lý lỗi thường gặp

### Lỗi: "User does not exist in wallet"

**Giải pháp:**
```bash
cd backend
npm run enrollAdmin
npm run registerUser
```

### Lỗi: "Cannot connect to Fabric network"

**Giải pháp:**
```bash
cd /fabric-samples/test-network
./network.sh up
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

### Lỗi: "Token không hợp lệ"

**Giải pháp:** Đăng xuất và đăng nhập lại

### Lỗi: "Chỉ admin mới có quyền truy cập"

**Giải pháp:** Đảm bảo bạn đang đăng nhập với tài khoản admin

## Bước 8: Tùy chỉnh

### Thay đổi Port Backend

Sửa trong `backend/server.js`:
```javascript
const PORT = process.env.PORT || 3006;
```

### Thay đổi Port Frontend

Tạo file `.env` trong `frontend/`:
```
PORT=3000
```

### Thay đổi JWT Secret

Tạo file `.env` trong `backend/`:
```
JWT_SECRET=your-secret-key-here
```

## Cấu trúc dự án

```
qlcay/
├── chaincode_qlcaytrong/
│   └── javascript/
│       ├── qlcaytrong.js
│       ├── index.js
│       └── package.json
├── backend/
│   ├── server.js
│   ├── enrollAdmin.js
│   ├── registerUser.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── components/
    │   │   ├── Login.js
    │   │   ├── Navigation.js
    │   │   ├── HomePage.js
    │   │   ├── CayTrongTable.js
    │   │   ├── UserManagement.js
    │   │   ├── ReportPage.js
    │   │   └── AccountPage.js
    │   └── services/
    │       └── api.js
    └── package.json
```

## Tài liệu tham khảo

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Contract API](https://hyperledger.github.io/fabric-chaincode-node/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [JWT Authentication](https://jwt.io/)

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs của Backend Server
2. Logs của Frontend (Console trong trình duyệt)
3. Logs của Chaincode (trong Docker containers)
4. Đảm bảo tất cả services đang chạy
5. Kiểm tra token JWT có hợp lệ không

---

**Chúc bạn triển khai thành công! 🎉**

