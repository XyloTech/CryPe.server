"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const wallet_1 = __importDefault(require("./routes/wallet"));
const settle_1 = __importDefault(require("./routes/settle"));
const liquidity_1 = __importDefault(require("./routes/liquidity"));
const error_1 = __importDefault(require("./middleware/error"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express_1.default.json({ limit: "10kb" }));
const publicPath = path_1.default.resolve(process.cwd(), "public");
app.use(express_1.default.static(publicPath));
app.use("/v1/user", user_1.default);
app.use("/v1/wallet", wallet_1.default);
app.use("/v1/settle", settle_1.default);
app.use("/v1/liquidity", liquidity_1.default);
app.get(["/", "/dashboard"], (_req, res) => {
    res.sendFile(path_1.default.join(publicPath, "index.html"));
});
app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.use(error_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map