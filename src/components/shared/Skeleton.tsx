import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton animate-shimmer rounded", className)}
      aria-hidden
    />
  );
}

export function ChampionCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded border border-border-subtle bg-surface-1 p-3">
      <Skeleton className="h-10 w-10 rounded flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-14 rounded" />
    </div>
  );
}

export function PoolGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ChampionCardSkeleton key={i} />
      ))}
    </div>
  );
}
