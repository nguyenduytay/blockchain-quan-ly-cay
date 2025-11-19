# Hướng Dẫn Đặt Tên Theo Tài Liệu Lab

## Cấu Trúc Thư Mục Đúng Theo Tài Liệu

Theo tài liệu lab, cấu trúc thư mục đúng cho dự án **qlcaytrong** (quản lý cây trồng) như sau:

### 1. Chaincode (Đã đúng ✅)

```
/fabric-samples/qlcaytrong/
├── javascript/
│   ├── qlcaytrong.js          # File chaincode chính
│   ├── index.js               # File export module
│   └── package.json           # Dependencies configuration
```

**Vị trí hiện tại:** `chaincode/javascript/qlcaytrong.js` ✅

**Khi deploy lên server:** Copy vào `/fabric-samples/qlcaytrong/javascript/`

### 2. Backend API Server (Cần đổi tên ⚠️)

```
qlcaytrong-backend/
├── server.js
├── enrollAdmin.js
├── registerUser.js
├── package.json
└── wallet/
```

**Vị trí hiện tại:** `backend/` ❌

**Cần đổi thành:** `qlcaytrong-backend/` ✅

### 3. Frontend React App (Cần đổi tên ⚠️)

```
qlcaytrong-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── CayTrongTable.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── App.css
│   └── index.js
└── package.json
```

**Vị trí hiện tại:** `frontend/` ❌

**Cần đổi thành:** `qlcaytrong-frontend/` ✅

## Các Lệnh Deploy Theo Tài Liệu

### Deploy Chaincode

```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlcaytrong -ccp ../qlcaytrong/ -ccl javascript
```

### Chạy Backend

```bash
cd ~/qlcaytrong/qlcaytrong-backend
npm install
node enrollAdmin.js
node registerUser.js
node server.js
```

### Chạy Frontend

```bash
cd ~/qlcaytrong/qlcaytrong-frontend
npm install
PORT=8006 npm start
```

## Tên Chaincode trong Code

Trong các file backend và frontend, đảm bảo sử dụng đúng tên chaincode:

- **Tên chaincode:** `qlcaytrong` (không có dấu gạch ngang)
- **Tên contract:** `QLCayTrong` (trong chaincode)
- **Channel:** `mychannel`

## Kiểm Tra Đặt Tên

### File chaincode

- ✅ `qlcaytrong.js` - Đúng
- ✅ `index.js` - Đúng
- ✅ `package.json` với name: `"qlcaytrong-chaincode"` - Đúng

### File backend

- ✅ `server.js` - Đúng
- ✅ `enrollAdmin.js` - Đúng
- ✅ `registerUser.js` - Đúng
- ✅ `package.json` với name: `"qlcaytrong-backend"` - Đúng
- ⚠️ Thư mục: `backend/` → Cần đổi thành `qlcaytrong-backend/`

### File frontend

- ✅ `package.json` với name: `"qlcaytrong-react-app"` - Đúng
- ⚠️ Thư mục: `frontend/` → Cần đổi thành `qlcaytrong-frontend/`

## Lưu Ý

1. **Tên chaincode** trong lệnh deploy phải khớp với tên trong code
2. **Tên thư mục backend/frontend** nên theo chuẩn `qlcaytrong-backend` và `qlcaytrong-frontend` để dễ quản lý
3. **Port mặc định:**
   - Backend API: `3006`
   - Frontend React: `8006` (hoặc `3000`)
