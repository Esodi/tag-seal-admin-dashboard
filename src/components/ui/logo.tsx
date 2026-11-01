import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "image" | "full";
  href?: string;
  priority?: boolean;
}

const sizeClasses = {
  sm: "size-8 text-xs rounded-lg",
  md: "size-10 text-xs rounded-xl",
  lg: "size-12 text-sm rounded-2xl",
  xl: "size-14 text-base rounded-2xl",
};

export function Logo({
  size = "md",
  variant = "badge",
  href,
  className,
  priority = false,
  ...props
}: LogoProps) {
  const content = (() => {
    if (variant === "image") {
      const dimensions = {
        sm: { width: 32, height: 20 },
        md: { width: 40, height: 25 },
        lg: { width: 48, height: 30 },
        xl: { width: 64, height: 40 },
      }[size];

      return (
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden bg-primary/10 border border-primary/20",
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <Image
            src="/images/logos/tag-and-seal-logo-5.png"
            alt="Tag & Seal"
            width={dimensions.width}
            height={dimensions.height}
            className="object-contain p-1"
            priority={priority}
          />
        </div>
      );
    }

    if (variant === "full") {
      return (
        <div className={cn("flex items-center gap-3", className)} {...props}>
          <span
            className={cn(
              "grid place-items-center bg-primary font-bold text-primary-foreground shadow-sm transition",
              sizeClasses[size]
            )}
          >
            T&S
          </span>
          <span className="font-semibold tracking-tight text-foreground">Tag & Seal</span>
        </div>
      );
    }

    // Default: "badge" (stylized T&S brand monogram badge)
    return (
      <span
        className={cn(
          "grid place-items-center bg-primary font-bold text-primary-foreground shadow-md transition select-none",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        T&S
      </span>
    );
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex transition hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

