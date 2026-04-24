"use client";

import { AlertCircle, CheckCircle } from "lucide-react";

interface MessageAlertProps {
  message: string;
  type: "error" | "success";
  className?: string;
}

export function MessageAlert({ message, type, className = "" }: MessageAlertProps) {
  const isError = type === "error";

  return (
    <div
      className={`rounded-md border p-3 text-sm flex items-start gap-2 ${
        isError
          ? "border-red-900/50 bg-red-950/40 text-red-400"
          : "border-green-900/50 bg-green-950/40 text-green-400"
      } ${className}`}
      suppressHydrationWarning
    >
      {isError ? (
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-400" />
      ) : (
        <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-400" />
      )}
      <span>{message}</span>
    </div>
  );
}
