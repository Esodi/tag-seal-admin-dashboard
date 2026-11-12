"use client";

import { useId, type ReactNode } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogSize,
} from "@/components/ui/dialog";

export interface CustomViewDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  closeLabel?: string;
  size?: DialogSize;
}

export function CustomViewDetailsDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  closeLabel = "Close",
  size = "xl",
}: CustomViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size} {...(!description ? { "aria-describedby": undefined } : {})} className="flex flex-col gap-0 overflow-hidden p-0 sm:p-0">
        <DialogHeader className="shrink-0 border-b bg-muted/20 px-5 py-5 pr-16 sm:px-7 sm:py-6 sm:pr-16">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <FileText className="size-3.5 text-primary" aria-hidden="true" /> Record details
          </div>
          <DialogTitle className="break-words text-xl leading-snug">{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <DialogBody className="space-y-6">{children}</DialogBody>

        <DialogFooter className="shrink-0 bg-muted/20 px-5 py-4 sm:px-7 [&_button]:min-h-10 sm:[&_button]:min-w-24">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {closeLabel}
            </Button>
          </DialogClose>
          {actions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DetailItem({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl data-slot="detail-item" className={cn("h-full min-w-0 rounded-xl border border-border/70 bg-muted/15 px-4 py-3.5", className)}>
      <dt className="text-[12px] font-medium leading-5 text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-[14px] font-medium leading-6 whitespace-pre-wrap [overflow-wrap:anywhere]">{children ?? "—"}</dd>
    </dl>
  );
}

export function DetailSection({ title, description, children, className }: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("min-w-0 space-y-3", className)}>
      <div>
        <h3 id={id} className="text-[14px] font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{description}</p>}
      </div>
      <div className="grid items-stretch gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

