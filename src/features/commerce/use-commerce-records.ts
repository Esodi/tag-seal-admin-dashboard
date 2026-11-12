"use client";

import { useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";
import type { CommerceResource, CommerceResponse } from "./types";

export function useCommerceRecords(resource: CommerceResource, initialData: CommerceResponse | null, initialError?: string) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(!initialData);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("desc");
  const [pageSize, setPageSize] = useState(initialData?.per_page ?? 10);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ search: query.trim(), status, sort, page: String(page), per_page: String(pageSize) });
        const response = await authenticatedFetch(`/api/admin/commerce/${resource}?${params}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || payload.status === false || !Array.isArray(payload.data?.data)) throw new Error(payload.message ?? "Commerce records could not be loaded.");
        if (controller.signal.aborted) return;
        setData(payload.data);
        const last = Math.max(1, payload.data.last_page);
        if (page > last) setPage(last);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Commerce records could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [resource, query, status, sort, pageSize, page, revision]);

  return { data, error, loading, query, status, sort, page, pageSize,
    setQuery: (value: string) => { setQuery(value); setPage(1); },
    setStatus: (value: string) => { setStatus(value); setPage(1); },
    setSort: (value: string) => { setSort(value); setPage(1); },
    setPageSize: (value: number) => { setPageSize(value); setPage(1); },
    setPage, reload: () => setRevision((value) => value + 1),
    reset: () => { setQuery(""); setStatus("all"); setSort("desc"); setPage(1); },
  };
}
