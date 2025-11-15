# Hướng Dẫn Triển Khai Hệ Thống Quản Lý Cây Trồng Blockchain

## Tổng quan

Dự án xây dựng hệ thống quản lý cây trồng trên Hyperledger Fabric với 3 thành phần chính:
1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ
2. **Backend API Server** - Cung cấp REST API
3. **Frontend Web App** - Giao diện người dùng React

## Bước 1: Chuẩn bị môi trường

### Yêu cầu hệ thống
- Hyperledger Fabric đã được cài đặt
- Node.js >= 14.x
- npm hoặc yarn
- Docker và Docker Compose

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

```bash
cd /fabric-samples/chaincode/
mkdir -p qlcaytrong/javascript
cd qlcaytrong/javascript
```

### 2.2. Copy các file chaincode

Copy các file từ thư mục `chaincode/javascript/` của dự án:
- `qlcaytrong.js`
- `index.js`
- `package.json`

### 2.3. Cài đặt dependencies

```bash
npm install
```

Kiểm tra cài đặt:
```bash
npm list fabric-contract-api fabric-shim
```

## Bước 3: Deploy Chaincode lên Fabric Network

### 3.1. Khởi động Fabric Network

```bash
cd /fabric-samples/test-network

# Dừng network nếu đang chạy
./network.sh down

# Khởi động network với CA
./network.sh up -ca

# Tạo channel
./network.sh createChannel
```

### 3.2. Deploy chaincode (Cách tự động - Khuyến nghị)

```bash
# Deploy chaincode qlcaytrong
./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/ -ccl javascript
```

### 3.3. Kiểm tra deployment

```bash
# Kiểm tra các container đang chạy
docker ps

# Kết quả phải có:
# - ca_org1.example.com
# - ca_org2.example.com
# - peer0.org1.example.com
# - peer0.org2.example.com
# - orderer.example.com
# - dev-peer0.org1.example.com-qlcaytrong-*
# - dev-peer0.org2.example.com-qlcaytrong-*
```

## Bước 4: Thiết lập Backend API Server

### 4.1. Tạo thư mục backend

```bash
cd ~
mkdir -p qlcaytrong-backend
cd qlcaytrong-backend
```

### 4.2. Copy các file backend

Copy các file từ thư mục `backend/`:
- `server.js`
- `package.json`
- `enrollAdmin.js`
- `registerUser.js`

### 4.3. Cài đặt dependencies

```bash
npm install
```

### 4.4. Đăng ký Admin

```bash
node enrollAdmin.js
```

Kết quả mong đợi:
```
Wallet path: /home/user/qlcaytrong-backend/wallet
Successfully enrolled admin user "admin" and imported it into the wallet
```

### 4.5. Đăng ký User

**QUAN TRỌNG**: Sửa file `registerUser.js`, thay đổi `USER_NAME` thành mã sinh viên của bạn:

```javascript
const USER_NAME = "sv102102666"; // Thay bằng mã sinh viên của bạn
```

Sau đó chạy:
```bash
node registerUser.js
```

Kết quả mong đợi:
```
Successfully registered and enrolled user "sv102102666"
```

### 4.6. Cấu hình USER_NAME trong server.js (nếu cần)

Nếu muốn sử dụng biến môi trường:
```bash
export USER_NAME=sv102102666
node server.js
```

Hoặc sửa trực tiếp trong `server.js`:
```javascript
const userName = process.env.USER_NAME || 'sv102102666'; // Thay bằng mã của bạn
```

### 4.7. Khởi động Backend Server

```bash
node server.js
```

Server sẽ chạy trên port 3006. Kiểm tra:
```bash
curl http://localhost:3006/health
```

## Bước 5: Thiết lập Frontend React App

### 5.1. Tạo thư mục frontend

```bash
cd ~
mkdir -p qlcaytrong-frontend
cd qlcaytrong-frontend
```

### 5.2. Copy các file frontend

Copy toàn bộ thư mục `frontend/` bao gồm:
- `package.json`
- `public/index.html`
- `src/App.js`
- `src/App.css`
- `src/index.js`
- `src/components/CayTrongTable.js`
- `src/services/api.js`

### 5.3. Cài đặt dependencies

```bash
npm install
```

### 5.4. Cấu hình API URL (nếu cần)

Nếu API server chạy trên địa chỉ khác, tạo file `.env`:
```bash
echo "REACT_APP_API_URL=http://localhost:3006/api" > .env
```

### 5.5. Khởi động Frontend App

```bash
PORT=8006 npm start
```

App sẽ mở tự động trên trình duyệt tại `http://localhost:8006`

## Bước 6: Kiểm tra và Test

### 6.1. Test Backend API với curl

```bash
# Health check
curl http://localhost:3006/health

# Khởi tạo dữ liệu
curl -X POST http://localhost:3006/api/init

# Lấy tất cả cây trồng
curl http://localhost:3006/api/caytrong

# Lấy cây trồng theo mã
curl http://localhost:3006/api/caytrong/CT001

# Tạo cây trồng mới
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

### 6.2. Test Frontend

1. Mở trình duyệt: `http://localhost:8006`
2. Click "Khởi tạo dữ liệu" để tạo dữ liệu mẫu
3. Thử các chức năng:
   - Xem danh sách cây trồng
   - Thêm cây trồng mới
   - Sửa thông tin
   - Xóa cây trồng
   - Lọc theo loại/giai đoạn
   - Chuyển giai đoạn
   - Cập nhật năng suất

## Bước 7: Sử dụng lệnh peer (Tùy chọn)

### 7.1. Thiết lập biến môi trường

```bash
cd /fabric-samples/test-network

export HOME_TESTNETWORK=/fabric-samples/test-network
export PATH=$HOME_TESTNETWORK/../bin:$PATH
export FABRIC_CFG_PATH=$HOME_TESTNETWORK/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=$HOME_TESTNETWORK/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=$HOME_TESTNETWORK/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
```

### 7.2. Các lệnh peer phổ biến

```bash
# Khởi tạo dữ liệu
peer chaincode invoke -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile $HOME_TESTNETWORK/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
  -C mychannel -n qlcaytrong \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $HOME_TESTNETWORK/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $HOME_TESTNETWORK/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"initLedger","Args":[]}'

# Truy vấn tất cả cây trồng
peer chaincode query -C mychannel -n qlcaytrong \
  -c '{"function":"queryAllCayTrong","Args":[]}'

# Truy vấn cây trồng theo mã
peer chaincode query -C mychannel -n qlcaytrong \
  -c '{"function":"queryCayTrong","Args":["CT001"]}'
```

## Xử lý lỗi thường gặp

### Lỗi: "User does not exist in wallet"
- **Nguyên nhân**: Chưa đăng ký user
- **Giải pháp**: Chạy `node registerUser.js`

### Lỗi: "Cannot connect to peer"
- **Nguyên nhân**: Fabric network chưa khởi động
- **Giải pháp**: Kiểm tra `docker ps` và khởi động lại network

### Lỗi: "Chaincode not found"
- **Nguyên nhân**: Chaincode chưa được deploy
- **Giải pháp**: Deploy lại chaincode bằng `./network.sh deployCC`

### Lỗi: "CORS error" trong frontend
- **Nguyên nhân**: Backend không cho phép CORS
- **Giải pháp**: Kiểm tra `cors()` middleware trong `server.js`

### Lỗi: "Connection refused" trong frontend
- **Nguyên nhân**: Backend server chưa chạy hoặc sai port
- **Giải pháp**: Kiểm tra backend đang chạy trên port 3006

## Cấu trúc dữ liệu Cây Trồng

```javascript
{
  docType: 'caytrong',
  maCay: 'CT001',                    // Mã cây (unique)
  tenCay: 'Cà phê Arabica',          // Tên cây
  loaiCay: 'Cây công nghiệp',        // Loại cây
  ngayTrong: '2020-01-15',           // Ngày trồng (YYYY-MM-DD)
  giaiDoan: 'Trưởng thành',         // Giai đoạn: Mới trồng, Đang phát triển, Trưởng thành, Thu hoạch
  nangSuat: 2.5,                     // Năng suất (tấn/ha)
  dienTich: 1000,                    // Diện tích (ha)
  viTri: 'Đắk Lắk'                  // Vị trí
}
```

## Tổng kết

Sau khi hoàn thành các bước trên, bạn sẽ có:
- ✅ Chaincode đã được deploy lên Fabric network
- ✅ Backend API server chạy trên port 3006
- ✅ Frontend React app chạy trên port 8006
- ✅ Hệ thống quản lý cây trồng hoàn chỉnh trên blockchain

Chúc bạn thành công! 🌳

