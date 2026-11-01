"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isProtected = Boolean(pathname?.startsWith("/dashboard"));

  useEffect(() => {
    if (!isProtected) {
      clearSessionExpiredFlag();
      setOpen(false);
      return;
    }

    // Check if session was already flagged expired on mount/page reload
    if (isSessionExpiredFlagged()) {
      setOpen(true);
    }

    const expired = () => setOpen(true);
    const restored = () => setOpen(false);

    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    window.addEventListener(SESSION_RESTORED_EVENT, restored);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
      window.removeEventListener(SESSION_RESTORED_EVENT, restored);
    };
  }, [isProtected]);

  if (!isProtected) return null;

  const handleSignIn = () => {
    setOpen(false);
    clearSessionExpiredFlag();
    router.push("/login?expired=1");
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
            className="w-full bg-primary font-medium hover:bg-primary/90"
          >
            Sign in again
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
