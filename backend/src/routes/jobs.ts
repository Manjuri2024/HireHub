import { Router } from "express";
import { z } from "zod";
import { Job, User } from "../models";
import { ah, requireAuth, requireRole, validate } from "../middleware";
import { matchScore } from "../services/ai";

const r = Router();
r.use(requireAuth);

const jobSchema = z.object({
  title: z.string().min(2).max(120),
  company: z.string().min(2).max(120),
  location: z.string().max(120).default("Remote"),
  type: z.enum(["full-time", "internship", "part-time"]).default("full-time"),
  description: z.string().min(10).max(5000),
  skills: z.array(z.string().min(1)).max(30).default([]),
  minCgpa: z.number().min(0).max(10).default(0),
  salary: z.string().max(60).default(""),
});

r.get("/", ah(async (req, res) => {
  const q = String(req.query.q || "").trim();
  const filter: Record<string, unknown> = { status: "open" };
  if (q) filter.$or = [{ title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { company: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }];
  res.json(await Job.find(filter).sort({ createdAt: -1 }).limit(100));
}));

r.get("/mine", requireRole("recruiter"), ah(async (req, res) => {
  res.json(await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 }));
}));

r.get("/recommended", requireRole("student"), ah(async (req, res) => {
  const me = await User.findById(req.user.id);
  const jobs = await Job.find({ status: "open" }).limit(100);
  const ranked = jobs
    .map((j) => ({ job: j, matchScore: matchScore(me?.skills || [], j.skills) }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
  res.json(ranked);
}));

r.post("/", requireRole("recruiter"), validate(jobSchema), ah(async (req, res) => {
  res.status(201).json(await Job.create({ ...req.body, recruiter: req.user.id }));
}));

r.patch("/:id", requireRole("recruiter"), ah(async (req, res) => {
  const body = jobSchema.partial().extend({ status: z.enum(["open", "closed"]).optional() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Validation failed" });
  const job = await Job.findOneAndUpdate({ _id: req.params.id, recruiter: req.user.id }, body.data, { new: true });
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
}));

r.delete("/:id", requireRole("recruiter"), ah(async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user.id });
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ ok: true });
}));

export default r;
