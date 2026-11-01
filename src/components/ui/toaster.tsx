"use client";

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return <Sonner theme={(resolvedTheme ?? "light") as ToasterProps["theme"]} position="top-right" closeButton visibleToasts={4} icons={{ success: <CircleCheck className="size-5 text-success" />, info: <Info className="size-5 text-primary" />, warning: <TriangleAlert className="size-5 text-warning" />, error: <OctagonX className="size-5 text-danger" />, loading: <LoaderCircle className="size-4 animate-spin" /> }} toastOptions={{ classNames: { toast: "!items-start !gap-3 !rounded-xl !border-border !bg-card !px-4 !py-3 !text-foreground !shadow-xl", title: "!text-sm !font-semibold", description: "!mt-0.5 !text-supporting !leading-5 !text-muted-foreground" } }} {...props} />;
}
