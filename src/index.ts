import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import express, { Request, NextFunction } from "express";
import userRoutes from "./routes/user";
import settleRoutes from "./routes/settle";
import liquidityRoutes from "./routes/liquidity";
import { Pool } from "pg";
import { createClient } from "redis";
import errorMiddleware from "./middleware/error";

async function startServer() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" })
  );
  app.use(express.json({ limit: "10kb" }));

  app.use("/v1/user", userRoutes);
  app.use("/v1/settle", settleRoutes);
  app.use("/v1/liquidity", liquidityRoutes);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(errorMiddleware);

  const port = process.env.PORT || 3000;

  // Database connection (optional for prototype)
  let pgPool: any = null;
  try {
    pgPool = new Pool({
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number(process.env.POSTGRES_PORT || 5432),
      database: process.env.POSTGRES_DB || "crpe",
      user: process.env.POSTGRES_USER || "crpe",
      password: process.env.POSTGRES_PASSWORD || "password",
    });
    await pgPool.connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.warn("⚠️ PostgreSQL connection failed, running without DB");
    pgPool = { connect: async () => {}, end: async () => {} };
  }

  // Redis connection (optional for prototype)
  let redis: any = null;
  try {
    redis = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT || 6379),
      },
    });
    await redis.connect();
    console.log("✀ Connected to Redis");
  } catch (err) {
    console.warn("⚠️ Redis connection failed, running without cache");
    redis = { connect: async () => {}, disconnect: async () => {}, on: () => {} };
  }

  // Make db and redis available to routes via request
  app.use((req: Request, _res, next: NextFunction) => {
    (req as any)["pgPool"] = pgPool;
    (req as any)["redis"] = redis;
    next();
  });

  app.listen(port, () => {
    console.log(`🚀 CryPe backend running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);