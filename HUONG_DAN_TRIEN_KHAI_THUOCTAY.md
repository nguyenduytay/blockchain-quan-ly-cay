# Hướng Dẫn Triển Khai Hệ Thống Quản Lý Thuốc Tây Blockchain

## Tổng quan

Dự án xây dựng hệ thống quản lý thuốc tây trên Hyperledger Fabric với 3 thành phần chính:

1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ
2. **Backend API Server** - Cung cấp REST API
3. **Frontend Web App** - Giao diện người dùng React

## Quy ước : 
### URL_BACK_END = http://localhost:3007 hoặc = http://16.19.0.15:3007
### URL_FRONT_END = http://localhost:3008 hoặc http://16.19.0.15:3008

## Bước 1: Chuẩn bị môi trường

### Yêu cầu hệ thống

- Hyperledger Fabric đã được cài đặt trên VMHyper
- Node.js >= 16.x (khuyến nghị >= 18.x để tương thích tốt nhất)
- npm hoặc yarn
- Docker và Docker Compose

**Lưu ý về phiên bản Node.js:**

- Node.js 16.x: Có thể gặp cảnh báo với fabric-contract-api@2.5.x, nên dùng phiên bản 2.2.x
- Node.js 18.x trở lên: Tương thích tốt với tất cả phiên bản fabric-contract-api

### Truy cập VMHyper

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

### Kiểm tra môi trường

```bash
# Kiểm tra Node.js
node --version

# Kiểm tra npm
npm --version

# Kiểm tra Docker
docker --version
```

## Bước 2: Tạo và cài đặt Chaincode

### 2.1. Tạo thư mục chaincode

**Đặt tại `/fabric-samples/chaincode/` (thông thường)**

```bash
cd /fabric-samples/chaincode/
mkdir -p thuoctay/javascript
cd thuoctay/javascript
```

### 2.2. Copy các file chaincode

Copy các file từ thư mục `chaincode_thuoctay/javascript/` của dự án:

- `thuoctay.js`
- `index.js`
- `package.json`

### 2.3. Cài đặt dependencies

```bash
npm install
```

**Nếu gặp cảnh báo về phiên bản Node.js:**

- Nếu dùng Node.js 16.x: Package.json đã được cấu hình để dùng fabric-contract-api@~2.2.0 (tương thích với Node.js 16)
- Nếu dùng Node.js 18.x trở lên: Có thể dùng phiên bản mới nhất

Kiểm tra cài đặt:

```bash
npm list fabric-contract-api fabric-shim
```

### 2.4. Package chaincode

```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn thuoctay -ccp ../chaincode/thuoctay/javascript -ccl javascript
```

**Lưu ý:** 
- `-ccn thuoctay`: Tên chaincode
- `-ccp`: Đường dẫn đến thư mục chaincode
- `-ccl javascript`: Ngôn ngữ chaincode

## Bước 3: Cài đặt Backend API Server

### 3.1. Tạo thư mục backend

```bash
cd ~
mkdir -p backend_thuoctay
cd backend_thuoctay
```

### 3.2. Copy các file backend

Copy các file từ thư mục `backend_thuoctay/` của dự án:

- `server.js`
- `enrollAdmin.js`
- `registerUser.js`
- `package.json`

### 3.3. Cài đặt dependencies

```bash
npm install
```

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

Server sẽ chạy trên port **3007** (mặc định).

Kiểm tra server:

```bash
curl http://localhost:3007/health
```

## Bước 4: Cài đặt Frontend React App

### 4.1. Tạo thư mục frontend

```bash
cd ~
mkdir -p frontend_thuoctay
cd frontend_thuoctay
```

### 4.2. Copy các file frontend

Copy toàn bộ thư mục `frontend_thuoctay/` của dự án.

### 4.3. Cài đặt dependencies

```bash
npm install
```

### 4.4. Cấu hình API URL (nếu cần)

Tạo file `.env` trong thư mục `frontend_thuoctay/`:

```bash
REACT_APP_API_URL=http://localhost:3007/api
```

Hoặc nếu chạy trên server khác:

```bash
REACT_APP_API_URL=http://16.19.0.15:3007/api
```

### 4.5. Chạy Frontend

```bash
npm start
```

Frontend sẽ chạy trên port **3008** (mặc định).

Truy cập ứng dụng tại: `http://localhost:3008`

## Bước 5: Sử dụng ứng dụng

### 5.1. Khởi tạo dữ liệu mẫu

1. Mở trình duyệt và truy cập `http://localhost:3008`
2. Click nút **"Khởi tạo dữ liệu"** để tạo dữ liệu mẫu
3. Đợi thông báo thành công

### 5.2. Quản lý thuốc tây

**Thêm thuốc mới:**
- Click nút **"Thêm thuốc mới"**
- Điền đầy đủ thông tin:
  - Mã thuốc (duy nhất)
  - Tên thuốc
  - Hoạt chất
  - Nhà sản xuất
  - Ngày sản xuất
  - Hạn sử dụng
  - Đơn vị (Viên, Chai, Ống, Gói, Hộp)
  - Số lượng
  - Giá bán (VNĐ)
  - Loại thuốc
- Click **"Lưu"**

**Sửa thuốc:**
- Click nút **"Sửa"** trên dòng thuốc cần sửa
- Chỉnh sửa thông tin (trừ mã thuốc)
- Click **"Lưu"**

**Xóa thuốc:**
- Click nút **"Xóa"** trên dòng thuốc cần xóa
- Xác nhận xóa

**Cập nhật số lượng:**
- Click nút **"Cập nhật SL"** trên dòng thuốc
- Nhập số lượng mới

**Cập nhật giá bán:**
- Click nút **"Cập nhật giá"** trên dòng thuốc
- Nhập giá bán mới

**Lọc thuốc:**
- Chọn loại thuốc từ dropdown
- Chọn nhà sản xuất từ dropdown

### 5.3. Thống kê

Ứng dụng hiển thị các thống kê:
- Tổng số thuốc
- Tổng số lượng
- Tổng giá trị (VNĐ)
- Số thuốc hết hạn

**Lưu ý:** Thuốc hết hạn sẽ được đánh dấu màu đỏ trong bảng.

## Bước 6: API Endpoints

### Health Check
```
GET /health
```

### Khởi tạo dữ liệu
```
POST /api/init
```

### Lấy tất cả thuốc
```
GET /api/thuoctay
```

### Lấy thuốc theo mã
```
GET /api/thuoctay/:maThuoc
```

### Tạo thuốc mới
```
POST /api/thuoctay
Body: {
  maThuoc, tenThuoc, hoatchat, nhaSanXuat, 
  ngaySanXuat, hanSuDung, donVi, soLuong, 
  giaBan, loaiThuoc
}
```

### Cập nhật thuốc
```
PUT /api/thuoctay/:maThuoc
Body: {
  tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, 
  hanSuDung, donVi, soLuong, giaBan, loaiThuoc
}
```

### Xóa thuốc
```
DELETE /api/thuoctay/:maThuoc
```

### Tìm thuốc theo loại
```
GET /api/thuoctay/loai/:loaiThuoc
```

### Tìm thuốc theo nhà sản xuất
```
GET /api/thuoctay/nhasanxuat/:nhaSanXuat
```

### Cập nhật số lượng
```
PATCH /api/thuoctay/:maThuoc/soluong
Body: { soLuongMoi }
```

### Cập nhật giá bán
```
PATCH /api/thuoctay/:maThuoc/giaban
Body: { giaBanMoi }
```

## Bước 7: Xử lý lỗi thường gặp

### Lỗi: "User does not exist in wallet"

**Nguyên nhân:** Chưa đăng ký user

**Giải pháp:**
```bash
cd backend_thuoctay
npm run enrollAdmin
npm run registerUser
```

### Lỗi: "Cannot connect to Fabric network"

**Nguyên nhân:** Fabric network chưa chạy hoặc chaincode chưa được deploy

**Giải pháp:**
```bash
cd /fabric-samples/test-network
./network.sh up
./network.sh deployCC -ccn thuoctay -ccp ../chaincode/thuoctay/javascript -ccl javascript
```

### Lỗi: "Port already in use"

**Nguyên nhân:** Port đã được sử dụng bởi ứng dụng khác

**Giải pháp:**
- Thay đổi port trong `server.js` (backend) hoặc `package.json` (frontend)
- Hoặc dừng ứng dụng đang sử dụng port đó

### Lỗi: "CORS error" trong Frontend

**Nguyên nhân:** Backend không cho phép CORS từ frontend

**Giải pháp:** Đảm bảo `cors` đã được cài đặt và cấu hình trong `server.js`

## Bước 8: Tùy chỉnh

### Thay đổi Port Backend

Sửa trong `backend_thuoctay/server.js`:
```javascript
const PORT = process.env.PORT || 3007; // Thay đổi số port
```

### Thay đổi Port Frontend

Sửa trong `frontend_thuoctay/package.json`:
```json
"scripts": {
  "start": "PORT=3008 react-scripts start"
}
```

Hoặc tạo file `.env`:
```
PORT=3008
```

### Thay đổi Connection Profile Path

Sửa trong `backend_thuoctay/server.js` và các file khác:
```javascript
const ccpPath = path.resolve('/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
```

## Tài liệu tham khảo

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Contract API](https://hyperledger.github.io/fabric-chaincode-node/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)

## Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Logs của Backend Server
2. Logs của Frontend (Console trong trình duyệt)
3. Logs của Chaincode (trong Docker containers)
4. Đảm bảo tất cả services đang chạy

---

**Chúc bạn triển khai thành công! 🎉**

