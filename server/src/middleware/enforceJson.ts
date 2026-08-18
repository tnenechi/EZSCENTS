import type { Request, Response, NextFunction } from "express";

// PUT/PATCH/DELETE are never "simple" cross-origin requests (the Fetch/CORS
// spec only treats GET/HEAD/POST as simple methods) and an HTML <form> can't
// issue them at all, so they're already forced through a CORS preflight that
// the `cors` origin allowlist blocks for foreign sites. POST is the one
// method a plain cross-site <form> CAN submit, and if its content type is one
// of the "simple" ones (`application/x-www-form-urlencoded`,
// `multipart/form-data`, `text/plain`) the browser skips preflight entirely —
// and this API's `express.urlencoded` parser would happily accept it,
// cookie and all, since `sameSite: "none"` is required for the cross-origin
// client/API split. Every legitimate client request is JSON, so rejecting
// non-JSON POST bodies forces a preflight (and CORS rejection for foreign
// origins) before any such request is ever processed — closing that CSRF
// path without needing tokens.
export const enforceJson = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "POST") {
    next();
    return;
  }

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    res.status(415).json({ message: "Content-Type must be application/json" });
    return;
  }

  next();
};
