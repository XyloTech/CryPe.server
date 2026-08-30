"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorMiddleware = (err, _req, res, _next) => {
    console.error("Error:", err.message);
    const status = err.statusCode || 500;
    res.status(status).json({ error: err.message || "Internal Server Error" });
};
exports.default = errorMiddleware;
//# sourceMappingURL=error.js.map