"use client";

import { useCallback, useEffect, useState } from "react";
import { authenticatedFetch } from "@/lib/auth/session";
import type { DairyResource, DairyResponse } from "./types";

export function useDairyRecords(resource: DairyResource, initialData: DairyResponse | null, initialError?: string, paused = false) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("desc");
  const [status, setStatus] = useState("all");
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load(silent = false) {
      if (pending) return;
      pending = true;
      if (!silent) { setLoading(true); setError(undefined); }
      try {
        const params = new URLSearchParams({ page: String(page), per_page: String(pageSize), sort, search });
        if (status !== "all") params.set("status", status);
        const response = await authenticatedFetch(`/api/admin/dairy/${resource}?${params}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || payload.status === false || !payload.data) throw new Error(payload.message ?? "Records could not be loaded.");
        if (controller.signal.aborted) return;
        setData(payload.data);
        setError(undefined);
        if (page > payload.data.last_page) setPage(Math.max(1, payload.data.last_page));
      } catch (e) {
        if (!controller.signal.aborted && !silent) setError(e instanceof Error ? e.message : "Records could not be loaded.");
      } finally {
        pending = false;
        if (!controller.signal.aborted && !silent) setLoading(false);
      }
    }
    const timer = window.setTimeout(() => void load(), search ? 300 : 0);
    const refresh = window.setInterval(() => {
      if (!paused && document.visibilityState === "visible" && !document.querySelector('[role="dialog"], [role="menu"]')) void load(true);
    }, 30000);
    return () => { controller.abort(); window.clearTimeout(timer); window.clearInterval(refresh); };
  }, [resource, page, pageSize, search, sort, status, revision, paused]);

  return { data, error, loading, page, pageSize, search, sort, status, setPage, reload,
    setSearch: (value: string) => { setSearch(value); setPage(1); },
    setSort: (value: string) => { setSort(value); setPage(1); },
    setStatus: (value: string) => { setStatus(value); setPage(1); },
    setPageSize: (value: number) => { setPageSize(value); setPage(1); },
  };
}
