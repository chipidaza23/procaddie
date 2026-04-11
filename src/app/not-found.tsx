import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
        <MapPin className="h-8 w-8 text-emerald-400" />
      </div>
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-500">
        404
      </p>
      <h1 className="mb-2 text-3xl font-bold text-white">Out of bounds</h1>
      <p className="mb-8 max-w-md text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you
        back on the fairway.
      </p>
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants(),
          "bg-emerald-600 text-white hover:bg-emerald-500"
        )}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
