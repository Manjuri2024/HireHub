"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Empty, ErrorBox, PageTitle, Spinner, SuccessBox } from "@/components/ui";

const schema = z.object({
  title: z.string().min(2), company: z.string().min(2), location: z.string().min(1),
  type: z.enum(["full-time", "internship", "part-time"]),
  description: z.string().min(10, "Describe the role (10+ chars)"),
  skills: z.string(), minCgpa: z.number({ invalid_type_error: "Enter a number" }).min(0).max(10),
});
type F = z.infer<typeof schema>;

function StudentJobs() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const jobs = useQuery({ queryKey: ["jobs", q], queryFn: () => api<any[]>(`/jobs?q=${encodeURIComponent(q)}`) });
  const apply = useMutation({ mutationFn: (jobId: string) => api("/applications", { method: "POST", body: { jobId } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["apps"] }) });
  return (
    <>
      <PageTitle title="Jobs" sub="Browse open positions" />
      <input className="input mb-4 max-w-sm" placeholder="Search title or company" value={q} onChange={(e) => setQ(e.target.value)} />
      {apply.error && <ErrorBox message={(apply.error as Error).message} />}
      {apply.isSuccess && <SuccessBox message="Application submitted." />}
      {jobs.isLoading ? <Spinner /> : jobs.error ? <ErrorBox message={(jobs.error as Error).message} /> : !jobs.data?.length ? <Empty text="No jobs found." /> : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {jobs.data.map((j) => (
            <div key={j._id} className="card">
              <div className="flex justify-between"><h3 className="font-semibold">{j.title}</h3><span className="badge">{j.type}</span></div>
              <p className="text-sm text-steel">{j.company} · {j.location}{j.minCgpa ? ` · min CGPA ${j.minCgpa}` : ""}</p>
              <p className="mt-2 text-sm">{j.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">{j.skills.map((s: string) => <span key={s} className="badge">{s}</span>)}</div>
              <button className="btn-primary mt-3" disabled={apply.isPending} onClick={() => apply.mutate(j._id)}>Apply</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function RecruiterJobs() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const jobs = useQuery({ queryKey: ["myjobs"], queryFn: () => api<any[]>("/jobs/mine") });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema), defaultValues: { type: "full-time", location: "Remote", company: user?.company || "", minCgpa: 0, skills: "" } });
  const create = useMutation({
    mutationFn: (v: F) => api("/jobs", { method: "POST", body: { ...v, skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean) } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["myjobs"] }); reset(); },
  });
  const toggle = useMutation({ mutationFn: (j: any) => api(`/jobs/${j._id}`, { method: "PATCH", body: { status: j.status === "open" ? "closed" : "open" } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["myjobs"] }) });
  const del = useMutation({ mutationFn: (id: string) => api(`/jobs/${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["myjobs"] }) });
  return (
    <>
      <PageTitle title="My Jobs" sub="Post and manage openings" />
      <form onSubmit={handleSubmit((v) => create.mutate(v))} className="card mb-6 grid gap-3 md:grid-cols-2">
        <div><label className="label">Title</label><input className="input" {...register("title")} />{errors.title && <p className="err">{errors.title.message}</p>}</div>
        <div><label className="label">Company</label><input className="input" {...register("company")} />{errors.company && <p className="err">{errors.company.message}</p>}</div>
        <div><label className="label">Location</label><input className="input" {...register("location")} /></div>
        <div><label className="label">Type</label><select className="input" {...register("type")}><option value="full-time">Full-time</option><option value="internship">Internship</option><option value="part-time">Part-time</option></select></div>
        <div><label className="label">Skills (comma separated)</label><input className="input" {...register("skills")} /></div>
        <div><label className="label">Minimum CGPA</label><input type="number" step="0.1" className="input" {...register("minCgpa", { valueAsNumber: true })} /></div>
        <div className="md:col-span-2"><label className="label">Description</label><textarea rows={3} className="input" {...register("description")} />{errors.description && <p className="err">{errors.description.message}</p>}</div>
        <div className="md:col-span-2">{create.error && <ErrorBox message={(create.error as Error).message} />}<button className="btn-primary" disabled={create.isPending}>{create.isPending ? "Posting…" : "Post job"}</button></div>
      </form>
      {jobs.isLoading ? <Spinner /> : !jobs.data?.length ? <Empty text="You haven't posted any jobs yet." /> : jobs.data.map((j) => (
        <div key={j._id} className="card mb-3 flex flex-wrap items-center justify-between gap-3">
          <div><p className="font-semibold">{j.title} <span className="badge">{j.status}</span></p><p className="text-sm text-steel">{j.company} · {j.location}</p></div>
          <div className="flex gap-2"><button className="btn-outline" onClick={() => toggle.mutate(j)}>{j.status === "open" ? "Close" : "Reopen"}</button><button className="btn-danger" onClick={() => confirm("Delete this job?") && del.mutate(j._id)}>Delete</button></div>
        </div>
      ))}
    </>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "recruiter" ? <RecruiterJobs /> : <StudentJobs />;
}
