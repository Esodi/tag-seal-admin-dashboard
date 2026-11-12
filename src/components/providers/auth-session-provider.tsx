"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markSessionExpired, markSessionRestored } from "@/lib/auth/session";

export type AdminUser = {
  id: number;
  username?: string;
  email?: string;
  role: string;
  platformRole?: "admin" | "superAdmin";
  status?: string;
  firstname?: string;
  surname?: string;
  phone1?: string;
};

export type AuthSession = {
  user: AdminUser;
  profile?: Record<string, unknown> | null;
  expiresAt: number;
  verified?: boolean;
};

type SessionContextValue = {
  session: AuthSession | null;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<AuthSession | null>;
  refreshSessionKeepAlive: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUser: (user: AdminUser) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<SessionContextValue["status"]>("loading");
  const sessionRef = useRef<AuthSession | null>(null);
  const statusRef = useRef<SessionContextValue["status"]>("loading");
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (!response.ok) {
        if (response.status !== 401) return sessionRef.current;
        const previouslyAuthenticated = statusRef.current === "authenticated";
        setSession(null);
        setStatus("unauthenticated");
        if (previouslyAuthenticated && window.location.pathname.startsWith("/dashboard")) {
          markSessionExpired();
        }
        return null;
      }
      const next = (await response.json()) as AuthSession;
      sessionRef.current = next;
      statusRef.current = "authenticated";
      setSession(next);
      setStatus("authenticated");
      return next;
    } catch {
      setStatus((current) => (current === "loading" ? "unauthenticated" : current));
      return null;
    }
  }, []);

  const refreshSessionKeepAlive = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 401) {
          markSessionExpired();
        }
        return false;
      }
      const data = await response.json();
      if (data?.expiresAt) {
        setSession((current) => (current ? { ...current, expiresAt: data.expiresAt } : current));
      }
      markSessionRestored();
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    sessionRef.current = session;
    statusRef.current = status;
  }, [session, status]);

  // Initial session hydration
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Periodic background check & re-check on tab focus
  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 60_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  // Intercept 401 responses globally from any client fetch call
  useEffect(() => {
    if (typeof window === "undefined") return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof URL
            ? args[0].pathname
            : (args[0] as Request)?.url || "";
        // Don't mark expired if it's the login form itself failing authentication credentials
        if (!url.includes("/api/auth/login")) {
          markSessionExpired();
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      status,
      refresh,
      refreshSessionKeepAlive,
      updateUser: (user) => setSession((current) => (current ? { ...current, user } : current)),
      signOut: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setSession(null);
        setStatus("unauthenticated");
        router.replace("/login");
        router.refresh();
      },
    }),
    [refresh, refreshSessionKeepAlive, router, session, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useAuthSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useAuthSession must be used inside AuthSessionProvider");
  return value;
}
