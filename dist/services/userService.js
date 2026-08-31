"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const users = new Map();
// Seed initial demo data if empty to showcase in UI immediately if needed
function seedInitialData() {
    if (users.size === 0) {
        const demoUsers = [
            {
                id: "demo-usr-001",
                wallet_address: "0x4c4cbff8c45e131ab8f2af5f04b3a162078727c7",
                kyc_level: "verified",
                kyc_status: "verified",
                spending_limit: 50000,
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
                id: "demo-usr-002",
                wallet_address: "0x71C8fb43E3cedX98e5B14B6002f23F35B91176b6",
                kyc_level: "pending",
                kyc_status: "pending",
                spending_limit: 1000,
                created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            },
            {
                id: "demo-usr-003",
                wallet_address: "0x129B35C15FEdaA0cf114aE7D63C9993309a47395",
                kyc_level: "verified",
                kyc_status: "verified",
                spending_limit: 25000,
                created_at: new Date(Date.now() - 86400000).toISOString(),
            }
        ];
        for (const u of demoUsers) {
            users.set(u.id, u);
        }
    }
}
seedInitialData();
class UserService {
    async registerUser(walletAddress) {
        const normalizedAddress = walletAddress.toLowerCase();
        for (const user of users.values()) {
            if (user.wallet_address.toLowerCase() === normalizedAddress) {
                return user;
            }
        }
        const id = (0, uuid_1.v4)();
        const user = {
            id,
            wallet_address: walletAddress,
            kyc_level: "pending",
            kyc_status: "pending",
            spending_limit: 1000,
            created_at: new Date().toISOString(),
        };
        users.set(id, user);
        return user;
    }
    async getUserByWallet(walletAddress) {
        const normalizedAddress = walletAddress.toLowerCase();
        for (const user of users.values()) {
            if (user.wallet_address.toLowerCase() === normalizedAddress) {
                return user;
            }
        }
        return null;
    }
    async getAllUsers() {
        return Array.from(users.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    async updateUser(userId, updates) {
        const user = users.get(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (updates.kyc_level !== undefined)
            user.kyc_level = updates.kyc_level;
        if (updates.kyc_status !== undefined)
            user.kyc_status = updates.kyc_status;
        if (updates.spending_limit !== undefined)
            user.spending_limit = Number(updates.spending_limit);
        users.set(userId, user);
        return user;
    }
    async deleteUser(userId) {
        return users.delete(userId);
    }
    async getDashboardStats() {
        const allUsers = Array.from(users.values());
        const oneDayAgo = Date.now() - 24 * 3600 * 1000;
        let verified = 0;
        let pending = 0;
        let rejected = 0;
        let totalLimit = 0;
        let recent = 0;
        for (const u of allUsers) {
            if (u.kyc_status === "verified")
                verified++;
            else if (u.kyc_status === "rejected")
                rejected++;
            else
                pending++;
            totalLimit += u.spending_limit || 0;
            if (new Date(u.created_at).getTime() > oneDayAgo) {
                recent++;
            }
        }
        return {
            totalUsers: allUsers.length,
            verifiedUsers: verified,
            pendingUsers: pending,
            rejectedUsers: rejected,
            totalSpendingLimit: totalLimit,
            recentRegistrations: recent,
        };
    }
    async verifyKYC(userId, _biometricData, _documents) {
        const user = users.get(userId);
        if (!user) {
            throw new Error("User not found");
        }
        user.kyc_level = "verified";
        user.kyc_status = "verified";
        user.spending_limit = 50000;
        return {
            kyc_level: "verified",
            kyc_status: "verified",
            limits: { max: 50000 },
        };
    }
    async getUserStatus(userId) {
        const user = users.get(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return {
            kyc_level: user.kyc_level,
            kyc_status: user.kyc_status,
            spending_limit: user.spending_limit,
            wallet_address: user.wallet_address,
        };
    }
}
exports.default = UserService;
//# sourceMappingURL=userService.js.map