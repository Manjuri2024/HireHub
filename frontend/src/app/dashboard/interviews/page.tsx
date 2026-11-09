"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Empty, ErrorBox, PageTitle, Spinner } from "@/components/ui";

export default function Interviews() {
  const q = useQuery({ queryKey: ["iv"], queryFn: () => api<any[]>("/interviews") });
  return (
    <>
      <PageTitle title="Interviews" sub="Upcoming schedule" />
      {q.isLoading ? <Spinner /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : !q.data?.length ? <Empty text="No interviews scheduled." /> : q.data.map((i) => (
        <div key={i._id} className="card mb-3">
          <p className="font-semibold">{i.application?.job?.title} <span className="text-steel">· {i.application?.job?.company}</span></p>
          <p className="text-sm">{new Date(i.scheduledAt).toLocaleString()} · {i.mode}{i.student?.name ? ` · ${i.student.name}` : ""}</p>
          {i.link && <a className="text-sm text-steel underline" href={i.link} target="_blank" rel="noreferrer">Meeting link</a>}
        </div>
      ))}
    </>
  );
}
