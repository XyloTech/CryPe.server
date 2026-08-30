import { Request, Response, NextFunction } from "express";

const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Error:", err.message);
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
};

export default errorMiddleware;