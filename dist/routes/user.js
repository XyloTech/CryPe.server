"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = __importDefault(require("../services/userService"));
const router = (0, express_1.Router)();
const service = new userService_1.default();
router.post("/register", async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) {
            return res.status(400).json({ error: "Wallet address required" });
        }
        const user = await service.registerUser(walletAddress);
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
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
exports.default = router;
//# sourceMappingURL=user.js.map