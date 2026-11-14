export function OverviewSkeleton() {
  return <div className="mx-auto max-w-[1500px] animate-pulse space-y-6" aria-label="Loading dashboard">
    <div className="space-y-2"><div className="h-3 w-32 rounded bg-muted" /><div className="h-8 w-72 rounded-lg bg-muted" /><div className="h-3 w-80 max-w-full rounded bg-muted" /></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 15 }, (_, index) => <div key={index} className="card h-[124px] p-4"><div className="h-4 w-28 rounded bg-muted" /><div className="mt-4 h-7 w-20 rounded bg-muted" /><div className="mt-2 h-3 w-36 rounded bg-muted" /></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]"><div className="card h-[390px] p-6"><div className="h-4 w-36 rounded bg-muted" /><div className="mt-2 h-3 w-52 rounded bg-muted" /><div className="mt-8 h-72 rounded-xl bg-muted/70" /></div><div className="card h-[390px] p-6"><div className="h-4 w-40 rounded bg-muted" /><div className="mt-8 h-64 rounded-full bg-muted/70" /></div></div>
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]"><div className="card h-72 bg-muted/30" /><div className="card h-72 bg-muted/30" /></div>
  </div>;
}
