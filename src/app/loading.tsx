import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 p-6">
      <Skeleton className="mb-8 h-10 w-40 bg-slate-800" />
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl bg-slate-800" />
        <Skeleton className="h-48 w-full rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}
