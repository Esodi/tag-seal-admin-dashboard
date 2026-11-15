"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  items: Map<string, React.ReactNode>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error("Select components must be used within <Select>");
  }
  return ctx;
}

function extractNodeText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join(" ");
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractNodeText(node.props.children);
  }
  return "";
}

function collectSelectItems(
  children: React.ReactNode,
  map: Map<string, React.ReactNode>,
) {
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(
        child,
      )
    ) {
      return;
    }
    const childType = child.type as { displayName?: string };
    if (
      childType?.displayName === "SelectItem" &&
      typeof child.props.value === "string"
    ) {
      map.set(child.props.value, child.props.children);
      return;
    }
    if (child.props.children) {
      collectSelectItems(child.props.children, map);
    }
  });
}

function countSelectItems(children: React.ReactNode): number {
  let count = 0;
  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(
        child,
      )
    ) {
      return;
    }
    const childType = child.type as { displayName?: string };
    if (
      childType?.displayName === "SelectItem" &&
      typeof child.props.value === "string"
    ) {
      count += 1;
      return;
    }
    if (child.props.children) {
      count += countSelectItems(child.props.children);
    }
  });
  return count;
}

function filterSelectChildren(
  children: React.ReactNode,
  query: string,
): React.ReactNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return React.Children.toArray(children);
  }

  const filtered: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (
      !React.isValidElement<{ value?: unknown; children?: React.ReactNode }>(
        child,
      )
    ) {
      return;
    }
    const childType = child.type as { displayName?: string };
    if (
      childType?.displayName === "SelectItem" &&
      typeof child.props.value === "string"
    ) {
      const labelText = extractNodeText(child.props.children).toLowerCase();
      const valueText = child.props.value.toLowerCase();
      if (
        labelText.includes(normalizedQuery) ||
        valueText.includes(normalizedQuery)
      ) {
        filtered.push(child);
      }
      return;
    }
    if (child.props.children) {
      const nested = filterSelectChildren(child.props.children, query);
      if (nested.length > 0) {
        filtered.push(React.cloneElement(child, {}, ...nested));
      }
    }
  });

  return filtered;
}

function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  disabled,
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState(defaultValue);
  const [searchQuery, setSearchQuery] = React.useState("");
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

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSearchQuery("");
      }
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const items = React.useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    collectSelectItems(children, map);
    return map;
  }, [children]);

  const contextValue = React.useMemo<SelectContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      disabled,
      items,
      searchQuery,
      setSearchQuery,
    }),
    [value, handleValueChange, disabled, items, searchQuery],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root
        open={controlledOpen}
        onOpenChange={handleOpenChange}
        modal={false}
      >
        {children}
      </DropdownMenuPrimitive.Root>
    </SelectContext.Provider>
  );
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  placeholder,
  className,
  children,
}: {
  placeholder?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  const { value, items } = useSelectContext();
  const resolvedLabel =
    children ?? (value ? (items.get(value) ?? null) : null);

  return (
    <span
      data-slot="select-value"
      className={cn(
        "truncate",
        !resolvedLabel && "text-muted-foreground",
        className,
      )}
    >
      {resolvedLabel ?? placeholder ?? ""}
    </span>
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  disabled: triggerDisabled,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  const { value, disabled: rootDisabled } = useSelectContext();
  const isDisabled = triggerDisabled ?? rootDisabled;

  return (
    <DropdownMenuPrimitive.Trigger
      type="button"
      disabled={isDisabled}
      data-slot="select-trigger"
      data-size={size}
      data-placeholder={!value ? "" : undefined}
      className={cn(
        "group/select flex w-fit min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 shrink-0 opacity-50 transition-transform duration-150 group-data-[state=open]/select:rotate-180" />
    </DropdownMenuPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  align = "start",
  sideOffset = 4,
  searchable,
  searchPlaceholder = "Search options...",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  position?: "item-aligned" | "popper";
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const { searchQuery, setSearchQuery } = useSelectContext();
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

  const totalOptionsCount = React.useMemo(
    () => countSelectItems(children),
    [children],
  );
  const isSearchable = searchable ?? totalOptionsCount > 5;

  const visibleChildren = React.useMemo(
    () =>
      isSearchable
        ? filterSelectChildren(children, searchQuery)
        : React.Children.toArray(children),
    [children, isSearchable, searchQuery],
  );

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="select-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-h-[min(18rem,var(--radix-dropdown-menu-content-available-height,18rem))] w-[var(--radix-dropdown-menu-trigger-width)] min-w-[max(10rem,var(--radix-dropdown-menu-trigger-width))] max-w-[min(100vw-1.5rem,var(--radix-dropdown-menu-trigger-width))] overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className,
        )}
        {...props}
      >
        {isSearchable ? (
          <div
            className="sticky top-0 z-10 -mx-1 -mt-1 mb-1 border-b bg-popover p-2"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Escape") {
                    event.stopPropagation();
                  }
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-8 w-full rounded-md border border-input bg-background pr-7 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50"
              />
              {searchQuery ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 rounded-xs p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div data-slot="select-items-list" className="min-w-0">
          {visibleChildren.length > 0 ? (
            visibleChildren
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {isSearchable && searchQuery.trim()
                ? "No matching options found."
                : "No options available."}
            </div>
          )}
        </div>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Item>, "onSelect"> & {
  value: string;
}) {
  const { value: selectedValue, onValueChange } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <DropdownMenuPrimitive.Item
      data-slot="select-item"
      data-state={isSelected ? "checked" : "unchecked"}
      disabled={disabled}
      onSelect={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-none border-b border-border/70 py-2 pr-8 pl-2.5 text-[calc(0.875rem+1.5px)] leading-snug outline-hidden select-none last:border-b-0 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        isSelected && "bg-accent/60 font-medium text-accent-foreground",
        className,
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2.5 flex size-4 items-center justify-center"
      >
        {isSelected ? <CheckIcon className="size-4" /> : null}
      </span>
      <span className="truncate">{children}</span>
    </DropdownMenuPrimitive.Item>
  );
}
SelectItem.displayName = "SelectItem";

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
