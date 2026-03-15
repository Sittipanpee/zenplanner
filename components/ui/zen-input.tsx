/**
 * Zen Input Component
 */

import { forwardRef, type InputHTMLAttributes } from "react";

export interface ZenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const ZenInput = forwardRef<HTMLInputElement, ZenInputProps>(
  ({ className = "", label, error, helperText, icon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zen-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zen-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              zen-input w-full px-4 py-3 text-zen-text bg-zen-surface
              placeholder:text-zen-text-muted
              focus:outline-none focus:ring-2 focus:ring-zen-sage focus:border-transparent
              disabled:bg-zen-surface-alt disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${error ? "border-zen-blossom focus:ring-zen-blossom" : "border-zen-border"}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-zen-blossom">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-zen-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

ZenInput.displayName = "ZenInput";

/**
 * Zen Textarea Component
 */
export interface ZenTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const ZenTextarea = forwardRef<HTMLTextAreaElement, ZenTextareaProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-zen-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            zen-input w-full px-4 py-3 text-zen-text bg-zen-surface
            placeholder:text-zen-text-muted resize-none
            focus:outline-none focus:ring-2 focus:ring-zen-sage focus:border-transparent
            ${error ? "border-zen-blossom focus:ring-zen-blossom" : "border-zen-border"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-zen-blossom">{error}</p>
        )}
      </div>
    );
  }
);

ZenTextarea.displayName = "ZenTextarea";