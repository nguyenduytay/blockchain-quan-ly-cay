# Hướng Dẫn Sửa Lỗi Đăng Ký QLHSCB - "No valid responses from any peers"

## 🔍 Nguyên Nhân Lỗi

Lỗi **"No valid responses from any peers"** xảy ra khi:
1. Chaincode chưa được deploy hoặc deploy sai
2. Hyperledger Fabric network chưa chạy
3. Gateway không kết nối được với peer
4. Chaincode có lỗi khi thực thi

---

## ✅ Bước 1: Kiểm Tra Network Đang Chạy

```bash
# Kiểm tra các container đang chạy
docker ps

# Phải thấy các container sau:
# - peer0.org1.example.com
# - peer0.org2.example.com
# - orderer.example.com
# - ca_org1
# - ca_org2
# - dev-peer0.org1.example.com-qlhscb-1.0-xxx
# - dev-peer0.org2.example.com-qlhscb-1.0-xxx
```

**Nếu không thấy container chaincode → Chaincode chưa được deploy**

---

## ✅ Bước 2: Kiểm Tra Chaincode Đã Deploy

### Cách 1: Kiểm tra bằng Docker containers (Đơn giản nhất)

```bash
# Kiểm tra container chaincode đang chạy
docker ps | grep qlhscb

# Phải thấy 2 containers:
# - dev-peer0.org1.example.com-qlhscb-1.0-xxx
# - dev-peer0.org2.example.com-qlhscb-1.0-xxx
```

**Nếu không thấy → Chaincode chưa được deploy**

### Cách 2: Kiểm tra bằng peer command trong container cli

**Bước 1: Vào container cli**

```bash
docker exec -it cli bash
```

**Bước 2: Kiểm tra đường dẫn MSP trong container**

```bash
# Kiểm tra các đường dẫn có thể
ls -la /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ 2>/dev/null
ls -la /etc/hyperledger/fabric/peer/crypto/ 2>/dev/null
ls -la /fabric-samples/test-network/organizations/ 2>/dev/null

# Hoặc tìm kiếm file MSP
find / -name "msp" -type d 2>/dev/null | grep org1
```

**Bước 3: Thiết lập biến môi trường cho Org1 (Đường dẫn đúng)**

```bash
# Đường dẫn đúng trong container cli (đã kiểm tra)
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
```

**Lưu ý:** Đường dẫn đúng là `/opt/gopath/.../peer/organizations/...` (KHÔNG phải `/opt/gopath/.../peer/crypto/...`)

**Kiểm tra đường dẫn có đúng không:**

```bash
# Kiểm tra MSP path
ls $CORE_PEER_MSPCONFIGPATH

# Phải thấy các file:
# - admincerts/
# - cacerts/
# - keystore/
# - signcerts/
```

**Bước 4: Kiểm tra chaincode (sau khi thiết lập đúng)**

```bash
# Kiểm tra biến môi trường
echo "MSPID: $CORE_PEER_LOCALMSPID"
echo "ADDRESS: $CORE_PEER_ADDRESS"
echo "MSP PATH: $CORE_PEER_MSPCONFIGPATH"

# Kiểm tra chaincode
peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

**Hoặc nếu muốn kiểm tra cho Org2:**

```bash
# Thiết lập cho peer0.org2
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051

# Kiểm tra chaincode
peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

**Bước 5: Thoát khỏi container**

```bash
exit
```

### ⚠️ Lưu Ý: Nếu Container CLI Không Có Đường Dẫn MSP

Nếu container cli không mount đúng volume, bạn có thể:

**Cách 1: Sử dụng đường dẫn từ host (nếu được mount)**

```bash
# Kiểm tra xem có mount /fabric-samples không
ls /fabric-samples/test-network/organizations/

# Nếu có, dùng đường dẫn này
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
```

**Cách 2: Sử dụng peer container trực tiếp (Khuyến nghị)**

Thay vì dùng container cli, dùng trực tiếp peer container:

```bash
# Thoát khỏi cli
exit

# Kiểm tra chaincode trực tiếp từ peer container
docker exec peer0.org1.example.com peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

**Cách 3: Kiểm tra bằng docker ps (Đơn giản nhất)**

```bash
# Thoát khỏi cli
exit

# Kiểm tra chaincode container đang chạy
docker ps | grep qlhscb

# Nếu thấy 2 containers chaincode → Chaincode đã được deploy
```

### Cách 3: Kiểm tra bằng peer command trên host (Nếu container cli không hoạt động)

```bash
cd /fabric-samples/test-network

# Thiết lập biến môi trường
export PATH=$PATH:/fabric-samples/bin
export FABRIC_CFG_PATH=/fabric-samples/config
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Kiểm tra chaincode
peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

**Phải thấy:**
```
Committed chaincode definition for chaincode 'qlhscb' on channel 'mychannel'
```

### Cách 4: Kiểm tra bằng Docker exec vào peer container

```bash
# Kiểm tra trong peer container
docker exec peer0.org1.example.com peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

### Cách 5: Kiểm tra log của chaincode container

```bash
# Xem log của chaincode container
docker logs $(docker ps -q -f "name=dev-peer0.org1.example.com-qlhscb") --tail 50
```

**Nếu thấy log chaincode đang chạy → Chaincode đã được deploy**

---

## ✅ Bước 3: Khởi Động Lại Network (Nếu Cần)

```bash
cd /fabric-samples/test-network

# Dừng network
./network.sh down

# Khởi động lại
sudo systemctl restart docker

# Khởi động network với CA
./network.sh up createChannel -ca

# Tạo channel (nếu chưa có)
./network.sh createChannel
```

---

## ✅ Bước 4: Deploy Lại Chaincode QLHSCB

### Kiểm tra vị trí chaincode trước

```bash
# Kiểm tra chaincode ở đâu
ls -la /fabric-samples/chaincode/qlhscb/javascript/
# hoặc
ls -la ~/qlhscb/chaincode_qlhscb/javascript/
# hoặc
ls -la /fabric-samples/qlhscb/javascript/
```

### Deploy chaincode

```bash
cd /fabric-samples/test-network

# Nếu chaincode tại /fabric-samples/chaincode/qlhscb/javascript/
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript

# Nếu chaincode tại /fabric-samples/qlhscb/javascript/
./network.sh deployCC -ccn qlhscb -ccp ../qlhscb/javascript -ccl javascript

# Nếu chaincode tại ~/qlhscb/chaincode_qlhscb/javascript/
./network.sh deployCC -ccn qlhscb -ccp ~/qlhscb/chaincode_qlhscb/javascript -ccl javascript

# Phải thấy:
# Chaincode qlhscb installed on peer0.org1.example.com
# Chaincode qlhscb installed on peer0.org2.example.com
# Chaincode qlhscb committed to channel mychannel
```

**Sau khi deploy, kiểm tra lại:**
```bash
docker ps | grep qlhscb
# Phải thấy 2 containers chaincode đang chạy
```

---

## ✅ Bước 5: Kiểm Tra Wallet Backend

```bash
cd ~/qlhscb/backend_qlhscb
# hoặc
cd ~/backend_qlhscb

# Kiểm tra wallet có user chưa
ls -la wallet/

# Phải thấy:
# - admin/
# - appUser/
```

**Nếu không có → Cần enroll lại:**

```bash
# Enroll admin
node enrollAdmin.js

# Register và enroll app user
node registerUser.js
```

---

## ✅ Bước 6: Kiểm Tra Connection Profile

```bash
# Kiểm tra file connection profile tồn tại
ls -la /fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json

# Nếu không có, tạo lại hoặc kiểm tra đường dẫn trong server.js
```

---

## ✅ Bước 7: Khởi Động Lại Backend

```bash
cd ~/qlhscb/backend_qlhscb
# hoặc
cd ~/backend_qlhscb

# Dừng server cũ (nếu đang chạy)
# Nhấn Ctrl+C hoặc:
pkill -f "node server.js"

# Khởi động lại
node server.js
```

**Phải thấy:**
```
✅ Loaded connection profile from: /fabric-samples/test-network/...
🚀 QLHoSoCanBo API Server đang chạy trên port 3007
📡 Health check: http://localhost:3007/health
🌐 API Base URL: http://localhost:3007/api
```

---

## ✅ Bước 8: Test Đăng Ký Với curl

### 8.1. Test Health Check

```bash
curl http://localhost:3007/health
# hoặc
curl http://192.168.80.10:3007/health
```

**Phải trả về:**
```json
{"status":"OK","message":"QLHoSoCanBo API Server is running","timestamp":"..."}
```

### 8.2. Test Khởi Tạo Dữ Liệu

```bash
curl -X POST http://localhost:3007/api/init
```

**Phải trả về:**
```json
{"success":true,"message":"Đã khởi tạo dữ liệu mẫu thành công"}
```

### 8.3. Test Đăng Ký User (Câu Lệnh Chuẩn)

```bash
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
```

**Hoặc nếu chạy trên server khác:**

```bash
curl -X POST http://192.168.80.10:3007/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "fullName": "Administrator",
    "email": "admin@example.com",
    "phone": "0123456789",
    "role": "admin"
  }'
```

**Nếu thành công sẽ thấy:**
```json
{"success":true,"message":"Đăng ký thành công"}
```

**Nếu lỗi → Xem log backend để biết chi tiết**

---

## ✅ Bước 9: Kiểm Tra Log Backend

Nếu vẫn lỗi, kiểm tra log backend:

```bash
# Xem log real-time
tail -f ~/qlhscb/backend_qlhscb/server.log
# hoặc nếu chạy với output
# Xem terminal đang chạy node server.js
```

**Các lỗi thường gặp:**

1. **"User appUser does not exist in wallet"**
   ```bash
   cd ~/backend_qlhscb
   node enrollAdmin.js
   node registerUser.js
   ```

2. **"DiscoveryService: mychannel error: access denied"**
   - Đã được fix bằng cách tắt discovery trong code
   - Nếu vẫn lỗi, kiểm tra lại file `server.js` dòng 111-142

3. **"Chaincode qlhscb not found"**
   ```bash
   cd /fabric-samples/test-network
   ./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
   ```

4. **"Connection refused"**
   - Kiểm tra network có đang chạy: `docker ps`
   - Kiểm tra connection profile path trong `server.js`

---

## ✅ Bước 10: Test Đăng Nhập Sau Khi Đăng Ký

```bash
curl -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Phải trả về:**
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

---

## 🔧 Thiết Lập Biến Môi Trường Trong Container CLI

### Script Thiết Lập Nhanh Cho Org1

Tạo file `setup_cli_org1.sh`:

```bash
#!/bin/bash
# Script thiết lập biến môi trường cho Org1 trong container cli

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=peer0.org1.example.com:7051

echo "✅ Đã thiết lập biến môi trường cho Org1"
echo "CORE_PEER_LOCALMSPID: $CORE_PEER_LOCALMSPID"
echo "CORE_PEER_ADDRESS: $CORE_PEER_ADDRESS"
```

**Cách sử dụng:**

```bash
# Vào container cli
docker exec -it cli bash

# Chạy script (copy nội dung script vào terminal)
# Hoặc tạo file trong container và source
source setup_cli_org1.sh

# Bây giờ có thể chạy các lệnh peer
peer lifecycle chaincode querycommitted -C mychannel --name qlhscb
```

### Script Thiết Lập Nhanh Cho Org2

```bash
#!/bin/bash
# Script thiết lập biến môi trường cho Org2 trong container cli

export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=peer0.org2.example.com:9051

echo "✅ Đã thiết lập biến môi trường cho Org2"
echo "CORE_PEER_LOCALMSPID: $CORE_PEER_LOCALMSPID"
echo "CORE_PEER_ADDRESS: $CORE_PEER_ADDRESS"
```

### Các Lệnh Peer Thường Dùng Sau Khi Thiết Lập

```bash
# 1. Kiểm tra chaincode đã commit
peer lifecycle chaincode querycommitted -C mychannel --name qlhscb

# 2. Kiểm tra tất cả chaincode đã commit
peer lifecycle chaincode querycommitted -C mychannel

# 3. Query chaincode (nếu chaincode có hàm query)
peer chaincode query -C mychannel -n qlhscb -c '{"function":"queryAllHoSoCanBo","Args":[]}'

# 4. Kiểm tra channel
peer channel list

# 5. Kiểm tra thông tin channel
peer channel getinfo -c mychannel
```

### Lưu Ý Quan Trọng

1. **Đường dẫn trong container cli khác với host:**
   - Trong cli: `/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/...`
   - Trên host: `/fabric-samples/test-network/organizations/...`

2. **Phải thiết lập lại biến môi trường mỗi lần vào container mới:**
   - Các biến môi trường không được lưu giữ giữa các lần vào container

3. **Kiểm tra biến môi trường:**
   ```bash
   echo $CORE_PEER_LOCALMSPID
   echo $CORE_PEER_ADDRESS
   ```

4. **Nếu gặp lỗi "cannot init crypto":**
   - Kiểm tra đường dẫn MSP có đúng không
   - Kiểm tra container cli có mount đúng volume không
   - Thử vào container và kiểm tra: `ls $CORE_PEER_MSPCONFIGPATH`

---

## 🔧 Script Tự Động Kiểm Tra

Tạo file `check_qlhscb.sh`:

```bash
#!/bin/bash

echo "=== Kiểm tra Network ==="
docker ps | grep -E "peer|orderer|ca|qlhscb"

echo ""
echo "=== Kiểm tra Chaincode ==="
docker ps | grep qlhscb || echo "Chaincode chưa được deploy (không thấy container)"

echo ""
echo "=== Kiểm tra Wallet ==="
ls -la ~/backend_qlhscb/wallet/ 2>/dev/null || ls -la ~/qlhscb/backend_qlhscb/wallet/ 2>/dev/null || echo "Wallet không tồn tại"

echo ""
echo "=== Kiểm tra Backend ==="
curl -s http://localhost:3007/health || echo "Backend không chạy"
```

Chạy:
```bash
chmod +x check_qlhscb.sh
./check_qlhscb.sh
```

---

## 📝 Tóm Tắt Các Câu Lệnh Chuẩn

### 1. Deploy Chaincode
```bash
cd /fabric-samples/test-network
./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript
```

### 2. Enroll Admin và User
```bash
cd ~/backend_qlhscb
node enrollAdmin.js
node registerUser.js
```

### 3. Khởi Động Backend
```bash
cd ~/backend_qlhscb
node server.js
```

### 4. Đăng Ký User
```bash
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
```

### 5. Đăng Nhập
```bash
curl -X POST http://localhost:3007/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Thứ tự thực hiện:**
   - Network phải chạy trước
   - Chaincode phải được deploy
   - Wallet phải có admin và appUser
   - Backend mới chạy

2. **Kiểm tra đường dẫn:**
   - Connection profile: `/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`
   - Chaincode: `/fabric-samples/chaincode/qlhscb/javascript/`
   - Wallet: `~/backend_qlhscb/wallet/` hoặc `~/qlhscb/backend_qlhscb/wallet/`

3. **Nếu vẫn lỗi:**
   - Xem log backend chi tiết
   - Kiểm tra `docker logs` của peer containers
   - Kiểm tra chaincode có lỗi syntax không

---

**Chúc bạn sửa lỗi thành công! 🎯**

