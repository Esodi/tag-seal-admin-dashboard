"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in", className)} {...props} />;
}

const dialogSizes = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl", full: "sm:max-w-[min(96vw,1500px)]" } as const;
export type DialogSize = keyof typeof dialogSizes;

function DialogContent({ className, children, size = "md", showClose = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { size?: keyof typeof dialogSizes; showClose?: boolean }) {
  return <DialogPrimitive.Portal><DialogOverlay /><DialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto rounded-2xl border bg-card p-5 shadow-2xl outline-none sm:p-6", dialogSizes[size], className)} {...props}>{children}{showClose && <DialogPrimitive.Close className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close"><X className="size-4" /></DialogPrimitive.Close>}</DialogPrimitive.Content></DialogPrimitive.Portal>;
}
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("grid gap-1.5 pr-8 text-left", className)} {...props} />; }
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end", className)} {...props} />; }
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />; }
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description className={cn("text-supporting leading-6 text-muted-foreground", className)} {...props} />; }

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger };
