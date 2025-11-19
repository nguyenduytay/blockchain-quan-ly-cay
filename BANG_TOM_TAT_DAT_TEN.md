# Bảng Tóm Tắt Đặt Tên Theo Tài Liệu Lab

## ✅ Đã Đúng

| Thành phần              | Tên hiện tại             | Trạng thái |
| ----------------------- | ------------------------ | ---------- |
| Chaincode file          | `qlcaytrong.js`          | ✅ Đúng    |
| Chaincode class         | `QLCayTrong`             | ✅ Đúng    |
| Chaincode name (deploy) | `qlcaytrong`             | ✅ Đúng    |
| Backend package.json    | `"qlcaytrong-backend"`   | ✅ Đúng    |
| Frontend package.json   | `"qlcaytrong-react-app"` | ✅ Đúng    |
| Chaincode package.json  | `"qlcaytrong-chaincode"` | ✅ Đúng    |

## ⚠️ Cần Đổi Tên

| Thành phần       | Tên hiện tại | Tên đúng theo tài liệu | Hành động       |
| ---------------- | ------------ | ---------------------- | --------------- |
| Thư mục backend  | `backend/`   | `qlcaytrong-backend/`  | Đổi tên thư mục |
| Thư mục frontend | `frontend/`  | `qlcaytrong-frontend/` | Đổi tên thư mục |

## 📍 Vị Trí Trên Server Linux

| Thành phần | Vị trí trên server                       | Lệnh deploy                                                                 |
| ---------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Chaincode  | `/fabric-samples/qlcaytrong/javascript/` | `./network.sh deployCC -ccn qlcaytrong -ccp ../qlcaytrong/ -ccl javascript` |
| Backend    | `~/qlcaytrong/qlcaytrong-backend/`       | `cd ~/qlcaytrong/qlcaytrong-backend && node server.js`                      |
| Frontend   | `~/qlcaytrong/qlcaytrong-frontend/`      | `cd ~/qlcaytrong/qlcaytrong-frontend && PORT=8006 npm start`                |

## 🔧 Cách Đổi Tên Thư Mục

### Trên Windows (PowerShell)

```powershell
# Chạy script
.\doi-ten-thu-muc.ps1

# Hoặc thủ công
Rename-Item -Path "backend" -NewName "qlcaytrong-backend"
Rename-Item -Path "frontend" -NewName "qlcaytrong-frontend"
```

### Trên Linux/Mac

```bash
# Đổi tên thư mục
mv backend qlcaytrong-backend
mv frontend qlcaytrong-frontend
```

## 📝 Tên Chaincode trong Code

Trong tất cả các file, đảm bảo sử dụng đúng tên:

- **Tên chaincode khi deploy:** `qlcaytrong` (không có dấu gạch ngang)
- **Tên contract trong code:** `QLCayTrong` (PascalCase)
- **Tên file chaincode:** `qlcaytrong.js` (camelCase)

### Kiểm tra trong các file:

1. **backend/server.js:**

   ```javascript
   const contract = network.getContract("qlcaytrong"); // ✅ Đúng
   ```

2. **chaincode/javascript/index.js:**

   ```javascript
   const QLCayTrong = require("./qlcaytrong"); // ✅ Đúng
   module.exports.contracts = [QLCayTrong]; // ✅ Đúng
   ```

3. **Lệnh deploy:**
   ```bash
   ./network.sh deployCC -ccn qlcaytrong -ccp ../qlcaytrong/ -ccl javascript
   #                                 ^^^^ Tên chaincode phải khớp
   ```

## 🎯 Checklist Triển Khai

- [ ] Đổi tên `backend/` → `qlcaytrong-backend/`
- [ ] Đổi tên `frontend/` → `qlcaytrong-frontend/`
- [ ] Copy chaincode vào `/fabric-samples/qlcaytrong/javascript/` trên server
- [ ] Kiểm tra tên chaincode trong `server.js` là `qlcaytrong`
- [ ] Kiểm tra tên contract trong `index.js` là `QLCayTrong`
- [ ] Deploy chaincode với tên `qlcaytrong`
- [ ] Test API endpoints
- [ ] Test frontend connection

## 📚 Tham Khảo

- Xem chi tiết trong: `HUONG_DAN_DAT_TEN.md`
- Hướng dẫn triển khai: `README.md`
- Script đổi tên: `doi-ten-thu-muc.ps1`
