export interface User {
    id: string;
    wallet_address: string;
    kyc_level: "pending" | "verified" | "rejected";
    kyc_status: "pending" | "verified" | "rejected";
    spending_limit: number;
    created_at: string;
}
export default class UserService {
    registerUser(walletAddress: string): Promise<User>;
    getUserByWallet(walletAddress: string): Promise<User | null>;
    verifyKYC(userId: string, _biometricData?: any, _documents?: any): Promise<{
        kyc_level: string;
        kyc_status: string;
        limits: {
            max: number;
        };
    }>;
    getUserStatus(userId: string): Promise<{
        kyc_level: string;
        kyc_status: string;
        spending_limit: number;
        wallet_address: string;
    }>;
}
