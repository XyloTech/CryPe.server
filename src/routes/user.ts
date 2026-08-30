import { Router, Request, Response } from "express";
import userService from "../services/userService";

const router = Router();
const service = new userService();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address required" });
    }
    const user = await service.registerUser(walletAddress);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/kyc/verify", async (req: Request, res: Response) => {
  try {
    const { userId, biometricData, documents } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }
    const result = await service.verifyKYC(userId, biometricData, documents);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const status = await service.getUserStatus(userId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;