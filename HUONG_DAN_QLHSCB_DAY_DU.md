# Hướng Dẫn Triển Khai QLHSCB (Quản Lý Hồ Sơ Cán Bộ) - Đầy Đủ Tính Năng

## Tổng quan

Dự án xây dựng hệ thống quản lý hồ sơ cán bộ trên Hyperledger Fabric với 3 thành phần chính:

1. **Chaincode** (Smart Contract) - Quản lý logic nghiệp vụ
2. **Backend API Server** - Cung cấp REST API
3. **Frontend Web App** - Giao diện người dùng React

## Quy ước : 
### URL_BACK_END = http://localhost:3007 hoặc = http://192.168.80.10:3007
### URL_FRONT_END = http://localhost:3001 hoặc http://192.168.80.10:3001

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
ssh hyperledger@192.168.80.10
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
mkdir -p qlhscb/javascript
cd qlhscb/javascript
```

**Hoặc nếu chaincode đã có trong dự án:**

```bash
cd ~/qlcay/chaincode_qlhscb/javascript
```

### 2.2. Copy các file chaincode

Copy các file từ thư mục `chaincode_qlhscb/javascript/` của dự án:

- `qlhscb.js`
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

**Nếu vẫn cài phiên bản 2.5.x trên Node.js 16:**

```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json

# Cài lại với phiên bản cố định
npm install fabric-contract-api@2.2.15 fabric-shim@2.2.15 --save-exact
```

## Bước 3: Deploy Chaincode lên Fabric Network

### 3.1. Khởi động Fabric Network

```bash
cd /fabric-samples/test-network
sudo systemctl restart docker

# Dừng network nếu đang chạy
./network.sh down

# Khởi động network với CA
./network.sh up createChannel -ca

# Tạo channel
./network.sh createChannel
```

### 3.2. Deploy chaincode (Cách tự động - Khuyến nghị)

**chaincode đặt tại `/fabric-samples/chaincode/qlhscb/`:**

```bash
# Deploy chaincode qlhscb
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
```

**Hoặc nếu chaincode đặt tại `~/qlcay/chaincode_qlhscb/`:**

```bash
./network.sh deployCC -ccn qlhscb -ccp ~/qlcay/chaincode_qlhscb/javascript -ccl javascript
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
# - dev-peer0.org1.example.com-qlhscb-*
# - dev-peer0.org2.example.com-qlhscb-*
```

## Bước 4: Thiết lập Backend API Server

### 4.1. Tạo thư mục backend

```bash
cd ~
mkdir -p qlhscb/backend_qlhscb
cd qlhscb/backend_qlhscb
```

**Hoặc nếu backend đã có trong dự án:**

```bash
cd ~/qlcay/backend_qlhscb
```

### 4.2. Copy các file backend

Copy các file từ thư mục `backend_qlhscb/` của dự án:

- `server.js`
- `package.json`
- `enrollAdmin.js`
- `registerUser.js`

### 4.3. Cài đặt dependencies

```bash
npm install
```

### 4.4. Cấu hình environment variables (Tùy chọn)

Tạo file `.env`:

```bash
cat > .env << EOF
PORT=3007
USER_NAME=appUser
CCP_PATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
JWT_SECRET=qlhscb-secret-key-2024
DISCOVERY_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://192.168.80.10:3001
ENABLE_SCHEDULED_REPORTS=true
EOF
```

### 4.5. Đăng ký Admin

```bash
node enrollAdmin.js
```

Kết quả mong đợi:

```
Wallet path: /home/user/qlhscb/backend_qlhscb/wallet
Successfully enrolled admin user "admin" and imported it into the wallet
```

### 4.6. Đăng ký User

**QUAN TRỌNG**: Sửa file `registerUser.js`, thay đổi `USER_NAME` thành mã sinh viên của bạn:

```javascript
const USER_NAME = "appUser"; // có thể chọn mssv
```

Sau đó chạy:

```bash
node registerUser.js
```

Kết quả mong đợi:

```
Successfully registered and enrolled user "appUser"
```

### 4.7. Cấu hình USER_NAME trong server.js (nếu cần)

Nếu muốn sử dụng biến môi trường:

```bash
export USER_NAME=appUser
node server.js
```

Hoặc sửa trực tiếp trong `server.js`:

```javascript
const userName = process.env.USER_NAME || "appUser"; 
```

### 4.8. Khởi động Backend Server

```bash
node server.js
```

Server sẽ chạy trên port 3007. Kiểm tra:

```bash
curl http://localhost:3007/health
# hoặc
curl http://192.168.80.10:3007/health
```

## Bước 5: Thiết lập Frontend React App

### 5.1. Tạo thư mục frontend

```bash
cd ~
mkdir -p qlhscb/frontend_qlhscb
cd qlhscb/frontend_qlhscb
```

**Hoặc nếu frontend đã có trong dự án:**

```bash
cd ~/qlcay/frontend_qlhscb
```

### 5.2. Copy các file frontend

Copy toàn bộ thư mục `frontend_qlhscb/` của dự án bao gồm:

- `package.json`
- `public/index.html`
- `src/App.js`
- `src/App.css`
- `src/index.js`
- `src/components/` (tất cả components)
- `src/services/api.js`

### 5.3. Cài đặt dependencies

```bash
npm install
```

### 5.4. Cấu hình API URL

**Nếu API server chạy trên địa chỉ khác hoặc truy cập từ xa:**
Tạo file `.env`:

```bash
# Nếu truy cập từ máy khác đến VMHyper
echo "REACT_APP_API_URL=http://192.168.80.10:3007/api" > .env
```

**Hoặc nếu chạy local:**

```bash
echo "REACT_APP_API_URL=http://localhost:3007/api" > .env
```

### 5.5. Khởi động Frontend App

```bash
PORT=3001 npm start
```

App sẽ mở tự động trên trình duyệt tại `http://localhost:3001` hoặc `http://192.168.80.10:3001`

## Bước 6: Kiểm tra và Test

### 6.1. Test Backend API với curl

```bash
# Health check
curl http://localhost:3007/health

# Khởi tạo dữ liệu
curl -X POST http://localhost:3007/api/init

# Lấy tất cả hồ sơ cán bộ
curl http://localhost:3007/api/hosocanbo

# Lấy hồ sơ cán bộ theo mã
curl http://localhost:3007/api/hosocanbo/CB001

# Đăng ký user mới
curl -X POST http://localhost:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "phone": "0123456789",
    "role": "admin"
  }'

# Đăng nhập
curl -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Tạo hồ sơ cán bộ mới (cần token)
curl -X POST http://localhost:3007/api/hosocanbo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "maCanBo": "CB006",
    "hoTen": "Nguyễn Văn A",
    "ngaySinh": "1990-01-15",
    "gioiTinh": "Nam",
    "chucVu": "Trưởng phòng",
    "phongBan": "Phòng Nhân sự",
    "ngayVaoLam": "2020-01-15",
    "trinhDo": "Đại học",
    "luong": 15000000,
    "diaChi": "123 Đường ABC, Quận 1, TP.HCM"
  }'
```

### 6.2. Test Frontend

1. Mở trình duyệt: `http://localhost:3001` hoặc `http://192.168.80.10:3001`
2. Đăng ký tài khoản mới hoặc đăng nhập
3. Click "Khởi tạo dữ liệu" để tạo dữ liệu mẫu
4. Thử các chức năng:
   - Xem danh sách hồ sơ cán bộ
   - Thêm hồ sơ cán bộ mới
   - Sửa thông tin
   - Xóa hồ sơ
   - Tìm kiếm và lọc
   - Export Excel/PDF
   - Import từ Excel/CSV
   - Xem Dashboard
   - Xem báo cáo

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
  -C mychannel -n qlhscb \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles $HOME_TESTNETWORK/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles $HOME_TESTNETWORK/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
  -c '{"function":"initLedger","Args":[]}'

# Truy vấn tất cả hồ sơ cán bộ
peer chaincode query -C mychannel -n qlhscb \
  -c '{"function":"queryAllHoSoCanBo","Args":[]}'

# Truy vấn hồ sơ cán bộ theo mã
peer chaincode query -C mychannel -n qlhscb \
  -c '{"function":"queryHoSoCanBo","Args":["CB001"]}'
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
- **Giải pháp**: Deploy lại chaincode bằng `./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript`

### Lỗi: "CORS error" trong frontend

- **Nguyên nhân**: Backend không cho phép CORS
- **Giải pháp**: Kiểm tra `cors()` middleware trong `server.js`

### Lỗi: "Connection refused" trong frontend

- **Nguyên nhân**: Backend server chưa chạy hoặc sai port
- **Giải pháp**: Kiểm tra backend đang chạy trên port 3007

### Lỗi: "Peer endorsements do not match"

- **Nguyên nhân**: Network không đồng bộ
- **Giải pháp**: 
```bash
cd /fabric-samples/test-network
./network.sh down
./network.sh up createChannel -ca
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
```

### Lỗi: "Access denied"

- **Nguyên nhân**: User chưa được enroll hoặc wallet bị lỗi
- **Giải pháp**: 
```bash
cd backend_qlhscb
node enrollAdmin.js
node registerUser.js
```

## Cấu trúc dữ liệu Hồ Sơ Cán Bộ

```javascript
{
  docType: 'hosocanbo',
  maCanBo: 'CB001',                    // Mã cán bộ (unique)
  hoTen: 'Nguyễn Văn A',              // Họ tên
  ngaySinh: '1990-01-15',              // Ngày sinh (YYYY-MM-DD)
  gioiTinh: 'Nam',                     // Giới tính: Nam, Nữ
  chucVu: 'Trưởng phòng',             // Chức vụ
  phongBan: 'Phòng Nhân sự',          // Phòng ban
  ngayVaoLam: '2020-01-15',            // Ngày vào làm (YYYY-MM-DD)
  trinhDo: 'Đại học',                  // Trình độ: Trung cấp, Cao đẳng, Đại học, Thạc sĩ, Tiến sĩ
  luong: 15000000,                     // Lương (VND)
  diaChi: '123 Đường ABC, Quận 1'     // Địa chỉ
}
```

## Tổng kết

Sau khi hoàn thành các bước trên, bạn sẽ có:

- ✅ Chaincode đã được deploy lên Fabric network
- ✅ Backend API server chạy trên port 3007
- ✅ Frontend React app chạy trên port 3001
- ✅ Hệ thống quản lý hồ sơ cán bộ hoàn chỉnh trên blockchain

## Cấu trúc thư mục cuối cùng trên VMHyper

```
/fabric-samples/
├── chaincode/
│   └── qlhscb/
│       └── javascript/
│           ├── qlhscb.js
│           ├── index.js
│           └── package.json

~/qlhscb/
├── backend_qlhscb/            # Backend API Server
│   ├── server.js
│   ├── enrollAdmin.js
│   ├── registerUser.js
│   ├── package.json
│   ├── .env
│   └── wallet/
└── frontend_qlhscb/            # Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.js
    │   │   ├── ForgotPassword.js
    │   │   ├── ResetPassword.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Navigation.js
    │   │   ├── HoSoCanBoTable.js
    │   │   ├── UserManagement.js
    │   │   ├── ReportPage.js
    │   │   └── AccountPage.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env
```

## Lưu ý quan trọng

1. **Vị trí chaincode:** Có thể đặt tại `/fabric-samples/chaincode/qlhscb/` hoặc `~/qlcay/chaincode_qlhscb/`
2. **Lệnh deploy:** Phải khớp với vị trí chaincode:
   - Nếu tại `/fabric-samples/chaincode/qlhscb/`: `-ccp ../chaincode/qlhscb/javascript`
   - Nếu tại `~/qlcay/chaincode_qlhscb/`: `-ccp ~/qlcay/chaincode_qlhscb/javascript`
3. **Backend và Frontend:** Nên đặt trong thư mục `~/qlhscb/` hoặc `~/qlcay/` để dễ quản lý
4. **Tên chaincode:** Luôn là `qlhscb` (không có dấu gạch ngang) khi deploy
5. **Port:** Backend chạy trên port 3007, Frontend chạy trên port 3001
6. **Theme:** Xanh dương/Tím (#667eea, #764ba2) - Khác với QLCayTrong (xanh lá)

## So Sánh 3 Hệ Thống

| Hệ thống | Theme | Port Backend | Port Frontend | Chaincode Name | Icon |
|----------|-------|--------------|---------------|----------------|------|
| QLCayTrong | Xanh lá | 3006 | 3000 | qlcaytrong | 🌳 |
| QLHSCB | Xanh dương/Tím | 3007 | 3001 | qlhscb | 👔 |
| QLThuocTay | Cam/Đỏ | 3008 | 3002 | thuoctay | 💊 |

Chúc bạn thành công! 👔
