export function AnalyticsSkeleton() {
  return <div className="mx-auto max-w-7xl animate-pulse space-y-6" aria-label="Loading reports and analytics">
    <div className="space-y-3"><div className="h-3 w-48 rounded bg-muted" /><div className="h-8 w-72 rounded bg-muted" /><div className="h-4 w-[30rem] max-w-full rounded bg-muted" /></div>
    <div className="card h-20 bg-muted/30" />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="card h-36 p-4"><div className="size-9 rounded-xl bg-muted" /><div className="mt-4 h-6 w-20 rounded bg-muted" /><div className="mt-2 h-4 w-28 rounded bg-muted" /></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]"><div className="card h-[390px] bg-muted/30" /><div className="card h-[390px] bg-muted/30" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div className="card h-80 bg-muted/30" /><div className="card h-80 bg-muted/30" /></div>
  </div>;
}
