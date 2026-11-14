"use client";

import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";

/** Calls an admin proxy route and throws the server's message on failure. */
export async function registrySend<T = unknown>(path: string, method: string, body?: Record<string, unknown> | FormData): Promise<T> {
  const multipart = body instanceof FormData;
  const response = await authenticatedFetch(path, {
    method,
    headers: multipart ? { Accept: "application/json" } : { "Content-Type": "application/json" },
    body: multipart ? body : body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === false) {
    const firstError = payload.errors && typeof payload.errors === "object" ? Object.values(payload.errors as Record<string, string[]>)[0]?.[0] : undefined;
    throw new Error(firstError ?? payload.message ?? "The request failed.");
  }
  return payload.data as T;
}

/** Runs [action], shows the outcome as a toast and reports whether it worked. */
export async function registryRun(action: () => Promise<unknown>, success: string, onDone?: () => void) {
  try {
    await action();
    toast.success(success);
    onDone?.();
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "The request failed.");
    return false;
  }
}
