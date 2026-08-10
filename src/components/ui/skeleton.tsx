import React from "react";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden border border-border bg-surface ${className}`}>
      <div className="aspect-3/4 skeleton" />
      <div className="p-4">
        <div className="h-4 w-3/4 skeleton mb-3 rounded" />
        <div className="h-3 w-1/2 skeleton mb-2 rounded" />
        <div className="h-8 w-full skeleton rounded" />
      </div>
    </div>
  );
}

export default SkeletonCard;
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };
