import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CtaSection() {
  return (
    <section className="bg-slate-900 px-4 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to play smarter?</h2>
        <p className="mb-10 text-lg text-slate-400">
          Join ProCaddie and get AI-powered course intelligence for every round. Free to get started — no credit card required.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup" className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 text-white hover:bg-emerald-500")}>
            Create Free Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "text-slate-400 hover:bg-slate-800 hover:text-white")}>
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
