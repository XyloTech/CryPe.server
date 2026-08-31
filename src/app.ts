import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import userRoutes from "./routes/user";
import walletRoutes from "./routes/wallet";
import settleRoutes from "./routes/settle";
import liquidityRoutes from "./routes/liquidity";
import errorMiddleware from "./middleware/error";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "10kb" }));

const publicPath = path.resolve(process.cwd(), "public");
app.use(express.static(publicPath));

app.use("/v1/user", userRoutes);
app.use("/v1/wallet", walletRoutes);
app.use("/v1/settle", settleRoutes);
app.use("/v1/liquidity", liquidityRoutes);

app.get(["/", "/dashboard"], (_req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorMiddleware);

export default app;