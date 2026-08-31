"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const redis_1 = require("redis");
const app_1 = __importDefault(require("./app"));
async function startServer() {
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
    catch (_err) {
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
        console.log("✅ Connected to Redis");
    }
    catch (_err) {
        console.warn("⚠️ Redis connection failed, running without cache");
        redis = { connect: async () => { }, disconnect: async () => { }, on: () => { } };
    }
    // Make db and redis available to routes via request
    app_1.default.use((req, _res, next) => {
        req["pgPool"] = pgPool;
        req["redis"] = redis;
        next();
    });
    app_1.default.listen(port, () => {
        console.log(`🚀 CryPe backend running on http://localhost:${port}`);
    });
}
startServer().catch(console.error);
//# sourceMappingURL=index.js.map