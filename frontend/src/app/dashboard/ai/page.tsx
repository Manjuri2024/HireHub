"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DemoBanner, ErrorBox, PageTitle, Spinner } from "@/components/ui";

const Result = ({ r }: { r: any }) => r && (
  <div className="mt-4 space-y-3">
    {r.demo && <DemoBanner note={r.note} />}
    <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-mist/40 p-4 text-sm">{JSON.stringify(r.data, null, 2)}</pre>
  </div>
);

function ResumeTool() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => api<any>("/profile") });
  const [text, setText] = useState("");
  useEffect(() => { if (profile.data?.resumeText && !text) setText(profile.data.resumeText); }, [profile.data]); // eslint-disable-line
  const m = useMutation({ mutationFn: () => api<any>("/ai/resume-analyze", { method: "POST", body: { text } }) });
  return (
    <div className="card"><h2 className="mb-2 font-semibold">AI Resume Analyzer</h2>
      <textarea rows={8} className="input" placeholder="Paste your resume text (50+ characters)" value={text} onChange={(e) => setText(e.target.value)} />
      <button className="btn-primary mt-3" disabled={m.isPending} onClick={() => m.mutate()}>{m.isPending ? "Analysing…" : "Analyse resume"}</button>
      {m.error && <div className="mt-3"><ErrorBox message={(m.error as Error).message} /></div>}
      <Result r={m.data} />
    </div>
  );
}

function GapTool() {
  const jobs = useQuery({ queryKey: ["jobs", ""], queryFn: () => api<any[]>("/jobs") });
  const [jobId, setJobId] = useState("");
  const m = useMutation({ mutationFn: () => api<any>("/ai/skill-gap", { method: "POST", body: { jobId } }) });
  return (
    <div className="card"><h2 className="mb-2 font-semibold">Skill Gap Analyzer</h2>
      {jobs.isLoading ? <Spinner /> : <select className="input" value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="">Select target job…</option>{jobs.data?.map((j) => <option key={j._id} value={j._id}>{j.title}, {j.company}</option>)}</select>}
      <button className="btn-primary mt-3" disabled={!jobId || m.isPending} onClick={() => m.mutate()}>Analyse gap</button>
      {m.error && <div className="mt-3"><ErrorBox message={(m.error as Error).message} /></div>}
      <Result r={m.data} />
    </div>
  );
}

function CoachTool() {
  const [role, setRole] = useState("Software Developer");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [out, setOut] = useState<any>(null);
  const m = useMutation({
    mutationFn: () => api<any>("/ai/interview-coach", { method: "POST", body: { role, question: question || undefined, answer: answer || undefined } }),
    onSuccess: (r) => { setOut(r); const next = r.data.question || r.data.nextQuestion; if (next) setQuestion(next); setAnswer(""); },
  });
  return (
    <div className="card"><h2 className="mb-2 font-semibold">AI Interview Coach</h2>
      <input className="input mb-2" value={role} onChange={(e) => setRole(e.target.value)} />
      {question && <p className="mb-2 rounded-lg bg-mist/50 p-3 text-sm"><b>Question:</b> {question}</p>}
      {question && <textarea rows={4} className="input" placeholder="Type your answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />}
      <button className="btn-primary mt-3" disabled={m.isPending || (!!question && !answer)} onClick={() => m.mutate()}>{question ? "Get feedback" : "Start practice"}</button>
      {m.error && <div className="mt-3"><ErrorBox message={(m.error as Error).message} /></div>}
      <Result r={out} />
    </div>
  );
}

export default function AiTools() {
  const status = useQuery({ queryKey: ["aistatus"], queryFn: () => api<{ demoMode: boolean }>("/ai/status") });
  return (
    <>
      <PageTitle title="AI Tools" sub="Powered by Google Gemini via the HireHub backend" />
      {status.data?.demoMode && <div className="mb-4"><DemoBanner note="No GEMINI_API_KEY configured on the server. Results are rule-based." /></div>}
      <div className="space-y-6"><ResumeTool /><GapTool /><CoachTool /></div>
    </>
  );
}
