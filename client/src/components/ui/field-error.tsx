"use client";

import { AlertCircle } from "lucide-react";

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className = "" }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs text-red-400 mt-1 animate-in fade-in duration-200 ${className}`}
      role="alert"
    >
      <AlertCircle size={14} className="flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}
