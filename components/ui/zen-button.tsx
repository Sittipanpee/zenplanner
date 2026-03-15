/**
 * Zen Button Component
 */

import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ZenButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const ZenButton = forwardRef<HTMLButtonElement, ZenButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading, fullWidth, children, disabled, ...props }, ref) => {
    const baseStyles = `
      zen-button inline-flex items-center justify-center font-body font-semibold
      transition-all duration-200 ease-out focus:outline-none focus:ring-2
      focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: "bg-zen-sage text-white hover:bg-zen-sage-light focus:ring-zen-sage",
      secondary: "bg-zen-surface border border-zen-border text-zen-text hover:border-zen-border-hover hover:bg-zen-surface-alt focus:ring-zen-sage",
      ghost: "bg-transparent text-zen-text-secondary hover:text-zen-text hover:bg-zen-surface-alt",
      danger: "bg-zen-blossom text-white hover:opacity-90 focus:ring-zen-blossom",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-base rounded-full",
      lg: "h-14 px-8 text-lg rounded-full",
    };

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

ZenButton.displayName = "ZenButton";