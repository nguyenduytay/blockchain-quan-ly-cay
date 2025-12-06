/*
 * Script kiểm tra network status trước khi test
 */
'use strict';

const { execSync } = require('child_process');

console.log('🔍 Kiểm tra Network Status...\n');

// 1. Kiểm tra network containers
console.log('1️⃣ Kiểm tra Network Containers:');
try {
    const peerOutput = execSync('docker ps | grep -E "peer|orderer|ca"', { encoding: 'utf8' });
    console.log('✅ Network containers đang chạy:');
    console.log(peerOutput);
} catch (error) {
    console.error('❌ Không tìm thấy network containers!');
    console.error('   Chạy: cd /fabric-samples/test-network && ./network.sh up createChannel -ca');
}

// 2. Kiểm tra chaincode containers
console.log('\n2️⃣ Kiểm tra Chaincode Containers:');
try {
    const chaincodeOutput = execSync('docker ps | grep qlhscb', { encoding: 'utf8' });
    console.log('✅ Chaincode containers đang chạy:');
    console.log(chaincodeOutput);
} catch (error) {
    console.error('❌ Không tìm thấy chaincode containers!');
    console.error('   Chạy: cd /fabric-samples/test-network && ./network.sh deployCC -ccn qlhscb -ccp ../chaincode/qlhscb/javascript -ccl javascript');
}

// 3. Kiểm tra wallet
console.log('\n3️⃣ Kiểm tra Wallet:');
const fs = require('fs');
const path = require('path');
const walletPath = path.join(process.cwd(), 'wallet');

try {
    const walletFiles = fs.readdirSync(walletPath);
    console.log('✅ Wallet contents:');
    walletFiles.forEach(file => {
        const filePath = path.join(walletPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            console.log(`   - ${file}/ (directory)`);
        } else {
            console.log(`   - ${file} (file)`);
        }
    });
    
    // Kiểm tra thư mục, không phải file
    const hasAdminDir = walletFiles.some(file => {
        const filePath = path.join(walletPath, file);
        return fs.statSync(filePath).isDirectory() && file === 'admin';
    });
    const hasAppUserDir = walletFiles.some(file => {
        const filePath = path.join(walletPath, file);
        return fs.statSync(filePath).isDirectory() && file === 'appUser';
    });
    
    if (!hasAdminDir) {
        console.error('   ❌ Thiếu admin identity (thư mục admin/)!');
        console.error('   Chạy: node enrollAdmin.js');
    } else {
        console.log('   ✅ admin/ identity tồn tại');
    }
    if (!hasAppUserDir) {
        console.error('   ❌ Thiếu appUser identity (thư mục appUser/)!');
        console.error('   Chạy: node registerUser.js');
    } else {
        console.log('   ✅ appUser/ identity tồn tại');
    }
} catch (error) {
    console.error('❌ Wallet không tồn tại hoặc không thể đọc!');
    console.error('   Chạy: node enrollAdmin.js && node registerUser.js');
}

// 4. Kiểm tra connection profile
console.log('\n4️⃣ Kiểm tra Connection Profile:');
const ccpPath = '/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
try {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    console.log('✅ Connection profile tồn tại:');
    console.log(`   - Organizations: ${Object.keys(ccp.organizations || {}).join(', ')}`);
    console.log(`   - Peers: ${Object.keys(ccp.peers || {}).join(', ')}`);
    console.log(`   - Orderers: ${Object.keys(ccp.orderers || {}).join(', ')}`);
    console.log(`   - Channels: ${Object.keys(ccp.channels || {}).join(', ')}`);
} catch (error) {
    console.error('❌ Connection profile không tồn tại hoặc không hợp lệ!');
    console.error(`   Path: ${ccpPath}`);
    console.error(`   Error: ${error.message}`);
}

console.log('\n✅ Hoàn tất kiểm tra!');
console.log('💡 Nếu có lỗi, hãy sửa theo hướng dẫn ở trên trước khi test.');

