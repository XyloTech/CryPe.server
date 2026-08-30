"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const settle_1 = __importDefault(require("./routes/settle"));
const liquidity_1 = __importDefault(require("./routes/liquidity"));
const error_1 = __importDefault(require("./middleware/error"));
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
exports.default = app;
//# sourceMappingURL=app.js.map