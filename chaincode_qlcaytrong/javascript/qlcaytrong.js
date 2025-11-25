/*
 * Chaincode Quan Ly Cay Trong
 * Dua tren FabCar
 */
'use strict';

const { Contract } = require('fabric-contract-api');

class QLCayTrong extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Khoi Tao Du Lieu Cay Trong ===========');
        const caytrongs = [
            {
                maCay: 'CT001',
                tenCay: 'Cà phê Arabica',
                loaiCay: 'Cây công nghiệp',
                ngayTrong: '2020-01-15',
                giaiDoan: 'Trưởng thành',
                nangSuat: 2.5,
                dienTich: 1000,
                viTri: 'Đắk Lắk'
            },
            {
                maCay: 'CT002',
                tenCay: 'Cao su',
                loaiCay: 'Cây công nghiệp',
                ngayTrong: '2019-03-20',
                giaiDoan: 'Trưởng thành',
                nangSuat: 1.8,
                dienTich: 2000,
                viTri: 'Bình Phước'
            },
            {
                maCay: 'CT003',
                tenCay: 'Tiêu',
                loaiCay: 'Cây gia vị',
                ngayTrong: '2021-05-10',
                giaiDoan: 'Đang phát triển',
                nangSuat: 3.2,
                dienTich: 500,
                viTri: 'Gia Lai'
            },
            {
                maCay: 'CT004',
                tenCay: 'Điều',
                loaiCay: 'Cây công nghiệp',
                ngayTrong: '2020-08-25',
                giaiDoan: 'Trưởng thành',
                nangSuat: 1.5,
                dienTich: 1500,
                viTri: 'Đắk Nông'
            },
            {
                maCay: 'CT005',
                tenCay: 'Sầu riêng',
                loaiCay: 'Cây ăn quả',
                ngayTrong: '2022-02-14',
                giaiDoan: 'Đang phát triển',
                nangSuat: 4.0,
                dienTich: 800,
                viTri: 'Tiền Giang'
            }
        ];

        for (let i = 0; i < caytrongs.length; i++) {
            caytrongs[i].docType = 'caytrong';
            await ctx.stub.putState(caytrongs[i].maCay, Buffer.from(JSON.stringify(caytrongs[i])));
            console.info('Da them cay trong: ', caytrongs[i].maCay, ' - ', caytrongs[i].tenCay);
        }
        console.info('============= END : Khoi Tao Du Lieu Cay Trong ===========');
    }

    async queryCayTrong(ctx, maCay) {
        const caytrongAsBytes = await ctx.stub.getState(maCay);
        if (!caytrongAsBytes || caytrongAsBytes.length === 0) {
            throw new Error(`Cay trong ${maCay} khong ton tai`);
        }
        console.log(caytrongAsBytes.toString());
        return caytrongAsBytes.toString();
    }

    async createCayTrong(ctx, maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri) {
        console.info('============= START : Tao Cay Trong Moi ===========');
        // Kiem tra cay trong da ton tai chua
        const exists = await ctx.stub.getState(maCay);
        if (exists && exists.length > 0) {
            throw new Error(`Cay trong ${maCay} da ton tai`);
        }

        const caytrong = {
            docType: 'caytrong',
            maCay: maCay,
            tenCay: tenCay,
            loaiCay: loaiCay,
            ngayTrong: ngayTrong,
            giaiDoan: giaiDoan,
            nangSuat: parseFloat(nangSuat),
            dienTich: parseFloat(dienTich),
            viTri: viTri
        };

        await ctx.stub.putState(maCay, Buffer.from(JSON.stringify(caytrong)));
        console.info('============= END : Tao Cay Trong Moi ===========');
        return JSON.stringify(caytrong);
    }

    async queryAllCayTrong(ctx) {
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

    async updateCayTrong(ctx, maCay, tenCay, loaiCay, ngayTrong, giaiDoan, nangSuat, dienTich, viTri) {
        console.info('============= START : Cap Nhat Cay Trong ===========');
        const caytrongAsBytes = await ctx.stub.getState(maCay);
        if (!caytrongAsBytes || caytrongAsBytes.length === 0) {
            throw new Error(`Cay trong ${maCay} khong ton tai`);
        }

        const caytrong = JSON.parse(caytrongAsBytes.toString());
        caytrong.tenCay = tenCay;
        caytrong.loaiCay = loaiCay;
        caytrong.ngayTrong = ngayTrong;
        caytrong.giaiDoan = giaiDoan;
        caytrong.nangSuat = parseFloat(nangSuat);
        caytrong.dienTich = parseFloat(dienTich);
        caytrong.viTri = viTri;

        await ctx.stub.putState(maCay, Buffer.from(JSON.stringify(caytrong)));
        console.info('============= END : Cap Nhat Cay Trong ===========');
        return JSON.stringify(caytrong);
    }

    async deleteCayTrong(ctx, maCay) {
        console.info('============= START : Xoa Cay Trong ===========');
        const exists = await ctx.stub.getState(maCay);
        if (!exists || exists.length === 0) {
            throw new Error(`Cay trong ${maCay} khong ton tai`);
        }
        await ctx.stub.deleteState(maCay);
        console.info('============= END : Xoa Cay Trong ===========');
        return `Da xoa cay trong ${maCay}`;
    }

    async queryCayTrongByLoai(ctx, loaiCay) {
        console.info('============= START : Tim Cay Trong Theo Loai ===========');
        const allCayTrong = JSON.parse(await this.queryAllCayTrong(ctx));
        const result = allCayTrong.filter(item => item.Record.loaiCay === loaiCay);
        console.info(`Tim thay ${result.length} cay trong loai ${loaiCay}`);
        return JSON.stringify(result);
    }

    async queryCayTrongByGiaiDoan(ctx, giaiDoan) {
        console.info('============= START : Tim Cay Trong Theo Giai Doan ===========');
        const allCayTrong = JSON.parse(await this.queryAllCayTrong(ctx));
        const result = allCayTrong.filter(item => item.Record.giaiDoan === giaiDoan);
        console.info(`Tim thay ${result.length} cay trong giai doan ${giaiDoan}`);
        return JSON.stringify(result);
    }

    async changeGiaiDoanCayTrong(ctx, maCay, giaiDoanMoi) {
        console.info('============= START : Chuyen Giai Doan Cay Trong ===========');
        const caytrongAsBytes = await ctx.stub.getState(maCay);
        if (!caytrongAsBytes || caytrongAsBytes.length === 0) {
            throw new Error(`Cay trong ${maCay} khong ton tai`);
        }
        const caytrong = JSON.parse(caytrongAsBytes.toString());
        const giaiDoanCu = caytrong.giaiDoan;
        caytrong.giaiDoan = giaiDoanMoi;
        await ctx.stub.putState(maCay, Buffer.from(JSON.stringify(caytrong)));
        console.info(`Da chuyen cay trong ${maCay} tu giai doan ${giaiDoanCu} sang ${giaiDoanMoi}`);
        console.info('============= END : Chuyen Giai Doan Cay Trong ===========');
        return JSON.stringify(caytrong);
    }

    async updateNangSuat(ctx, maCay, nangSuatMoi) {
        console.info('============= START : Cap Nhat Nang Suat ===========');
        const caytrongAsBytes = await ctx.stub.getState(maCay);
        if (!caytrongAsBytes || caytrongAsBytes.length === 0) {
            throw new Error(`Cay trong ${maCay} khong ton tai`);
        }
        const caytrong = JSON.parse(caytrongAsBytes.toString());
        const nangSuatCu = caytrong.nangSuat;
        caytrong.nangSuat = parseFloat(nangSuatMoi);
        await ctx.stub.putState(maCay, Buffer.from(JSON.stringify(caytrong)));
        console.info(`Da cap nhat nang suat cay trong ${maCay} tu ${nangSuatCu} sang ${nangSuatMoi}`);
        console.info('============= END : Cap Nhat Nang Suat ===========');
        return JSON.stringify(caytrong);
    }

    // ============ USER MANAGEMENT FUNCTIONS ============
    
    async createUser(ctx, username, password, fullName, email, role) {
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
            role: role || 'user',
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

    async updateUser(ctx, username, fullName, email, role) {
        console.info('============= START : Cap Nhat User ===========');
        const userKey = `USER_${username}`;
        const userAsBytes = await ctx.stub.getState(userKey);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`User ${username} khong ton tai`);
        }

        const user = JSON.parse(userAsBytes.toString());
        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (role) user.role = role;
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
}

module.exports = QLCayTrong;

