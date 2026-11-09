"use client";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { Empty, ErrorBox, PageTitle, Spinner } from "@/components/ui";

const Chart = ({ title, data, x }: { title: string; data: any[]; x: string }) => (
  <div className="card"><h2 className="mb-3 font-semibold">{title}</h2>
    {data.length ? <div className="h-64"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#C7E5F2" /><XAxis dataKey={x} fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Bar dataKey="count" fill="#216485" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <Empty text="No data yet." />}
  </div>
);

export default function Analytics() {
  const q = useQuery({ queryKey: ["placement"], queryFn: () => api<any>("/analytics/placement") });
  if (q.isLoading) return <Spinner />;
  if (q.error) return <ErrorBox message={(q.error as Error).message} />;
  const d = q.data;
  return (
    <>
      <PageTitle title="Placement Analytics" sub="Computed live from your database; nothing is estimated." />
      <div className="grid gap-4 md:grid-cols-2">
        <Chart title="Application pipeline" data={d.pipeline} x="status" />
        <Chart title="Hires by company" data={d.hiresByCompany} x="company" />
        <Chart title="Top student skills" data={d.topSkills} x="skill" />
        <div className="card"><h2 className="mb-3 font-semibold">Students</h2>
          {d.students.length ? <table className="w-full text-sm"><thead><tr className="text-left text-steel"><th>Name</th><th>CGPA</th><th>Skills</th><th>Status</th></tr></thead><tbody>
            {d.students.map((s: any) => <tr key={s.id} className="border-t border-mist"><td className="py-1">{s.name}</td><td>{s.cgpa || "-"}</td><td>{s.skills}</td><td>{s.placed ? "Placed" : "Seeking"}</td></tr>)}</tbody></table> : <Empty text="No students registered for your college." />}
        </div>
      </div>
    </>
  );
}
