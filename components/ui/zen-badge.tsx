/**
 * Zen Badge Component
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface ZenBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  children: ReactNode;
}

export function ZenBadge({
  className = "",
  variant = "default",
  size = "md",
  children,
  ...props
}: ZenBadgeProps) {
  const variants = {
    default: "bg-zen-surface-alt text-zen-text-secondary",
    success: "bg-zen-sage/10 text-zen-sage",
    warning: "bg-zen-gold/10 text-zen-gold",
    danger: "bg-zen-blossom/10 text-zen-blossom",
    info: "bg-zen-sky/10 text-zen-sky",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      role="status"
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Zen Status Badge
 */
export interface ZenStatusBadgeProps {
  status: "pending" | "active" | "completed" | "failed";
  className?: string;
}

export function ZenStatusBadge({ status, className = "" }: ZenStatusBadgeProps) {
  const config = {
    pending: { variant: "warning" as const, label: "รอดำเนินการ" },
    active: { variant: "info" as const, label: "กำลังทำ" },
    completed: { variant: "success" as const, label: "เสร็จสิ้น" },
    failed: { variant: "danger" as const, label: "ล้มเหลว" },
  };

  const { variant, label } = config[status];

  return (
    <ZenBadge variant={variant} className={className}>
      {label}
    </ZenBadge>
  );
}