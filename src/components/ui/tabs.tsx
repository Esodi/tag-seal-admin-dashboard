"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  orientation: "horizontal" | "vertical";
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return ctx;
}

function Tabs({
  className,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({
      value,
      onValueChange: handleValueChange,
      orientation,
    }),
    [value, handleValueChange, orientation],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  variant = "default",
  onKeyDown,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "line" | "resource";
}) {
  const { orientation } = useTabsContext();

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      data-slot="tabs-list"
      data-variant={variant}
      data-orientation={orientation}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const previous = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (![previous, next, "Home", "End"].includes(event.key)) return;
        const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
        const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
        if (index < 0 || !tabs.length) return;
        event.preventDefault();
        const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === next ? 1 : -1) + tabs.length) % tabs.length;
        tabs[target].focus();
        tabs[target].click();
      }}
      className={cn(
        "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=default]:bg-muted data-[variant=line]:gap-1 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent",
        "data-[variant=resource]:h-auto data-[variant=resource]:max-w-full data-[variant=resource]:flex-wrap data-[variant=resource]:justify-start data-[variant=resource]:gap-1 data-[variant=resource]:rounded-xl data-[variant=resource]:border data-[variant=resource]:bg-muted/40 data-[variant=resource]:p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  disabled,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  value: string;
}) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive || !selectedValue ? 0 : -1}
      data-slot="tabs-trigger"
      data-state={isActive ? "active" : "inactive"}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) {
          onValueChange(value);
        }
      }}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        "group-data-[variant=resource]/tabs-list:min-h-9 group-data-[variant=resource]/tabs-list:flex-none group-data-[variant=resource]/tabs-list:rounded-lg group-data-[variant=resource]/tabs-list:px-4 group-data-[variant=resource]/tabs-list:text-[13px] group-data-[variant=resource]/tabs-list:text-muted-foreground group-data-[variant=resource]/tabs-list:hover:bg-accent/50 group-data-[variant=resource]/tabs-list:data-[state=active]:border-primary group-data-[variant=resource]/tabs-list:data-[state=active]:bg-primary group-data-[variant=resource]/tabs-list:data-[state=active]:text-primary-foreground group-data-[variant=resource]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=resource]/tabs-list:data-[state=active]:[&_[data-slot=badge]]:border-transparent group-data-[variant=resource]/tabs-list:data-[state=active]:[&_[data-slot=badge]]:bg-primary-foreground/15 group-data-[variant=resource]/tabs-list:data-[state=active]:[&_[data-slot=badge]]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TabsContent({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: string;
}) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      data-slot="tabs-content"
      data-state="active"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

