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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3008;
const JWT_SECRET = process.env.JWT_SECRET || 'thuoctay-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// Connection profile path
const ccpPath = process.env.CCP_PATH || path.resolve('/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');

// Load connection profile with error handling
let ccp;
try {
    if (!fs.existsSync(ccpPath)) {
        console.error(`❌ Connection profile not found at: ${ccpPath}`);
        process.exit(1);
    }
    ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    console.log(`✅ Loaded connection profile from: ${ccpPath}`);
} catch (error) {
    console.error('❌ Error loading connection profile:', error.message);
    process.exit(1);
}

// Wallet path
const walletPath = path.join(process.cwd(), 'wallet');

// Helper function to get gateway
async function getGateway(userName) {
    console.log(`[DEBUG] getGateway called with userName: ${userName}`);
    
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`[DEBUG] Wallet path: ${walletPath}`);
    
    const userExists = await wallet.get(userName);
    if (!userExists) {
        console.error(`[DEBUG] User ${userName} does not exist in wallet`);
        throw new Error(`User ${userName} does not exist in wallet. Please register first.`);
    }
    console.log(`[DEBUG] User ${userName} found in wallet`);

    // Log connection profile info
    console.log(`[DEBUG] Connection Profile Info:`);
    console.log(`  - Organizations: ${Object.keys(ccp.organizations || {}).join(', ')}`);
    console.log(`  - Peers: ${Object.keys(ccp.peers || {}).join(', ')}`);
    if (ccp.peers) {
        Object.keys(ccp.peers).forEach(peerName => {
            const peer = ccp.peers[peerName];
            console.log(`    - ${peerName}: ${peer.url || 'N/A'}`);
        });
    }
    console.log(`  - Orderers: ${Object.keys(ccp.orderers || {}).join(', ')}`);
    console.log(`  - Channels: ${Object.keys(ccp.channels || {}).join(', ')}`);

    const gateway = new Gateway();
    
    // Thử với discovery enabled trước (để tự động tìm tất cả peers)
    // Nếu fail thì fallback về discovery disabled
    let discoveryEnabled = true;
    let lastError = null;
    
    try {
        console.log(`[DEBUG] Attempting to connect gateway with discovery enabled (timeout 10s)...`);
        await gateway.connect(ccp, {
            wallet,
            identity: userName,
            discovery: { 
                enabled: true, 
                asLocalhost: true,
                timeout: 10000 // 10 giây timeout
            }
        });
        console.log(`[DEBUG] Gateway connected successfully with discovery enabled`);
        return gateway;
    } catch (error) {
        lastError = error;
        console.log(`[DEBUG] Discovery connection failed: ${error.message}`);
        console.log(`[DEBUG] Retrying with discovery disabled...`);
        
        // Đóng gateway cũ
        try {
            await gateway.disconnect();
        } catch (e) {
            // Ignore
        }
        
        // Tạo gateway mới và thử với discovery disabled
        const gateway2 = new Gateway();
        try {
            await gateway2.connect(ccp, {
                wallet,
                identity: userName,
                discovery: { 
                    enabled: false, 
                    asLocalhost: true
                }
            });
            console.log(`[DEBUG] Gateway connected successfully with discovery disabled`);
            return gateway2;
        } catch (error2) {
            console.error(`[DEBUG] Gateway connection failed with discovery disabled:`);
            console.error(`  Error: ${error2.message}`);
            console.error(`  Stack: ${error2.stack}`);
            
            // Log chi tiết về peers
            if (ccp.peers) {
                console.error(`[DEBUG] Available peers in connection profile:`);
                Object.keys(ccp.peers).forEach(peerName => {
                    const peer = ccp.peers[peerName];
                    console.error(`  - ${peerName}: ${peer.url || 'N/A'}`);
                });
            }
            
            // Gợi ý sửa lỗi
            throw new Error(`Không thể kết nối với Fabric network.\n` +
                `Lỗi discovery: ${lastError.message}\n` +
                `Lỗi không discovery: ${error2.message}\n\n` +
                `Vui lòng kiểm tra:\n` +
                `1. Network có đang chạy: docker ps | grep peer (phải thấy peer0.org1 và peer0.org2)\n` +
                `2. Chaincode đã deploy: docker ps | grep thuoctay (phải thấy 2 containers)\n` +
                `3. Wallet có user: ls -la wallet/ (phải thấy admin/ và appUser/)\n` +
                `4. Connection profile chỉ có 1 peer, nhưng network có 2 peers. Có thể cần bật discovery.`);
        }
    }
}

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

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Chưa đăng nhập' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }
        next();
    };
};

// Guest access (optional authentication)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};

// Email configuration
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Multer configuration for file upload
const upload = multer({ dest: 'uploads/' });

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
app.post('/api/thuoctay', authenticateToken, async (req, res) => {
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
app.put('/api/thuoctay/:maThuoc', authenticateToken, async (req, res) => {
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
app.delete('/api/thuoctay/:maThuoc', authenticateToken, async (req, res) => {
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
app.patch('/api/thuoctay/:maThuoc/giaban', authenticateToken, async (req, res) => {
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
        console.error(`Error updating gia ban: ${error.message || 'Update failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ SEARCH & FILTER ENDPOINTS ============

// Search thuoc tay (full-text)
app.get('/api/thuoctay/search', optionalAuth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('searchThuocTay', q);
        await gateway.disconnect();

        const thuoctays = JSON.parse(result.toString());
        res.json({ success: true, data: thuoctays });
    } catch (error) {
        console.error(`Error searching thuoc tay: ${error.message || 'Search failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Filter thuoc tay (multiple criteria)
app.get('/api/thuoctay/filter', optionalAuth, async (req, res) => {
    try {
        const { loaiThuoc, nhaSanXuat, donVi } = req.query;

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('filterThuocTay', 
            loaiThuoc || '', 
            nhaSanXuat || '', 
            donVi || ''
        );
        await gateway.disconnect();

        const thuoctays = JSON.parse(result.toString());
        res.json({ success: true, data: thuoctays });
    } catch (error) {
        console.error(`Error filtering thuoc tay: ${error.message || 'Filter failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register new user
app.post('/api/auth/register', async (req, res) => {
    let gateway;
    try {
        const { username, password, fullName, email, phone, role } = req.body;

        if (!username || !password || !fullName || !email) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const hashedPassword = await bcrypt.hash(password, 10);
        await contract.submitTransaction('createUser', username, hashedPassword, fullName, email, phone || '', role || 'user');
        
        if (gateway) {
            await gateway.disconnect();
        }
        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        console.error(`[REGISTER] Error:`, error.message || 'Registration failed');
        if (gateway) {
            try {
                await gateway.disconnect();
            } catch (disconnectError) {
                console.error(`[REGISTER] Error disconnecting:`, disconnectError.message);
            }
        }
        let errorMessage = error.message || 'Đăng ký thất bại';
        if (errorMessage.includes('da ton tai')) {
            errorMessage = `Tên đăng nhập "${req.body.username}" đã tồn tại.`;
        }
        res.status(500).json({ error: errorMessage });
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
        const contract = network.getContract('thuoctay');

        let user;
        try {
            const result = await contract.evaluateTransaction('getUser', username);
            user = JSON.parse(result.toString());
        } catch (error) {
            await gateway.disconnect();
            if (error.message && error.message.includes('khong ton tai')) {
                return res.status(401).json({
                    error: `Tên đăng nhập "${username}" không tồn tại.`
                });
            }
            throw error;
        }
        await gateway.disconnect();

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Sai mật khẩu' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
        }

        const token = jwt.sign(
            { 
                username: user.username, 
                role: user.role,
                fullName: user.fullName 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        delete user.password;
        res.json({ 
            success: true, 
            token,
            user: {
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(`Error logging in: ${error.message || 'Login failed'}`);
        res.status(401).json({ error: error.message });
    }
});

// Get current user info
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('getUser', req.user.username);
        const user = JSON.parse(result.toString());
        await gateway.disconnect();

        delete user.password;
        res.json({ success: true, user });
    } catch (error) {
        console.error(`Error getting user info: ${error.message || 'Query failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!email && !phone) {
            return res.status(400).json({ error: 'Thiếu email hoặc số điện thoại' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const allUsers = JSON.parse(await contract.evaluateTransaction('getAllUsers'));
        const user = allUsers.find(u => 
            (email && u.Record.email === email) || 
            (phone && u.Record.phone === phone)
        );
        
        if (!user) {
            await gateway.disconnect();
            return res.status(404).json({ error: 'Email hoặc số điện thoại không tồn tại' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString();

        await contract.submitTransaction('createResetToken', user.Record.username, resetToken, expiresAt);
        await gateway.disconnect();

        // Send email/SMS (if configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS && email) {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3002'}/reset-password?token=${resetToken}`;
            await emailTransporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Đặt lại mật khẩu - QLThuocTay',
                html: `
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng click vào link sau:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>Link này sẽ hết hạn sau 1 giờ.</p>
                `
            });
        }

        res.json({ 
            success: true, 
            message: 'Email/SMS đặt lại mật khẩu đã được gửi',
            token: resetToken
        });
    } catch (error) {
        console.error(`Error in forgot password: ${error.message || 'Forgot password failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Reset password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu mới' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const tokenData = JSON.parse(await contract.evaluateTransaction('getResetToken', token));
        
        if (new Date(tokenData.expiresAt) < new Date()) {
            await gateway.disconnect();
            return res.status(400).json({ error: 'Token đã hết hạn' });
        }
        if (tokenData.used) {
            await gateway.disconnect();
            return res.status(400).json({ error: 'Token đã được sử dụng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await contract.submitTransaction('updateUserPassword', tokenData.username, hashedPassword);
        await contract.submitTransaction('markResetTokenUsed', token);
        await gateway.disconnect();

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error(`Error resetting password: ${error.message || 'Reset password failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const userResult = await contract.evaluateTransaction('getUser', req.user.username);
        const user = JSON.parse(userResult.toString());
        
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            await gateway.disconnect();
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await contract.submitTransaction('updateUserPassword', req.user.username, hashedPassword);
        await gateway.disconnect();

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error(`Error changing password: ${error.message || 'Change password failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Verify email
app.post('/api/auth/verify-email', authenticateToken, async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Thiếu token' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('verifyEmail', req.user.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Email đã được xác thực' });
    } catch (error) {
        console.error(`Error verifying email: ${error.message || 'Email verification failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Verify phone
app.post('/api/auth/verify-phone', authenticateToken, async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({ error: 'Thiếu OTP' });
        }

        // In production, verify OTP from SMS service
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('verifyPhone', req.user.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Số điện thoại đã được xác thực' });
    } catch (error) {
        console.error(`Error verifying phone: ${error.message || 'Phone verification failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ USER MANAGEMENT ENDPOINTS ============

// Get all users
app.get('/api/users', authenticateToken, authorize('admin', 'manager'), async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('getAllUsers');
        const users = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: users });
    } catch (error) {
        console.error(`Error getting users: ${error.message || 'Query failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Get user by username
app.get('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('getUser', req.params.username);
        const user = JSON.parse(result.toString());
        await gateway.disconnect();

        delete user.password;
        res.json({ success: true, data: user });
    } catch (error) {
        console.error(`Error getting user: ${error.message || 'Query failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Update user
app.put('/api/users/:username', authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền cập nhật' });
        }

        const { fullName, email, phone, role } = req.body;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const updateRole = (req.user.role === 'admin' && role) ? role : undefined;

        await contract.submitTransaction('updateUser', req.params.username, 
            fullName || '', email || '', phone || '', updateRole || '');
        await gateway.disconnect();

        res.json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        console.error(`Error updating user: ${error.message || 'Update failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete user
app.delete('/api/users/:username', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        await contract.submitTransaction('deleteUser', req.params.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Xóa user thành công' });
    } catch (error) {
        console.error(`Error deleting user: ${error.message || 'Deletion failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ IMPORT/EXPORT ENDPOINTS ============

// Export to Excel
app.get('/api/thuoctay/export/excel', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryAllThuocTay');
        const allThuocTay = JSON.parse(result.toString());
        await gateway.disconnect();

        const thuoctays = allThuocTay.filter(item => item.Record.docType === 'thuoctay');
        const data = thuoctays.map(item => ({
            'Mã thuốc': item.Record.maThuoc,
            'Tên thuốc': item.Record.tenThuoc,
            'Hoạt chất': item.Record.hoatchat,
            'Nhà sản xuất': item.Record.nhaSanXuat,
            'Ngày sản xuất': item.Record.ngaySanXuat,
            'Hạn sử dụng': item.Record.hanSuDung,
            'Đơn vị': item.Record.donVi,
            'Số lượng': item.Record.soLuong,
            'Giá bán (VND)': item.Record.giaBan,
            'Loại thuốc': item.Record.loaiThuoc
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Thuốc Tây');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=thuoc-tay-${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    } catch (error) {
        console.error(`Error exporting to Excel: ${error.message || 'Export failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Export to PDF
app.get('/api/thuoctay/export/pdf', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryAllThuocTay');
        const allThuocTay = JSON.parse(result.toString());
        await gateway.disconnect();

        const thuoctays = allThuocTay.filter(item => item.Record.docType === 'thuoctay');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=thuoc-tay-${new Date().toISOString().split('T')[0]}.pdf`);
        
        doc.pipe(res);
        doc.fontSize(20).text('Báo Cáo Thuốc Tây', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        thuoctays.forEach((item, index) => {
            const record = item.Record;
            doc.fontSize(14).text(`${index + 1}. ${record.tenThuoc} (${record.maThuoc})`, { underline: true });
            doc.fontSize(10);
            doc.text(`   Hoạt chất: ${record.hoatchat}`);
            doc.text(`   Nhà sản xuất: ${record.nhaSanXuat}`);
            doc.text(`   Hạn sử dụng: ${record.hanSuDung}`);
            doc.text(`   Số lượng: ${record.soLuong} ${record.donVi}`);
            doc.text(`   Giá bán: ${record.giaBan.toLocaleString('vi-VN')} VND`);
            doc.text(`   Loại: ${record.loaiThuoc}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error(`Error exporting to PDF: ${error.message || 'Export failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Import from Excel/CSV
app.post('/api/thuoctay/import', authenticateToken, authorize('admin', 'manager'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Không có file được upload' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const results = { success: [], errors: [] };

        for (const row of data) {
            try {
                await contract.submitTransaction(
                    'createThuocTay',
                    row['Mã thuốc'] || row.maThuoc,
                    row['Tên thuốc'] || row.tenThuoc,
                    row['Hoạt chất'] || row.hoatchat,
                    row['Nhà sản xuất'] || row.nhaSanXuat,
                    row['Ngày sản xuất'] || row.ngaySanXuat,
                    row['Hạn sử dụng'] || row.hanSuDung,
                    row['Đơn vị'] || row.donVi,
                    (row['Số lượng'] || row.soLuong || 0).toString(),
                    (row['Giá bán (VND)'] || row.giaBan || 0).toString(),
                    row['Loại thuốc'] || row.loaiThuoc
                );
                results.success.push(row['Mã thuốc'] || row.maThuoc);
            } catch (error) {
                results.errors.push({
                    row: row['Mã thuốc'] || row.maThuoc,
                    error: error.message
                });
            }
        }

        await gateway.disconnect();
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Import thành công ${results.success.length} bản ghi, ${results.errors.length} lỗi`,
            results
        });
    } catch (error) {
        console.error(`Error importing: ${error.message || 'Import failed'}`);
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
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryAllThuocTay');
        const allThuocTay = JSON.parse(result.toString());
        await gateway.disconnect();

        const thuoctays = allThuocTay.filter(item => item.Record.docType === 'thuoctay');

        const stats = {
            totalThuocTay: thuoctays.length,
            totalSoLuong: thuoctays.reduce((sum, item) => sum + parseInt(item.Record.soLuong || 0), 0),
            totalGiaTri: thuoctays.reduce((sum, item) => sum + (parseInt(item.Record.soLuong || 0) * parseFloat(item.Record.giaBan || 0)), 0),
            byLoaiThuoc: {},
            byNhaSanXuat: {},
            byDonVi: {}
        };

        thuoctays.forEach(item => {
            const loai = item.Record.loaiThuoc;
            if (!stats.byLoaiThuoc[loai]) {
                stats.byLoaiThuoc[loai] = { count: 0, soLuong: 0 };
            }
            stats.byLoaiThuoc[loai].count++;
            stats.byLoaiThuoc[loai].soLuong += parseInt(item.Record.soLuong || 0);
        });

        thuoctays.forEach(item => {
            const nhaSanXuat = item.Record.nhaSanXuat;
            if (!stats.byNhaSanXuat[nhaSanXuat]) {
                stats.byNhaSanXuat[nhaSanXuat] = 0;
            }
            stats.byNhaSanXuat[nhaSanXuat]++;
        });

        thuoctays.forEach(item => {
            const donVi = item.Record.donVi;
            if (!stats.byDonVi[donVi]) {
                stats.byDonVi[donVi] = 0;
            }
            stats.byDonVi[donVi]++;
        });

        res.json({ 
            success: true, 
            report: {
                generatedAt: new Date().toISOString(),
                generatedBy: req.user.username,
                statistics: stats,
                data: thuoctays
            }
        });
    } catch (error) {
        console.error(`Error generating report: ${error.message || 'Report generation failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Save report
app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
        const reportId = `RPT_${Date.now()}_${req.user.username}`;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('queryAllThuocTay');
        const allThuocTay = JSON.parse(result.toString());
        const thuoctays = allThuocTay.filter(item => item.Record.docType === 'thuoctay');

        const stats = {
            totalThuocTay: thuoctays.length,
            totalSoLuong: thuoctays.reduce((sum, item) => sum + parseInt(item.Record.soLuong || 0), 0),
            totalGiaTri: thuoctays.reduce((sum, item) => sum + (parseInt(item.Record.soLuong || 0) * parseFloat(item.Record.giaBan || 0)), 0),
            byLoaiThuoc: {},
            byNhaSanXuat: {},
            byDonVi: {}
        };

        thuoctays.forEach(item => {
            const loai = item.Record.loaiThuoc;
            if (!stats.byLoaiThuoc[loai]) {
                stats.byLoaiThuoc[loai] = { count: 0, soLuong: 0 };
            }
            stats.byLoaiThuoc[loai].count++;
            stats.byLoaiThuoc[loai].soLuong += parseInt(item.Record.soLuong || 0);
        });

        thuoctays.forEach(item => {
            const nhaSanXuat = item.Record.nhaSanXuat;
            if (!stats.byNhaSanXuat[nhaSanXuat]) {
                stats.byNhaSanXuat[nhaSanXuat] = 0;
            }
            stats.byNhaSanXuat[nhaSanXuat]++;
        });

        thuoctays.forEach(item => {
            const donVi = item.Record.donVi;
            if (!stats.byDonVi[donVi]) {
                stats.byDonVi[donVi] = 0;
            }
            stats.byDonVi[donVi]++;
        });

        const reportData = {
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.username,
            statistics: stats,
            data: thuoctays
        };

        await contract.submitTransaction('saveReport', reportId, JSON.stringify(reportData));
        await gateway.disconnect();

        res.json({ success: true, reportId, report: reportData });
    } catch (error) {
        console.error(`Error saving report: ${error.message || 'Save report failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Get report history
app.get('/api/reports/history', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('getAllReports');
        const reports = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error(`Error getting report history: ${error.message || 'Get report history failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Get specific report
app.get('/api/reports/:reportId', authenticateToken, async (req, res) => {
    try {
        const { reportId } = req.params;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('thuoctay');

        const result = await contract.evaluateTransaction('getReport', reportId);
        const report = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: report });
    } catch (error) {
        console.error(`Error getting report: ${error.message || 'Get report failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Scheduled report generation
if (process.env.ENABLE_SCHEDULED_REPORTS === 'true') {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Generating daily report for QLThuocTay...');
        } catch (error) {
            console.error('Error generating scheduled report:', error);
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLThuocTay API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

