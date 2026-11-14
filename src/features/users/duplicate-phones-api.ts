"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";

export type PhoneRecord = { source: "login" | "profile"; label: string; value: string };

export type DuplicateAccount = {
  userId: number;
  username: string;
  name: string;
  role: string;
  status: string;
  createdAt: string | null;
  lastActiveAt: string | null;
  records: PhoneRecord[];
};

export type DuplicatePhone = { phone: string; reason: "shared" | "mismatch"; accounts: DuplicateAccount[] };

async function readGroups(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.status === false) {
    const errors = payload.errors && typeof payload.errors === "object" ? Object.values(payload.errors as Record<string, string[]>).flat() : [];
    throw new Error(errors[0] ?? payload.message ?? "The request failed.");
  }
  return payload.data as DuplicatePhone[];
}

/** Changes or clears ([phone] null) one phone record and returns the remaining duplicates. */
export async function updateAccountPhone(userId: number, source: PhoneRecord["source"], phone: string | null) {
  return readGroups(await authenticatedFetch(`/api/admin/users/${userId}/phone`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, phone }),
  }));
}

/** Phone numbers that cannot sign in because they point at more than one account. */
export function useDuplicatePhones() {
  const [groups, setGroups] = useState<DuplicatePhone[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setError("");
    try {
      setGroups(await readGroups(await authenticatedFetch("/api/admin/users/duplicate-phones", { cache: "no-store" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load duplicate phone numbers.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return { groups, error, load, setGroups };
}
