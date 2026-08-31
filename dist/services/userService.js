"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const users = new Map();
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
    async verifyKYC(userId, _biometricData, _documents) {
        const user = users.get(userId);
        if (!user) {
            throw new Error("User not found");
        }
        // In production, integrate with biometric KYC provider SDK
        // For now, simulate verification
        user.kyc_level = "verified";
        user.kyc_status = "verified";
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