import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Admin sign in" };

function LoginFormSkeleton() {
  return (
    <div className="relative z-10 w-full max-w-[400px]">
      <div className="mb-3 h-4 w-24 animate-pulse rounded bg-white/20" />
      <div className="h-[460px] animate-pulse rounded-2xl border bg-card/60 p-6 shadow-2xl backdrop-blur-xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07170f] p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/82 to-[#07170f]/94" />
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
