import type { ReactNode } from "react";

/** The paged list shape the admin list endpoints return inside `data`. */
export type RegistryResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  meta?: Record<string, number>;
};

export type RegistryConfig = {
  title: string;
  singular: string;
  description: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  statuses: string[];
  stats: Array<{ key: string; label: string; note: string }>;
};

export type RegistryColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (record: T) => ReactNode;
  value: (record: T) => string;
};

export function registryColumn<T>(key: string, label: string, value: RegistryColumn<T>["value"], render?: RegistryColumn<T>["render"], className?: string): RegistryColumn<T> {
  return { key, label, value, render: render ?? value, className };
}
