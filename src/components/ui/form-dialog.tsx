"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FormStepperHeader,
  type FormStep,
} from "@/components/ui/form-stepper";
import { cn } from "@/lib/utils";

export type FormDialogSize = "sm" | "md" | "lg" | "xl" | "full";

const DEFAULT_STEPPER_FIELD_THRESHOLD = 8;

function countStepFields(steps: FormStep[]): number {
  return steps.reduce(
    (total, step) =>
      total + (step.fieldCount ?? step.fieldNames?.length ?? 0),
    0,
  );
}

function shouldUseFormStepper(
  steps: FormStep[],
  fieldThreshold = DEFAULT_STEPPER_FIELD_THRESHOLD,
): boolean {
  if (steps.length <= 1) return false;
  return countStepFields(steps) > fieldThreshold;
}

function findFirstErrorStepIndex(
  steps: FormStep[],
  errors?: Record<string, string>,
): number {
  if (!errors) return -1;
  const errorKeys = Object.keys(errors).filter((key) => Boolean(errors[key]));
  if (errorKeys.length === 0) return -1;

  return steps.findIndex((step) =>
    step.fieldNames?.some((fieldName) => errorKeys.includes(fieldName)),
  );
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  steps,
  stepperThreshold = DEFAULT_STEPPER_FIELD_THRESHOLD,
  errors,
  allowStepJump = false,
  onValidateStep,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  size = "lg",
  fieldsClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  steps?: FormStep[];
  stepperThreshold?: number;
  errors?: Record<string, string>;
  allowStepJump?: boolean;
  onValidateStep?: (
    stepIndex: number,
    step: FormStep,
  ) => boolean | Promise<boolean>;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void | boolean | Promise<void | boolean>;
  submitLabel?: string;
  cancelLabel?: string;
  size?: FormDialogSize;
  fieldsClassName?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [highestVisitedStep, setHighestVisitedStep] = useState(0);
  const stepTransitionAtRef = useRef(0);

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setHighestVisitedStep(0);
      stepTransitionAtRef.current = 0;
    }
  }, [open]);

  const isStepperActive = Boolean(
    steps && shouldUseFormStepper(steps, stepperThreshold),
  );
  const totalSteps = steps?.length ?? 0;
  const safeStep =
    totalSteps > 0 ? Math.min(activeStep, totalSteps - 1) : 0;
  const isLastStep = !isStepperActive || safeStep >= totalSteps - 1;
  const currentStep = isStepperActive && steps ? steps[safeStep] : null;

  async function goToNextStep(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!isStepperActive || !steps || safeStep >= totalSteps - 1) return;
    const step = steps[safeStep];
    if (onValidateStep) {
      const valid = await onValidateStep(safeStep, step);
      if (!valid) return;
    }
    const nextIndex = Math.min(safeStep + 1, totalSteps - 1);
    stepTransitionAtRef.current = Date.now();
    setActiveStep(nextIndex);
    setHighestVisitedStep((prev) => Math.max(prev, nextIndex));
  }

  function goToPreviousStep(event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!isStepperActive || safeStep <= 0) return;
    stepTransitionAtRef.current = Date.now();
    setActiveStep(Math.max(0, safeStep - 1));
  }

  async function handleStepSelect(targetIndex: number) {
    if (!isStepperActive || !steps || targetIndex === safeStep) return;
    if (targetIndex > safeStep && onValidateStep) {
      const valid = await onValidateStep(safeStep, steps[safeStep]);
      if (!valid) return;
    }
    stepTransitionAtRef.current = Date.now();
    setActiveStep(targetIndex);
    setHighestVisitedStep((prev) => Math.max(prev, targetIndex));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Date.now() - stepTransitionAtRef.current < 180) {
      return;
    }
    if (isStepperActive && !isLastStep) {
      await goToNextStep();
      return;
    }
    setSubmitting(true);
    try {
      const result = await onSubmit(event);
      if (result !== false) {
        onOpenChange(false);
      } else if (isStepperActive && steps && errors) {
        const errorStep = findFirstErrorStepIndex(steps, errors);
        if (errorStep >= 0) {
          setActiveStep(errorStep);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5">
          {isStepperActive && steps && currentStep ? (
            <>
              <FormStepperHeader
                steps={steps}
                activeStep={safeStep}
                highestVisitedStep={highestVisitedStep}
                errors={errors}
                allowStepJump={allowStepJump}
                onStepSelect={(index) => void handleStepSelect(index)}
              />

              <section
                key={currentStep.id}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    {currentStep.title}
                  </h3>
                  {currentStep.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {currentStep.description}
                    </p>
                  ) : null}
                </div>
                {currentStep.content}
              </section>
            </>
          ) : steps && steps.length > 0 ? (
            <div className={cn("grid gap-4", fieldsClassName)}>
              {steps.map((step) => (
                <section
                  key={step.id}
                  className="rounded-lg border bg-muted/20 p-4"
                >
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  {step.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  ) : null}
                  <div className="mt-4">{step.content}</div>
                </section>
              ))}
            </div>
          ) : (
            <div className={cn("grid gap-4", fieldsClassName)}>{children}</div>
          )}

          <DialogFooter className="sm:items-center sm:justify-between">
            <div className="hidden text-xs text-muted-foreground sm:block">
              {isStepperActive
                ? `Step ${safeStep + 1} of ${totalSteps} · ${currentStep?.title ?? ""}`
                : null}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {cancelLabel}
                </Button>
              </DialogClose>

              {isStepperActive && safeStep > 0 ? (
                <Button
                  key="stepper-previous-button"
                  type="button"
                  variant="secondary"
                  onClick={goToPreviousStep}
                  disabled={submitting}
                >
                  <ChevronLeft />
                  Previous
                </Button>
              ) : null}

              {isStepperActive && !isLastStep ? (
                <Button
                  key="stepper-next-button"
                  type="button"
                  onClick={(event) => void goToNextStep(event)}
                  disabled={submitting}
                >
                  Next step
                  <ChevronRight />
                </Button>
              ) : (
                <Button
                  key="stepper-submit-button"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting && <LoaderCircle className="animate-spin" />}
                  {submitting ? "Saving…" : submitLabel}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
