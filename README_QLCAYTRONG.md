# 🌳 Hệ Thống Quản Lý Cây Trồng Blockchain

Hệ thống quản lý cây trồng hiện đại được xây dựng trên nền tảng **Hyperledger Fabric Blockchain** với giao diện web chuyên nghiệp.

## ✨ Tính năng chính

### 🔐 Authentication & Authorization
- Đăng nhập/Đăng xuất với JWT
- Phân quyền Admin và User
- Quản lý session an toàn

### 🌱 Quản lý Cây Trồng
- Thêm, sửa, xóa cây trồng
- Theo dõi giai đoạn phát triển
- Cập nhật năng suất
- Lọc và tìm kiếm theo nhiều tiêu chí
- Thống kê tổng quan

### 👥 Quản lý Người dùng (Admin)
- Xem danh sách tất cả user
- Sửa thông tin user
- Xóa user
- Phân quyền admin/user

### 📊 Báo cáo & Thống kê
- Tạo báo cáo tự động
- Thống kê theo loại cây
- Thống kê theo giai đoạn
- Thống kê theo vị trí
- Xuất báo cáo CSV

### 🏠 Trang chủ chuyên nghiệp
- Giao diện hiện đại với HTML5/CSS
- Responsive design
- Animation và hiệu ứng đẹp mắt
- Thông tin tổng quan hệ thống

### 👤 Quản lý Tài khoản
- Xem thông tin cá nhân
- Cập nhật thông tin
- Đổi mật khẩu (sắp có)

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js**
- **Hyperledger Fabric** - Blockchain platform
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** 18.x
- **React Bootstrap** - UI Components
- **Axios** - HTTP Client
- **HTML5/CSS3** - Modern styling

### Blockchain
- **Hyperledger Fabric** 2.x
- **Chaincode** (Smart Contract) - JavaScript

## 📁 Cấu trúc dự án

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
│   └── package.json
│
├── frontend/                      # React App
│   ├── src/
│   │   ├── App.js               # Main app component
│   │   ├── App.css              # Global styles
│   │   ├── components/
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Navigation.js   # Navigation bar
│   │   │   ├── HomePage.js      # Home page
│   │   │   ├── CayTrongTable.js # Cây trồng management
│   │   │   ├── UserManagement.js # User management
│   │   │   ├── ReportPage.js    # Reports page
│   │   │   └── AccountPage.js   # Account page
│   │   └── services/
│   │       └── api.js           # API service
│   └── package.json
│
├── HUONG_DAN_TRIEN_KHAI_QLCAYTRONG.md  # Deployment guide
└── README_QLCAYTRONG.md          # This file
```

## 🚀 Bắt đầu nhanh

### 1. Cài đặt Chaincode

```bash
cd /fabric-samples/chaincode/
mkdir -p qlcaytrong/javascript
# Copy files từ chaincode_qlcaytrong/javascript/
cd qlcaytrong/javascript
npm install
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
npm run enrollAdmin
npm run registerUser
npm start
```

Backend chạy trên: `http://localhost:3006`

### 3. Cài đặt Frontend

```bash
cd frontend
npm install
npm start
```

Frontend chạy trên: `http://localhost:3000`

### 4. Tạo tài khoản đầu tiên

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

### 5. Đăng nhập

Truy cập `http://localhost:3000` và đăng nhập với:
- Username: `admin`
- Password: `admin123`

## 📖 Tài liệu

Xem file [HUONG_DAN_TRIEN_KHAI_QLCAYTRONG.md](./HUONG_DAN_TRIEN_KHAI_QLCAYTRONG.md) để biết hướng dẫn chi tiết về triển khai.

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Cây trồng
- `POST /api/init` - Khởi tạo dữ liệu mẫu
- `GET /api/caytrong` - Lấy tất cả cây trồng
- `POST /api/caytrong` - Tạo cây trồng mới
- `PUT /api/caytrong/:maCay` - Cập nhật cây trồng
- `DELETE /api/caytrong/:maCay` - Xóa cây trồng
- `GET /api/caytrong/loai/:loaiCay` - Lọc theo loại
- `GET /api/caytrong/giaidoan/:giaiDoan` - Lọc theo giai đoạn

### User Management (Admin only)
- `GET /api/users` - Lấy tất cả user
- `GET /api/users/:username` - Lấy thông tin user
- `PUT /api/users/:username` - Cập nhật user
- `DELETE /api/users/:username` - Xóa user

### Reports
- `GET /api/reports` - Tạo báo cáo

## 🎨 Giao diện

Hệ thống có giao diện hiện đại với:
- Gradient backgrounds
- Smooth animations
- Responsive design
- Modern card layouts
- Professional color scheme

## 🔒 Bảo mật

- JWT authentication
- Password hashing với bcrypt
- Role-based access control
- Secure API endpoints
- Blockchain immutability

## 📝 License

Apache-2.0

## 👥 Tác giả

Hệ thống được phát triển cho dự án Quản Lý Cây Trồng trên Blockchain.

## 🙏 Cảm ơn

Cảm ơn Hyperledger Fabric community và React community đã cung cấp các công cụ tuyệt vời!

---

**Made with ❤️ using Hyperledger Fabric & React**

