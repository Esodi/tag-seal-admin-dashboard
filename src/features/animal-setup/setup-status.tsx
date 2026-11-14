import { Badge } from "@/components/ui/badge";

const amber = "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300";

/** Where a type stands: draft, published but not used by the app yet, or live in the app. */
export function SetupStatus({ published, hasDraft, live }: { published: boolean; hasDraft: boolean; live: boolean }) {
  return <span className="inline-flex flex-wrap gap-1.5">
    {!published ? <Badge variant="outline" className={amber}>Draft</Badge>
      : live ? <Badge>Live in app</Badge>
        : <Badge variant="outline">Published · not live</Badge>}
    {published && hasDraft && <Badge variant="outline" className={amber}>Draft changes</Badge>}
  </span>;
}
