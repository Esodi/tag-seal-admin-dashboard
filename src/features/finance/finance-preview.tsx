import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Accessible proportional bars; labels retain exact values independently of colour. */
export function FinancePreview({ title, description, values, money = false }: {
  title: string; description: string; values: Array<{ label: string; value: number }>; money?: boolean;
}) {
  const max = Math.max(1, ...values.map(item => Math.abs(item.value)));
  return <Card className="gap-4 shadow-none"><CardHeader><h2 className="text-sm font-semibold">{title}</h2><p className="text-xs text-muted-foreground">{description}</p></CardHeader><CardContent><div className="grid gap-4 sm:grid-cols-2">{values.map((item, index) => <div key={item.label} className="space-y-2"><div className="flex justify-between gap-3 text-xs"><span className="text-muted-foreground">{item.label}</span><span className="font-semibold tabular-nums">{money ? "TZS " : ""}{item.value.toLocaleString("en-TZ", { maximumFractionDigits: 2 })}</span></div><div role="img" aria-label={`${item.label}: ${item.value}`} className="h-3 overflow-hidden rounded-full bg-muted"><div className={index === 0 ? "h-full rounded-full bg-primary" : "h-full rounded-full bg-amber-500"} style={{ width: `${Math.abs(item.value) / max * 100}%` }} /></div></div>)}</div></CardContent></Card>;
}
