import Link from "next/link";
import { ArrowRight, Bell, BarChart3, Briefcase, CalendarCheck, Check, FileText, GraduationCap, Headphones, Building2, Landmark, Sparkles, Target, Users, UserPlus, PieChart } from "lucide-react";
import { Logo } from "@/components/ui";

const core = [
  [FileText, "AI Resume Analyzer", "Extracts skills and gives improvement feedback from your resume."],
  [Target, "Smart Job Matching", "Ranks open jobs by overlap with your skills."],
  [BarChart3, "Skill Gap Analyzer", "Finds missing skills and suggests a learning plan."],
  [Headphones, "AI Interview Coach", "Practise questions and get feedback."],
  [Users, "Candidate Screening", "Advisory AI summaries. Humans make every decision."],
  [CalendarCheck, "Interview Scheduling", "Schedule and track interviews."],
  [PieChart, "Placement Analytics", "Live stats computed from your own data."],
  [Bell, "Real-Time Notifications", "Instant updates on applications and interviews."],
] as const;

const steps = [
  [UserPlus, "Create Account", "Sign up as a Student, Recruiter or College."],
  [FileText, "Build Profile", "Add your details, resume and preferences."],
  [Sparkles, "Get AI Recommendations", "Receive job matches and candidate suggestions."],
  [Briefcase, "Apply & Hire", "Apply, schedule interviews and track progress."],
] as const;

const roles = [
  [GraduationCap, "For Students", ["Build your profile and resume", "Get AI job recommendations", "Track applications & interviews"]],
  [Building2, "For Recruiters", ["Post and manage job openings", "Screen and shortlist candidates", "Schedule interviews and hire"]],
  [Landmark, "For Colleges", ["Monitor placement progress", "See eligibility and readiness", "View placement reports & analytics"]],
] as const;

export default function Landing() {
  return (
    <main className="bg-gradient-to-b from-mist/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden gap-6 text-sm font-medium text-brand md:flex">
          <a href="#how">How it works</a><a href="#features">Features</a><a href="#everyone">Who it&apos;s for</a>
        </nav>
        <div className="flex gap-2">
          <Link href="/login" className="btn-outline">Login</Link>
          <Link href="/register" className="btn-primary">Get Started</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2">
        <div>
          <span className="badge"><Sparkles className="mr-1 inline h-3 w-3" />AI-Powered Recruitment & Placement Platform</span>
          <h1 className="mt-4 text-5xl font-extrabold text-ink">HireHub</h1>
          <h2 className="mt-2 text-3xl font-bold text-ink">Connect Talent with Opportunities using AI</h2>
          <p className="mt-4 text-brand">A smart platform that brings together students, recruiters and colleges to make hiring and campus placement smarter, faster and more efficient.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/register" className="btn-primary">Get Started <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="btn-outline">Explore Jobs</Link>
          </div>
        </div>
        <div className="card border-brand/20 bg-gradient-to-br from-white to-mist/60">
          <p className="mb-3 text-xs font-medium uppercase text-steel">Sample preview</p>
          <div className="rounded-xl bg-deep p-4 text-white">
            <p className="font-semibold">Welcome back!</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              {["Applications", "Interviews", "Match Score"].map((t) => <div key={t} className="rounded-lg bg-white/10 p-3">{t}<div className="text-lg font-bold">–</div></div>)}
            </div>
            <p className="mt-3 text-xs text-sky">Your real numbers appear here after you sign in.</p>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-bold">How It Works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {steps.map(([Icon, t, d], i) => (
            <div key={t} className="card flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs text-white">{i + 1}</span>
              <div><Icon className="h-5 w-5 text-steel" /><p className="mt-1 font-semibold">{t}</p><p className="text-sm text-steel">{d}</p></div></div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-bold">Core Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {core.map(([Icon, t, d]) => (
            <div key={t} className="card"><Icon className="h-6 w-6 text-steel" /><p className="mt-2 font-semibold">{t}</p><p className="text-sm text-steel">{d}</p></div>
          ))}
        </div>
      </section>

      <section id="everyone" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-center text-3xl font-bold">Built for Everyone</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {roles.map(([Icon, t, items]) => (
            <div key={t} className="card bg-mist/40"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white"><Icon className="h-5 w-5" /></span><h3 className="text-xl font-bold">{t}</h3></div>
              <ul className="mt-4 space-y-2 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-steel" />{i}</li>)}</ul></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-deep to-steel p-8 text-white">
          <div><h2 className="text-2xl font-bold">Ready to Take the Next Step?</h2><p className="text-mist">Join HireHub and experience an AI-assisted recruitment journey.</p></div>
          <Link href="/register" className="btn bg-mist text-brand hover:bg-white">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-mist px-6 py-8 text-sm text-steel">
        <div className="flex flex-wrap items-center justify-between gap-3"><Logo /><span>AI-Powered Recruitment & Placement Platform</span></div>
        <p className="mt-6">© {new Date().getFullYear()} HireHub. All rights reserved.</p>
      </footer>
    </main>
  );
}
