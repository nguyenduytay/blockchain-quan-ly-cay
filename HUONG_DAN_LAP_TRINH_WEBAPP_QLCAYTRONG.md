# Lập Trình Web App Truy Xuất API Backend Server

Xây dựng webapp React.js để gọi các hàm API trên và hiển thị danh sách theo dạng table.

## Cấu Trúc Thư Mục

```
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── services/
    │   └── App.js
    ├── package.json
    └── .env
```

## Tạo Thư Mục React App

```bash
cd ~
mkdir -p frontend
cd frontend
```

## Tạo Cấu Trúc Thư Mục

```bash
# Tạo cấu trúc thư mục
mkdir -p src/components src/services public

# Tạo các file cần thiết
touch package.json src/index.js src/App.js src/App.css public/index.html
touch src/components/CayTrongTable.js src/services/api.js
```

## 7.1. File: package.json

```bash
cd ~/frontend
nano package.json
```

**Nội dung file `package.json`:**

File này đã có sẵn trong thư mục `frontend/package.json` với các dependencies:
- `react` - React library
- `react-dom` - React DOM
- `react-scripts` - Create React App scripts
- `bootstrap` - Bootstrap CSS
- `react-bootstrap` - Bootstrap components
- `axios` - HTTP client
- `react-router-dom` - Routing
- `recharts` - Charts and graphs
- `xlsx` - Excel processing
- `jspdf` - PDF generation

## 7.2. File: src/services/api.js

```bash
cd ~/frontend
nano src/services/api.js
```

**Chức năng:**
- Cấu hình Axios client với base URL
- Định nghĩa các hàm API để gọi backend:
  - `getAllCayTrong()` - Lấy tất cả cây trồng
  - `getCayTrong(maCay)` - Lấy cây trồng theo mã
  - `createCayTrong(data)` - Tạo cây trồng mới
  - `updateCayTrong(maCay, data)` - Cập nhật cây trồng
  - `deleteCayTrong(maCay)` - Xóa cây trồng
  - `getCayTrongByLoai(loaiCay)` - Tìm theo loại
  - `getCayTrongByGiaiDoan(giaiDoan)` - Tìm theo giai đoạn
  - `changeGiaiDoan(maCay, giaiDoanMoi)` - Chuyển giai đoạn
  - `initLedger()` - Khởi tạo dữ liệu mẫu
  - `searchCayTrong(query)` - Tìm kiếm full-text
  - `filterCayTrong(filters)` - Lọc kết hợp

**Cấu hình API URL:**
- Base URL: `http://192.168.80.10:3006/api` hoặc `http://localhost:3006/api`
- Được cấu hình trong file `.env` với biến `REACT_APP_API_URL`

## 7.3. File: src/App.js

```bash
cd ~/frontend
nano src/App.js
```

**Chức năng:**
- Main App component
- Routing với React Router
- Quản lý authentication state
- Navigation và layout
- Protected routes
- Public routes (Login, Register, ForgotPassword, ResetPassword)

**Các routes:**
- `/login` - Trang đăng nhập
- `/register` - Trang đăng ký
- `/forgot-password` - Quên mật khẩu
- `/reset-password` - Đặt lại mật khẩu
- `/` - Trang chủ (protected)
- `/dashboard` - Dashboard (protected)
- `/caytrong` - Quản lý cây trồng (protected)
- `/report` - Báo cáo (protected)
- `/users` - Quản lý người dùng (protected, Admin/Manager only)
- `/account` - Tài khoản (protected)

## 7.4. File: src/App.css

```bash
cd ~/frontend
nano src/App.css
```

**Chức năng:**
- Global CSS styles
- Theme colors (xanh lá - green theme cho QLCayTrong)
- Navigation styles
- Button styles
- Card styles
- Responsive design
- Animation và transitions

**Theme colors:**
- Primary: `#11998e` (xanh lá đậm)
- Secondary: `#38ef7d` (xanh lá nhạt)
- Gradient: `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)`

## 7.5. File: src/index.js

```bash
cd ~/frontend
nano src/index.js
```

**Chức năng:**
- Entry point của React app
- Render App component vào DOM
- Import Bootstrap CSS
- Import global styles

## 7.6. File: src/components/CayTrongTable.js

```bash
cd ~/frontend
nano src/components/CayTrongTable.js
```

**Chức năng:**
- Component chính để hiển thị và quản lý cây trồng
- Hiển thị danh sách cây trồng trong bảng
- Thêm, sửa, xóa cây trồng
- Tìm kiếm và lọc cây trồng
- Import/Export Excel và PDF
- Chuyển giai đoạn cây trồng
- Cập nhật năng suất
- Khởi tạo dữ liệu mẫu
- Thống kê thông tin
- Giao diện responsive với Bootstrap
- Xử lý lỗi và loading states

**Các tính năng:**
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Tìm kiếm full-text
- ✅ Lọc nâng cao (theo loại, giai đoạn, vị trí)
- ✅ Import/Export Excel
- ✅ Export PDF
- ✅ Chuyển giai đoạn
- ✅ Cập nhật năng suất
- ✅ Thống kê tổng quan
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## 7.7. File: public/index.html

```bash
cd ~/frontend
nano public/index.html
```

**Chức năng:**
- HTML template chính
- Meta tags
- Title: "QLCayTrong - Hệ Thống Quản Lý Cây Trồng Blockchain"
- Bootstrap CDN (nếu cần)
- Root div để render React app

## 7.8. Cài Đặt và Chạy Webapp

### Bước 1: Tạo và Cài Đặt React App

```bash
# Tạo thư mục react-app
cd ~/frontend

# Tạo package.json và các file
# Cài đặt dependencies:
npm install
```

**Dependencies sẽ được cài:**
- `react` - React library
- `react-dom` - React DOM
- `react-scripts` - Create React App scripts
- `bootstrap` - Bootstrap CSS
- `react-bootstrap` - Bootstrap components
- `axios` - HTTP client
- `react-router-dom` - Routing
- `recharts` - Charts and graphs
- `xlsx` - Excel processing
- `jspdf` - PDF generation

### Bước 2: Cấu Hình Environment Variables

```bash
ls -a
cat .env
```

**Tạo file `.env` nếu chưa có:**

```bash
nano .env
```

**Nội dung file `.env`:**

```env
# API Backend URL
REACT_APP_API_URL=http://192.168.80.10:3006/api

# Hoặc nếu chạy local:
# REACT_APP_API_URL=http://localhost:3006/api
```

### Bước 3: Khởi Động Ứng Dụng

```bash
# Khởi động React app (chạy trên port 3000 mặc định)
PORT=3000 npm start
```

**Hoặc:**

```bash
npm start
```

**Kết quả mong đợi:**
```
Compiled successfully!

You can now view qlcaytrong-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.80.10:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

### Bước 4: Kiểm Tra Kết Nối

**Mở 3 terminal windows và chạy lần lượt:**

**Terminal 1 - Kiểm tra API server:**
```bash
curl http://192.168.80.10:3006/health
```

**Hoặc trong browser truy cập:**
```
http://192.168.80.10:3006/health
```

**Terminal 2 - Kiểm tra chaincode:**
```bash
curl http://192.168.80.10:3006/api/caytrong
```

**Terminal 3 - Kiểm tra React app:**
```bash
curl http://192.168.80.10:3000
```

## 7.9. Truy Cập Web App

### Mở Trình Duyệt

**Gõ địa chỉ:**
```
http://192.168.80.10:3000
```

**Hoặc nếu truy cập từ máy local:**
```
http://localhost:3000
```

### Các Chức Năng Của Webapp

#### 1. Hiển Thị Danh Sách Cây Trồng Trong Bảng
- Bảng responsive với Bootstrap
- Hiển thị đầy đủ thông tin: Mã cây, Tên cây, Loại cây, Ngày trồng, Giai đoạn, Năng suất, Diện tích, Vị trí
- Pagination (nếu có nhiều dữ liệu)
- Sorting (sắp xếp theo cột)

#### 2. Thêm, Sửa, Xóa Cây Trồng
- **Thêm:** Modal form để nhập thông tin cây trồng mới
- **Sửa:** Click nút "Sửa" để mở modal với form đã điền sẵn
- **Xóa:** Click nút "Xóa" và xác nhận trong modal

#### 3. Lọc Cây Trồng Theo Loại
- Dropdown để chọn loại cây
- Hiển thị kết quả lọc ngay lập tức
- Có thể kết hợp với các bộ lọc khác

#### 4. Lọc Cây Trồng Theo Giai Đoạn
- Dropdown để chọn giai đoạn
- Các giai đoạn: Mới trồng, Đang phát triển, Trưởng thành, Thu hoạch

#### 5. Tìm Kiếm Full-Text
- Ô tìm kiếm để nhập từ khóa
- Tìm kiếm theo: Tên cây, Mã cây, Vị trí
- Kết quả hiển thị ngay khi gõ

#### 6. Lọc Kết Hợp Nhiều Tiêu Chí
- Bộ lọc nâng cao với nhiều tiêu chí:
  - Loại cây
  - Giai đoạn
  - Vị trí
- Có thể kết hợp nhiều tiêu chí cùng lúc

#### 7. Chuyển Giai Đoạn Cây Trồng
- Click nút "Chuyển giai đoạn" trên từng dòng
- Modal để chọn giai đoạn mới
- Cập nhật ngay lập tức

#### 8. Cập Nhật Năng Suất
- Click nút "Cập nhật năng suất" trên từng dòng
- Modal để nhập năng suất mới
- Validation số thực

#### 9. Khởi Tạo Dữ Liệu Mẫu
- Nút "Khởi tạo dữ liệu" ở đầu trang
- Tạo 5 cây trồng mẫu
- Hiển thị thông báo thành công

#### 10. Thống Kê Thông Tin
- Cards hiển thị:
  - Tổng số cây trồng
  - Tổng diện tích
  - Năng suất trung bình
  - Số cây trưởng thành
- Cập nhật real-time khi có thay đổi

#### 11. Import/Export Excel
- **Export:** Nút "Xuất Excel" để tải file Excel
- **Import:** Nút "Import Excel" (Admin/Manager only) để upload file
- Validation format file

#### 12. Export PDF
- Nút "Xuất PDF" để tải báo cáo PDF
- Format đẹp với header, footer
- Bao gồm thống kê tổng quan

#### 13. Giao Diện Responsive Với Bootstrap
- Responsive trên mọi thiết bị
- Mobile-friendly
- Tablet-friendly
- Desktop-optimized

#### 14. Xử Lý Lỗi và Loading States
- Loading spinner khi đang tải dữ liệu
- Error messages rõ ràng
- Toast notifications cho các hành động
- Retry mechanism

#### 15. Authentication & Authorization
- Đăng nhập/Đăng xuất
- Protected routes
- Role-based access control
- Session management

#### 16. Dashboard Tổng Quan
- KPI cards
- Biểu đồ trực quan (Bar chart, Pie chart)
- Thống kê theo loại cây
- Thống kê theo giai đoạn
- Thống kê theo vị trí

#### 17. Báo Cáo & Thống Kê
- Tạo báo cáo tự động
- Xuất báo cáo CSV, Excel, PDF
- Lưu trữ lịch sử báo cáo
- Báo cáo định kỳ

#### 18. Quản Lý Người Dùng (Admin/Manager Only)
- Xem danh sách users
- Sửa thông tin user
- Xóa user (Admin only)
- Phân quyền

#### 19. Quản Lý Tài Khoản
- Xem thông tin cá nhân
- Cập nhật thông tin
- Đổi mật khẩu

## 7.10. Cấu Trúc Component Chính

```
src/
├── components/
│   ├── Login.js              # Trang đăng nhập
│   ├── Register.js           # Trang đăng ký
│   ├── ForgotPassword.js    # Quên mật khẩu
│   ├── ResetPassword.js     # Đặt lại mật khẩu
│   ├── Navigation.js        # Navigation bar
│   ├── HomePage.js          # Trang chủ
│   ├── Dashboard.js         # Dashboard với biểu đồ
│   ├── CayTrongTable.js     # Component chính quản lý cây trồng
│   ├── UserManagement.js   # Quản lý người dùng
│   ├── ReportPage.js        # Trang báo cáo
│   └── AccountPage.js       # Trang tài khoản
├── services/
│   └── api.js               # API service functions
├── App.js                   # Main app component
├── App.css                  # Global styles
└── index.js                 # Entry point
```

## 7.11. Lưu Ý Quan Trọng

1. **Port mặc định:** Frontend chạy trên port **3000**
2. **API URL:** Cấu hình trong file `.env` với `REACT_APP_API_URL`
3. **Backend URL:** `http://192.168.80.10:3006` hoặc `http://localhost:3006`
4. **CORS:** Backend phải cho phép CORS từ frontend origin
5. **Authentication:** Sử dụng JWT token lưu trong localStorage
6. **Responsive:** Sử dụng Bootstrap 5 cho responsive design
7. **Theme:** Xanh lá (green) cho QLCayTrong để phân biệt với các hệ thống khác

## 7.12. Xử Lý Lỗi Thường Gặp

### Lỗi: "Network Error" hoặc "CORS Error"

**Nguyên nhân:** Backend không cho phép CORS hoặc chưa chạy

**Giải pháp:**
```bash
# Kiểm tra backend đang chạy
curl http://192.168.80.10:3006/health

# Kiểm tra CORS trong server.js (phải có app.use(cors()))
```

### Lỗi: "Cannot GET /"

**Nguyên nhân:** React Router chưa được cấu hình đúng

**Giải pháp:** Kiểm tra routing trong `App.js`

### Lỗi: "API URL not found"

**Nguyên nhân:** File `.env` chưa được tạo hoặc sai format

**Giải pháp:**
```bash
# Tạo file .env
echo "REACT_APP_API_URL=http://192.168.80.10:3006/api" > .env

# Restart React app
npm start
```

### Lỗi: "Module not found"

**Nguyên nhân:** Dependencies chưa được cài đặt

**Giải pháp:**
```bash
npm install
```

## 7.13. Build Production

```bash
# Build production
npm run build

# Serve production build
npm install -g serve
serve -s build -l 3000
```

## 7.14. Kết Luận

Webapp React.js này cung cấp đầy đủ chức năng để tương tác với API backend server và hiển thị dữ liệu cây trồng một cách trực quan và dễ sử dụng!

**Tính năng chính:**
- ✅ CRUD operations đầy đủ
- ✅ Tìm kiếm và lọc nâng cao
- ✅ Import/Export Excel và PDF
- ✅ Dashboard với biểu đồ
- ✅ Authentication & Authorization
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ User management
- ✅ Reports & Statistics

**Chúc bạn lập trình thành công! 🌳**

