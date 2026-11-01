"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { toast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
  const [login, setLogin] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!login.trim()) {
      toast.error("Please enter your username or administrator email.");
      return;
    }

    setPending(true);
    // Simulate recovery request dispatch
    setTimeout(() => {
      setPending(false);
      setSubmitted(true);
      toast.success("Recovery request received", {
        description: "If an active account exists, password recovery instructions have been dispatched.",
        id: "recovery-dispatched",
      });
    }, 900);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07170f] p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/82 to-[#07170f]/94" />

      <div className="relative z-10 w-full max-w-[405px]">
        <Link
          href="/login"
          className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>

        <section className="rounded-2xl border bg-card p-5 pb-7 text-foreground shadow-2xl sm:p-6 sm:pb-8">
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" className="mb-3 shadow-md" />
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-success">
              Password Recovery
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
              Reset your password
            </h1>
            <p className="mt-1.5 text-supporting leading-5 text-muted-foreground">
              Enter your administrator username or email address.
            </p>
          </div>

          {submitted ? (
            <div className="mt-6 space-y-4 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
                <CheckCircle2 className="size-6" />
              </div>
              <p className="text-sm text-foreground font-medium">
                Instructions have been dispatched.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If your account is registered as an active system administrator, you will receive an
                email with instructions to reset your password shortly.
              </p>
              <Button asChild className="w-full mt-2">
                <Link href="/login">
                  Return to sign in <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <Field>
                <FieldLabel htmlFor="account-login" required>
                  Username or email
                </FieldLabel>
                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="account-login"
                    name="login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    required
                    autoFocus
                    className="pl-10"
                    placeholder="Enter username or email"
                  />
                </div>
              </Field>

              <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                <Mail className="size-4 shrink-0 text-success" />
                <span>Super administrators can also reset user credentials directly.</span>
              </div>

              <Button disabled={pending} className="w-full">
                {pending ? (
                  <>
                    <LoaderCircle className="animate-spin mr-1" />
                    Sending instructions…
                  </>
                ) : (
                  <>
                    Send recovery instructions <ArrowRight className="ml-1 size-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

