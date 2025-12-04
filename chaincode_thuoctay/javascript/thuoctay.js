/*
 * Chaincode Quan Ly Thuoc Tay
 * Dua tren FabCar
 */
'use strict';

const { Contract } = require('fabric-contract-api');

class QLThuocTay extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Khoi Tao Du Lieu Thuoc Tay ===========');
        const thuoctays = [
            {
                maThuoc: 'T001',
                tenThuoc: 'Paracetamol 500mg',
                hoatchat: 'Paracetamol',
                nhaSanXuat: 'Traphaco',
                ngaySanXuat: '2024-01-15',
                hanSuDung: '2026-01-15',
                donVi: 'Viên',
                soLuong: 1000,
                giaBan: 5000,
                loaiThuoc: 'Giảm đau, hạ sốt'
            },
            {
                maThuoc: 'T002',
                tenThuoc: 'Amoxicillin 500mg',
                hoatchat: 'Amoxicillin',
                nhaSanXuat: 'Hậu Giang Pharma',
                ngaySanXuat: '2024-02-20',
                hanSuDung: '2026-02-20',
                donVi: 'Viên',
                soLuong: 500,
                giaBan: 12000,
                loaiThuoc: 'Kháng sinh'
            },
            {
                maThuoc: 'T003',
                tenThuoc: 'Vitamin C 1000mg',
                hoatchat: 'Ascorbic Acid',
                nhaSanXuat: 'Domesco',
                ngaySanXuat: '2024-03-10',
                hanSuDung: '2026-03-10',
                donVi: 'Viên',
                soLuong: 2000,
                giaBan: 8000,
                loaiThuoc: 'Vitamin'
            },
            {
                maThuoc: 'T004',
                tenThuoc: 'Ibuprofen 400mg',
                hoatchat: 'Ibuprofen',
                nhaSanXuat: 'Pharmedic',
                ngaySanXuat: '2024-01-25',
                hanSuDung: '2026-01-25',
                donVi: 'Viên',
                soLuong: 800,
                giaBan: 15000,
                loaiThuoc: 'Giảm đau, kháng viêm'
            },
            {
                maThuoc: 'T005',
                tenThuoc: 'Omeprazole 20mg',
                hoatchat: 'Omeprazole',
                nhaSanXuat: 'Traphaco',
                ngaySanXuat: '2024-02-14',
                hanSuDung: '2026-02-14',
                donVi: 'Viên',
                soLuong: 600,
                giaBan: 18000,
                loaiThuoc: 'Điều trị dạ dày'
            }
        ];

        for (let i = 0; i < thuoctays.length; i++) {
            thuoctays[i].docType = 'thuoctay';
            await ctx.stub.putState(thuoctays[i].maThuoc, Buffer.from(JSON.stringify(thuoctays[i])));
            console.info('Da them thuoc tay: ', thuoctays[i].maThuoc, ' - ', thuoctays[i].tenThuoc);
        }
        console.info('============= END : Khoi Tao Du Lieu Thuoc Tay ===========');
    }

    async queryThuocTay(ctx, maThuoc) {
        const thuoctayAsBytes = await ctx.stub.getState(maThuoc);
        if (!thuoctayAsBytes || thuoctayAsBytes.length === 0) {
            throw new Error(`Thuoc tay ${maThuoc} khong ton tai`);
        }
        console.log(thuoctayAsBytes.toString());
        return thuoctayAsBytes.toString();
    }

    async createThuocTay(ctx, maThuoc, tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong, giaBan, loaiThuoc) {
        console.info('============= START : Tao Thuoc Tay Moi ===========');
        // Kiem tra thuoc tay da ton tai chua
        const exists = await ctx.stub.getState(maThuoc);
        if (exists && exists.length > 0) {
            throw new Error(`Thuoc tay ${maThuoc} da ton tai`);
        }

        const thuoctay = {
            docType: 'thuoctay',
            maThuoc: maThuoc,
            tenThuoc: tenThuoc,
            hoatchat: hoatchat,
            nhaSanXuat: nhaSanXuat,
            ngaySanXuat: ngaySanXuat,
            hanSuDung: hanSuDung,
            donVi: donVi,
            soLuong: parseInt(soLuong),
            giaBan: parseFloat(giaBan),
            loaiThuoc: loaiThuoc
        };

        await ctx.stub.putState(maThuoc, Buffer.from(JSON.stringify(thuoctay)));
        console.info('============= END : Tao Thuoc Tay Moi ===========');
        return JSON.stringify(thuoctay);
    }

    async queryAllThuocTay(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async updateThuocTay(ctx, maThuoc, tenThuoc, hoatchat, nhaSanXuat, ngaySanXuat, hanSuDung, donVi, soLuong, giaBan, loaiThuoc) {
        console.info('============= START : Cap Nhat Thuoc Tay ===========');
        const thuoctayAsBytes = await ctx.stub.getState(maThuoc);
        if (!thuoctayAsBytes || thuoctayAsBytes.length === 0) {
            throw new Error(`Thuoc tay ${maThuoc} khong ton tai`);
        }

        const thuoctay = JSON.parse(thuoctayAsBytes.toString());
        thuoctay.tenThuoc = tenThuoc;
        thuoctay.hoatchat = hoatchat;
        thuoctay.nhaSanXuat = nhaSanXuat;
        thuoctay.ngaySanXuat = ngaySanXuat;
        thuoctay.hanSuDung = hanSuDung;
        thuoctay.donVi = donVi;
        thuoctay.soLuong = parseInt(soLuong);
        thuoctay.giaBan = parseFloat(giaBan);
        thuoctay.loaiThuoc = loaiThuoc;

        await ctx.stub.putState(maThuoc, Buffer.from(JSON.stringify(thuoctay)));
        console.info('============= END : Cap Nhat Thuoc Tay ===========');
        return JSON.stringify(thuoctay);
    }

    async deleteThuocTay(ctx, maThuoc) {
        console.info('============= START : Xoa Thuoc Tay ===========');
        const exists = await ctx.stub.getState(maThuoc);
        if (!exists || exists.length === 0) {
            throw new Error(`Thuoc tay ${maThuoc} khong ton tai`);
        }
        await ctx.stub.deleteState(maThuoc);
        console.info('============= END : Xoa Thuoc Tay ===========');
        return `Da xoa thuoc tay ${maThuoc}`;
    }

    async queryThuocTayByLoai(ctx, loaiThuoc) {
        console.info('============= START : Tim Thuoc Tay Theo Loai ===========');
        const allThuocTay = JSON.parse(await this.queryAllThuocTay(ctx));
        const result = allThuocTay.filter(item => item.Record.loaiThuoc === loaiThuoc);
        console.info(`Tim thay ${result.length} thuoc tay loai ${loaiThuoc}`);
        return JSON.stringify(result);
    }

    async queryThuocTayByNhaSanXuat(ctx, nhaSanXuat) {
        console.info('============= START : Tim Thuoc Tay Theo Nha San Xuat ===========');
        const allThuocTay = JSON.parse(await this.queryAllThuocTay(ctx));
        const result = allThuocTay.filter(item => item.Record.nhaSanXuat === nhaSanXuat);
        console.info(`Tim thay ${result.length} thuoc tay cua nha san xuat ${nhaSanXuat}`);
        return JSON.stringify(result);
    }

    async updateSoLuong(ctx, maThuoc, soLuongMoi) {
        console.info('============= START : Cap Nhat So Luong ===========');
        const thuoctayAsBytes = await ctx.stub.getState(maThuoc);
        if (!thuoctayAsBytes || thuoctayAsBytes.length === 0) {
            throw new Error(`Thuoc tay ${maThuoc} khong ton tai`);
        }
        const thuoctay = JSON.parse(thuoctayAsBytes.toString());
        const soLuongCu = thuoctay.soLuong;
        thuoctay.soLuong = parseInt(soLuongMoi);
        await ctx.stub.putState(maThuoc, Buffer.from(JSON.stringify(thuoctay)));
        console.info(`Da cap nhat so luong thuoc tay ${maThuoc} tu ${soLuongCu} sang ${soLuongMoi}`);
        console.info('============= END : Cap Nhat So Luong ===========');
        return JSON.stringify(thuoctay);
    }

    async updateGiaBan(ctx, maThuoc, giaBanMoi) {
        console.info('============= START : Cap Nhat Gia Ban ===========');
        const thuoctayAsBytes = await ctx.stub.getState(maThuoc);
        if (!thuoctayAsBytes || thuoctayAsBytes.length === 0) {
            throw new Error(`Thuoc tay ${maThuoc} khong ton tai`);
        }
        const thuoctay = JSON.parse(thuoctayAsBytes.toString());
        const giaBanCu = thuoctay.giaBan;
        thuoctay.giaBan = parseFloat(giaBanMoi);
        await ctx.stub.putState(maThuoc, Buffer.from(JSON.stringify(thuoctay)));
        console.info(`Da cap nhat gia ban thuoc tay ${maThuoc} tu ${giaBanCu} sang ${giaBanMoi}`);
        console.info('============= END : Cap Nhat Gia Ban ===========');
        return JSON.stringify(thuoctay);
    }

    // ============ SEARCH & FILTER FUNCTIONS ============

    async searchThuocTay(ctx, searchTerm) {
        console.info('============= START : Tim Kiem Thuoc Tay ===========');
        const allThuocTay = JSON.parse(await this.queryAllThuocTay(ctx));
        const term = searchTerm.toLowerCase();
        const result = allThuocTay.filter(item => {
            const record = item.Record;
            return record.tenThuoc.toLowerCase().includes(term) ||
                   record.maThuoc.toLowerCase().includes(term) ||
                   record.hoatchat.toLowerCase().includes(term) ||
                   record.nhaSanXuat.toLowerCase().includes(term) ||
                   record.loaiThuoc.toLowerCase().includes(term);
        });
        console.info(`Tim thay ${result.length} ket qua cho "${searchTerm}"`);
        return JSON.stringify(result);
    }

    async filterThuocTay(ctx, loaiThuoc, nhaSanXuat, donVi) {
        console.info('============= START : Loc Thuoc Tay ===========');
        const allThuocTay = JSON.parse(await this.queryAllThuocTay(ctx));
        const result = allThuocTay.filter(item => {
            const record = item.Record;
            const matchLoai = !loaiThuoc || record.loaiThuoc === loaiThuoc;
            const matchNhaSanXuat = !nhaSanXuat || record.nhaSanXuat === nhaSanXuat;
            const matchDonVi = !donVi || record.donVi === donVi;
            return matchLoai && matchNhaSanXuat && matchDonVi;
        });
        console.info(`Tim thay ${result.length} ket qua`);
        return JSON.stringify(result);
    }

    // ============ USER MANAGEMENT FUNCTIONS ============
    
    async createUser(ctx, username, password, fullName, email, phone, role) {
        console.info('============= START : Tao User Moi ===========');
        const userKey = `USER_${username}`;
        const exists = await ctx.stub.getState(userKey);
        if (exists && exists.length > 0) {
            throw new Error(`User ${username} da ton tai`);
        }

        const user = {
            docType: 'user',
            username: username,
            password: password,
            fullName: fullName,
            email: email,
            phone: phone || '',
            role: role || 'user',
            emailVerified: false,
            phoneVerified: false,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        console.info(`Da tao user: ${username}`);
        console.info('============= END : Tao User Moi ===========');
        return JSON.stringify(user);
    }

    async getUser(ctx, username) {
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        return userAsBytes.toString();
    }

    async getAllUsers(ctx) {
        const startKey = 'USER_';
        const endKey = 'USER_\uffff';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            if (record.password) {
                delete record.password;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

    async updateUser(ctx, username, fullName, email, phone, role) {
        console.info('============= START : Cap Nhat User ===========');
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }

        const user = JSON.parse(userAsBytes.toString());
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;
        user.updatedAt = new Date().toISOString();

        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        console.info(`Da cap nhat user: ${username}`);
        console.info('============= END : Cap Nhat User ===========');
        delete user.password;
        return JSON.stringify(user);
    }

    async deleteUser(ctx, username) {
        console.info('============= START : Xoa User ===========');
        const userKey = `USER_${username}`;
        const exists = await ctx.stub.getState(userKey);
        if (!exists || exists.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        await ctx.stub.deleteState(userKey);
        console.info(`Da xoa user: ${username}`);
        console.info('============= END : Xoa User ===========');
        return `Da xoa user ${username}`;
    }

    async verifyUser(ctx, username, password) {
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        const user = JSON.parse(userAsBytes.toString());
        if (user.password !== password) {
            throw new Error('Mat khau khong dung');
        }
        if (!user.isActive) {
            throw new Error('Tai khoan da bi khoa');
        }
        delete user.password;
        return JSON.stringify(user);
    }

    // ============ EMAIL/PHONE VERIFICATION ============

    async verifyEmail(ctx, username) {
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.emailVerified = true;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return JSON.stringify({ success: true });
    }

    async verifyPhone(ctx, username) {
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.phoneVerified = true;
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return JSON.stringify({ success: true });
    }

    // ============ RESET PASSWORD FUNCTIONS ============

    async createResetToken(ctx, username, token, expiresAt) {
        const tokenKey = `RESET_${token}`;
        const tokenData = {
            docType: 'resetToken',
            username: username,
            token: token,
            expiresAt: expiresAt,
            used: false,
            createdAt: new Date().toISOString()
        };
        await ctx.stub.putState(tokenKey, Buffer.from(JSON.stringify(tokenData)));
        return JSON.stringify(tokenData);
    }

    async getResetToken(ctx, token) {
        const tokenKey = `RESET_${token}`;
        const tokenAsBytes = await ctx.stub.getState(tokenKey);
        if (!tokenAsBytes || tokenAsBytes.length === 0) {
            throw new Error('Token khong ton tai hoac da het han');
        }
        return tokenAsBytes.toString();
    }

    async updateUserPassword(ctx, username, newPassword) {
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.password = newPassword;
        user.updatedAt = new Date().toISOString();
        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        return JSON.stringify({ success: true });
    }

    async markResetTokenUsed(ctx, token) {
        const tokenKey = `RESET_${token}`;
        const tokenAsBytes = await ctx.stub.getState(tokenKey);
        if (!tokenAsBytes || tokenAsBytes.length === 0) {
            throw new Error('Token khong ton tai');
        }
        const tokenData = JSON.parse(tokenAsBytes.toString());
        tokenData.used = true;
        await ctx.stub.putState(tokenKey, Buffer.from(JSON.stringify(tokenData)));
        return JSON.stringify(tokenData);
    }

    // ============ REPORT HISTORY FUNCTIONS ============

    async saveReport(ctx, reportId, reportData) {
        const reportKey = `REPORT_${reportId}`;
        const report = {
            docType: 'report',
            reportId: reportId,
            ...JSON.parse(reportData),
            createdAt: new Date().toISOString()
        };
        await ctx.stub.putState(reportKey, Buffer.from(JSON.stringify(report)));
        return JSON.stringify(report);
    }

    async getReport(ctx, reportId) {
        const reportKey = `REPORT_${reportId}`;
        const reportAsBytes = await ctx.stub.getState(reportKey);
        if (!reportAsBytes || reportAsBytes.length === 0) {
            throw new Error(`Bao cao ${reportId} khong ton tai`);
        }
        return reportAsBytes.toString();
    }

    async getAllReports(ctx) {
        const startKey = 'REPORT_';
        const endKey = 'REPORT_\uffff';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }
}

module.exports = QLThuocTay;

