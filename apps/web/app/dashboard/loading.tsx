import { Skeleton } from '../../components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-12 p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-2xl mb-4" />
        <Skeleton className="h-10 w-3/4 max-w-lg" />
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>

      {/* Recent Tools Skeleton - assuming a horizontal list or similar */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-hidden">
             <Skeleton className="h-32 w-64 rounded-xl flex-shrink-0" />
             <Skeleton className="h-32 w-64 rounded-xl flex-shrink-0" />
             <Skeleton className="h-32 w-64 rounded-xl flex-shrink-0" />
        </div>
      </div>

      {/* Tools Grid Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-6 w-1 rounded-full" />
            <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
        </div>
      </div>
    </div>
  );
}
