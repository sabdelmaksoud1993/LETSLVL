import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const badgeVariants = {
  live: "bg-red-600 text-white animate-live-pulse",
  new: "bg-lvl-yellow text-lvl-black",
  sale: "bg-green-600 text-white",
  limited: "bg-purple-600 text-white",
  default: "bg-lvl-slate text-lvl-white",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-body font-bold uppercase tracking-wider rounded-full",
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {variant === "live" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
