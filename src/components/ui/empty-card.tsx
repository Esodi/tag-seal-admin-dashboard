import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyCard({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed py-12 shadow-none", className)}>
      <CardContent className="flex flex-col items-center justify-center px-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

