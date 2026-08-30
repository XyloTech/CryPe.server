import { v4 as uuidv4 } from "uuid";

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

interface SettledResult {
  txId: string;
  status: "pending" | "executed" | "failed";
  upiReference: string;
  quoteId: string;
}

const quotes: Map<string, Quote> = new Map();
const settlements: Map<string, SettledResult> = new Map();

export default class SettlementService {
  async getQuote(sourceAsset: string, amount: string, targetVpa: string): Promise<Quote> {
    const quoteId = uuidv4();
    const exchangeRate = this.simulateExchangeRate(sourceAsset);
    const fees = this.calculateFees(amount, exchangeRate);
    const estimatedTime = "2.5s";

    const quote: Quote = {
      quoteId,
      sourceAsset,
      amount,
      targetVpa,
      exchangeRate,
      fees,
      estimatedTime,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    quotes.set(quoteId, quote);
    return quote;
  }

  private simulateExchangeRate(asset: string): string {
    const rates: Record<string, string> = {
      USDC: "83.50",
      USDT: "83.45",
      DAI: "83.48",
    };
    return rates[asset] || "83.00";
  }

  private calculateFees(amount: string, rate: string): string {
    const amountNum = parseFloat(amount);
    const fee = Math.max(amountNum * parseFloat(rate), 1).toFixed(2);
    return fee;
  }

  async executeSettlement(
    quoteId: string,
    _signedPayload: any,
    idempotencyKey: string
  ): Promise<{
    txId: string;
    status: "pending" | "executed" | "failed";
    upiReference: string;
    quoteId: string;
  }> {
    // Check idempotency - prevent double-spending
    const existing = settlements.get(idempotencyKey);
    if (existing) {
      return {
        txId: existing.txId,
        status: existing.status,
        upiReference: existing.upiReference ?? `UPI-${uuidv4().slice(0, 8)}`,
        quoteId: existing.quoteId,
      };
    }

    const quote = quotes.get(quoteId);
    if (!quote) {
      throw new Error("Invalid quote ID");
    }
    if (quote.status !== "pending") {
      throw new Error("Quote already processed");
    }

    // Mark quote as executed
    quote.status = "executed";

    // Generate settlement transaction
    const txId = uuidv4();
    const upiReference = `UPI${uuidv4().slice(0, 12)}`;

    // Simulate parallel execution: DEX swap + UPI payout
    const result: SettledResult = {
      txId,
      status: "executed",
      upiReference,
      quoteId,
    };

    settlements.set(idempotencyKey, result);

    return {
      txId,
      status: "executed",
      upiReference,
      quoteId,
    };
  }

  async getTransactionStatus(txId: string): Promise<{
    txId: string;
    status: "pending" | "executed" | "failed";
    upiReference?: string;
  }> {
    // Search by txId in settlements
    for (const [_key, value] of settlements.entries()) {
      if (value.txId === txId) {
        return {
          txId: value.txId,
          status: value.status,
          upiReference: value.upiReference,
        };
      }
    }
    // Also check quotes
    for (const [, quote] of quotes.entries()) {
      if (quote.quoteId === txId) {
        return {
          txId: quote.quoteId,
          status: quote.status,
        };
      }
    }
    throw new Error("Transaction not found");
  }

  async checkLiquidityHealth(): Promise<{
    pools: Array<{ name: string; health: string; tvl: string }>;
    overall: string;
  }> {
    const pools = [
      { name: "Polygon-USDC", health: "healthy", tvl: "$12.5M" },
      { name: "Arbitrum-USDT", health: "healthy", tvl: "$8.3M" },
      { name: "ETH-INR OTC", health: "caution", tvl: "$4.2M" },
    ];

    const healthyCount = pools.filter((p) => p.health === "healthy").length;
    const overall = healthyCount === pools.length ? "healthy" : "caution";

    return { pools, overall };
  }
}