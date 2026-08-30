import { Router, Request, Response } from "express";
import settleService from "../services/settlementService";

const router = Router();
const service = new settleService();

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const health = await service.checkLiquidityHealth();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;