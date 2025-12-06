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
const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');

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

// Email configuration (cần cấu hình trong .env)
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

// Connection profile path
const ccpPath = process.env.CCP_PATH || path.resolve('/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');

// Load connection profile with error handling
let ccp;
try {
    if (!fs.existsSync(ccpPath)) {
        console.error(`❌ Connection profile not found at: ${ccpPath}`);
        console.error('Please check if Hyperledger Fabric network is set up correctly.');
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
                `2. Chaincode đã deploy: docker ps | grep qlcaytrong (phải thấy 2 containers)\n` +
                `3. Wallet có user: ls -la wallet/ (phải thấy admin/ và appUser/)\n` +
                `4. Connection profile chỉ có 1 peer, nhưng network có 2 peers. Có thể cần bật discovery.`);
        }
    }
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
    let gateway;
    try {
        const { username, password, fullName, email, phone, role } = req.body;

        console.log(`[DEBUG] [REGISTER] Received registration request:`);
        console.log(`  Username: ${username}`);
        console.log(`  FullName: ${fullName}`);
        console.log(`  Email: ${email}`);
        console.log(`  Phone: ${phone || ''}`);
        console.log(`  Role: ${role || 'user'}`);

        if (!username || !password || !fullName || !email) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        console.log(`[DEBUG] [REGISTER] Using identity: ${userName}`);
        
        gateway = await getGateway(userName);
        console.log(`[DEBUG] [REGISTER] Gateway obtained successfully`);
        
        const network = await gateway.getNetwork('mychannel');
        console.log(`[DEBUG] [REGISTER] Network 'mychannel' obtained`);
        
        const contract = network.getContract('qlcaytrong');
        console.log(`[DEBUG] [REGISTER] Contract 'qlcaytrong' obtained`);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`[DEBUG] [REGISTER] Password hashed`);
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode (nếu chaincode hỗ trợ)
        const timestamp = new Date().toISOString();
        console.log(`[DEBUG] [REGISTER] Timestamp: ${timestamp}`);

        console.log(`[DEBUG] [REGISTER] Submitting transaction createUser...`);
        console.log(`[DEBUG] [REGISTER] Transaction parameters:`);
        console.log(`  - username: ${username}`);
        console.log(`  - hashedPassword: ${hashedPassword.substring(0, 20)}...`);
        console.log(`  - fullName: ${fullName}`);
        console.log(`  - email: ${email}`);
        console.log(`  - phone: ${phone || ''}`);
        console.log(`  - role: ${role || 'user'}`);
        console.log(`  - timestamp: ${timestamp}`);

        await contract.submitTransaction('createUser', username, hashedPassword, fullName, email, phone || '', role || 'user', timestamp);
        
        console.log(`[DEBUG] [REGISTER] Transaction submitted successfully!`);
        
        if (gateway) {
            await gateway.disconnect();
            console.log(`[DEBUG] [REGISTER] Gateway disconnected`);
        }
        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        console.error(`[REGISTER] Error registering user:`, error.message || 'Registration failed');
        
        // Log chi tiết lỗi
        console.error(`[DEBUG] [REGISTER] Full error details:`);
        console.error(`  Error name: ${error.name || 'N/A'}`);
        console.error(`  Error message: ${error.message || 'N/A'}`);
        if (error.stack) {
            console.error(`  Stack trace:`);
            console.error(error.stack);
        }
        if (error.errors) {
            console.error(`  Errors array:`, JSON.stringify(error.errors, null, 2));
        }
        if (error.cause) {
            console.error(`  Cause:`, JSON.stringify(error.cause, null, 2));
        }
        
        // Log peer info nếu có
        if (ccp.peers) {
            console.error(`[DEBUG] [REGISTER] Available peers in connection profile:`);
            Object.keys(ccp.peers).forEach(peerName => {
                const peer = ccp.peers[peerName];
                console.error(`  - ${peerName}:`);
                console.error(`    URL: ${peer.url || 'N/A'}`);
                console.error(`    Event URL: ${peer.eventUrl || 'N/A'}`);
            });
        }
        
        // Log network status
        console.error(`[DEBUG] [REGISTER] Network status check:`);
        console.error(`  - Channel: mychannel`);
        console.error(`  - Chaincode: qlcaytrong`);
        console.error(`  - Identity: ${process.env.USER_NAME || 'appUser'}`);
        
        if (gateway) {
            try {
                await gateway.disconnect();
                console.log(`[DEBUG] [REGISTER] Gateway disconnected after error`);
            } catch (disconnectError) {
                console.error(`[REGISTER] Error disconnecting gateway:`, disconnectError.message || 'Disconnect failed');
            }
        }

        // Xử lý các lỗi cụ thể
        let errorMessage = error.message || 'Đăng ký thất bại';
        
        if (errorMessage.includes('No valid responses from any peers')) {
            errorMessage = `Lỗi: Không nhận được phản hồi từ peers.\n` +
                `Vui lòng kiểm tra:\n` +
                `1. Network: docker ps | grep peer (phải thấy peer0.org1 và peer0.org2)\n` +
                `2. Chaincode: docker ps | grep qlcaytrong (phải thấy 2 containers)\n` +
                `3. Wallet: ls -la wallet/ (phải thấy admin/ và appUser/)\n` +
                `4. Xem log chi tiết ở trên để biết thêm thông tin.`;
        } else if (errorMessage.includes('Peer endorsements do not match')) {
            errorMessage = 'Lỗi blockchain: Chaincode chưa được deploy đúng hoặc network chưa chạy. Vui lòng kiểm tra lại.';
        } else if (errorMessage.includes('chaincode') || errorMessage.includes('chaincode name')) {
            errorMessage = 'Lỗi: Chaincode chưa được deploy. Chạy: cd /fabric-samples/test-network && ./network.sh deployCC -ccn qlcaytrong -ccp ../chaincode/qlcaytrong/javascript -ccl javascript';
        } else if (errorMessage.includes('network') || errorMessage.includes('channel')) {
            errorMessage = 'Lỗi: Network chưa được khởi động. Chạy: cd /fabric-samples/test-network && ./network.sh up';
        } else if (errorMessage.includes('da ton tai')) {
            errorMessage = `Tên đăng nhập "${req.body.username}" đã tồn tại. Vui lòng chọn tên khác.`;
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
        const contract = network.getContract('qlcaytrong');

        // Get user from blockchain
        let user;
        try {
            const result = await contract.evaluateTransaction('getUser', username);
            user = JSON.parse(result.toString());
        } catch (error) {
            await gateway.disconnect();
            // Check if error is about user not existing
            if (error.message && error.message.includes('khong ton tai')) {
                return res.status(401).json({ 
                    error: `Tên đăng nhập "${username}" không tồn tại. Vui lòng đăng ký tài khoản trước.` 
                });
            }
            throw error;
        }
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
app.get('/api/users', authenticateToken, authorize('admin', 'manager'), async (req, res) => {
    try {

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
app.delete('/api/users/:username', authenticateToken, authorize('admin'), async (req, res) => {
    try {

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

// ============ SEARCH & FILTER ENDPOINTS ============

// Search cay trong (full-text)
app.get('/api/caytrong/search', optionalAuth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('searchCayTrong', q);
        await gateway.disconnect();

        const caytrongs = JSON.parse(result.toString());
        res.json({ success: true, data: caytrongs });
    } catch (error) {
        console.error(`Error searching cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Filter cay trong (multiple criteria)
app.get('/api/caytrong/filter', optionalAuth, async (req, res) => {
    try {
        const { loaiCay, giaiDoan, viTri } = req.query;

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('filterCayTrong', 
            loaiCay || '', 
            giaiDoan || '', 
            viTri || ''
        );
        await gateway.disconnect();

        const caytrongs = JSON.parse(result.toString());
        res.json({ success: true, data: caytrongs });
    } catch (error) {
        console.error(`Error filtering cay trong: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ RESET PASSWORD ENDPOINTS ============

// Forgot password - Send reset email
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Thiếu email' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Find user by email
        const allUsers = JSON.parse(await contract.evaluateTransaction('getAllUsers'));
        const user = allUsers.find(u => u.Record.email === email);
        
        if (!user) {
            await gateway.disconnect();
            return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        await contract.submitTransaction('createResetToken', user.Record.username, resetToken, expiresAt);
        await gateway.disconnect();

        // Send email (if configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
            await emailTransporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Đặt lại mật khẩu - QLCayTrong',
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
            message: 'Email đặt lại mật khẩu đã được gửi',
            token: resetToken // Trong production, không nên trả về token
        });
    } catch (error) {
        console.error(`Error in forgot password: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu mới' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Get token
        const tokenData = JSON.parse(await contract.evaluateTransaction('getResetToken', token));
        
        // Check if token is expired or used
        if (new Date(tokenData.expiresAt) < new Date()) {
            await gateway.disconnect();
            return res.status(400).json({ error: 'Token đã hết hạn' });
        }
        if (tokenData.used) {
            await gateway.disconnect();
            return res.status(400).json({ error: 'Token đã được sử dụng' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await contract.submitTransaction('updateUserPassword', tokenData.username, hashedPassword);
        
        // Mark token as used
        await contract.submitTransaction('markResetTokenUsed', token);
        await gateway.disconnect();

        res.json({ success: true, message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        console.error(`Error resetting password: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Change password (when logged in)
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Thiếu mật khẩu hiện tại hoặc mật khẩu mới' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Verify current password
        const userResult = await contract.evaluateTransaction('getUser', req.user.username);
        const user = JSON.parse(userResult.toString());
        
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            await gateway.disconnect();
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await contract.submitTransaction('updateUserPassword', req.user.username, hashedPassword);
        await gateway.disconnect();

        res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error(`Error changing password: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ IMPORT/EXPORT ENDPOINTS ============

// Export to Excel
app.get('/api/caytrong/export/excel', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryAllCayTrong');
        const allCayTrong = JSON.parse(result.toString());
        await gateway.disconnect();

        // Prepare data for Excel
        const data = allCayTrong.map(item => ({
            'Mã cây': item.Record.maCay,
            'Tên cây': item.Record.tenCay,
            'Loại cây': item.Record.loaiCay,
            'Ngày trồng': item.Record.ngayTrong,
            'Giai đoạn': item.Record.giaiDoan,
            'Năng suất (tấn/ha)': item.Record.nangSuat,
            'Diện tích (ha)': item.Record.dienTich,
            'Vị trí': item.Record.viTri
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Cây Trồng');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=cay-trong-${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    } catch (error) {
        console.error(`Error exporting to Excel: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Export to PDF
app.get('/api/caytrong/export/pdf', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('queryAllCayTrong');
        const allCayTrong = JSON.parse(result.toString());
        await gateway.disconnect();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=cay-trong-${new Date().toISOString().split('T')[0]}.pdf`);
        
        doc.pipe(res);
        doc.fontSize(20).text('Báo Cáo Cây Trồng', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        allCayTrong.forEach((item, index) => {
            const record = item.Record;
            doc.fontSize(14).text(`${index + 1}. ${record.tenCay} (${record.maCay})`, { underline: true });
            doc.fontSize(10);
            doc.text(`   Loại: ${record.loaiCay}`);
            doc.text(`   Giai đoạn: ${record.giaiDoan}`);
            doc.text(`   Năng suất: ${record.nangSuat} tấn/ha`);
            doc.text(`   Diện tích: ${record.dienTich} ha`);
            doc.text(`   Vị trí: ${record.viTri}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error(`Error exporting to PDF: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Import from Excel/CSV
app.post('/api/caytrong/import', authenticateToken, authorize('admin', 'manager'), upload.single('file'), async (req, res) => {
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
        const contract = network.getContract('qlcaytrong');

        const results = { success: [], errors: [] };

        for (const row of data) {
            try {
                await contract.submitTransaction(
                    'createCayTrong',
                    row['Mã cây'] || row.maCay,
                    row['Tên cây'] || row.tenCay,
                    row['Loại cây'] || row.loaiCay,
                    row['Ngày trồng'] || row.ngayTrong,
                    row['Giai đoạn'] || row.giaiDoan,
                    (row['Năng suất (tấn/ha)'] || row.nangSuat || 0).toString(),
                    (row['Diện tích (ha)'] || row.dienTich || 0).toString(),
                    row['Vị trí'] || row.viTri
                );
                results.success.push(row['Mã cây'] || row.maCay);
            } catch (error) {
                results.errors.push({
                    row: row['Mã cây'] || row.maCay,
                    error: error.message
                });
            }
        }

        await gateway.disconnect();
        
        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            message: `Import thành công ${results.success.length} bản ghi, ${results.errors.length} lỗi`,
            results
        });
    } catch (error) {
        console.error(`Error importing: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ REPORT HISTORY ENDPOINTS ============

// Save report
app.post('/api/reports', authenticateToken, async (req, res) => {
    try {
        const reportId = `RPT_${Date.now()}_${req.user.username}`;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        // Get all cay trong for report
        const result = await contract.evaluateTransaction('queryAllCayTrong');
        const allCayTrong = JSON.parse(result.toString());

        // Calculate statistics (same as GET /api/reports)
        const stats = {
            totalCayTrong: allCayTrong.length,
            totalDienTich: allCayTrong.reduce((sum, item) => sum + parseFloat(item.Record.dienTich || 0), 0),
            avgNangSuat: allCayTrong.length > 0 
                ? allCayTrong.reduce((sum, item) => sum + parseFloat(item.Record.nangSuat || 0), 0) / allCayTrong.length 
                : 0,
            byLoaiCay: {},
            byGiaiDoan: {},
            byViTri: {}
        };

        allCayTrong.forEach(item => {
            const loai = item.Record.loaiCay;
            if (!stats.byLoaiCay[loai]) {
                stats.byLoaiCay[loai] = { count: 0, dienTich: 0 };
            }
            stats.byLoaiCay[loai].count++;
            stats.byLoaiCay[loai].dienTich += parseFloat(item.Record.dienTich || 0);
        });

        allCayTrong.forEach(item => {
            const giaiDoan = item.Record.giaiDoan;
            if (!stats.byGiaiDoan[giaiDoan]) {
                stats.byGiaiDoan[giaiDoan] = 0;
            }
            stats.byGiaiDoan[giaiDoan]++;
        });

        allCayTrong.forEach(item => {
            const viTri = item.Record.viTri;
            if (!stats.byViTri[viTri]) {
                stats.byViTri[viTri] = 0;
            }
            stats.byViTri[viTri]++;
        });

        const reportData = {
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.username,
            statistics: stats,
            data: allCayTrong
        };

        await contract.submitTransaction('saveReport', reportId, JSON.stringify(reportData));
        await gateway.disconnect();

        res.json({ success: true, reportId, report: reportData });
    } catch (error) {
        console.error(`Error saving report: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Get report history
app.get('/api/reports/history', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('getAllReports');
        const reports = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: reports });
    } catch (error) {
        console.error(`Error getting report history: ${error}`);
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
        const contract = network.getContract('qlcaytrong');

        const result = await contract.evaluateTransaction('getReport', reportId);
        const report = JSON.parse(result.toString());
        await gateway.disconnect();

        res.json({ success: true, data: report });
    } catch (error) {
        console.error(`Error getting report: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// Scheduled report generation (daily at midnight)
if (process.env.ENABLE_SCHEDULED_REPORTS === 'true') {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Generating daily report...');
            // Implementation for scheduled reports
        } catch (error) {
            console.error('Error generating scheduled report:', error);
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLCayTrong API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});

