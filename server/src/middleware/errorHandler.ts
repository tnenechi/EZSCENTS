import type { Request, Response, NextFunction } from "express";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Express 5 forwards rejected promises from async route handlers here automatically,
// so this catches uncaught async errors even in controllers without their own try/catch.
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  console.error(err);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
