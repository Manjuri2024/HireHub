import { Router } from "express";
import { z } from "zod";
import { Application, Interview, Job, Notification, User } from "../models";
import { ah, requireAuth, requireRole, validate } from "../middleware";
import { notify } from "../services/notify";

export const interviews = Router();
interviews.use(requireAuth);

interviews.post("/", requireRole("recruiter"), validate(z.object({
  applicationId: z.string().min(1),
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Must be in the future"),
  mode: z.enum(["online", "onsite"]).default("online"),
  link: z.string().max(300).default(""),
  notes: z.string().max(1000).default(""),
})), ah(async (req, res) => {
  const app = await Application.findById(req.body.applicationId).populate("job");
  const job: any = app?.job;
  if (!app || !job || String(job.recruiter) !== req.user.id) return res.status(404).json({ error: "Application not found" });
  const iv = await Interview.create({ ...req.body, application: app._id, student: app.student, recruiter: req.user.id });
  app.status = "interview";
  await app.save();
  await notify(app.student, "Interview scheduled", `${job.title} on ${new Date(req.body.scheduledAt).toLocaleString()}`);
  res.status(201).json(iv);
}));

interviews.get("/", ah(async (req, res) => {
  const f = req.user.role === "student" ? { student: req.user.id } : { recruiter: req.user.id };
  res.json(await Interview.find(f).populate("student", "name email").populate({ path: "application", populate: { path: "job", select: "title company" } }).sort({ scheduledAt: 1 }));
}));

export const notifications = Router();
notifications.use(requireAuth);
notifications.get("/", ah(async (req, res) => res.json(await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50))));
notifications.patch("/read-all", ah(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ ok: true });
}));

export const analytics = Router();
analytics.use(requireAuth);

/** All numbers are computed from the database; nothing is fabricated. */
analytics.get("/placement", requireRole("admin"), ah(async (req, res) => {
  const admin = await User.findById(req.user.id);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sf: Record<string, unknown> = { role: "student" };
  if (admin?.college) sf.college = new RegExp("^" + esc(admin.college.trim()) + "$", "i");
  const students = await User.find(sf);
  const ids = students.map((s) => s._id);
  const apps = await Application.find({ student: { $in: ids } }).populate("job", "company");
  const placed = students.filter((s) => s.placed).length;
  const byStatus: Record<string, number> = {};
  const byCompany: Record<string, number> = {};
  apps.forEach((a: any) => {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    if (a.status === "hired" && a.job?.company) byCompany[a.job.company] = (byCompany[a.job.company] || 0) + 1;
  });
  const skillCount: Record<string, number> = {};
  students.forEach((s) => s.skills.forEach((k) => (skillCount[k] = (skillCount[k] || 0) + 1)));
  res.json({
    totals: { students: students.length, placed, unplaced: students.length - placed, applications: apps.length, openJobs: await Job.countDocuments({ status: "open" }) },
    placementRate: students.length ? Math.round((placed / students.length) * 100) : 0,
    pipeline: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    hiresByCompany: Object.entries(byCompany).map(([company, count]) => ({ company, count })),
    topSkills: Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([skill, count]) => ({ skill, count })),
    students: students.map((s) => ({ id: s._id, name: s.name, email: s.email, cgpa: s.cgpa, skills: s.skills.length, placed: s.placed, resume: !!s.resumeName })),
  });
}));
