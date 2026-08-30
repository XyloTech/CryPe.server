interface Quote {
    quoteId: string;
    sourceAsset: string;
    amount: string;
    targetVpa: string;
    exchangeRate: string;
    fees: string;
    estimatedTime: string;
    status: "pending" | "executed" | "failed";
    createdAt: string;
}
export default class SettlementService {
    getQuote(sourceAsset: string, amount: string, targetVpa: string): Promise<Quote>;
    private simulateExchangeRate;
    private calculateFees;
    executeSettlement(quoteId: string, _signedPayload: any, idempotencyKey: string): Promise<{
        txId: string;
        status: "pending" | "executed" | "failed";
        upiReference: string;
        quoteId: string;
    }>;
    getTransactionStatus(txId: string): Promise<{
        txId: string;
        status: "pending" | "executed" | "failed";
        upiReference?: string;
    }>;
    checkLiquidityHealth(): Promise<{
        pools: Array<{
            name: string;
            health: string;
            tvl: string;
        }>;
        overall: string;
    }>;
}
export {};
