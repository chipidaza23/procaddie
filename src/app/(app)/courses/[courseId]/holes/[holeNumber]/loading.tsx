import { Skeleton } from "@/components/ui/skeleton";

export default function HoleLoading() {
  return (
    <div className="flex flex-col">
      {/* Hole header */}
      <div className="bg-slate-800 p-4">
        <div className="mb-1 flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-48" />
      </div>

      {/* Aerial map */}
      <Skeleton className="h-56 w-full rounded-none sm:h-72" />

      {/* Strategy section */}
      <div className="p-4 space-y-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Club recommendations */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <Skeleton className="mb-1.5 h-3 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-20 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
