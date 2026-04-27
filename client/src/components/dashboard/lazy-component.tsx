"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

interface LazyDashboardComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyDashboardComponent({
  children,
  fallback = <DashboardSkeleton />,
}: LazyDashboardComponentProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
