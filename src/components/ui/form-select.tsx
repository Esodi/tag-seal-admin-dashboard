"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface FormSelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly FormSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "default";
  align?: "start" | "center" | "end";
  searchable?: boolean;
  searchPlaceholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

const EMPTY_OPTION_VALUE = "__form_select_empty__";

export function FormSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  invalid,
  size = "default",
  align = "start",
  searchable,
  searchPlaceholder,
  triggerClassName,
  contentClassName,
}: FormSelectProps) {
  const hasEmptyOption = options.some((option) => option.value === "");
  const normalizedValue =
    value === "" && hasEmptyOption ? EMPTY_OPTION_VALUE : value;

  return (
    <Select
      value={normalizedValue}
      onValueChange={(next) =>
        onValueChange(next === EMPTY_OPTION_VALUE ? "" : next)
      }
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-invalid={invalid || undefined}
        className={cn("w-full font-normal", triggerClassName)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        align={align}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        className={contentClassName}
      >
        {options.map((option) => {
          const itemValue =
            option.value === "" ? EMPTY_OPTION_VALUE : option.value;
          return (
            <SelectItem
              key={itemValue}
              value={itemValue}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

