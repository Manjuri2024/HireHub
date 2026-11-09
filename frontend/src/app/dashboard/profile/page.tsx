"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ErrorBox, PageTitle, Spinner, SuccessBox } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2), headline: z.string().max(160), education: z.string().max(200),
  cgpa: z.number({ invalid_type_error: "Enter a number" }).min(0).max(10), skills: z.string(), experience: z.string().max(2000),
});
type F = z.infer<typeof schema>;

export default function Profile() {
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["profile"], queryFn: () => api<any>("/profile") });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });
  const [note, setNote] = useState("");
  useEffect(() => { if (me.data) reset({ name: me.data.name, headline: me.data.headline, education: me.data.education, cgpa: me.data.cgpa, skills: me.data.skills.join(", "), experience: me.data.experience }); }, [me.data, reset]);

  const save = useMutation({
    mutationFn: (v: F) => api("/profile", { method: "PUT", body: { ...v, skills: v.skills.split(",").map((s) => s.trim()).filter(Boolean) } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); qc.invalidateQueries({ queryKey: ["passport"] }); },
  });
  const upload = useMutation({
    mutationFn: (f: File) => { const fd = new FormData(); fd.append("resume", f); return api<any>("/profile/resume", { method: "POST", form: fd }); },
    onSuccess: (r) => { setNote(r.note || "Resume uploaded."); qc.invalidateQueries({ queryKey: ["profile"] }); qc.invalidateQueries({ queryKey: ["passport"] }); },
  });
  if (me.isLoading) return <Spinner />;
  return (
    <>
      <PageTitle title="Profile" sub="Keep your details current for better matches" />
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="card grid gap-3 md:grid-cols-2">
        <div><label className="label">Name</label><input className="input" {...register("name")} />{errors.name && <p className="err">{errors.name.message}</p>}</div>
        <div><label className="label">Headline</label><input className="input" {...register("headline")} /></div>
        <div><label className="label">Education</label><input className="input" {...register("education")} /></div>
        <div><label className="label">CGPA (0-10)</label><input type="number" step="0.01" className="input" {...register("cgpa", { valueAsNumber: true })} />{errors.cgpa && <p className="err">{errors.cgpa.message}</p>}</div>
        <div className="md:col-span-2"><label className="label">Skills (comma separated)</label><input className="input" {...register("skills")} /></div>
        <div className="md:col-span-2"><label className="label">Experience & projects</label><textarea rows={4} className="input" {...register("experience")} /></div>
        <div className="md:col-span-2 space-y-2">
          {save.error && <ErrorBox message={(save.error as Error).message} />}{save.isSuccess && <SuccessBox message="Profile saved." />}
          <button className="btn-primary" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</button>
        </div>
      </form>
      <div className="card mt-6"><h2 className="mb-2 font-semibold">Resume</h2>
        <p className="mb-2 text-sm text-steel">{me.data?.resumeName ? `Current: ${me.data.resumeName}` : "No resume uploaded yet."} (PDF/Word, max 5MB)</p>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} />
        {upload.isPending && <Spinner />}{upload.error && <ErrorBox message={(upload.error as Error).message} />}{note && <SuccessBox message={note} />}
      </div>
    </>
  );
}
