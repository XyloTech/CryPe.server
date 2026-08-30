import { Router, Request, Response } from "express";
import settleService from "../services/settlementService";

const router = Router();
const service = new settleService();

router.post("/quote", async (req: Request, res: Response) => {
  try {
    const { sourceAsset, amount, targetVpa } = req.body;
    if (!sourceAsset || !amount || !targetVpa) {
      return res.status(400).json({ error: "sourceAsset, amount, and targetVpa required" });
    }
    const quote = await service.getQuote(sourceAsset, amount, targetVpa);
    res.json(quote);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/execute", async (req: Request, res: Response) => {
  try {
    const { quoteId, signedPayload, idempotencyKey } = req.body;
    if (!quoteId || !signedPayload || !idempotencyKey) {
      return res.status(400).json({ error: "quoteId, signedPayload, and idempotencyKey required" });
    }
    const result = await service.executeSettlement(quoteId, signedPayload, idempotencyKey);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:txId", async (req: Request, res: Response) => {
  try {
    const txId = req.params.txId as string;
    const status = await service.getTransactionStatus(txId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;