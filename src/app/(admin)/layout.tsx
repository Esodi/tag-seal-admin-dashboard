import { AdminShell } from "@/components/layout/admin-shell";
import { Suspense } from "react";

function ShellFallback({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background"><aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card p-4 lg:block"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">T&S</span><span className="font-semibold">Tag & Seal</span></div><div className="mt-8 space-y-3">{Array.from({ length: 9 }, (_, index) => <div key={index} className="h-9 animate-pulse rounded-xl bg-muted" />)}</div></aside><div className="lg:pl-64"><header className="h-16 border-b bg-background/90" /><main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<ShellFallback>{children}</ShellFallback>}><AdminShell>{children}</AdminShell></Suspense>;
}
