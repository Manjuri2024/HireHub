import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "recruiter", "admin"], required: true },
    college: { type: String, default: "" },
    company: { type: String, default: "" },
    headline: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: { type: String, default: "" },
    cgpa: { type: Number, default: 0 },
    experience: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeName: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    placed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote" },
    type: { type: String, enum: ["full-time", "internship", "part-time"], default: "full-time" },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    minCgpa: { type: Number, default: 0 },
    salary: { type: String, default: "" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const PIPELINE = ["applied", "shortlisted", "interview", "offered", "hired", "rejected"] as const;

const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: PIPELINE, default: "applied" },
    matchScore: { type: Number, default: 0 },
    screening: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

const interviewSchema = new Schema(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ["online", "onsite"], default: "online" },
    link: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
export const Job = model("Job", jobSchema);
export const Application = model("Application", applicationSchema);
export const Interview = model("Interview", interviewSchema);
export const Notification = model("Notification", notificationSchema);
