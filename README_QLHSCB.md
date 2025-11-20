# Hệ Thống Quản Lý Hồ Sơ Cán Bộ trên Blockchain - Hyperledger Fabric

Dự án xây dựng hệ thống quản lý hồ sơ cán bộ sử dụng Hyperledger Fabric blockchain, bao gồm:

- Chaincode (Smart Contract) quản lý hồ sơ cán bộ
- Backend API Server (Node.js/Express)
- Frontend Web App (React.js)

## Cấu trúc dự án

**Theo chuẩn tài liệu lab, cấu trúc đúng như sau:**

```
qlhscb/
├── chaincode_qlhscb/
│   └── javascript/
│       ├── qlhscb.js      # Chaincode chính
│       ├── index.js            # Export module
│       └── package.json        # Dependencies
├── backend_qlhscb/         # Backend API Server
│   ├── server.js               # API Server
│   ├── enrollAdmin.js          # Đăng ký admin
│   ├── registerUser.js         # Đăng ký user
│   ├── package.json            # Dependencies
│   └── wallet/                 # Wallet chứa identities
└── frontend_qlhscb/        # Frontend React App
    ├── src/
    │   ├── components/
    │   │   └── HoSoCanBoTable.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

**Lưu ý:**

- Trên server Linux, chaincode nên đặt tại: `/fabric-samples/qlhscb/javascript/`
- Backend nên đặt tại: `~/qlhscb/qlhscb-backend/`
- Frontend nên đặt tại: `~/qlhscb/qlhscb-frontend/`

## Cài đặt và triển khai

### 1. Chaincode

**Trên server Linux:**

```bash
# Tạo thư mục chaincode
cd /fabric-samples/chaincode/
mkdir qlhscb
cd qlhscb
mkdir javascript
cd javascript

# Copy các file chaincode vào đây
# Sau đó cài đặt dependencies:
npm install
```

**Hoặc đặt tại:** `/fabric-samples/qlhscb/javascript/` (theo tài liệu)

### 2. Deploy Chaincode

```bash
cd /fabric-samples/test-network

# Khởi động network
./network.sh up -ca

# Tạo channel
./network.sh createChannel

# Deploy chaincode (theo tài liệu)
./network.sh deployCC -ccn qlhscb -ccp ../qlhscb/ -ccl javascript

# Hoặc nếu đặt tại chaincode/
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/ -ccl javascript
```

### 3. Backend API Server

**Trên server Linux:**

```bash
cd ~/qlhscb/qlhscb-backend
# Hoặc: cd backend_qlhscb (nếu chưa đổi tên)

npm install

# Đăng ký admin
node enrollAdmin.js

# Đăng ký user (thay đổi USER_NAME trong registerUser.js hoặc dùng biến môi trường)
export USER_NAME="sv102102666"  # Thay bằng mã sinh viên của bạn
node registerUser.js

# Khởi động server
node server.js
```

Server sẽ chạy trên port 3007.

### 4. Frontend React App

**Trên server Linux:**

```bash
cd ~/qlhscb/qlhscb-frontend
# Hoặc: cd frontend_qlhscb (nếu chưa đổi tên)

npm install

# Khởi động app
PORT=8007 npm start
```

App sẽ chạy trên port 8007.

## API Endpoints

| Method | Endpoint                            | Mô tả                        |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | /health                             | Health check                 |
| POST   | /api/init                           | Khởi tạo dữ liệu mẫu         |
| GET    | /api/hosocanbo                      | Lấy tất cả hồ sơ cán bộ     |
| GET    | /api/hosocanbo/:maCanBo             | Lấy hồ sơ cán bộ theo mã    |
| POST   | /api/hosocanbo                      | Tạo hồ sơ cán bộ mới         |
| PUT    | /api/hosocanbo/:maCanBo             | Cập nhật hồ sơ cán bộ        |
| DELETE | /api/hosocanbo/:maCanBo             | Xóa hồ sơ cán bộ             |
| GET    | /api/hosocanbo/phongban/:phongBan   | Tìm hồ sơ cán bộ theo phòng ban |
| GET    | /api/hosocanbo/chucvu/:chucVu      | Tìm hồ sơ cán bộ theo chức vụ |
| PATCH  | /api/hosocanbo/:maCanBo/thaydoichucvu | Thay đổi chức vụ          |
| PATCH  | /api/hosocanbo/:maCanBo/luong       | Cập nhật lương              |

## Các hàm trong Chaincode

| Function                | Mô tả                            | Parameters                                                             |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| initLedger              | Khởi tạo dữ liệu mẫu 5 hồ sơ cán bộ | Không có                                                               |
| queryHoSoCanBo          | Truy vấn hồ sơ cán bộ theo mã   | maCanBo                                                                  |
| createHoSoCanBo         | Tạo hồ sơ cán bộ mới             | maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi |
| queryAllHoSoCanBo       | Truy vấn tất cả hồ sơ cán bộ     | Không có                                                               |
| updateHoSoCanBo         | Cập nhật thông tin hồ sơ cán bộ   | maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi |
| deleteHoSoCanBo         | Xóa hồ sơ cán bộ                  | maCanBo                                                                  |
| queryHoSoCanBoByPhongBan | Tìm hồ sơ cán bộ theo phòng ban   | phongBan                                                                |
| queryHoSoCanBoByChucVu  | Tìm hồ sơ cán bộ theo chức vụ     | chucVu                                                                  |
| changeChucVu             | Thay đổi chức vụ cán bộ           | maCanBo, chucVuMoi                                                      |
| updateLuong              | Cập nhật lương                    | maCanBo, luongMoi                                                       |

## Dữ liệu mẫu

Hệ thống khởi tạo 5 hồ sơ cán bộ mẫu:

- CB001: Nguyễn Văn An - Trưởng phòng Phòng Nhân sự
- CB002: Trần Thị Bình - Nhân viên Phòng Kế toán
- CB003: Lê Văn Cường - Phó phòng Phòng Kỹ thuật
- CB004: Phạm Thị Dung - Nhân viên Phòng Marketing
- CB005: Hoàng Văn Em - Trưởng phòng Phòng Kinh doanh

## Tính năng Frontend

- Hiển thị danh sách hồ sơ cán bộ trong bảng
- Thêm, sửa, xóa hồ sơ cán bộ
- Lọc hồ sơ cán bộ theo phòng ban và chức vụ
- Thay đổi chức vụ cán bộ
- Cập nhật lương
- Khởi tạo dữ liệu mẫu
- Thống kê thông tin (tổng số, tổng lương, lương trung bình)
- Giao diện responsive với Bootstrap
- Xử lý lỗi và loading states
- Định dạng tiền tệ VND

## Lưu ý

1. **Đặt tên theo chuẩn:** Nên đổi tên thư mục `backend_qlhscb/` → `qlhscb-backend/` và `frontend_qlhscb/` → `qlhscb-frontend/` để khớp với tài liệu lab
2. **Chaincode name:** Trong code phải dùng `qlhscb` (không có dấu gạch ngang) khi deploy
3. Đảm bảo Hyperledger Fabric test-network đang chạy trước khi khởi động backend
4. Thay đổi USER_NAME trong `registerUser.js` hoặc dùng biến môi trường `export USER_NAME="sv102102666"` theo mã sinh viên của bạn
5. Đảm bảo đường dẫn connection profile đúng: `/fabric-samples/test-network/organizations/...`
6. Backend và Frontend cần chạy trên các port khác nhau (3007 và 8007)
7. **Vị trí chaincode trên server:** Nên đặt tại `/fabric-samples/qlhscb/javascript/` theo tài liệu

## Cấu trúc dữ liệu Hồ Sơ Cán Bộ

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

## Tác giả

Dự án được xây dựng dựa trên mẫu FabCar của Hyperledger Fabric và dự án quản lý cây trồng.

