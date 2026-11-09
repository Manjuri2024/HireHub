import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware";
import auth from "./routes/auth";
import jobs from "./routes/jobs";
import applications from "./routes/applications";
import profile from "./routes/profile";
import ai from "./routes/ai";
import { analytics, interviews, notifications } from "./routes/misc";

export const app = express();

// Needed on Render/Vercel so rate limiting sees the real client IP
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));

const limiter = (limit: number, windowMs: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/db-status", (_req, res) => res.json({ connected: mongoose.connection.readyState === 1 }));

// General limit for all API routes
app.use("/api", limiter(600, 15 * 60 * 1000));

// Stricter limits: login/register (brute force) and AI (costs money)
app.use("/api/auth", limiter(env.isProd ? 20 : 200, 15 * 60 * 1000), auth);
app.use("/api/ai", limiter(env.isProd ? 30 : 200, 60 * 60 * 1000), ai);

app.use("/api/jobs", jobs);
app.use("/api/applications", applications);
app.use("/api/profile", profile);
app.use("/api/interviews", interviews);
app.use("/api/notifications", notifications);
app.use("/api/analytics", analytics);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);