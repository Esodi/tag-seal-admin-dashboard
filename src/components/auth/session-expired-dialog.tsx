"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  SESSION_EXPIRED_EVENT,
  SESSION_RESTORED_EVENT,
  clearSessionExpiredFlag,
  isSessionExpiredFlagged,
} from "@/lib/auth/session";

export function SessionExpiredDialog() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();

  const isProtected = Boolean(pathname?.startsWith("/dashboard"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isProtected) {
      clearSessionExpiredFlag();
      setOpen(false);
      return;
    }

    let rafId = 0;
    // Defer opening until after the initial hydration frame so Radix aria-hidden
    // does not mutate sibling Suspense containers during React hydration.
    if (isSessionExpiredFlagged()) {
      rafId = window.requestAnimationFrame(() => setOpen(true));
    }

    const expired = () => setOpen(true);
    const restored = () => setOpen(false);

    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener(SESSION_RESTORED_EVENT, restored);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener(SESSION_RESTORED_EVENT, restored);
    };
  }, [isProtected, mounted]);

  if (!mounted || !isProtected) return null;

  const handleSignIn = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (signingOut) return;
    setSigningOut(true);
    clearSessionExpiredFlag();
    await fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => undefined);
    setOpen(false);
    window.location.replace("/login?expired=1");
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!signingOut) setOpen(next); }}>
      <AlertDialogContent className="max-w-md border-amber-500/20 bg-background/95 backdrop-blur-xl">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <LockKeyhole className="size-6" />
          </AlertDialogMedia>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
            Session protection
          </span>
          <AlertDialogTitle className="text-lg font-bold tracking-tight">
            Your session has ended
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
            Sign in again to continue. Your current dashboard location will be restored after authentication.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={handleSignIn}
            disabled={signingOut}
            className="w-full bg-primary font-medium hover:bg-primary/90"
          >
            {signingOut ? "Signing out..." : "Sign in again"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
