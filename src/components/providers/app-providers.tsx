"use client";

import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";
import { SessionExpiredDialog } from "@/components/auth/session-expired-dialog";
import { IdleTimeoutDialog } from "@/components/auth/idle-timeout-dialog";
import { Toaster } from "@/components/ui/toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthSessionProvider>
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <SessionExpiredDialog />
          <IdleTimeoutDialog />
        </Suspense>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}
