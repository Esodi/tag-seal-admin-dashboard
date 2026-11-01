import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

function Field({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field" className={cn("grid min-w-0 content-start gap-2", className)} {...props} />; }
function FieldLabel({ required, children, ...props }: React.ComponentProps<typeof Label> & { required?: boolean }) { return <Label {...props}>{children}{required && <span className="ml-1 text-danger" aria-hidden="true">*</span>}</Label>; }
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="field-description" className={cn("text-supporting leading-5 text-muted-foreground", className)} {...props} />; }
function FieldError({ className, children, errors, ...props }: React.ComponentProps<"div"> & { errors?: Array<{ message?: string } | undefined> }) {
  const messages = children ? [children] : [...new Set((errors ?? []).map((item) => item?.message).filter(Boolean))];
  if (!messages.length) return null;
  return <div role="alert" data-slot="field-error" className={cn("text-supporting leading-5 text-danger", className)} {...props}>{messages.length === 1 ? messages[0] : <ul className="ml-4 list-disc">{messages.map((message, index) => <li key={index}>{message}</li>)}</ul>}</div>;
}
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-group" className={cn("grid gap-4", className)} {...props} />; }
function FieldGrid({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-grid" className={cn("grid gap-4 sm:grid-cols-2 [&>*:only-child]:sm:col-span-2", className)} {...props} />; }

export { Field, FieldDescription, FieldError, FieldGrid, FieldGroup, FieldLabel };
