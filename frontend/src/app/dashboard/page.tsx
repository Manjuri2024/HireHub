"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Empty, ErrorBox, PageTitle, Spinner } from "@/components/ui";

const Stat = ({ label, value }: { label: string; value: string | number }) => <div className="card"><p className="text-sm text-steel">{label}</p><p className="text-3xl font-bold text-brand">{value}</p></div>;

function Student() {
  const apps = useQuery({ queryKey: ["apps"], queryFn: () => api<any[]>("/applications/mine") });
  const rec = useQuery({ queryKey: ["rec"], queryFn: () => api<any[]>("/jobs/recommended") });
  const passport = useQuery({ queryKey: ["passport"], queryFn: () => api<any>("/ai/passport") });
  if (apps.isLoading || rec.isLoading || passport.isLoading) return <Spinner />;
  if (apps.error) return <ErrorBox message={(apps.error as Error).message} />;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Applications" value={apps.data?.length ?? 0} />
        <Stat label="Interviews" value={apps.data?.filter((a) => a.interview).length ?? 0} />
        <Stat label="Readiness Passport" value={`${passport.data?.score ?? 0}%`} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card"><h2 className="mb-3 font-semibold">Recommended for you</h2>
          {rec.data?.length ? rec.data.slice(0, 5).map((r) => (
            <div key={r.job._id} className="flex items-center justify-between border-b border-mist py-2 text-sm last:border-0"><span>{r.job.title} <span className="text-steel">· {r.job.company}</span></span><span className="badge">{r.matchScore}% match</span></div>
          )) : <Empty text="No open jobs yet." />}
          <Link href="/dashboard/jobs" className="btn-outline mt-3">Browse jobs</Link></div>
        <div className="card"><h2 className="mb-3 font-semibold">Placement Readiness Passport <span className="badge">{passport.data?.level}</span></h2>
          {passport.data?.items.map((i: any) => <p key={i.label} className="text-sm">{i.done ? "✅" : "⬜"} {i.label}</p>)}
          <Link href="/dashboard/profile" className="btn-outline mt-3">Improve profile</Link></div>
      </div>
    </>
  );
}

function Recruiter() {
  const jobs = useQuery({ queryKey: ["myjobs"], queryFn: () => api<any[]>("/jobs/mine") });
  const iv = useQuery({ queryKey: ["iv"], queryFn: () => api<any[]>("/interviews") });
  if (jobs.isLoading || iv.isLoading) return <Spinner />;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Stat label="Open jobs" value={jobs.data?.filter((j) => j.status === "open").length ?? 0} />
      <Stat label="Total jobs" value={jobs.data?.length ?? 0} />
      <Stat label="Scheduled interviews" value={iv.data?.length ?? 0} />
    </div>
  );
}

function Admin() {
  const q = useQuery({ queryKey: ["placement"], queryFn: () => api<any>("/analytics/placement") });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorBox message={(q.error as Error).message} />;
  const t = q.data.totals;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Students" value={t.students} /><Stat label="Placed" value={t.placed} /><Stat label="Placement rate" value={`${q.data.placementRate}%`} /><Stat label="Applications" value={t.applications} />
      </div>
      <div className="card mt-6"><h2 className="mb-3 font-semibold">Students needing attention</h2>
        {q.data.students.filter((s: any) => !s.placed && (!s.resume || s.skills < 3)).map((s: any) => (
          <p key={s.id} className="border-b border-mist py-2 text-sm last:border-0">{s.name} <span className="text-steel">· {!s.resume && "no resume "}{s.skills < 3 && `· ${s.skills} skills`}</span></p>
        ))}
        {!q.data.students.some((s: any) => !s.placed && (!s.resume || s.skills < 3)) && <Empty text="Everyone has a resume and 3+ skills." />}
        <Link href="/dashboard/analytics" className="btn-outline mt-3">Full analytics</Link></div>
    </>
  );
}

export default function Overview() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageTitle title={`Welcome back, ${user.name.split(" ")[0]}`} sub={user.role === "admin" ? "Placement Command Center" : user.role === "recruiter" ? "Recruiter dashboard" : "Student dashboard"} />
      {user.role === "student" ? <Student /> : user.role === "recruiter" ? <Recruiter /> : <Admin />}
    </>
  );
}
