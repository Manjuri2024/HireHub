"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ErrorBox, Logo } from "@/components/ui";

const schema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(1, "Password is required") });
type F = z.infer<typeof schema>;

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const onSubmit = async (v: F) => {
    setError("");
    try { const r = await api("/auth/login", { method: "POST", body: v }); await login(r.token); router.push("/dashboard"); }
    catch (e) { setError((e as Error).message); }
  };
  const demo = (email: string) => { setValue("email", email); setValue("password", "Password@123"); };

  return (
    <main className="grid min-h-screen place-items-center bg-mist/30 p-6">
      <div className="card w-full max-w-md space-y-4">
        <Logo /><h1 className="text-xl font-bold">Welcome back</h1>
        {error && <ErrorBox message={error} />}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div><label className="label">Email</label><input className="input" {...register("email")} />{errors.email && <p className="err">{errors.email.message}</p>}</div>
          <div><label className="label">Password</label><input type="password" className="input" {...register("password")} />{errors.password && <p className="err">{errors.password.message}</p>}</div>
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Log in"}</button>
        </form>
        <div className="rounded-lg bg-mist/50 p-3 text-xs text-brand">
          Demo accounts (after running <code>npm run seed</code>):
          <div className="mt-2 flex flex-wrap gap-2">
            {["student", "recruiter", "admin"].map((r) => <button key={r} type="button" className="btn-outline !py-1 text-xs" onClick={() => demo(`${r}@hirehub.demo`)}>{r}</button>)}
          </div>
        </div>
        <p className="text-sm text-steel">New here? <Link href="/register" className="font-semibold text-brand underline">Create an account</Link></p>
      </div>
    </main>
  );
}
