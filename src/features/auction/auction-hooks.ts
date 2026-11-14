"use client";

import { useEffect, useState } from "react";
import type { LocationOption, LocationOptionsResponse } from "@/features/locations/types";
import { authenticatedFetch } from "@/lib/auth/session";
import type { AuctionCentreRecord } from "./types";

type Loaded<T> = { data: T; error: string | null; loading: boolean };

/** Loads active centres while a form that needs them is open. */
export function useActiveCentres(open: boolean): Loaded<AuctionCentreRecord[]> {
  const [state, setState] = useState<Loaded<AuctionCentreRecord[]>>({ data: [], error: null, loading: false });
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setState((old) => ({ ...old, loading: true }));
    authenticatedFetch("/api/admin/auction/centres?status=active&per_page=100", { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message ?? "Could not load the centres.");
        setState({ data: payload.data?.data ?? [], error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: [], error: error instanceof Error ? error.message : "Could not load the centres.", loading: false });
      });
    return () => controller.abort();
  }, [open]);
  return state;
}

export type RegionDistrictOptions = { regions: LocationOption[]; districts: LocationOption[] };

/** Regions and districts (each district carries its region as `parent`). */
export function useRegionDistrictOptions(open: boolean): Loaded<RegionDistrictOptions> {
  const [state, setState] = useState<Loaded<RegionDistrictOptions>>({ data: { regions: [], districts: [] }, error: null, loading: false });
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setState((old) => ({ ...old, loading: true }));
    authenticatedFetch("/api/admin/locations/wards/options", { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as LocationOptionsResponse & { message?: string };
        if (!response.ok) throw new Error(payload.message ?? "Could not load regions and districts.");
        setState({ data: { regions: payload.data?.regions ?? [], districts: payload.data?.districts ?? [] }, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ data: { regions: [], districts: [] }, error: error instanceof Error ? error.message : "Could not load regions and districts.", loading: false });
      });
    return () => controller.abort();
  }, [open]);
  return state;
}
