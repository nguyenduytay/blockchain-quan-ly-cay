# Hệ Thống Quản Lý Cây Trồng trên Blockchain - Hyperledger Fabric

Dự án xây dựng hệ thống quản lý cây trồng sử dụng Hyperledger Fabric blockchain, bao gồm:

- Chaincode (Smart Contract) quản lý cây trồng
- Backend API Server (Node.js/Express)
- Frontend Web App (React.js)

## Cấu trúc dự án

```
qlcay/
├── chaincode/
│   └── javascript/
│       ├── qlcaytrong.js      # Chaincode chính
│       ├── index.js            # Export module
│       └── package.json        # Dependencies
├── backend/
│   ├── server.js               # API Server
│   ├── enrollAdmin.js          # Đăng ký admin
│   ├── registerUser.js         # Đăng ký user
│   └── package.json            # Dependencies
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── CayTrongTable.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    └── package.json
```

## Cài đặt và triển khai

### 1. Chaincode

```bash
cd /fabric-samples/chaincode/
mkdir qlcaytrong
cd qlcaytrong
mkdir javascript
cd javascript

# Copy các file chaincode vào đây
# Sau đó cài đặt dependencies:
npm install
```

### 2. Deploy Chaincode

```bash
cd /fabric-samples/test-network

# Khởi động network
./network.sh up -ca

# Tạo channel
./network.sh createChannel

# Deploy chaincode
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/ -ccl javascript
```

### 3. Backend API Server

```bash
cd backend
npm install

# Đăng ký admin
node enrollAdmin.js

# Đăng ký user (thay đổi USER_NAME trong registerUser.js)
node registerUser.js

# Khởi động server
node server.js
```

Server sẽ chạy trên port 3006.

### 4. Frontend React App

```bash
cd frontend
npm install

# Khởi động app
PORT=8006 npm start
```

App sẽ chạy trên port 8006.

## API Endpoints

| Method | Endpoint                            | Mô tả                        |
| ------ | ----------------------------------- | ---------------------------- |
| GET    | /health                             | Health check                 |
| POST   | /api/init                           | Khởi tạo dữ liệu mẫu         |
| GET    | /api/caytrong                       | Lấy tất cả cây trồng         |
| GET    | /api/caytrong/:maCay                | Lấy cây trồng theo mã        |
| POST   | /api/caytrong                       | Tạo cây trồng mới            |
| PUT    | /api/caytrong/:maCay                | Cập nhật cây trồng           |
| DELETE | /api/caytrong/:maCay                | Xóa cây trồng                |
| GET    | /api/caytrong/loai/:loaiCay         | Tìm cây trồng theo loại      |
| GET    | /api/caytrong/giaidoan/:giaiDoan    | Tìm cây trồng theo giai đoạn |
| PATCH  | /api/caytrong/:maCay/chuyengiaidoan | Chuyển giai đoạn             |
| PATCH  | /api/caytrong/:maCay/nangsuat       | Cập nhật năng suất           |

## Các hàm trong Chaincode

| Function                | Mô tả                            | Parameters                                                             |
| ----------------------- | -------------------------------- | ---------------------------------------------------------------------- |
| initLedger              | Khởi tạo dữ liệu mẫu 5 cây trồng | Không có                                                               |
| queryCayTrong           | Truy vấn cây trồng theo mã       | maCay                                                                  |
| createCayTrong          | Tạo cây trồng mới                | maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri |
| queryAllCayTrong        | Truy vấn tất cả cây trồng        | Không có                                                               |
| updateCayTrong          | Cập nhật thông tin cây trồng     | maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri |
| deleteCayTrong          | Xóa cây trồng                    | maCay                                                                  |
| queryCayTrongByLoai     | Tìm cây trồng theo loại          | loaiCay                                                                |
| queryCayTrongByGiaiDoan | Tìm cây trồng theo giai đoạn     | giaiDoan                                                               |
| changeGiaiDoanCayTrong  | Chuyển giai đoạn cây trồng       | maCay, giaiDoanMoi                                                     |
| updateNangSuat          | Cập nhật năng suất               | maCay, nangSuatMoi                                                     |

## Dữ liệu mẫu

Hệ thống khởi tạo 5 cây trồng mẫu:

- CT001: Cà phê Arabica
- CT002: Cao su
- CT003: Tiêu
- CT004: Điều
- CT005: Sầu riêng

## Tính năng Frontend

- Hiển thị danh sách cây trồng trong bảng
- Thêm, sửa, xóa cây trồng
- Lọc cây trồng theo loại và giai đoạn
- Chuyển giai đoạn cây trồng
- Cập nhật năng suất
- Khởi tạo dữ liệu mẫu
- Thống kê thông tin (tổng số, diện tích, năng suất trung bình)
- Giao diện responsive với Bootstrap
- Xử lý lỗi và loading states

## Lưu ý

1. Đảm bảo Hyperledger Fabric test-network đang chạy trước khi khởi động backend
2. Thay đổi USER_NAME trong `registerUser.js` theo mã sinh viên của bạn
3. Đảm bảo đường dẫn connection profile đúng: `/fabric-samples/test-network/organizations/...`
4. Backend và Frontend cần chạy trên các port khác nhau (3006 và 8006)

## Tác giả

Dự án được xây dựng dựa trên mẫu FabCar của Hyperledger Fabric.
