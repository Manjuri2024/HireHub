"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ErrorBox, PageTitle, SuccessBox } from "@/components/ui";

export default function Settings() {
  const { user, logout, refresh } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const save = useMutation({ mutationFn: () => api("/profile", { method: "PUT", body: { name } }), onSuccess: () => refresh() });
  return (
    <>
      <PageTitle title="Settings" sub="Account details" />
      <div className="card max-w-md space-y-3">
        <div><label className="label">Email</label><input className="input" disabled value={user?.email || ""} /></div>
        <div><label className="label">Role</label><input className="input" disabled value={user?.role || ""} /></div>
        <div><label className="label">Display name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
        {save.error && <ErrorBox message={(save.error as Error).message} />}{save.isSuccess && <SuccessBox message="Saved." />}
        <div className="flex gap-2"><button className="btn-primary" disabled={name.length < 2 || save.isPending} onClick={() => save.mutate()}>Save</button><button className="btn-danger" onClick={logout}>Log out</button></div>
      </div>
    </>
  );
}
