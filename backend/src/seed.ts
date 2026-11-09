import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./config/env";
import { Application, Interview, Job, Notification, User } from "./models";

/** Demo data only. Companies are fictional and clearly labelled "(Demo)". */
async function seed() {
  await mongoose.connect(env.mongoUri);
  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Application.deleteMany({}), Interview.deleteMany({}), Notification.deleteMany({})]);
  const pw = await bcrypt.hash("Password@123", 10);
  const college = "Demo Institute of Technology";
  const admin = await User.create({ name: "Demo Placement Officer", email: "admin@hirehub.demo", password: pw, role: "admin", college });
  const recruiter = await User.create({ name: "Demo Recruiter", email: "recruiter@hirehub.demo", password: pw, role: "recruiter", company: "Acme Labs (Demo)" });
  const student = await User.create({
    name: "Demo Student", email: "student@hirehub.demo", password: pw, role: "student", college,
    headline: "Aspiring full-stack developer", education: "B.Tech Computer Science", cgpa: 8.2,
    skills: ["JavaScript", "React", "Node.js", "MongoDB", "Git"],
  });
  await User.create({ name: "Second Student", email: "student2@hirehub.demo", password: pw, role: "student", college, cgpa: 7.4, skills: ["Python", "SQL"] });
  const jobs = await Job.insertMany([
    { title: "Full Stack Developer", company: "Acme Labs (Demo)", location: "Remote", description: "Build web features end to end with React and Node.", skills: ["React", "Node.js", "MongoDB", "TypeScript"], minCgpa: 7, salary: "Demo", recruiter: recruiter._id },
    { title: "Data Analyst Intern", company: "Acme Labs (Demo)", location: "Hybrid", type: "internship", description: "Analyse datasets and build dashboards.", skills: ["Python", "SQL", "Data Analysis"], recruiter: recruiter._id },
    { title: "Frontend Engineer", company: "Acme Labs (Demo)", location: "Remote", description: "Craft accessible user interfaces.", skills: ["React", "TypeScript", "CSS", "Testing"], recruiter: recruiter._id },
  ]);
  await Application.create({ job: jobs[0]._id, student: student._id, matchScore: 75 });
  await Notification.create({ user: student._id, title: "Welcome to HireHub", body: "This is demo data." });
  console.log("Seeded. Demo logins (password Password@123):\n  student@hirehub.demo\n  recruiter@hirehub.demo\n  admin@hirehub.demo");
  void admin;
  await mongoose.disconnect();
}
seed().catch((e) => { console.error(e); process.exit(1); });
