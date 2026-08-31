export interface User {
    id: string;
    wallet_address: string;
    kyc_level: "pending" | "verified" | "rejected";
    kyc_status: "pending" | "verified" | "rejected";
    spending_limit: number;
    created_at: string;
}
export interface DashboardStats {
    totalUsers: number;
    verifiedUsers: number;
    pendingUsers: number;
    rejectedUsers: number;
    totalSpendingLimit: number;
    recentRegistrations: number;
}
export default class UserService {
    registerUser(walletAddress: string): Promise<User>;
    getUserByWallet(walletAddress: string): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    updateUser(userId: string, updates: Partial<Pick<User, "kyc_level" | "kyc_status" | "spending_limit">>): Promise<User>;
    deleteUser(userId: string): Promise<boolean>;
    getDashboardStats(): Promise<DashboardStats>;
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
