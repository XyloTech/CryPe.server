import { v4 as uuidv4 } from "uuid";

export interface User {
  id: string;
  wallet_address: string;
  kyc_level: "pending" | "verified" | "rejected";
  kyc_status: "pending" | "verified" | "rejected";
  spending_limit: number;
  created_at: string;
}

const users: Map<string, User> = new Map();

export default class UserService {
  async registerUser(walletAddress: string): Promise<User> {
    const normalizedAddress = walletAddress.toLowerCase();
    for (const user of users.values()) {
      if (user.wallet_address.toLowerCase() === normalizedAddress) {
        return user;
      }
    }

    const id = uuidv4();
    const user: User = {
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

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const normalizedAddress = walletAddress.toLowerCase();
    for (const user of users.values()) {
      if (user.wallet_address.toLowerCase() === normalizedAddress) {
        return user;
      }
    }
    return null;
  }

  async verifyKYC(
    userId: string,
    _biometricData?: any,
    _documents?: any
  ): Promise<{ kyc_level: string; kyc_status: string; limits: { max: number } }> {
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

  async getUserStatus(userId: string): Promise<{
    kyc_level: string;
    kyc_status: string;
    spending_limit: number;
    wallet_address: string;
  }> {
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