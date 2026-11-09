import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models";
import { ah, requireAuth, signToken, validate } from "../middleware";
import { env } from "../config/env";

const r = Router();

// Admin accounts require the secret ADMIN_INVITE_CODE from the server environment.
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "recruiter", "admin"]),
  college: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  inviteCode: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// REGISTER
r.post(
  "/register",
  validate(registerSchema),
  ah(async (req, res) => {
    const { password, role, inviteCode, ...rest } = req.body;

    // Admin accounts need the secret invite code and a college name
    if (role === "admin") {
      if (!env.adminInviteCode || inviteCode !== env.adminInviteCode) {
        return res.status(403).json({ error: "Invalid admin invite code" });
      }
      if (!rest.college?.trim()) {
        return res.status(400).json({ error: "College name is required for admin accounts" });
      }
    }

    // Prevent duplicate email registrations
    const existingUser = await User.findOne({ email: rest.email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...rest,
      role,
      password: hashedPassword,
    });

    const token = signToken({
      id: String(user._id),
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// LOGIN
r.post(
  "/login",
  validate(loginSchema),
  ah(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+password");

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({
      id: String(user._id),
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  })
);

// GET CURRENT USER
r.get(
  "/me",
  requireAuth,
  ah(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  })
);

export default r;