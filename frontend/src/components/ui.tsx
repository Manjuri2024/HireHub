import { Loader2, Inbox, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

export const Spinner = () => <div className="flex items-center gap-2 py-8 text-steel"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>;
export const ErrorBox = ({ message }: { message: string }) => <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{message}</div>;
export const SuccessBox = ({ message }: { message: string }) => <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</div>;
export const Empty = ({ text }: { text: string }) => <div className="flex flex-col items-center gap-2 py-10 text-sm text-steel"><Inbox className="h-8 w-8 text-sky" />{text}</div>;
export const DemoBanner = ({ note }: { note?: string }) => <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><b>DEMO MODE.</b> {note}</div>;
export const PageTitle = ({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><h1 className="text-2xl font-bold text-ink">{title}</h1>{sub && <p className="text-sm text-steel">{sub}</p>}</div>{children}
  </div>
);
export const Logo = ({ light = false }: { light?: boolean }) => (
  <span className={`flex items-center gap-2 text-xl font-extrabold ${light ? "text-white" : "text-ink"}`}>
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm text-white">H</span>HireHub
  </span>
);
