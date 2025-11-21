/*
 * Backend API Server for QLThuocTay Blockchain
 * Express.js server to interact with Hyperledger Fabric chaincode
 */
'use strict';

const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware
app.use(cors());
app.use(express.json());

// Connection profile path
const ccpPath = path.resolve('/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

// Wallet path
const walletPath = path.join(process.cwd(), 'wallet');

// Helper function to get gateway
async function getGateway(userName) {
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const userExists = await wallet.get(userName);
    if (!userExists) {
        throw new Error(`User ${userName} does not exist in wallet. Please register first.`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: userName,
        discovery: { enabled: true, asLocalhost: true }
    });

    return gateway;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'QLThuocTay API Server is running', timestamp: new Date().toISOString() });
});

// Initialize ledger with sample data
app.post('/api/init', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('initLedger');
        await gateway.disconnect();

        res.json({ success: true, message: 'Đã khởi tạo dữ liệu mẫu thành công' });
    } catch (error) {
        console.error(`Error initializing ledger: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get all thuoc tay
app.get('/api/thuoctay', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryAllThuocTay');
        await gateway.disconnect();

        const allThuocTay = JSON.parse(result.toString());
        res.json({ success: true, data: allThuocTay });
    } catch (error) {
        console.error(`Error querying all thuoc tay: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get thuoc tay by maThuoc
app.get('/api/thuoctay/:maThuoc', async (req, res) => {
    try {
        const { maThuoc } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryThuocTay', maThuoc);
        await gateway.disconnect();

        const thuoctay = JSON.parse(result.toString());
        res.json({ success: true, data: thuoctay });
    } catch (error) {
        console.error(`Error querying thuoc tay: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Create new thuoc tay
app.post('/api/thuoctay', async (req, res) => {
    try {
        const { maThuoc, tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong, giaBan, loaiThuoc } = req.body;

        if (!maThuoc || !tenThuoc || !hoatchat || !nhaSanXuat || !ngaySanXuat || !hanSuDung || !donVi || !soLuong || !giaBan || !loaiThuoc) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('createThuocTay', maThuoc, tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong.toString(), giaBan.toString(), loaiThuoc);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã tạo thuốc tây ${maThuoc} thành công` });
    } catch (error) {
        console.error(`Error creating thuoc tay: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update thuoc tay
app.put('/api/thuoctay/:maThuoc', async (req, res) => {
    try {
        const { maThuoc } = req.params;
        const { tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong, giaBan, loaiThuoc } = req.body;

        if (!tenThuoc || !hoatchat || !nhaSanXuat || !ngaySanXuat || !hanSuDung || !donVi || !soLuong || !giaBan || !loaiThuoc) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('updateThuocTay', maThuoc, tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong.toString(), giaBan.toString(), loaiThuoc);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật thuốc tây ${maThuoc} thành công` });
    } catch (error) {
        console.error(`Error updating thuoc tay: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete thuoc tay
app.delete('/api/thuoctay/:maThuoc', async (req, res) => {
    try {
        const { maThuoc } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('deleteThuocTay', maThuoc);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã xóa thuốc tây ${maThuoc} thành công` });
    } catch (error) {
        console.error(`Error deleting thuoc tay: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query thuoc tay by loaiThuoc
app.get('/api/thuoctay/loai/:loaiThuoc', async (req, res) => {
    try {
        const { loaiThuoc } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryThuocTayByLoai', loaiThuoc);
        await gateway.disconnect();

        const thuoctays = JSON.parse(result.toString());
        res.json({ success: true, data: thuoctays });
    } catch (error) {
        console.error(`Error querying thuoc tay by loai: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query thuoc tay by nhaSanXuat
app.get('/api/thuoctay/nhasanxuat/:nhaSanXuat', async (req, res) => {
    try {
        const { nhaSanXuat } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryThuocTayByNhaSanXuat', nhaSanXuat);
        await gateway.disconnect();

        const thuoctays = JSON.parse(result.toString());
        res.json({ success: true, data: thuoctays });
    } catch (error) {
        console.error(`Error querying thuoc tay by nha san xuat: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update so luong
app.patch('/api/thuoctay/:maThuoc/soluong', async (req, res) => {
    try {
        const { maThuoc } = req.params;
        const { soLuongMoi } = req.body;

        if (!soLuongMoi) {
            return res.status(400).json({ error: 'Thiếu soLuongMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('updateSoLuong', maThuoc, soLuongMoi.toString());
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật số lượng thuốc tây ${maThuoc} thành công` });
    } catch (error) {
        console.error(`Error updating so luong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update gia ban
app.patch('/api/thuoctay/:maThuoc/giaban', async (req, res) => {
    try {
        const { maThuoc } = req.params;
        const { giaBanMoi } = req.body;

        if (!giaBanMoi) {
            return res.status(400).json({ error: 'Thiếu giaBanMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('updateGiaBan', maThuoc, giaBanMoi.toString());
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật giá bán thuốc tây ${maThuoc} thành công` });
    } catch (error) {
        console.error(`Error updating gia ban: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLThuocTay API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

