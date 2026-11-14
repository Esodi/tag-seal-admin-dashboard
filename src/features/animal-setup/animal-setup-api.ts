"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";

const BASE = "/api/admin/blueprints/animal-setup";

/** A failed request with every message the server returned, so all problems can be listed. */
export class SetupError extends Error {
  constructor(public messages: string[]) {
    super(messages[0] ?? "The request failed.");
  }
}

export async function sendTo<T>(base: string, path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await authenticatedFetch(`${base}${path}`, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === false) {
    const messages = payload.errors && typeof payload.errors === "object"
      ? Object.values(payload.errors as Record<string, string[] | string>).flat()
      : [];
    throw new SetupError(messages.length ? messages : [payload.message ?? "The request failed."]);
  }
  return payload.data as T;
}

export const setupSend = <T>(path: string, method = "GET", body?: unknown) => sendTo<T>(BASE, path, method, body);

/** Loads [base][path] and reloads on demand; [setData] accepts the fresh copy returned by a change. */
export function useAdminResource<T>(base: string, path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    sendTo<T>(base, path)
      .then((result) => { if (active) setData(result); })
      .catch((e: Error) => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [base, path, revision]);
  const reload = useCallback(() => setRevision((n) => n + 1), []);
  return { data, error, reload, setData };
}

export const useSetupResource = <T,>(path: string) => useAdminResource<T>(BASE, path);
