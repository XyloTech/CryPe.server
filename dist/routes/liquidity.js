"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settlementService_1 = __importDefault(require("../services/settlementService"));
const router = (0, express_1.Router)();
const service = new settlementService_1.default();
router.get("/health", async (_req, res) => {
    try {
        const health = await service.checkLiquidityHealth();
        res.json(health);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=liquidity.js.map