"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";

type RecordPage = { current_page: number; per_page: number; last_page: number; total: number };

/** Pagination for read-only Laravel registries; local search is scoped to the loaded page. */
export function useRecordPage<T extends RecordPage>(endpoint: string, initialData: T | null, initialError?: string) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialData?.current_page ?? 1);
  const [pageSize, setPageSize] = useState(initialData?.per_page ?? 15);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(undefined);
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(pageSize) });
        const response = await authenticatedFetch(`${endpoint}?${params}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || payload.status === false || !payload.data) throw new Error(payload.message ?? "Records could not be loaded.");
        if (controller.signal.aborted) return;
        setData(payload.data);
        const lastPage = Math.max(1, payload.data.last_page);
        if (page > lastPage) setPage(lastPage);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Records could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [endpoint, page, pageSize, revision]);

  return { data, error, loading, page, pageSize, setPage,
    setPageSize: (value: number) => { setPageSize(value); setPage(1); },
    reload: () => setRevision((value) => value + 1),
  };
}
