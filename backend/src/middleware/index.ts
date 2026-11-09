import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodSchema } from "zod";
import { env } from "../config/env";

export interface AuthUser { id: string; role: "student" | "recruiter" | "admin" }

export const ah =
  (fn: (req: any, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

export const signToken = (u: AuthUser) => jwt.sign(u, env.jwtSecret, { expiresIn: "7d" });
export const verifyToken = (token: string): AuthUser => jwt.verify(token, env.jwtSecret) as AuthUser;

export const requireAuth: RequestHandler = (req, res, next) => {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return void res.status(401).json({ error: "Authentication required" });
  try {
    (req as any).user = verifyToken(h.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole =
  (...roles: AuthUser["role"][]): RequestHandler =>
  (req, res, next) => {
    const u = (req as any).user as AuthUser | undefined;
    if (!u || !roles.includes(u.role)) return void res.status(403).json({ error: "You do not have access to this resource" });
    next();
  };

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      return void res.status(400).json({
        error: "Validation failed",
        details: r.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      });
    }
    req.body = r.data;
    next();
  };

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.code === 11000) return void res.status(409).json({ error: "Already exists" });
  if (err?.name === "CastError") return void res.status(400).json({ error: "Invalid id" });
  if (err?.name === "MulterError") return void res.status(400).json({ error: err.message });
  console.error(err);
  const status = err.status || 500;
  const hide = status === 500 && process.env.NODE_ENV === "production";
  res.status(status).json({ error: hide ? "Server error" : err.message || "Server error" });
};