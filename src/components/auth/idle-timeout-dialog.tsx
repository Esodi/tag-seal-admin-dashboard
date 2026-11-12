"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/toast";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { markSessionExpired } from "@/lib/auth/session";
import {
  INACTIVITY_TIMEOUT_MINUTES,
  INACTIVITY_WARNING_COUNTDOWN_SECONDS,
} from "@/lib/constant_values";

const IDLE_TIME_LIMIT_MS = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

export function IdleTimeoutDialog() {
  const [open, setOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(INACTIVITY_WARNING_COUNTDOWN_SECONDS);
  const [refreshing, setRefreshing] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { status, refreshSessionKeepAlive, signOut } = useAuthSession();

  const isProtected = Boolean(pathname?.startsWith("/dashboard"));
  const lastActivityRef = useRef<number>(0);
  const openRef = useRef(open);
  openRef.current = open;

  // Track user activity on window
  useEffect(() => {
    if (!isProtected || status !== "authenticated") {
      setOpen(false);
      return;
    }

    const resetActivity = () => {
      // Only track activity if the confirmation dialog is not open
      if (!openRef.current) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetActivity();
          throttleTimeout = null;
        }, 500);
      }
    };

    for (const evt of events) {
      window.addEventListener(evt, throttledHandler, { passive: true });
    }

    lastActivityRef.current = Date.now();

    return () => {
      for (const evt of events) {
        window.removeEventListener(evt, throttledHandler);
      }
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isProtected, status]);

  // Main tick interval
  useEffect(() => {
    if (!isProtected || status !== "authenticated") {
      setOpen(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (!openRef.current) {
        if (elapsed >= IDLE_TIME_LIMIT_MS) {
          setSecondsRemaining(INACTIVITY_WARNING_COUNTDOWN_SECONDS);
          setOpen(true);
        }
      } else {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Time expired
            clearInterval(interval);
            setOpen(false);
            markSessionExpired();
            const returnTo = `${window.location.pathname}${window.location.search}`;
            void signOut().then(() => {
              router.push(`/login?expired=idle&returnTo=${encodeURIComponent(returnTo)}`);
            });
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isProtected, router, signOut, status]);

  if (!isProtected || status !== "authenticated") {
    return null;
  }

  const handleStillOn = async () => {
    setRefreshing(true);
    try {
      const success = await refreshSessionKeepAlive();
      if (success) {
        lastActivityRef.current = Date.now();
        setOpen(false);
        toast.success("Session refreshed. You're still signed in.", { id: "session-refreshed" });
      } else {
        markSessionExpired();
        setOpen(false);
        router.push("/login?expired=1");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOutNow = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md border-amber-500/20 bg-background/95 backdrop-blur-xl">
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-lg font-bold tracking-tight">
            Are you still working?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have been inactive for {INACTIVITY_TIMEOUT_MINUTES} {INACTIVITY_TIMEOUT_MINUTES === 1 ? "minute" : "minutes"}. For security reasons, your dashboard session will close automatically.
          </AlertDialogDescription>
          <p className="text-supporting tabular-nums text-muted-foreground" aria-live="polite">
            Session closes in {secondsRemaining} sec.
          </p>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-row">
          <AlertDialogCancel
            onClick={handleSignOutNow}
            size="default"
            className="w-full font-normal text-muted-foreground sm:flex-1"
          >
            <LogOut className="mr-1.5 size-4" />
            Sign out
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleStillOn}
            disabled={refreshing}
            size="default"
            className="w-full font-medium sm:flex-1"
          >
            <RefreshCw className={`mr-1.5 size-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Stay signed in"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
