import { Router } from "express";
import { z } from "zod";
import { Application, Interview, Job, PIPELINE, User } from "../models";
import { ah, requireAuth, requireRole, validate } from "../middleware";
import { matchScore } from "../services/ai";
import { notify } from "../services/notify";

const r = Router();
r.use(requireAuth);

r.post("/", requireRole("student"), validate(z.object({ jobId: z.string().min(1) })), ah(async (req, res) => {
  const job = await Job.findById(req.body.jobId);
  if (!job || job.status !== "open") return res.status(404).json({ error: "Job not available" });
  const me = await User.findById(req.user.id);
  if (me && job.minCgpa && me.cgpa < job.minCgpa)
    return res.status(400).json({ error: `Minimum CGPA ${job.minCgpa} required` });
  const app = await Application.create({ job: job._id, student: req.user.id, matchScore: matchScore(me?.skills || [], job.skills) });
  await notify(job.recruiter, "New application", `${me?.name} applied for ${job.title}`);
  res.status(201).json(app);
}));

r.get("/mine", requireRole("student"), ah(async (req, res) => {
  const apps = await Application.find({ student: req.user.id }).populate("job").sort({ createdAt: -1 });
  const interviews = await Interview.find({ student: req.user.id });
  res.json(apps.map((a) => ({ ...a.toObject(), interview: interviews.find((i) => String(i.application) === String(a._id)) || null })));
}));

r.get("/job/:jobId", requireRole("recruiter"), ah(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user.id });
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(await Application.find({ job: job._id }).populate("student", "name email skills cgpa education college resumeUrl").sort({ matchScore: -1 }));
}));

r.patch("/:id/status", requireRole("recruiter"), validate(z.object({ status: z.enum(PIPELINE) })), ah(async (req, res) => {
  const app = await Application.findById(req.params.id).populate("job");
  const job: any = app?.job;
  if (!app || !job || String(job.recruiter) !== req.user.id) return res.status(404).json({ error: "Application not found" });
  app.status = req.body.status;
  if (req.body.status === "hired") await User.findByIdAndUpdate(app.student, { placed: true });
  await app.save();
  await notify(app.student, "Application update", `Your application for ${job.title} is now: ${req.body.status}`);
  res.json(app);
}));

export default r;
