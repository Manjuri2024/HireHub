"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL, api, getToken } from "@/lib/api";
import { Empty, ErrorBox, PageTitle, Spinner } from "@/components/ui";

export default function Notifications() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["notifs"], queryFn: () => api<any[]>("/notifications") });
  const readAll = useMutation({ mutationFn: () => api("/notifications/read-all", { method: "PATCH" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifs"] }) });
  useEffect(() => {
    const s = io(API_URL, { auth: { token: getToken() } });
    s.on("notification", () => qc.invalidateQueries({ queryKey: ["notifs"] }));
    return () => { s.disconnect(); };
  }, [qc]);
  return (
    <>
      <PageTitle title="Notifications" sub="Live updates via Socket.IO"><button className="btn-outline" onClick={() => readAll.mutate()}>Mark all read</button></PageTitle>
      {q.isLoading ? <Spinner /> : q.error ? <ErrorBox message={(q.error as Error).message} /> : !q.data?.length ? <Empty text="You're all caught up." /> : q.data.map((n) => (
        <div key={n._id} className={`card mb-2 ${n.read ? "" : "border-steel"}`}><p className="font-semibold">{n.title}</p><p className="text-sm text-steel">{n.body}</p><p className="text-xs text-sky">{new Date(n.createdAt).toLocaleString()}</p></div>
      ))}
    </>
  );
}
