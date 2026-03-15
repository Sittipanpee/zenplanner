/**
 * Zen Card Component
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface ZenCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}

export function ZenCard({
  className = "",
  variant = "default",
  padding = "md",
  children,
  ...props
}: ZenCardProps) {
  const variants = {
    default: "border border-zen-border",
    interactive: "border border-zen-border hover:border-zen-border-hover hover:shadow-lg transition-all duration-200 cursor-pointer",
    highlight: "border-2 border-zen-sage shadow-md",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      className={`
        zen-card bg-zen-surface rounded-zen-lg shadow-zen-md
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Zen Card Header
 */
export interface ZenCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function ZenCardHeader({ title, subtitle, icon, action }: ZenCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-zen-sage">{icon}</div>
        )}
        <div>
          <h3 className="font-semibold text-zen-text">{title}</h3>
          {subtitle && (
            <p className="text-sm text-zen-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/**
 * Zen Card Content
 */
export interface ZenCardContentProps {
  children: ReactNode;
  className?: string;
}

export function ZenCardContent({ children, className = "" }: ZenCardContentProps) {
  return <div className={className}>{children}</div>;
}

/**
 * Zen Card Footer
 */
export interface ZenCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function ZenCardFooter({ children, className = "" }: ZenCardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-zen-border ${className}`}>
      {children}
    </div>
  );
}