"use client";

import { toast } from "@/components/ui/toast";
import { authenticatedFetch } from "@/lib/auth/session";

export class RegistryApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "RegistryApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

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
    const fieldErrors: Record<string, string> = {};
    if (payload.errors && typeof payload.errors === "object") {
      for (const [key, val] of Object.entries(payload.errors as Record<string, unknown>)) {
        if (Array.isArray(val) && typeof val[0] === "string" && val[0].trim()) {
          fieldErrors[key] = val[0].trim();
        } else if (typeof val === "string" && val.trim()) {
          fieldErrors[key] = val.trim();
        }
      }
    }
    const firstError = Object.values(fieldErrors)[0];
    const message =
      firstError ??
      (typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : null) ??
      (response.status === 413 ? "The uploaded file is too large. Each document must be 8 MB or smaller." : "The request failed.");
    throw new RegistryApiError(message, response.status, fieldErrors);
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
