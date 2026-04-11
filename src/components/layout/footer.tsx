import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 bg-slate-900 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-white">ProCaddie</span>
            <span>&mdash;</span>
            <span>&copy; {year} All rights reserved.</span>
          </div>
          <p className="text-sm text-slate-600">
            Built with AI &mdash;{" "}
            <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-500 transition-colors">
              Open App
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
