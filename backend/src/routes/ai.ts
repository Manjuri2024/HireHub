import { Router } from "express";
import { z } from "zod";
import { Application, Job, User } from "../models";
import { ah, requireAuth, requireRole, validate } from "../middleware";
import { aiAvailable, analyzeResume, extractSkills, interviewCoach, screenCandidate, skillGap } from "../services/ai";

const r = Router();
r.use(requireAuth);

r.get("/status", (_req, res) => res.json({ demoMode: !aiAvailable() }));

r.post("/resume-analyze", requireRole("student"), validate(z.object({ text: z.string().min(50, "Paste at least 50 characters of resume text").max(20000) })), ah(async (req, res) => {
  const result = await analyzeResume(req.body.text);
  const skills: string[] = Array.isArray((result.data as any).skills) ? (result.data as any).skills : extractSkills(req.body.text);
  const me = await User.findById(req.user.id);
  await User.findByIdAndUpdate(req.user.id, { resumeText: req.body.text, skills: Array.from(new Set([...(me?.skills || []), ...skills])) });
  res.json(result);
}));

r.post("/skill-gap", requireRole("student"), validate(z.object({ jobId: z.string().min(1) })), ah(async (req, res) => {
  const job = await Job.findById(req.body.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const me = await User.findById(req.user.id);
  res.json({ job: { id: job._id, title: job.title }, ...(await skillGap(me?.skills || [], job)) });
}));

r.post("/interview-coach", requireRole("student"), validate(z.object({ role: z.string().min(2).max(100), question: z.string().max(500).optional(), answer: z.string().max(4000).optional() })), ah(async (req, res) => {
  res.json(await interviewCoach(req.body.role, req.body.question, req.body.answer));
}));

/** Advisory screening only: never modifies application status. */
r.post("/screen/:applicationId", requireRole("recruiter"), ah(async (req, res) => {
  const app = await Application.findById(req.params.applicationId).populate("job").populate("student");
  const job: any = app?.job;
  if (!app || !job || String(job.recruiter) !== req.user.id) return res.status(404).json({ error: "Application not found" });
  const student: any = app.student;
  const result = await screenCandidate(job, { skills: student.skills, resumeText: student.resumeText, cgpa: student.cgpa });
  app.screening = result;
  await app.save();
  res.json(result);
}));

/** Placement Readiness Passport: computed from real profile data. */
r.get("/passport", requireRole("student"), ah(async (req, res) => {
  const me = await User.findById(req.user.id);
  if (!me) return res.status(404).json({ error: "User not found" });
  const items = [
    { label: "Profile headline", done: !!me.headline, weight: 10 },
    { label: "Education details", done: !!me.education, weight: 10 },
    { label: "CGPA added", done: me.cgpa > 0, weight: 10 },
    { label: "5+ skills listed", done: me.skills.length >= 5, weight: 25 },
    { label: "Resume uploaded", done: !!me.resumeName, weight: 20 },
    { label: "Resume analysed", done: !!me.resumeText, weight: 15 },
    { label: "Experience / projects described", done: !!me.experience, weight: 10 },
  ];
  const score = items.filter((i) => i.done).reduce((s, i) => s + i.weight, 0);
  res.json({ score, items, level: score >= 80 ? "Ready" : score >= 50 ? "Almost ready" : "Getting started" });
}));

export default r;
