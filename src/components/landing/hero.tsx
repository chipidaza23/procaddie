import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900 px-4 py-24 text-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900 to-slate-900" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          AI-Powered Golf Intelligence
        </div>
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Your AI caddie preps the course{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
            so you can play with a plan
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 sm:text-xl">
          ProCaddie gives you personalized hole-by-hole strategy, aerial views,
          and real-time notes — everything your caddie would know, right in your pocket.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 text-white hover:bg-emerald-500")}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a
            href="#features"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-slate-600 bg-transparent text-slate-300 hover:border-slate-400 hover:bg-slate-800 hover:text-white")}
          >
            Learn More
            <ChevronDown className="ml-2 h-4 w-4" />
          </a>
        </div>
        <p className="mt-10 text-sm text-slate-500">Trusted by golfers at every handicap level</p>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
        <ChevronDown className="h-6 w-6" />
      </div>
    </section>
  );
}
