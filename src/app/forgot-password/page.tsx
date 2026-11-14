import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07170f] p-4 sm:p-6">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/tag-seal-farm.jpg')" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-[#062617]/95 via-[#123d28]/82 to-[#07170f]/94" />

      <div className="relative z-10 w-full max-w-[405px]">
        <Link href="/login" className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-white/70 transition hover:text-white">
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
