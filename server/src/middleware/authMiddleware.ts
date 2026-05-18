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
        console.warn(`[Auth] User not found for ID: ${req.session.userId}`);
        res.status(401).json({ message: "Not authorized, user not found" });
        return;
      }

      return next();
    } catch (error) {
      console.error("[Auth] Session failure:", error);
      res.status(401).json({ message: "Not authorized, session failed" });
      return;
    }
  } else {
    console.warn(`[Auth] No session or userId. req.session exists: ${!!req.session}, userId exists: ${!!req.session?.userId}`);
    res.status(401).json({ message: "Not authorized, no session" });
    return;
  }
};

export const tryProtect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  if (req.session && req.session.userId) {
    try {
      (req as any).user = await User.findById(req.session.userId).select("-password");
    } catch (error) {
      console.error("Optional auth failed:", error);
    }
  }
  next();
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
