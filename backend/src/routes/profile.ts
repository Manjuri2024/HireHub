import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import pdfParse from "pdf-parse";
import { User } from "../models";
import { ah, requireAuth, validate } from "../middleware";
import { cloudinaryEnabled, uploadBuffer } from "../services/cloudinary";

const r = Router();
r.use(requireAuth);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, f, cb) => cb(null, /pdf|msword|officedocument/.test(f.mimetype)),
});

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  headline: z.string().max(160).optional(),
  college: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  education: z.string().max(200).optional(),
  experience: z.string().max(2000).optional(),
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string().min(1).max(40)).max(40).optional(),
  resumeText: z.string().max(20000).optional(),
});

r.get("/", ah(async (req, res) => res.json(await User.findById(req.user.id))));

r.put("/", validate(profileSchema), ah(async (req, res) => {
  res.json(await User.findByIdAndUpdate(req.user.id, req.body, { new: true }));
}));

r.post("/resume", upload.single("resume"), ah(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Upload a PDF or Word file up to 5MB" });
  let url = "";
  let note = "";
  if (cloudinaryEnabled()) url = await uploadBuffer(req.file.buffer, req.file.originalname);
  else note = "Cloudinary is not configured; only the file name was saved (demo mode).";
  let resumeText = "";
  if (req.file.mimetype === "application/pdf") {
    try { resumeText = (await pdfParse(req.file.buffer)).text.slice(0, 20000); } catch { /* unreadable PDF */ }
  }
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { resumeUrl: url, resumeName: req.file.originalname, ...(resumeText && { resumeText }) },
    { new: true }
  );
  res.json({ user, note });
}));

export default r;
