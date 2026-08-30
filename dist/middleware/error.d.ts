import { Request, Response, NextFunction } from "express";
declare const errorMiddleware: (err: any, _req: Request, res: Response, _next: NextFunction) => void;
export default errorMiddleware;
