/*
 * Chaincode Quan Ly Ho So Can Bo
 * Dua tren FabCar
 */
'use strict';

const { Contract } = require('fabric-contract-api');

class QLHoSoCanBo extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Khoi Tao Du Lieu Ho So Can Bo ===========');
        const hosocanbos = [
            {
                maCanBo: 'CB001',
                hoTen: 'Nguyễn Văn An',
                ngaySinh: '1985-05-15',
                gioiTinh: 'Nam',
                chucVu: 'Trưởng phòng',
                phongBan: 'Phòng Nhân sự',
                ngayVaoLam: '2010-03-01',
                trinhDo: 'Đại học',
                luong: 15000000,
                diaChi: '123 Đường ABC, Quận 1, TP.HCM'
            },
            {
                maCanBo: 'CB002',
                hoTen: 'Trần Thị Bình',
                ngaySinh: '1990-08-20',
                gioiTinh: 'Nữ',
                chucVu: 'Nhân viên',
                phongBan: 'Phòng Kế toán',
                ngayVaoLam: '2015-06-15',
                trinhDo: 'Đại học',
                luong: 12000000,
                diaChi: '456 Đường XYZ, Quận 2, TP.HCM'
            },
            {
                maCanBo: 'CB003',
                hoTen: 'Lê Văn Cường',
                ngaySinh: '1988-12-10',
                gioiTinh: 'Nam',
                chucVu: 'Phó phòng',
                phongBan: 'Phòng Kỹ thuật',
                ngayVaoLam: '2012-09-01',
                trinhDo: 'Thạc sĩ',
                luong: 18000000,
                diaChi: '789 Đường DEF, Quận 3, TP.HCM'
            },
            {
                maCanBo: 'CB004',
                hoTen: 'Phạm Thị Dung',
                ngaySinh: '1992-03-25',
                gioiTinh: 'Nữ',
                chucVu: 'Nhân viên',
                phongBan: 'Phòng Marketing',
                ngayVaoLam: '2018-01-10',
                trinhDo: 'Đại học',
                luong: 11000000,
                diaChi: '321 Đường GHI, Quận 4, TP.HCM'
            },
            {
                maCanBo: 'CB005',
                hoTen: 'Hoàng Văn Em',
                ngaySinh: '1987-07-30',
                gioiTinh: 'Nam',
                chucVu: 'Trưởng phòng',
                phongBan: 'Phòng Kinh doanh',
                ngayVaoLam: '2011-05-20',
                trinhDo: 'Thạc sĩ',
                luong: 20000000,
                diaChi: '654 Đường JKL, Quận 5, TP.HCM'
            }
        ];

        for (let i = 0; i < hosocanbos.length; i++) {
            hosocanbos[i].docType = 'hosocanbo';
            await ctx.stub.putState(hosocanbos[i].maCanBo, Buffer.from(JSON.stringify(hosocanbos[i])));
            console.info('Da them ho so can bo: ', hosocanbos[i].maCanBo, ' - ', hosocanbos[i].hoTen);
        }
        console.info('============= END : Khoi Tao Du Lieu Ho So Can Bo ===========');
    }

    async queryHoSoCanBo(ctx, maCanBo) {
        const hosocanboAsBytes = await ctx.stub.getState(maCanBo);
        if (!hosocanboAsBytes || hosocanboAsBytes.length === 0) {
            throw new Error(`Ho so can bo ${maCanBo} khong ton tai`);
        }
        console.log(hosocanboAsBytes.toString());
        return hosocanboAsBytes.toString();
    }

    async createHoSoCanBo(ctx, maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi) {
        console.info('============= START : Tao Ho So Can Bo Moi ===========');
        // Kiem tra ho so can bo da ton tai chua
        const exists = await ctx.stub.getState(maCanBo);
        if (exists && exists.length > 0) {
            throw new Error(`Ho so can bo ${maCanBo} da ton tai`);
        }

        const hosocanbo = {
            docType: 'hosocanbo',
            maCanBo: maCanBo,
            hoTen: hoTen,
            ngaySinh: ngaySinh,
            gioiTinh: gioiTinh,
            chucVu: chucVu,
            phongBan: phongBan,
            ngayVaoLam: ngayVaoLam,
            trinhDo: trinhDo,
            luong: parseFloat(luong),
            diaChi: diaChi
        };

        await ctx.stub.putState(maCanBo, Buffer.from(JSON.stringify(hosocanbo)));
        console.info('============= END : Tao Ho So Can Bo Moi ===========');
        return JSON.stringify(hosocanbo);
    }

    async queryAllHoSoCanBo(ctx) {
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

    async updateHoSoCanBo(ctx, maCanBo, hoTen, ngaySinh, gioiTinh, chucVu, phongBan, ngayVaoLam, trinhDo, luong, diaChi) {
        console.info('============= START : Cap Nhat Ho So Can Bo ===========');
        const hosocanboAsBytes = await ctx.stub.getState(maCanBo);
        if (!hosocanboAsBytes || hosocanboAsBytes.length === 0) {
            throw new Error(`Ho so can bo ${maCanBo} khong ton tai`);
        }

        const hosocanbo = JSON.parse(hosocanboAsBytes.toString());
        hosocanbo.hoTen = hoTen;
        hosocanbo.ngaySinh = ngaySinh;
        hosocanbo.gioiTinh = gioiTinh;
        hosocanbo.chucVu = chucVu;
        hosocanbo.phongBan = phongBan;
        hosocanbo.ngayVaoLam = ngayVaoLam;
        hosocanbo.trinhDo = trinhDo;
        hosocanbo.luong = parseFloat(luong);
        hosocanbo.diaChi = diaChi;

        await ctx.stub.putState(maCanBo, Buffer.from(JSON.stringify(hosocanbo)));
        console.info('============= END : Cap Nhat Ho So Can Bo ===========');
        return JSON.stringify(hosocanbo);
    }

    async deleteHoSoCanBo(ctx, maCanBo) {
        console.info('============= START : Xoa Ho So Can Bo ===========');
        const exists = await ctx.stub.getState(maCanBo);
        if (!exists || exists.length === 0) {
            throw new Error(`Ho so can bo ${maCanBo} khong ton tai`);
        }
        await ctx.stub.deleteState(maCanBo);
        console.info('============= END : Xoa Ho So Can Bo ===========');
        return `Da xoa ho so can bo ${maCanBo}`;
    }

    async queryHoSoCanBoByPhongBan(ctx, phongBan) {
        console.info('============= START : Tim Ho So Can Bo Theo Phong Ban ===========');
        const allHoSoCanBo = JSON.parse(await this.queryAllHoSoCanBo(ctx));
        const result = allHoSoCanBo.filter(item => item.Record.phongBan === phongBan);
        console.info(`Tim thay ${result.length} ho so can bo phong ban ${phongBan}`);
        return JSON.stringify(result);
    }

    async queryHoSoCanBoByChucVu(ctx, chucVu) {
        console.info('============= START : Tim Ho So Can Bo Theo Chuc Vu ===========');
        const allHoSoCanBo = JSON.parse(await this.queryAllHoSoCanBo(ctx));
        const result = allHoSoCanBo.filter(item => item.Record.chucVu === chucVu);
        console.info(`Tim thay ${result.length} ho so can bo chuc vu ${chucVu}`);
        return JSON.stringify(result);
    }

    async changeChucVu(ctx, maCanBo, chucVuMoi) {
        console.info('============= START : Thay Doi Chuc Vu Can Bo ===========');
        const hosocanboAsBytes = await ctx.stub.getState(maCanBo);
        if (!hosocanboAsBytes || hosocanboAsBytes.length === 0) {
            throw new Error(`Ho so can bo ${maCanBo} khong ton tai`);
        }
        const hosocanbo = JSON.parse(hosocanboAsBytes.toString());
        const chucVuCu = hosocanbo.chucVu;
        hosocanbo.chucVu = chucVuMoi;
        await ctx.stub.putState(maCanBo, Buffer.from(JSON.stringify(hosocanbo)));
        console.info(`Da thay doi chuc vu can bo ${maCanBo} tu ${chucVuCu} sang ${chucVuMoi}`);
        console.info('============= END : Thay Doi Chuc Vu Can Bo ===========');
        return JSON.stringify(hosocanbo);
    }

    async updateLuong(ctx, maCanBo, luongMoi) {
        console.info('============= START : Cap Nhat Luong Can Bo ===========');
        const hosocanboAsBytes = await ctx.stub.getState(maCanBo);
        if (!hosocanboAsBytes || hosocanboAsBytes.length === 0) {
            throw new Error(`Ho so can bo ${maCanBo} khong ton tai`);
        }
        const hosocanbo = JSON.parse(hosocanboAsBytes.toString());
        const luongCu = hosocanbo.luong;
        hosocanbo.luong = parseFloat(luongMoi);
        await ctx.stub.putState(maCanBo, Buffer.from(JSON.stringify(hosocanbo)));
        console.info(`Da cap nhat luong can bo ${maCanBo} tu ${luongCu} sang ${luongMoi}`);
        console.info('============= END : Cap Nhat Luong Can Bo ===========');
        return JSON.stringify(hosocanbo);
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
            password: password, // Trong thuc te nen hash password
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
            // Khong tra ve password
            if (record.password) {
                delete record.password;
            }
            allResults.push({ Key: key, Record: record });
        }
        return JSON.stringify(allResults);
    }

    async updateUser(ctx, username, newFullName, newEmail, newRole, newIsActive) {
        console.info('============= START : Cap Nhat User ===========');
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }

        const user = JSON.parse(userAsBytes.toString());
        if (newFullName) user.fullName = newFullName;
        if (newEmail) user.email = newEmail;
        if (newRole !== undefined && newRole !== null) user.role = newRole;
        if (newIsActive !== undefined && newIsActive !== null) user.isActive = newIsActive === 'true' || newIsActive === true;
        user.updatedAt = new Date().toISOString();

        await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
        console.info(`Da cap nhat user: ${username}`);
        console.info('============= END : Cap Nhat User ===========');
        // Khong tra ve password
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
        // Khong tra ve password
        delete user.password;
        return JSON.stringify(user);
    }

    // ============ SEARCH & FILTER FUNCTIONS ============

    async searchHoSoCanBo(ctx, searchTerm) {
        console.info('============= START : Tim Kiem Ho So Can Bo ===========');
        const allHoSoCanBo = JSON.parse(await this.queryAllHoSoCanBo(ctx));
        const term = searchTerm.toLowerCase();
        const result = allHoSoCanBo.filter(item => {
            const record = item.Record;
            return record.hoTen.toLowerCase().includes(term) ||
                   record.maCanBo.toLowerCase().includes(term) ||
                   record.phongBan.toLowerCase().includes(term) ||
                   record.chucVu.toLowerCase().includes(term) ||
                   record.trinhDo.toLowerCase().includes(term);
        });
        console.info(`Tim thay ${result.length} ket qua cho "${searchTerm}"`);
        return JSON.stringify(result);
    }

    async filterHoSoCanBo(ctx, phongBan, chucVu, trinhDo) {
        console.info('============= START : Loc Ho So Can Bo ===========');
        const allHoSoCanBo = JSON.parse(await this.queryAllHoSoCanBo(ctx));
        const result = allHoSoCanBo.filter(item => {
            const record = item.Record;
            const matchPhongBan = !phongBan || record.phongBan === phongBan;
            const matchChucVu = !chucVu || record.chucVu === chucVu;
            const matchTrinhDo = !trinhDo || record.trinhDo === trinhDo;
            return matchPhongBan && matchChucVu && matchTrinhDo;
        });
        console.info(`Tim thay ${result.length} ket qua`);
        return JSON.stringify(result);
    }

    // ============ RESET PASSWORD FUNCTIONS ============

    async createResetToken(ctx, username, token, expiresAt) {
        console.info('============= START : Tao Reset Token ===========');
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
        console.info(`Da tao reset token cho user: ${username}`);
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

    // ============ EMAIL/PHONE VERIFICATION FUNCTIONS ============

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

module.exports = QLHoSoCanBo;

