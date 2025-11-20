/*
 * Backend API Server for QLHoSoCanBo Blockchain
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
    res.json({ status: 'OK', message: 'QLHoSoCanBo API Server is running', timestamp: new Date().toISOString() });
});

// Initialize ledger with sample data
app.post('/api/init', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('initLedger');
        await gateway.disconnect();

        res.json({ success: true, message: 'Đã khởi tạo dữ liệu mẫu thành công' });
    } catch (error) {
        console.error(`Error initializing ledger: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get all ho so can bo
app.get('/api/hosocanbo', async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryAllHoSoCanBo');
        await gateway.disconnect();

        const allHoSoCanBo = JSON.parse(result.toString());
        res.json({ success: true, data: allHoSoCanBo });
    } catch (error) {
        console.error(`Error querying all ho so can bo: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get ho so can bo by maCanBo
app.get('/api/hosocanbo/:maCanBo', async (req, res) => {
    try {
        const { maCanBo } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryHoSoCanBo', maCanBo);
        await gateway.disconnect();

        const hosocanbo = JSON.parse(result.toString());
        res.json({ success: true, data: hosocanbo });
    } catch (error) {
        console.error(`Error querying ho so can bo: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Create new ho so can bo
app.post('/api/hosocanbo', async (req, res) => {
    try {
        const { maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi } = req.body;

        if (!maCanBo || !hoTen || !ngaySinh || !gioiTinh || !chucVu || !phongBan || !ngayVaoLam || !trinhDo || !luong || !diaChi) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('createHoSoCanBo', maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong.toString(), diaChi);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã tạo hồ sơ cán bộ ${maCanBo} thành công` });
    } catch (error) {
        console.error(`Error creating ho so can bo: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update ho so can bo
app.put('/api/hosocanbo/:maCanBo', async (req, res) => {
    try {
        const { maCanBo } = req.params;
        const { hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi } = req.body;

        if (!hoTen || !ngaySinh || !gioiTinh || !chucVu || !phongBan || !ngayVaoLam || !trinhDo || !luong || !diaChi) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('updateHoSoCanBo', maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong.toString(), diaChi);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật hồ sơ cán bộ ${maCanBo} thành công` });
    } catch (error) {
        console.error(`Error updating ho so can bo: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete ho so can bo
app.delete('/api/hosocanbo/:maCanBo', async (req, res) => {
    try {
        const { maCanBo } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('deleteHoSoCanBo', maCanBo);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã xóa hồ sơ cán bộ ${maCanBo} thành công` });
    } catch (error) {
        console.error(`Error deleting ho so can bo: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query ho so can bo by phongBan
app.get('/api/hosocanbo/phongban/:phongBan', async (req, res) => {
    try {
        const { phongBan } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryHoSoCanBoByPhongBan', phongBan);
        await gateway.disconnect();

        const hosocanbos = JSON.parse(result.toString());
        res.json({ success: true, data: hosocanbos });
    } catch (error) {
        console.error(`Error querying ho so can bo by phong ban: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Query ho so can bo by chucVu
app.get('/api/hosocanbo/chucvu/:chucVu', async (req, res) => {
    try {
        const { chucVu } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryHoSoCanBoByChucVu', chucVu);
        await gateway.disconnect();

        const hosocanbos = JSON.parse(result.toString());
        res.json({ success: true, data: hosocanbos });
    } catch (error) {
        console.error(`Error querying ho so can bo by chuc vu: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Change chuc vu
app.patch('/api/hosocanbo/:maCanBo/thaydoichucvu', async (req, res) => {
    try {
        const { maCanBo } = req.params;
        const { chucVuMoi } = req.body;

        if (!chucVuMoi) {
            return res.status(400).json({ error: 'Thiếu chucVuMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('changeChucVu', maCanBo, chucVuMoi);
        await gateway.disconnect();

        res.json({ success: true, message: `Đã thay đổi chức vụ cán bộ ${maCanBo} thành công` });
    } catch (error) {
        console.error(`Error changing chuc vu: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update luong
app.patch('/api/hosocanbo/:maCanBo/luong', async (req, res) => {
    try {
        const { maCanBo } = req.params;
        const { luongMoi } = req.body;

        if (!luongMoi) {
            return res.status(400).json({ error: 'Thiếu luongMoi' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('updateLuong', maCanBo, luongMoi.toString());
        await gateway.disconnect();

        res.json({ success: true, message: `Đã cập nhật lương cán bộ ${maCanBo} thành công` });
    } catch (error) {
        console.error(`Error updating luong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLHoSoCanBo API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

