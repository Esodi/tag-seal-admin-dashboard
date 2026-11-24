"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { consumeReturnTo, markSessionRestored } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/components/ui/toast";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, refresh } = useAuthSession();
  const [showPassword, setShowPassword] = useState(false);
  const method = "password";
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string;
    password?: string;
  }>({});

  const expiredParam = searchParams.get("expired");
  const returnToParam = searchParams.get("returnTo");

  // Already signed in → go to dashboard (Fresh Shop pattern)
  useEffect(() => {
    if (status !== "authenticated") return;
    if (expiredParam === "idle" || expiredParam === "1") return;
    const next = returnToParam?.startsWith("/") ? returnToParam : consumeReturnTo() ?? "/dashboard";
    router.replace(next);
  }, [status, expiredParam, returnToParam, router]);

  // Show session expiry / inactivity notification via Toast rather than in-card banners
  useEffect(() => {
    if (expiredParam === "idle") {
      toast.warning("Signed out due to inactivity", {
        description:
          "For your account security, your session was closed. Sign in again to resume your work.",
        id: "idle-timeout-toast",
        duration: 6000,
      });
    } else if (expiredParam === "1") {
      toast.error("Session expired", {
        description:
          "Your administrator session has ended. Please sign in again to continue.",
        id: "session-expired-toast",
        duration: 6000,
      });
    }
  }, [expiredParam]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const login = String(values.get("login") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const nextErrors = {
      ...(!login ? { login: "Enter your username or email." } : {}),
      ...(!password ? { password: "Enter your password." } : {}),
    };
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login,
          password,
          method,
          remember: values.get("remember") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Unable to sign in.", {
          id: "login-error",
        });
        return;
      }
      window.sessionStorage.setItem("tagseal:login-success", "1");
      markSessionRestored();
      await refresh();

      const savedReturnTo = consumeReturnTo();
      const rawTarget = savedReturnTo || returnToParam || "/dashboard";
      const target = rawTarget.startsWith("/dashboard")
        ? rawTarget
        : "/dashboard";

      router.replace(target);
      router.refresh();
    } catch {
      toast.error(
        "The authentication service is unavailable. Please try again shortly.",
        {
          id: "login-error",
        },
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-[450px]">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      <section className="rounded-2xl border bg-card p-5 pb-7 text-foreground shadow-2xl sm:p-10 sm:pb-10">
        {/* Centered Logo, Welcome Back, Title, and Description */}
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" className="mb-3 shadow-md" />
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-success">
            Welcome back
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
            Sign in to Tag & Seal
          </h1>
          <p className="mt-1.5 text-supporting leading-5 text-muted-foreground">
            Use your active system administrator account.
          </p>
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-3.5">
          <Field>
            <FieldLabel htmlFor="login" required>
              Username or email
            </FieldLabel>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="login"
                name="login"
                required
                autoFocus
                autoComplete="username"
                inputMode="text"
                aria-invalid={Boolean(fieldErrors.login)}
                aria-describedby={
                  fieldErrors.login ? "login-field-error" : undefined
                }
                onChange={() =>
                  fieldErrors.login &&
                  setFieldErrors((current) => ({
                    ...current,
                    login: undefined,
                  }))
                }
                className="pl-10"
                placeholder="Enter username or email"
              />
            </div>
            <FieldError id="login-field-error">{fieldErrors.login}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="password" required>
              Password
            </FieldLabel>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete={"current-password"}
                inputMode={"text"}
                maxLength={undefined}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? "password-field-error" : undefined
                }
                onChange={() =>
                  fieldErrors.password &&
                  setFieldErrors((current) => ({
                    ...current,
                    password: undefined,
                  }))
                }
                className="pl-10 pr-11"
                placeholder={"Enter your password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldError id="password-field-error">
              {fieldErrors.password}
            </FieldError>
          </Field>

          {/* Remember me & Forgot password link */}
          <div className="flex items-center justify-between gap-3 text-supporting">
            <label
              htmlFor="remember"
              className="flex cursor-pointer items-center gap-2 text-supporting text-muted-foreground select-none"
            >
              <Checkbox id="remember" name="remember" />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-success transition hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button disabled={pending} className="w-full">
            {pending ? (
              <>
                <LoaderCircle className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight />
              </>
            )}
          </Button>
        </form>
      </section>
    </div>
  );
}
