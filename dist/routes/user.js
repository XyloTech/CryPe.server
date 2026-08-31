"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = __importDefault(require("../services/userService"));
const router = (0, express_1.Router)();
const service = new userService_1.default();
// Dashboard list endpoint: Returns all users + summary statistics
router.get("/list", async (_req, res) => {
    try {
        const [users, stats] = await Promise.all([
            service.getAllUsers(),
            service.getDashboardStats(),
        ]);
        res.json({ users, stats });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Dashboard stats endpoint
router.get("/stats", async (_req, res) => {
    try {
        const stats = await service.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Standard register
router.post("/register", async (req, res) => {
    try {
        const { walletAddress, address } = req.body;
        const targetAddress = walletAddress || address;
        if (!targetAddress) {
            return res.status(400).json({ error: "Wallet address required" });
        }
        const user = await service.registerUser(targetAddress);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Wallet register compatibility endpoint
router.post("/wallet/register", async (req, res) => {
    try {
        const { address, walletAddress, chainId, method, timestamp } = req.body;
        const targetAddress = address || walletAddress;
        if (!targetAddress) {
            return res.status(400).json({ error: "Wallet address required" });
        }
        const user = await service.registerUser(targetAddress);
        res.json({
            success: true,
            userId: user.id,
            walletAddress: user.wallet_address,
            address: user.wallet_address,
            kycLevel: user.kyc_level,
            kycStatus: user.kyc_status,
            spendingLimit: user.spending_limit,
            chainId,
            method,
            timestamp,
            user,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// KYC Verification
router.post("/kyc/verify", async (req, res) => {
    try {
        const { userId, biometricData, documents } = req.body;
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }
        const result = await service.verifyKYC(userId, biometricData, documents);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get user status
router.get("/status/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const status = await service.getUserStatus(userId);
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update user from Dashboard (KYC status, spending limit)
router.patch("/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const { kyc_level, kyc_status, spending_limit } = req.body;
        const updated = await service.updateUser(userId, {
            kyc_level,
            kyc_status,
            spending_limit,
        });
        res.json({ success: true, user: updated });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete user from Dashboard
router.delete("/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const deleted = await service.deleteUser(userId);
        res.json({ success: deleted });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map