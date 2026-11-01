"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TypedConfirmationAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  confirmationText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function TypedConfirmationAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  confirmationText = "delete",
  confirmLabel = "Delete permanently",
  cancelLabel = "Cancel",
  destructive = true,
  isSubmitting = false,
  onConfirm,
}: TypedConfirmationAlertDialogProps) {
  const [typedValue, setTypedValue] = useState("");
  const normalizedTarget = confirmationText.trim().toLowerCase();
  const isConfirmed = typedValue.trim().toLowerCase() === normalizedTarget;

  useEffect(() => {
    if (!open) {
      setTypedValue("");
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {icon ? (
            <AlertDialogMedia
              className={cn(
                destructive &&
                  "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
              )}
            >
              {icon}
            </AlertDialogMedia>
          ) : null}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Type{" "}
            <button
              type="button"
              onClick={() => setTypedValue(confirmationText)}
              className="inline-flex cursor-pointer items-center rounded border bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground transition-colors hover:bg-muted/80"
              title={`Click to fill "${confirmationText}"`}
            >
              {confirmationText}
            </button>{" "}
            to confirm.
          </p>
          <Input
            value={typedValue}
            onChange={(event) => setTypedValue(event.target.value)}
            placeholder={`Type "${confirmationText}"`}
            autoComplete="off"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? "destructive" : "default"}
            disabled={!isConfirmed || isSubmitting}
            onClick={(event) => {
              if (!isConfirmed) {
                event.preventDefault();
                return;
              }
              void onConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
