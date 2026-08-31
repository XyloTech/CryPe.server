import "dotenv/config";
import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import { createClient } from "redis";
import app from "./app";

async function startServer() {
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
  } catch (_err) {
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
    console.log("✅ Connected to Redis");
  } catch (_err) {
    console.warn("⚠️ Redis connection failed, running without cache");
    redis = { connect: async () => {}, disconnect: async () => {}, on: () => {} };
  }

  // Make db and redis available to routes via request
  app.use((req: Request, _res: Response, next: NextFunction) => {
    (req as any)["pgPool"] = pgPool;
    (req as any)["redis"] = redis;
    next();
  });

  app.listen(port, () => {
    console.log(`🚀 CryPe backend running on http://localhost:${port}`);
  });
}

startServer().catch(console.error);
