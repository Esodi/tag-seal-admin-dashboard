"use client";

import { useState } from "react";
import { Download, ExternalLink, Eye, FileText, ImageIcon, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatBytes, mediaKind, useMediaUrl, type MediaSource } from "./media-source";

export function MediaPreviewDialog({ source, open, onOpenChange, description }: {
  source: MediaSource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
}) {
  const url = useMediaUrl(open ? source : null);
  const [zoomed, setZoomed] = useState(false);
  const kind = source ? mediaKind(source) : "other";
  return <Dialog open={open} onOpenChange={(next) => { if (!next) setZoomed(false); onOpenChange(next); }}>
    <DialogContent size="xl">
      <DialogHeader className="px-5 pt-6 sm:px-7">
        <DialogTitle className="truncate">{source?.name ?? "Document"}</DialogTitle>
        <DialogDescription>{description ?? ([formatBytes(source?.size), kind === "pdf" ? "PDF document" : kind === "image" ? "Image" : "File"].filter(Boolean).join(" · "))}</DialogDescription>
      </DialogHeader>
      <DialogBody className="py-4">
        {!url ? <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">This file could not be loaded.</p>
          : kind === "image" ? <div className={cn("relative overflow-auto rounded-lg border bg-muted/30", zoomed ? "max-h-[70vh]" : "")}>
            <img src={url} alt={source?.name ?? "Preview"} onClick={() => setZoomed((z) => !z)} className={cn("mx-auto cursor-zoom-in", zoomed ? "max-w-none cursor-zoom-out" : "max-h-[65vh] w-auto object-contain")} />
          </div>
          : kind === "pdf" ? <iframe src={url} title={source?.name ?? "PDF preview"} className="h-[70vh] w-full rounded-lg border bg-muted/30" />
          : <div className="grid place-items-center gap-3 rounded-lg border border-dashed p-10 text-center">
            <FileText className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">This file type cannot be previewed in the browser. Open or download it to review.</p>
          </div>}
      </DialogBody>
      <DialogFooter className="px-5 pb-5 sm:px-7">
        {kind === "image" && url && <Button type="button" variant="ghost" onClick={() => setZoomed((z) => !z)}>{zoomed ? <ZoomOut /> : <ZoomIn />}{zoomed ? "Fit to screen" : "Actual size"}</Button>}
        {url && <Button asChild variant="outline"><a href={url} download={source?.name}><Download />Download</a></Button>}
        {url && <Button asChild><a href={url} target="_blank" rel="noreferrer"><ExternalLink />Open in new tab</a></Button>}
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}

/** Inline trigger for one file: name, size and a Preview action. */
export function MediaPreviewButton({ source, onViewed, className }: { source: MediaSource; onViewed?: () => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const Icon = mediaKind(source) === "image" ? ImageIcon : FileText;
  return <>
    <button type="button" onClick={() => { setOpen(true); onViewed?.(); }} className={cn("inline-flex max-w-full items-center gap-1.5 text-left font-medium text-primary underline-offset-4 hover:underline", className)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{source.name}</span>
      {formatBytes(source.size) && <span className="shrink-0 text-xs font-normal text-muted-foreground">{formatBytes(source.size)}</span>}
      <Eye className="size-3.5 shrink-0 opacity-70" aria-hidden />
    </button>
    <MediaPreviewDialog source={source} open={open} onOpenChange={setOpen} />
  </>;
}

/** A list of documents, or a thumbnail gallery for photos. */
export function MediaPreviewList({ items, variant = "list", emptyText = "No files attached.", onViewed }: {
  items: MediaSource[];
  variant?: "list" | "gallery";
  emptyText?: string;
  onViewed?: (source: MediaSource) => void;
}) {
  const [active, setActive] = useState<MediaSource | null>(null);
  if (!items.length) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  if (variant === "list") return <ul className="grid gap-2">{items.map((item, index) => <li key={`${item.name}-${index}`} className="min-w-0"><MediaPreviewButton source={item} onViewed={() => onViewed?.(item)} /></li>)}</ul>;
  return <>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((item, index) => <GalleryTile key={`${item.name}-${index}`} source={item} onOpen={() => { setActive(item); onViewed?.(item); }} />)}
    </div>
    <MediaPreviewDialog source={active} open={active !== null} onOpenChange={(open) => { if (!open) setActive(null); }} />
  </>;
}

function GalleryTile({ source, onOpen }: { source: MediaSource; onOpen: () => void }) {
  const url = useMediaUrl(source);
  return <button type="button" onClick={onOpen} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Preview ${source.name}`}>
    {url ? <img src={url} alt={source.name} className="size-full object-cover transition-transform group-hover:scale-105" loading="lazy" /> : <ImageIcon className="m-auto size-6 text-muted-foreground" aria-hidden />}
  </button>;
}
