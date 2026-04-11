import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailLoading() {
  return (
    <div className="p-4 sm:p-6">
      {/* Back link + title */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
            <Skeleton className="mb-1 h-4 w-12" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Holes list */}
      <Skeleton className="mb-4 h-6 w-20" />
      <div className="space-y-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-4 w-4 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
