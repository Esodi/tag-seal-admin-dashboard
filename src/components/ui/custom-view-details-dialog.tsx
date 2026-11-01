"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="space-y-4">{children}</div>

        <DialogFooter>
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
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/20 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm font-medium break-words">{children}</div>
    </div>
  );
}

