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
    const discoveryEnabled = process.env.DISCOVERY_ENABLED !== 'false';
    
    try {
        await gateway.connect(ccp, {
            wallet,
            identity: userName,
            discovery: { enabled: discoveryEnabled, asLocalhost: true }
        });
    } catch (error) {
        // Fallback: retry without discovery if access denied
        if (error.message && error.message.includes('access denied') && discoveryEnabled) {
            await gateway.disconnect();
            await gateway.connect(ccp, {
                wallet,
                identity: userName,
                discovery: { enabled: false, asLocalhost: true }
            });
        } else {
            throw error;
        }
    }

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

        await contract.submitTransaction('createUser', username, hashedPassword, fullName, email, role || 'user');
        
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

        await contract.submitTransaction('updateUser', req.params.username, fullName || '', email || '', updateRole || '', updateIsActive || '');
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 QLHoSoCanBo API Server đang chạy trên port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
});
