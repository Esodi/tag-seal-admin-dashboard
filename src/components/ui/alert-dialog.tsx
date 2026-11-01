"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) { return <AlertDialogPrimitive.Portal><AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" /><AlertDialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl border bg-card p-6 shadow-2xl outline-none", className)} {...props} /></AlertDialogPrimitive.Portal>; }
function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("grid place-items-center gap-2 text-center", className)} {...props} />; }
function AlertDialogMedia({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mb-1 grid size-14 place-items-center rounded-full bg-muted text-primary [&_svg]:size-6", className)} {...props} />; }
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center", className)} {...props} />; }
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) { return <AlertDialogPrimitive.Title className={cn("text-lg font-semibold", className)} {...props} />; }
function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) { return <AlertDialogPrimitive.Description className={cn("max-w-[42ch] text-center text-supporting leading-6 text-muted-foreground", className)} {...props} />; }
function AlertDialogAction({ className, variant = "default", size = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action> & VariantProps<typeof buttonVariants>) { return <AlertDialogPrimitive.Action className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
function AlertDialogCancel({ className, size = "default", ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & Pick<VariantProps<typeof buttonVariants>, "size">) { return <AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: "outline", size }), className)} {...props} />; }

export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger };
