import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

// Pre-built skeleton components for common use cases
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  );
};
