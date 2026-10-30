import { Request, Response, NextFunction } from "express";

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export function tryCatch(handler: AsyncHandler): AsyncHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
