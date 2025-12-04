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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3007;
const JWT_SECRET = process.env.JWT_SECRET || 'qlhscb-secret-key-2024';

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
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const userExists = await wallet.get(userName);
    if (!userExists) {
        throw new Error(`User ${userName} does not exist in wallet. Please register first.`);
    }

    const gateway = new Gateway();
    // Tắt discovery để tránh lỗi "Peer endorsements do not match"
    // Discovery có thể gây lệch peer trong endorsement
    await gateway.connect(ccp, {
        wallet,
        identity: userName,
        discovery: { enabled: false, asLocalhost: true }
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
        console.error(`Error initializing ledger: ${error.message || 'Initialization failed'}`);
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
        // Filter out user records
        const filtered = allHoSoCanBo.filter(item => item.Record.docType === 'hosocanbo');
        res.json({ success: true, data: filtered });
    } catch (error) {
        console.error(`Error querying all ho so can bo: ${error.message || 'Query failed'}`);
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
        console.error(`Error querying ho so can bo: ${error.message || 'Query failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Create new ho so can bo
app.post('/api/hosocanbo', authenticateToken, async (req, res) => {
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
        console.error(`Error creating ho so can bo: ${error.message || 'Creation failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Update ho so can bo
app.put('/api/hosocanbo/:maCanBo', authenticateToken, async (req, res) => {
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
        console.error(`Error updating ho so can bo: ${error.message || 'Update failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Delete ho so can bo
app.delete('/api/hosocanbo/:maCanBo', authenticateToken, async (req, res) => {
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
        console.error(`Error deleting ho so can bo: ${error.message || 'Deletion failed'}`);
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
        console.error(`Error querying ho so can bo by phong ban: ${error.message || 'Query failed'}`);
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
        console.error(`Error querying ho so can bo by chuc vu: ${error.message || 'Query failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Change chuc vu
app.patch('/api/hosocanbo/:maCanBo/thaydoichucvu', authenticateToken, async (req, res) => {
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
        console.error(`Error changing chuc vu: ${error.message || 'Update failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Update luong
app.patch('/api/hosocanbo/:maCanBo/luong', authenticateToken, async (req, res) => {
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
        console.error(`Error updating luong: ${error.message || 'Update failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register new user
app.post('/api/auth/register', async (req, res) => {
    let gateway;
    try {
        const { username, password, fullName, email, role } = req.body;

        if (!username || !password || !fullName || !email) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();

        await contract.submitTransaction('createUser', username, hashedPassword, fullName, email, req.body.phone || '', role || 'user', timestamp);
        
        if (gateway) {
            await gateway.disconnect();
        }
        res.json({ success: true, message: 'Đăng ký thành công' });
    } catch (error) {
        console.error(`[REGISTER] Error registering user:`, error.message || 'Registration failed');
        
        if (gateway) {
            try {
                await gateway.disconnect();
            } catch (disconnectError) {
                console.error(`[REGISTER] Error disconnecting gateway:`, disconnectError.message || 'Disconnect failed');
            }
        }

        // Xử lý các lỗi cụ thể
        let errorMessage = error.message || 'Đăng ký thất bại';
        
        if (errorMessage.includes('Peer endorsements do not match')) {
            errorMessage = 'Lỗi blockchain: Chaincode chưa được deploy đúng hoặc network chưa chạy. Vui lòng kiểm tra lại.';
        } else if (errorMessage.includes('chaincode') || errorMessage.includes('chaincode name')) {
            errorMessage = 'Lỗi: Chaincode chưa được deploy. Chạy: cd /fabric-samples/test-network && ./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript';
        } else if (errorMessage.includes('network') || errorMessage.includes('channel')) {
            errorMessage = 'Lỗi: Network chưa được khởi động. Chạy: cd /fabric-samples/test-network && ./network.sh up';
        } else if (errorMessage.includes('da ton tai')) {
            errorMessage = `Tên đăng nhập "${username}" đã tồn tại. Vui lòng chọn tên khác.`;
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
        const contract = network.getContract('qlhscb');

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
        const contract = network.getContract('qlhscb');

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
        const contract = network.getContract('qlhscb');

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
        // User can only see their own info unless admin
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

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
        // User can only update their own info unless admin
        if (req.user.username !== req.params.username && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền cập nhật' });
        }

        const { fullName, email, role, isActive } = req.body;
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        // Only admin can change role and isActive
        const updateRole = (req.user.role === 'admin' && role) ? role : undefined;
        const updateIsActive = (req.user.role === 'admin' && isActive !== undefined) ? isActive : undefined;
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();

        await contract.submitTransaction('updateUser', req.params.username, fullName || '', email || '', updateRole || '', updateIsActive || '', timestamp);
        await gateway.disconnect();

        res.json({ success: true, message: 'Cập nhật thông tin thành công' });
    } catch (error) {
        console.error(`Error updating user: ${error.message || 'Update failed'}`);
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

        // Cannot delete yourself
        if (req.user.username === req.params.username) {
            return res.status(400).json({ error: 'Không thể xóa chính mình' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('deleteUser', req.params.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Xóa user thành công' });
    } catch (error) {
        console.error(`Error deleting user: ${error.message || 'Deletion failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ PASSWORD RESET ENDPOINTS ============

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
        const contract = network.getContract('qlhscb');

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
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();

        await contract.submitTransaction('createResetToken', user.Record.username, resetToken, expiresAt, timestamp);
        await gateway.disconnect();

        // Send email/SMS (if configured)
        if (process.env.SMTP_USER && process.env.SMTP_PASS && email) {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
            await emailTransporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Đặt lại mật khẩu - QLHSCB',
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
        const contract = network.getContract('qlhscb');

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
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();
        
        await contract.submitTransaction('updateUserPassword', tokenData.username, hashedPassword, timestamp);
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
        const contract = network.getContract('qlhscb');

        const userResult = await contract.evaluateTransaction('getUser', req.user.username);
        const user = JSON.parse(userResult.toString());
        
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            await gateway.disconnect();
            return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();
        
        await contract.submitTransaction('updateUserPassword', req.user.username, hashedPassword, timestamp);
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
        const contract = network.getContract('qlhscb');

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
        const contract = network.getContract('qlhscb');

        await contract.submitTransaction('verifyPhone', req.user.username);
        await gateway.disconnect();

        res.json({ success: true, message: 'Số điện thoại đã được xác thực' });
    } catch (error) {
        console.error(`Error verifying phone: ${error.message || 'Phone verification failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ SEARCH & FILTER ENDPOINTS ============

// Search ho so can bo (full-text)
app.get('/api/hosocanbo/search', optionalAuth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });
        }

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('searchHoSoCanBo', q);
        await gateway.disconnect();

        const hosocanbos = JSON.parse(result.toString());
        res.json({ success: true, data: hosocanbos });
    } catch (error) {
        console.error(`Error searching ho so can bo: ${error.message || 'Search failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Filter ho so can bo (multiple criteria)
app.get('/api/hosocanbo/filter', optionalAuth, async (req, res) => {
    try {
        const { phongBan, chucVu, trinhDo } = req.query;

        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('filterHoSoCanBo', 
            phongBan || '', 
            chucVu || '', 
            trinhDo || ''
        );
        await gateway.disconnect();

        const hosocanbos = JSON.parse(result.toString());
        res.json({ success: true, data: hosocanbos });
    } catch (error) {
        console.error(`Error filtering ho so can bo: ${error.message || 'Filter failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// ============ IMPORT/EXPORT ENDPOINTS ============

// Export to Excel
app.get('/api/hosocanbo/export/excel', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryAllHoSoCanBo');
        const allHoSoCanBo = JSON.parse(result.toString());
        await gateway.disconnect();

        const hosocanbos = allHoSoCanBo.filter(item => item.Record.docType === 'hosocanbo');
        const data = hosocanbos.map(item => ({
            'Mã cán bộ': item.Record.maCanBo,
            'Họ tên': item.Record.hoTen,
            'Ngày sinh': item.Record.ngaySinh,
            'Giới tính': item.Record.gioiTinh,
            'Chức vụ': item.Record.chucVu,
            'Phòng ban': item.Record.phongBan,
            'Ngày vào làm': item.Record.ngayVaoLam,
            'Trình độ': item.Record.trinhDo,
            'Lương (VND)': item.Record.luong,
            'Địa chỉ': item.Record.diaChi
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Hồ Sơ Cán Bộ');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=ho-so-can-bo-${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);
    } catch (error) {
        console.error(`Error exporting to Excel: ${error.message || 'Export failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Export to PDF
app.get('/api/hosocanbo/export/pdf', authenticateToken, async (req, res) => {
    try {
        const userName = process.env.USER_NAME || 'appUser';
        const gateway = await getGateway(userName);
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryAllHoSoCanBo');
        const allHoSoCanBo = JSON.parse(result.toString());
        await gateway.disconnect();

        const hosocanbos = allHoSoCanBo.filter(item => item.Record.docType === 'hosocanbo');

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ho-so-can-bo-${new Date().toISOString().split('T')[0]}.pdf`);
        
        doc.pipe(res);
        doc.fontSize(20).text('Báo Cáo Hồ Sơ Cán Bộ', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, { align: 'center' });
        doc.moveDown(2);

        hosocanbos.forEach((item, index) => {
            const record = item.Record;
            doc.fontSize(14).text(`${index + 1}. ${record.hoTen} (${record.maCanBo})`, { underline: true });
            doc.fontSize(10);
            doc.text(`   Chức vụ: ${record.chucVu}`);
            doc.text(`   Phòng ban: ${record.phongBan}`);
            doc.text(`   Trình độ: ${record.trinhDo}`);
            doc.text(`   Lương: ${record.luong.toLocaleString('vi-VN')} VND`);
            doc.text(`   Ngày vào làm: ${record.ngayVaoLam}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        console.error(`Error exporting to PDF: ${error.message || 'Export failed'}`);
        res.status(500).json({ error: error.message });
    }
});

// Import from Excel/CSV
app.post('/api/hosocanbo/import', authenticateToken, authorize('admin', 'manager'), upload.single('file'), async (req, res) => {
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
        const contract = network.getContract('qlhscb');

        const results = { success: [], errors: [] };

        for (const row of data) {
            try {
                await contract.submitTransaction(
                    'createHoSoCanBo',
                    row['Mã cán bộ'] || row.maCanBo,
                    row['Họ tên'] || row.hoTen,
                    row['Ngày sinh'] || row.ngaySinh,
                    row['Giới tính'] || row.gioiTinh,
                    row['Chức vụ'] || row.chucVu,
                    row['Phòng ban'] || row.phongBan,
                    row['Ngày vào làm'] || row.ngayVaoLam,
                    row['Trình độ'] || row.trinhDo,
                    (row['Lương (VND)'] || row.luong || 0).toString(),
                    row['Địa chỉ'] || row.diaChi
                );
                results.success.push(row['Mã cán bộ'] || row.maCanBo);
            } catch (error) {
                results.errors.push({
                    row: row['Mã cán bộ'] || row.maCanBo,
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
        const contract = network.getContract('qlhscb');

        // Get all ho so can bo
        const result = await contract.evaluateTransaction('queryAllHoSoCanBo');
        const allHoSoCanBo = JSON.parse(result.toString());
        await gateway.disconnect();

        // Filter out user records
        const hosocanbos = allHoSoCanBo.filter(item => item.Record.docType === 'hosocanbo');

        // Calculate statistics
        const stats = {
            totalCanBo: hosocanbos.length,
            totalLuong: hosocanbos.reduce((sum, item) => {
                return sum + parseFloat(item.Record.luong || 0);
            }, 0),
            avgLuong: hosocanbos.length > 0 
                ? hosocanbos.reduce((sum, item) => {
                    return sum + parseFloat(item.Record.luong || 0);
                }, 0) / hosocanbos.length 
                : 0,
            byPhongBan: {},
            byChucVu: {},
            byTrinhDo: {},
            byGioiTinh: {}
        };

        // Group by phong ban
        hosocanbos.forEach(item => {
            const phongBan = item.Record.phongBan;
            if (!stats.byPhongBan[phongBan]) {
                stats.byPhongBan[phongBan] = { count: 0, totalLuong: 0 };
            }
            stats.byPhongBan[phongBan].count++;
            stats.byPhongBan[phongBan].totalLuong += parseFloat(item.Record.luong || 0);
        });

        // Group by chuc vu
        hosocanbos.forEach(item => {
            const chucVu = item.Record.chucVu;
            if (!stats.byChucVu[chucVu]) {
                stats.byChucVu[chucVu] = 0;
            }
            stats.byChucVu[chucVu]++;
        });

        // Group by trinh do
        hosocanbos.forEach(item => {
            const trinhDo = item.Record.trinhDo;
            if (!stats.byTrinhDo[trinhDo]) {
                stats.byTrinhDo[trinhDo] = 0;
            }
            stats.byTrinhDo[trinhDo]++;
        });

        // Group by gioi tinh
        hosocanbos.forEach(item => {
            const gioiTinh = item.Record.gioiTinh;
            if (!stats.byGioiTinh[gioiTinh]) {
                stats.byGioiTinh[gioiTinh] = 0;
            }
            stats.byGioiTinh[gioiTinh]++;
        });

        res.json({ 
            success: true, 
            report: {
                generatedAt: new Date().toISOString(),
                generatedBy: req.user.username,
                statistics: stats,
                data: hosocanbos
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
        const contract = network.getContract('qlhscb');

        const result = await contract.evaluateTransaction('queryAllHoSoCanBo');
        const allHoSoCanBo = JSON.parse(result.toString());
        const hosocanbos = allHoSoCanBo.filter(item => item.Record.docType === 'hosocanbo');

        const stats = {
            totalCanBo: hosocanbos.length,
            totalLuong: hosocanbos.reduce((sum, item) => sum + parseFloat(item.Record.luong || 0), 0),
            avgLuong: hosocanbos.length > 0 
                ? hosocanbos.reduce((sum, item) => sum + parseFloat(item.Record.luong || 0), 0) / hosocanbos.length 
                : 0,
            byPhongBan: {},
            byChucVu: {},
            byTrinhDo: {},
            byGioiTinh: {}
        };

        hosocanbos.forEach(item => {
            const phongBan = item.Record.phongBan;
            if (!stats.byPhongBan[phongBan]) {
                stats.byPhongBan[phongBan] = { count: 0, totalLuong: 0 };
            }
            stats.byPhongBan[phongBan].count++;
            stats.byPhongBan[phongBan].totalLuong += parseFloat(item.Record.luong || 0);
        });

        hosocanbos.forEach(item => {
            const chucVu = item.Record.chucVu;
            if (!stats.byChucVu[chucVu]) {
                stats.byChucVu[chucVu] = 0;
            }
            stats.byChucVu[chucVu]++;
        });

        hosocanbos.forEach(item => {
            const trinhDo = item.Record.trinhDo;
            if (!stats.byTrinhDo[trinhDo]) {
                stats.byTrinhDo[trinhDo] = 0;
            }
            stats.byTrinhDo[trinhDo]++;
        });

        hosocanbos.forEach(item => {
            const gioiTinh = item.Record.gioiTinh;
            if (!stats.byGioiTinh[gioiTinh]) {
                stats.byGioiTinh[gioiTinh] = 0;
            }
            stats.byGioiTinh[gioiTinh]++;
        });

        // Tạo timestamp để đảm bảo deterministic trong chaincode
        const timestamp = new Date().toISOString();
        
        const reportData = {
            generatedAt: timestamp,
            generatedBy: req.user.username,
            statistics: stats,
            data: hosocanbos
        };

        await contract.submitTransaction('saveReport', reportId, JSON.stringify(reportData), timestamp);
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
        const contract = network.getContract('qlhscb');

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
        const contract = network.getContract('qlhscb');

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
            console.log('Generating daily report for QLHSCB...');
        } catch (error) {
            console.error('Error generating scheduled report:', error);
        }
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLHoSoCanBo API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});
