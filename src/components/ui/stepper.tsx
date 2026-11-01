"use client";

import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = {
  title: string;
  description?: string;
  hasError?: boolean;
};

export function Stepper({
  steps,
  activeStep,
  onStepChange,
  canNavigateToStep,
  className,
  ariaLabel = "Form progress",
}: {
  steps: Step[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  canNavigateToStep?: (step: number) => boolean;
  className?: string;
  ariaLabel?: string;
}) {
  if (!steps.length) return null;
  const last = Math.max(steps.length - 1, 1);
  const progress = (Math.min(Math.max(activeStep, 0), last) / last) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      {steps.length > 1 && (
        <div
          className="absolute top-[18px] h-0.5 bg-border"
          style={{
            left: `${50 / steps.length}%`,
            right: `${50 / steps.length}%`,
          }}
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <ol
        aria-label={ariaLabel}
        className="relative z-10 grid"
        style={{
          gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))`,
        }}
      >
        {steps.map((step, index) => {
          const complete = activeStep > index;
          const active = activeStep === index;
          const navigable =
            Boolean(onStepChange) &&
            index !== activeStep &&
            (canNavigateToStep?.(index) ?? true);

          const content = (
            <>
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2 bg-card text-xs font-semibold transition-colors",
                  step.hasError
                    ? "border-destructive bg-destructive text-white"
                    : active || complete
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground",
                )}
              >
                {step.hasError ? (
                  <AlertCircle className="size-4" />
                ) : complete ? (
                  <Check className="size-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "mt-1.5 line-clamp-1 text-xs font-medium",
                  step.hasError
                    ? "text-destructive"
                    : active
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
              {step.description && (
                <span className="mt-0.5 hidden line-clamp-1 text-[10px] text-muted-foreground sm:block">
                  {step.description}
                </span>
              )}
            </>
          );

          return (
            <li
              key={`${step.title}-${index}`}
              className="flex min-w-0 flex-col items-center px-1 text-center"
            >
              {navigable ? (
                <button
                  type="button"
                  onClick={() => onStepChange?.(index)}
                  className="flex cursor-pointer flex-col items-center rounded-lg focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {content}
                </button>
              ) : (
                <div className="flex flex-col items-center">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
