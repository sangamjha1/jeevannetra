"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";

interface FormErrorProps {
  error: string;
  onDismiss?: () => void;
  autoScroll?: boolean;
  autoFocus?: boolean;
}

export function FormError({
  error,
  onDismiss,
  autoScroll = true,
  autoFocus = true,
}: FormErrorProps) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      if (autoScroll) {
        // Scroll to error with smooth behavior and offset for visibility
        setTimeout(() => {
          errorRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }

      if (autoFocus) {
        // Attempt to focus first input in error container's context
        const firstInput = errorRef.current.parentElement?.querySelector(
          "input, select, textarea"
        ) as HTMLElement;
        firstInput?.focus();
      }
    }
  }, [error, autoScroll, autoFocus]);

  if (!error) return null;

  return (
    <div
      ref={errorRef}
      className="rounded-md border border-red-900/50 bg-red-950/40 p-3 text-sm flex items-start gap-2 text-red-400 animate-in fade-in slide-in-from-top-2 duration-300"
      role="alert"
      suppressHydrationWarning
    >
      <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-400" />
      <span className="flex-1">{error}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 hover:text-red-300 transition-colors"
          aria-label="Dismiss error"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
