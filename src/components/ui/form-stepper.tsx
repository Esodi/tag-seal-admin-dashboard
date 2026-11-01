"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";

export type FormStep = {
  id: string;
  title: string;
  description?: string;
  fieldNames?: string[];
  fieldCount?: number;
  content: ReactNode;
};

export function FormStepperHeader({
  steps,
  activeStep,
  highestVisitedStep,
  errors,
  allowStepJump = false,
  onStepSelect,
}: {
  steps: FormStep[];
  activeStep: number;
  highestVisitedStep: number;
  errors?: Record<string, string>;
  allowStepJump?: boolean;
  onStepSelect: (index: number) => void;
}) {
  const progressPercent =
    steps.length > 1
      ? Math.round(((activeStep + 1) / steps.length) * 100)
      : 100;

  return (
    <div className="grid gap-3.5 rounded-xl border bg-muted/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="tabular-nums">
            Step {activeStep + 1} of {steps.length}
          </Badge>
          <span className="text-sm font-semibold text-foreground">
            {steps[activeStep]?.title}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {progressPercent}% complete
        </span>
      </div>

      <Stepper
        steps={steps.map((step) => ({
          title: step.title,
          hasError: Boolean(
            errors &&
              step.fieldNames?.some((fieldName) => Boolean(errors[fieldName])),
          ),
        }))}
        activeStep={activeStep}
        onStepChange={onStepSelect}
        canNavigateToStep={(index) =>
          allowStepJump || index <= highestVisitedStep || index < activeStep
        }
      />
    </div>
  );
}
