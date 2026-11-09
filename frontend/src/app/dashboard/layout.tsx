"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { Bell, Briefcase, CalendarCheck, FileText, LayoutDashboard, LogOut, PieChart, Settings, Sparkles, User } from "lucide-react";
import { useAuth, Role } from "@/lib/auth";
import { Logo, Spinner } from "@/components/ui";

const nav: Record<Role, [string, string, any][]> = {
  student: [["/dashboard", "Dashboard", LayoutDashboard], ["/dashboard/jobs", "Jobs", Briefcase], ["/dashboard/applications", "Applications", FileText], ["/dashboard/interviews", "Interviews", CalendarCheck], ["/dashboard/ai", "AI Tools", Sparkles], ["/dashboard/profile", "Profile", User], ["/dashboard/notifications", "Notifications", Bell], ["/dashboard/settings", "Settings", Settings]],
  recruiter: [["/dashboard", "Dashboard", LayoutDashboard], ["/dashboard/jobs", "My Jobs", Briefcase], ["/dashboard/applications", "Pipeline", FileText], ["/dashboard/interviews", "Interviews", CalendarCheck], ["/dashboard/notifications", "Notifications", Bell], ["/dashboard/settings", "Settings", Settings]],
  admin: [["/dashboard", "Command Center", LayoutDashboard], ["/dashboard/analytics", "Analytics", PieChart], ["/dashboard/notifications", "Notifications", Bell], ["/dashboard/settings", "Settings", Settings]],
};

export default function DashLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  if (loading || !user) return <div className="p-10"><Spinner /></div>;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col bg-deep p-4 text-white md:flex">
        <Logo light />
        <nav className="mt-8 flex-1 space-y-1">
          {nav[user.role].map(([href, label, Icon]) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${path === href ? "bg-steel font-semibold" : "text-mist hover:bg-pine"}`}><Icon className="h-4 w-4" />{label}</Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist hover:bg-pine"><LogOut className="h-4 w-4" />Log out</button>
      </aside>
      <div className="flex-1 bg-mist/20">
        <div className="flex items-center justify-between border-b border-mist bg-white px-6 py-3 md:hidden">
          <Logo /><button onClick={logout} className="btn-outline !py-1">Log out</button>
        </div>
        <div className="flex gap-2 overflow-x-auto border-b border-mist bg-white px-4 py-2 md:hidden">
          {nav[user.role].map(([href, label]) => <Link key={href} href={href} className="badge whitespace-nowrap">{label}</Link>)}
        </div>
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </div>
    </div>
  );
}
