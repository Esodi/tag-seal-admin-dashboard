"use client";

import { useEffect, useState } from "react";
import type { FormSelectOption } from "@/components/ui/form-select";
import { authenticatedFetch } from "@/lib/auth/session";

export type LocationLevel = "regions" | "districts" | "wards" | "villages";

/** Loads one location level, filtered by its parent; levels below an empty parent stay empty. Countries and regions may load unfiltered. */
export function useCooperativeLocations(level: LocationLevel | "countries", parentId: string | null, enabled: boolean) {
  const [options, setOptions] = useState<FormSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waitingForParent = level !== "countries" && level !== "regions" && !parentId;

  useEffect(() => {
    if (!enabled || waitingForParent) {
      setOptions([]);
      return;
    }
    const controller = new AbortController();
    const query = new URLSearchParams({ level, ...(parentId ? { parent_id: parentId } : {}) });
    setLoading(true);
    setError(null);
    authenticatedFetch(`/api/admin/dairy/cooperatives/locations?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load locations.");
        setOptions(payload.data ?? []);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load locations.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [enabled, level, parentId, waitingForParent]);

  return { options, loading, error };
}
