"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settlementService_1 = __importDefault(require("../services/settlementService"));
const router = (0, express_1.Router)();
const service = new settlementService_1.default();
router.post("/quote", async (req, res) => {
    try {
        const { sourceAsset, amount, targetVpa } = req.body;
        if (!sourceAsset || !amount || !targetVpa) {
            return res.status(400).json({ error: "sourceAsset, amount, and targetVpa required" });
        }
        const quote = await service.getQuote(sourceAsset, amount, targetVpa);
        res.json(quote);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/execute", async (req, res) => {
    try {
        const { quoteId, signedPayload, idempotencyKey } = req.body;
        if (!quoteId || !signedPayload || !idempotencyKey) {
            return res.status(400).json({ error: "quoteId, signedPayload, and idempotencyKey required" });
        }
        const result = await service.executeSettlement(quoteId, signedPayload, idempotencyKey);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/status/:txId", async (req, res) => {
    try {
        const txId = req.params.txId;
        const status = await service.getTransactionStatus(txId);
        res.json(status);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=settle.js.map