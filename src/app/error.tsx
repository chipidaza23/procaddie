"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mb-8 max-w-md text-slate-400">
        An unexpected error occurred. Your round data is safe — please try again
        or refresh the page.
      </p>
      {error.digest && (
        <p className="mb-6 font-mono text-xs text-slate-600">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          onClick={reset}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Try Again
        </Button>
        <button
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-slate-700 text-slate-300 hover:bg-slate-800"
          )}
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
