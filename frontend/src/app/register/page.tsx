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

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["student", "recruiter", "admin"]),
  organisation: z.string().optional(),
  inviteCode: z.string().optional(),
});

type F = z.infer<typeof schema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "student",
      organisation: "",
      inviteCode: "",
    },
  });

  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const role = watch("role");

  const onSubmit = async ({ organisation, ...values }: F) => {
    setError("");

    try {
      const body = {
        ...values,
        ...(role === "recruiter"
          ? { company: organisation }
          : { college: organisation }),
      };

      const response = await api("/auth/register", {
        method: "POST",
        body,
      });

      await login(response.token);

      router.push("/dashboard");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-mist/30 p-6">
      <div className="card w-full max-w-md space-y-4">
        <Logo />

        <h1 className="text-xl font-bold">Create your account</h1>

        {error && <ErrorBox message={error} />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="label">I am a</label>

            <select className="input" {...register("role")}>
              <option value="student">Student</option>
              <option value="recruiter">Company Recruiter</option>
              <option value="admin">College Placement Officer</option>
            </select>

            {errors.role && <p className="err">{errors.role.message}</p>}
          </div>

          <div>
            <label className="label">Full name</label>

            <input
              className="input"
              placeholder="Enter your full name"
              {...register("name")}
            />

            {errors.name && <p className="err">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>

            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              {...register("email")}
            />

            {errors.email && <p className="err">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">
              {role === "recruiter" ? "Company" : "College"}
            </label>

            <input
              className="input"
              placeholder={
                role === "recruiter"
                  ? "Enter your company name"
                  : "Enter your college name"
              }
              {...register("organisation")}
            />
          </div>

          {role === "admin" && (
            <div>
              <label className="label">Admin invite code</label>
              <input
                className="input"
                placeholder="Provided by your institution"
                {...register("inviteCode")}
              />
            </div>
          )}

          <div>
            <label className="label">Password</label>

            <input
              type="password"
              className="input"
              placeholder="Minimum 8 characters"
              {...register("password")}
            />

            {errors.password && (
              <p className="err">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-steel">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}