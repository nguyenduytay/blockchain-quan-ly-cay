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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3006;
const JWT_SECRET = process.env.JWT_SECRET || 'qlcaytrong-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token không được cung cấp' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token không hợp lệ' });
        }
        req.user = user;
        next();
    });
};

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
app.patch('/api/caytrong/:maCay/nangsuat', authenticateToken, async (req, res) => {
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

// ============ AUTHENTICATION ENDPOINTS ============

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullName, email, role } = req.body;

        if (!username || !password || !fullName || !email) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        await contract.submitTransaction('createUser', username, hashedPassword, fullName, email, role || 'user');
        await gateway.disconnect();

        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        console.error(`Error registering user: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Thiếu username hoặc password' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Get user from blockchain
        const result = await contract.evaluateTransaction('getUser', username);
        const user = JSON.parse(result.toString());
        await gateway.disconnect();

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Sai mật khẩu' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                username: user.username, 
                role: user.role,
                fullName: user.fullName 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        delete user.password;

        res.json({ 
            success: true, 
            token,
            user: {
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(`Error logging in: ${error}`);
        res.status(401).json({ error: error.message });
    }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('getUser', req.user.username);
        const user = JSON.parse(result.toString());
        await gateway.disconnect();

        delete user.password;
        res.json({ success: true, user });
    } catch (error) {
        console.error(`Error getting user info: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ USER MANAGEMENT ENDPOINTS ============

// Get all users
app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        // Only admin can access
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('getAllUsers');
        const users = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: users });
    } catch (error) {
        console.error(`Error getting users: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get user by username
app.get('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        // User can only see their own info unless admin
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('getUser', req.params.username);
        const user = JSON.parse(result.toString());
        await gateway.disconnect();

        delete user.password;
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(`Error getting user: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Update user
app.put('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        // User can only update their own info unless admin
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền cập nhật' });
        }

        const { fullName, email, role } = req.body;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Only admin can change role
        const updateRole = (req.user.role === 'admin' && role) ? role : undefined;

        await contract.submitTransaction('updateUser', req.params.username, fullName || '', email || '', updateRole || '');
        await gateway.disconnect();

        res.json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        console.error(`Error updating user: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete user
app.delete('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        // Only admin can delete users
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Chỉ admin mới có quyền xóa user' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        await contract.submitTransaction('deleteUser', req.params.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Xóa user thành công' });
    } catch (error) {
        console.error(`Error deleting user: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ REPORT ENDPOINTS ============

// Generate report
app.get('/api/reports', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Get all cay trong
        const result = await contract.evaluateTransaction('queryAllCayTrong');
        const allCayTrong = JSON.parse(result.toString());
        await gateway.disconnect();

        // Calculate statistics
        const stats = {
            totalCayTrong: allCayTrong.length,
            totalDienTich: allCayTrong.reduce((sum, item) => {
                return sum + parseFloat(item.Record.dienTich || 0);
            }, 0),
            avgNangSuat: allCayTrong.length > 0 
                ? allCayTrong.reduce((sum, item) => {
                    return sum + parseFloat(item.Record.nangSuat || 0);
                }, 0) / allCayTrong.length 
                : 0,
            byLoaiCay: {},
            byGiaiDoan: {},
            byViTri: {}
        };

        // Group by loai cay
        allCayTrong.forEach(item => {
            const loai = item.Record.loaiCay;
            if (!stats.byLoaiCay[loai]) {
                stats.byLoaiCay[loai] = { count: 0, dienTich: 0 };
            }
            stats.byLoaiCay[loai].count++;
            stats.byLoaiCay[loai].dienTich += parseFloat(item.Record.dienTich || 0);
        });

        // Group by giai doan
        allCayTrong.forEach(item => {
            const giaiDoan = item.Record.giaiDoan;
            if (!stats.byGiaiDoan[giaiDoan]) {
                stats.byGiaiDoan[giaiDoan] = 0;
            }
            stats.byGiaiDoan[giaiDoan]++;
        });

        // Group by vi tri
        allCayTrong.forEach(item => {
            const viTri = item.Record.viTri;
            if (!stats.byViTri[viTri]) {
                stats.byViTri[viTri] = 0;
            }
            stats.byViTri[viTri]++;
        });

        res.json({ 
            success: true, 
            report: {
                generatedAt: new Date().toISOString(),
                generatedBy: req.user.username,
                statistics: stats,
                data: allCayTrong
            }
        });
    } catch (error) {
        console.error(`Error generating report: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLCayTrong API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

