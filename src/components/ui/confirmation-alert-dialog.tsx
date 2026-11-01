"use client";

import type { ReactNode } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ConfirmationAlertDialog({ open, onOpenChange, icon, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel", destructive, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; icon?: ReactNode; title: string; description?: ReactNode; confirmLabel?: string; cancelLabel?: string; destructive?: boolean; onConfirm: () => void | Promise<void> }) {
  return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent><AlertDialogHeader>{icon && <AlertDialogMedia className={destructive ? "bg-danger/10 text-danger" : undefined}>{icon}</AlertDialogMedia>}<AlertDialogTitle>{title}</AlertDialogTitle>{description && <AlertDialogDescription>{description}</AlertDialogDescription>}</AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{cancelLabel}</AlertDialogCancel><AlertDialogAction variant={destructive ? "destructive" : "default"} onClick={() => void onConfirm()}>{confirmLabel}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
