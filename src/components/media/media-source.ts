"use client";

import { useEffect, useMemo } from "react";

/**
 * A file the admin can review. Exactly one location is used, in order:
 * a ready URL (proxy path or CDN link), a media-service key streamed through
 * the admin proxy, or a legacy base64 payload kept in JSON.
 */
export type MediaSource = {
  name: string;
  mime?: string | null;
  size?: number | null;
  href?: string | null;
  mediaKey?: string | null;
  base64?: string | null;
};

type MediaKind = "image" | "pdf" | "other";

const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

export function mediaKind(source: Pick<MediaSource, "name" | "mime">): MediaKind {
  const mime = source.mime?.toLowerCase() ?? "";
  const extension = source.name.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || imageExtensions.includes(extension)) return "image";
  if (mime === "application/pdf" || extension === "pdf") return "pdf";
  return "other";
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "";
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

/** Treats `http(s)://` and same-origin paths as URLs; anything else is a media-service key. */
export function mediaSourceFrom(value: string | null | undefined, name?: string): MediaSource | null {
  if (!value) return null;
  const label = name ?? decodeURIComponent(value.split("?")[0].split("/").pop() || "Document");
  return /^(https?:)?\/\//i.test(value) || value.startsWith("/") ? { name: label, href: value } : { name: label, mediaKey: value };
}

/**
 * Reads a documents column (JSON string, `{label: url}` object or list of
 * URLs/keys) into labelled sources.
 */
export function mediaSourcesFrom(value: unknown): MediaSource[] {
  let parsed = value;
  if (typeof value === "string") {
    try { parsed = JSON.parse(value); } catch { parsed = [value]; }
  }
  const humanize = (label: string) => label.replace(/[_-]+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
  const entries: Array<[string | undefined, unknown]> = Array.isArray(parsed)
    ? parsed.map((item) => [undefined, item])
    : parsed && typeof parsed === "object" ? Object.entries(parsed) : [];
  return entries.flatMap(([label, item]) => {
    const source = typeof item === "string" ? mediaSourceFrom(item, label ? humanize(label) : undefined) : null;
    return source ? [source] : [];
  });
}

const mimeFor = (source: MediaSource) => source.mime ?? (mediaKind(source) === "pdf" ? "application/pdf" : mediaKind(source) === "image" ? `image/${source.name.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpeg"}` : "application/octet-stream");

/** Resolves a source to a URL the browser can render; base64 becomes a blob URL for the lifetime of the component. */
export function useMediaUrl(source: MediaSource | null) {
  const direct = source?.href ?? (source?.mediaKey ? `/api/admin/media/file?key=${encodeURIComponent(source.mediaKey)}` : null);
  const base64 = direct ? null : source?.base64 ?? null;
  const mime = source ? mimeFor(source) : "";
  const blobUrl = useMemo(() => {
    if (!base64 || typeof window === "undefined") return null;
    try {
      const raw = base64.includes(",") && base64.startsWith("data:") ? base64.slice(base64.indexOf(",") + 1) : base64;
      const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      return URL.createObjectURL(new Blob([bytes], { type: mime }));
    } catch {
      return null;
    }
  }, [base64, mime]);
  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, [blobUrl]);
  return direct ?? blobUrl;
}
