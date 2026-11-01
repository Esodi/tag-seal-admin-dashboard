"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn("peer grid size-4 shrink-0 place-items-center rounded-[5px] border border-border bg-background text-primary-foreground shadow-sm outline-none transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary", className)} {...props}><CheckboxPrimitive.Indicator data-slot="checkbox-indicator"><Check className="size-3" strokeWidth={3} /></CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>;
}

export { Checkbox };
