/*
 * Backend API Server for QLCayTrong Blockchain
 * Express.js server to interact with Hyperledger Fabric chaincode
 */
'use strict';

const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

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
    res.json({ status: 'OK', message: 'QLCayTrong API Server is running', timestamp: new Date().toISOString() });
});

// Initialize ledger with sample data
app.post('/api/init', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('initLedger');
        await gateway.disconnect();

        res.json({ success: true, message: 'Đã khởi tạo dữ liệu mẫu thành công' });
    } catch (error) {
        console.error(`Error initializing ledger: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get all cay trong
app.get('/api/caytrong', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryAllCayTrong');
        await gateway.disconnect();

        const allCayTrong = JSON.parse(result.toString());
        res.json({ success: true, data: allCayTrong });
    } catch (error) {
        console.error(`Error querying all cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get cay trong by maCay
app.get('/api/caytrong/:maCay', async (req, res) => {
    try {
        const { maCay } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryCayTrong', maCay);
        await gateway.disconnect();

        const caytrong = JSON.parse(result.toString());
        res.json({ success: true, data: caytrong });
    } catch (error) {
        console.error(`Error querying cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Create new cay trong
app.post('/api/caytrong', async (req, res) => {
    try {
        const { maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri } = req.body;

        if (!maCay || !tenCay || !loaiCay || !ngayTrong || !giaiDoan || !nangSuat || !dienTich || !viTri) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('createCayTrong', maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat.toString(), dienTich.toString(), viTri);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã tạo cây trồng ${maCay} thành công` });
    } catch (error) {
        console.error(`Error creating cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update cay trong
app.put('/api/caytrong/:maCay', async (req, res) => {
    try {
        const { maCay } = req.params;
        const { tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri } = req.body;

        if (!tenCay || !loaiCay || !ngayTrong || !giaiDoan || !nangSuat || !dienTich || !viTri) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('updateCayTrong', maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat.toString(), dienTich.toString(), viTri);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật cây trồng ${maCay} thành công` });
    } catch (error) {
        console.error(`Error updating cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete cay trong
app.delete('/api/caytrong/:maCay', async (req, res) => {
    try {
        const { maCay } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('deleteCayTrong', maCay);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã xóa cây trồng ${maCay} thành công` });
    } catch (error) {
        console.error(`Error deleting cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query cay trong by loaiCay
app.get('/api/caytrong/loai/:loaiCay', async (req, res) => {
    try {
        const { loaiCay } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryCayTrongByLoai', loaiCay);
        await gateway.disconnect();

        const caytrongs = JSON.parse(result.toString());
        res.json({ success: true, data: caytrongs });
    } catch (error) {
        console.error(`Error querying cay trong by loai: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query cay trong by giaiDoan
app.get('/api/caytrong/giaidoan/:giaiDoan', async (req, res) => {
    try {
        const { giaiDoan } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryCayTrongByGiaiDoan', giaiDoan);
        await gateway.disconnect();

        const caytrongs = JSON.parse(result.toString());
        res.json({ success: true, data: caytrongs });
    } catch (error) {
        console.error(`Error querying cay trong by giai doan: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Change giai doan
app.patch('/api/caytrong/:maCay/chuyengiaidoan', async (req, res) => {
    try {
        const { maCay } = req.params;
        const { giaiDoanMoi } = req.body;

        if (!giaiDoanMoi) {
            return res.status(400).json({ error: 'Thiếu giaiDoanMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('changeGiaiDoanCayTrong', maCay, giaiDoanMoi);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã chuyển giai đoạn cây trồng ${maCay} thành công` });
    } catch (error) {
        console.error(`Error changing giai doan: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update nang suat
app.patch('/api/caytrong/:maCay/nangsuat', async (req, res) => {
    try {
        const { maCay } = req.params;
        const { nangSuatMoi } = req.body;

        if (!nangSuatMoi) {
            return res.status(400).json({ error: 'Thiếu nangSuatMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('updateNangSuat', maCay, nangSuatMoi.toString());
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật năng suất cây trồng ${maCay} thành công` });
    } catch (error) {
        console.error(`Error updating nang suat: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLCayTrong API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

