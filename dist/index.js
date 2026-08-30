"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const settle_1 = __importDefault(require("./routes/settle"));
const liquidity_1 = __importDefault(require("./routes/liquidity"));
const pg_1 = require("pg");
const redis_1 = require("redis");
const error_1 = __importDefault(require("./middleware/error"));
async function startServer() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
    app.use(express_1.default.json({ limit: "10kb" }));
    app.use("/v1/user", user_1.default);
    app.use("/v1/settle", settle_1.default);
    app.use("/v1/liquidity", liquidity_1.default);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    app.use(error_1.default);
    const port = process.env.PORT || 3000;
    // Database connection (optional for prototype)
    let pgPool = null;
    try {
        pgPool = new pg_1.Pool({
            host: process.env.POSTGRES_HOST || "localhost",
            port: Number(process.env.POSTGRES_PORT || 5432),
            database: process.env.POSTGRES_DB || "crpe",
            user: process.env.POSTGRES_USER || "crpe",
            password: process.env.POSTGRES_PASSWORD || "password",
        });
        await pgPool.connect();
        console.log("✅ Connected to PostgreSQL");
    }
    catch (err) {
        console.warn("⚠️ PostgreSQL connection failed, running without DB");
        pgPool = { connect: async () => { }, end: async () => { } };
    }
    // Redis connection (optional for prototype)
    let redis = null;
    try {
        redis = (0, redis_1.createClient)({
            socket: {
                host: process.env.REDIS_HOST || "localhost",
                port: Number(process.env.REDIS_PORT || 6379),
            },
        });
        await redis.connect();
        console.log("✀ Connected to Redis");
    }
    catch (err) {
        console.warn("⚠️ Redis connection failed, running without cache");
        redis = { connect: async () => { }, disconnect: async () => { }, on: () => { } };
    }
    // Make db and redis available to routes via request
    app.use((req, _res, next) => {
        req["pgPool"] = pgPool;
        req["redis"] = redis;
        next();
    });
    app.listen(port, () => {
        console.log(`🚀 CryPe backend running on http://localhost:${port}`);
    });
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map