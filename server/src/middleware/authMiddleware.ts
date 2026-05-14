import type { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (req.session && req.session.userId) {
    try {
      (req as any).user = await User.findById(req.session.userId).select("-password");
      
      if (!(req as any).user) {
        res.status(401).json({ message: "Not authorized, user not found" });
        return;
      }

      return next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, session failed" });
      return;
    }
  } else {
    res.status(401).json({ message: "Not authorized, no session" });
    return;
  }
};

export const admin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if ((req as any).user && (req as any).user.role === "admin") {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};
