import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validateBody =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Invalid request data",
        errors: result.error.flatten(),
      });
      return;
    }
    req.body = result.data;
    next();
  };
