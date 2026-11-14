"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/components/ui/toast";

type Step = "account" | "otp" | "password" | "done";

const OTP_SECONDS = 300;

async function postJson(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? "The request failed.");
  }
  return payload;
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Portal password recovery: account → SMS OTP with countdown → new password + confirm. */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");
  const [login, setLogin] = useState("");
  const [phoneHint, setPhoneHint] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value <= 0 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  async function sendCode(identifier = login) {
    const payload = await postJson("/api/auth/forgot-password/send-otp", { login: identifier.trim() });
    setPhoneHint(payload.phoneHint ?? "");
    setSecondsLeft(payload.expiresInSeconds ?? OTP_SECONDS);
    setOtp("");
    return payload;
  }

  async function submitAccount(event: FormEvent) {
    event.preventDefault();
    const value = login.trim();
    if (!value) {
      setError("Enter your username or email.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const payload = await sendCode(value);
      setStep("otp");
      toast.success("Verification code sent", {
        description: payload.phoneHint
          ? `Check the SMS sent to ${payload.phoneHint}.`
          : "Check the SMS sent to your registered phone number.",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the verification code.");
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    if (secondsLeft > 0 || pending) return;
    setPending(true);
    setError("");
    try {
      const payload = await sendCode();
      setPhoneHint(payload.phoneHint ?? phoneHint);
      toast.success("A new code was sent.");
      otpRefs.current[0]?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resend the code.");
    } finally {
      setPending(false);
    }
  }

  function updateOtpDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = otp.padEnd(6, " ").split("");
    next[index] = digit || " ";
    const value = next.join("").replace(/ /g, "").slice(0, 6);
    setOtp(value);
    setError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (!digit && index > 0) otpRefs.current[index - 1]?.focus();
  }

  async function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    if (secondsLeft <= 0) {
      setError("This code has expired. Request a new one.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await postJson("/api/auth/forgot-password/verify-otp", { login: login.trim(), otp });
      setStep("password");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not verify the code.");
    } finally {
      setPending(false);
    }
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters for the new password.");
      return;
    }
    if (password !== confirm) {
      setError("The password and confirmation do not match.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await postJson("/api/auth/forgot-password/reset-password", {
        login: login.trim(),
        otp,
        newPassword: password,
        newPassword_confirmation: confirm,
      });
      setStep("done");
      toast.success("Password updated. You can sign in now.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset the password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-card p-5 pb-7 text-foreground shadow-2xl sm:p-6 sm:pb-8">
      <div className="flex flex-col items-center text-center">
        <Logo size="lg" className="mb-3 shadow-md" />
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-success">Password Recovery</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
          {step === "done" ? "Password updated" : step === "password" ? "Choose a new password" : step === "otp" ? "Enter verification code" : "Reset your password"}
        </h1>
        <p className="mt-1.5 text-supporting leading-5 text-muted-foreground">
          {step === "account" && "Enter your administrator username or email. We will SMS a code to the phone on your account."}
          {step === "otp" && `Enter the 6-digit code sent to ${phoneHint || "your registered phone"}.`}
          {step === "password" && "Enter a new password and confirm it. You will use this to sign in to the Portal."}
          {step === "done" && "Your administrator password was changed. Sign in with the new password."}
        </p>
      </div>

      {step === "account" && (
        <form onSubmit={submitAccount} noValidate className="mt-6 space-y-4">
          <Field>
            <FieldLabel htmlFor="account-login" required>Username or email</FieldLabel>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="account-login" value={login} onChange={(event) => { setLogin(event.target.value); setError(""); }}
                autoFocus className="pl-10" placeholder="Enter username or email" aria-invalid={Boolean(error)} />
            </div>
            <FieldError>{error}</FieldError>
          </Field>
          <Button disabled={pending} className="w-full">
            {pending ? <><LoaderCircle className="mr-1 animate-spin" />Sending code…</> : <>Send verification code <ArrowRight className="ml-1 size-4" /></>}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} noValidate className="mt-6 space-y-4">
          <Field>
            <FieldLabel required>Verification code</FieldLabel>
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Input
                  key={index}
                  ref={(node) => { otpRefs.current[index] = node; }}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={otp[index] ?? ""}
                  onChange={(event) => updateOtpDigit(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
                  }}
                  onPaste={(event) => {
                    event.preventDefault();
                    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                    if (!pasted) return;
                    setOtp(pasted);
                    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
                  }}
                  className="h-12 w-11 px-0 text-center text-lg font-semibold tabular-nums"
                  aria-label={`Digit ${index + 1}`}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            <FieldError>{error}</FieldError>
          </Field>

          <Button disabled={pending || otp.length !== 6 || secondsLeft <= 0} className="w-full">
            {pending ? <><LoaderCircle className="mr-1 animate-spin" />Checking…</> : <><ShieldCheck className="mr-1 size-4" />Verify code</>}
          </Button>

          <div className="text-center text-sm">
            {secondsLeft > 0 ? (
              <span className="text-muted-foreground">Resend code in {formatCountdown(secondsLeft)}</span>
            ) : (
              <button type="button" className="font-medium text-success underline-offset-2 hover:underline" onClick={() => void resendCode()} disabled={pending}>
                Resend OTP
              </button>
            )}
          </div>

          <Button type="button" variant="ghost" className="w-full" onClick={() => { setStep("account"); setError(""); setOtp(""); }}>
            <ArrowLeft className="mr-1 size-4" />Use a different account
          </Button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} noValidate className="mt-6 space-y-4">
          <Field>
            <FieldLabel htmlFor="new-password" required>New password</FieldLabel>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="new-password" type={showPassword ? "text" : "password"} value={password}
                onChange={(event) => { setPassword(event.target.value); setError(""); }}
                autoFocus className="pl-10 pr-10" placeholder="At least 8 characters" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password" required>Confirm password</FieldLabel>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm-password" type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(event) => { setConfirm(event.target.value); setError(""); }}
                className="pl-10 pr-10" placeholder="Repeat the new password" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? "Hide confirmation" : "Show confirmation"}>
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <FieldError>{error}</FieldError>
          </Field>
          <Button disabled={pending} className="w-full">
            {pending ? <><LoaderCircle className="mr-1 animate-spin" />Saving…</> : <>Save new password <ArrowRight className="ml-1 size-4" /></>}
          </Button>
        </form>
      )}

      {step === "done" && (
        <div className="mt-6 space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="text-sm font-medium text-foreground">You can now sign in with your new password.</p>
          <Button className="w-full" onClick={() => router.push("/login")}>
            Return to sign in <ArrowRight className="ml-1 size-4" />
          </Button>
        </div>
      )}

      {step !== "done" && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-success hover:underline">Back to sign in</Link>
        </p>
      )}
    </section>
  );
}
