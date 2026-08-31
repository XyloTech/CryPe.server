import { Router, Request, Response } from "express";
import userService from "../services/userService";

const router = Router();
const service = new userService();

router.post("/register", async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/status/:address", async (req: Request, res: Response) => {
  try {
    const address = req.params.address as string;
    const user = await service.getUserByWallet(address);
    if (!user) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
