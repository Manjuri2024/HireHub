"use client";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DemoBanner, Empty, ErrorBox, PageTitle, Spinner, SuccessBox } from "@/components/ui";

const STAGES = ["applied", "shortlisted", "interview", "offered", "hired", "rejected"];

function StudentApps() {
  const q = useQuery({ queryKey: ["apps"], queryFn: () => api<any[]>("/applications/mine") });
  return (
    <>
      <PageTitle title="My Applications" sub="Track your progress" />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : !q.data?.length ? <Empty text="You haven't applied to any jobs yet." /> : q.data.map((a) => (
        <div key={a._id} className="card mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-semibold">{a.job?.title}</p><p className="text-sm text-steel">{a.job?.company} · match {a.matchScore}%{a.interview ? ` · interview ${new Date(a.interview.scheduledAt).toLocaleString()}` : ""}</p></div>
          <span className="badge">{a.status}</span>
        </div>
      ))}
    </>
  );
}

function RecruiterPipeline() {
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["myjobs"], queryFn: () => api<any[]>("/jobs/mine") });
  const [jobId, setJobId] = useState("");
  const [msg, setMsg] = useState("");
  const [sched, setSched] = useState<{ id: string; at: string; link: string } | null>(null);
  const apps = useQuery({ queryKey: ["jobapps", jobId], queryFn: () => api<any[]>(`/applications/job/${jobId}`), enabled: !!jobId });
  const setStatus = useMutation({ mutationFn: (p: { id: string; status: string }) => api(`/applications/${p.id}/status`, { method: "PATCH", body: { status: p.status } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["jobapps", jobId] }) });
  const screen = useMutation({ mutationFn: (id: string) => api<any>(`/ai/screen/${id}`, { method: "POST" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["jobapps", jobId] }) });
  const schedule = useMutation({
    mutationFn: (s: { id: string; at: string; link: string }) => api("/interviews", { method: "POST", body: { applicationId: s.id, scheduledAt: new Date(s.at).toISOString(), link: s.link } }),
    onSuccess: () => { setMsg("Interview scheduled and candidate notified."); setSched(null); qc.invalidateQueries({ queryKey: ["jobapps", jobId] }); },
  });
  return (
    <>
      <PageTitle title="Recruitment Pipeline" sub="AI screening is advisory only. You make every decision." />
      <select className="input mb-4 max-w-sm" value={jobId} onChange={(e) => setJobId(e.target.value)}>
        <option value="">Select a job…</option>{jobs.data?.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
      </select>
      {msg && <SuccessBox message={msg} />}
      {(setStatus.error || screen.error || schedule.error) && <ErrorBox message={((setStatus.error || screen.error || schedule.error) as Error).message} />}
      {!jobId ? <Empty text="Choose a job to see its candidates." /> : apps.isLoading ? <Spinner /> : !apps.data?.length ? <Empty text="No applications yet." /> : apps.data.map((a) => (
        <div key={a._id} className="card mb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="font-semibold">{a.student.name} <span className="badge">match {a.matchScore}%</span></p><p className="text-sm text-steel">{a.student.email} · CGPA {a.student.cgpa || "n/a"} · {a.student.skills.join(", ") || "no skills listed"}</p></div>
            <select className="input !w-auto" value={a.status} onChange={(e) => setStatus.mutate({ id: a._id, status: e.target.value })}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-outline" disabled={screen.isPending} onClick={() => screen.mutate(a._id)}>AI screening (advisory)</button>
            <button className="btn-outline" onClick={() => setSched({ id: a._id, at: "", link: "" })}>Schedule interview</button>
          </div>
          {a.screening && (
            <div className="mt-3 space-y-2 rounded-lg bg-mist/40 p-3 text-sm">
              {a.screening.demo && <DemoBanner note={a.screening.note} />}
              <p><b>Fit score:</b> {a.screening.data.fitScore}</p>
              <p><b>Strengths:</b> {a.screening.data.strengths?.join("; ") || "-"}</p>
              <p><b>Concerns:</b> {a.screening.data.concerns?.join("; ") || "-"}</p>
              <p className="text-xs text-steel">{a.screening.data.note}</p>
            </div>
          )}
          {sched && sched.id === a._id && (
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div><label className="label">Date & time</label><input type="datetime-local" className="input" value={sched.at} onChange={(e) => setSched({ ...sched, at: e.target.value })} /></div>
              <div><label className="label">Meeting link</label><input className="input" value={sched.link} onChange={(e) => setSched({ ...sched, link: e.target.value })} /></div>
              <button className="btn-primary" disabled={!sched.at || schedule.isPending} onClick={() => schedule.mutate(sched)}>Confirm</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function Applications() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "recruiter" ? <RecruiterPipeline /> : <StudentApps />;
}