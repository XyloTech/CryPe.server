import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import settleRoutes from "./routes/settle";
import liquidityRoutes from "./routes/liquidity";
import errorMiddleware from "./middleware/error";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "10kb" }));

app.use("/v1/user", userRoutes);
app.use("/v1/wallet", walletRoutes);
app.use("/v1/settle", settleRoutes);
app.use("/v1/liquidity", liquidityRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

export default app;