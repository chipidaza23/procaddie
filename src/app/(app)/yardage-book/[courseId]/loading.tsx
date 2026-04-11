import { Skeleton } from "@/components/ui/skeleton";

export default function YardageBookLoading() {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="p-4">
              <Skeleton className="mb-4 h-36 w-full rounded-lg" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="rounded-md border border-slate-800 bg-slate-800/50 p-2 text-center">
                    <Skeleton className="mx-auto mb-1 h-3 w-12" />
                    <Skeleton className="mx-auto h-5 w-10" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
