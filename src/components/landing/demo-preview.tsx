export function DemoPreview() {
  return (
    <section className="bg-slate-950 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your yardage book, reimagined</h2>
          <p className="text-slate-400">See exactly what ProCaddie looks like on the course.</p>
        </div>
        <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl shadow-emerald-900/20">
          <div className="flex items-center justify-between bg-slate-800 px-5 py-3">
            <span className="text-xs font-medium text-slate-400">ProCaddie</span>
            <div className="flex gap-1.5">
              <div className="h-2 w-2 rounded-full bg-red-500/70" />
              <div className="h-2 w-2 rounded-full bg-yellow-500/70" />
              <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
            </div>
          </div>
          <div className="bg-emerald-600 px-5 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest opacity-80">Hole 7</p>
                <p className="text-2xl font-bold">Par 4 — 412 yds</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-80">Handicap</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </div>
          <div className="relative h-48 bg-slate-800">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 180" className="h-full w-full opacity-60">
                <rect width="200" height="180" fill="#1e293b" />
                <ellipse cx="20" cy="90" rx="22" ry="70" fill="#134e2a" />
                <ellipse cx="180" cy="90" rx="22" ry="70" fill="#134e2a" />
                <path d="M 70 170 Q 65 120 75 80 Q 80 50 90 20 L 110 20 Q 120 50 125 80 Q 135 120 130 170 Z" fill="#166534" />
                <ellipse cx="115" cy="60" rx="12" ry="8" fill="#d4c090" />
                <ellipse cx="100" cy="25" rx="20" ry="14" fill="#15803d" />
                <line x1="100" y1="25" x2="100" y2="10" stroke="white" strokeWidth="1.5" />
                <rect x="100" y="10" width="8" height="5" fill="#ef4444" />
                <rect x="88" y="162" width="24" height="10" rx="3" fill="#166534" stroke="#4ade80" strokeWidth="1" />
              </svg>
            </div>
            <div className="absolute right-3 top-3 flex flex-col gap-1.5">
              <div className="rounded bg-slate-900/80 px-2 py-1 text-center text-xs text-white">
                <p className="font-bold text-emerald-400">178</p>
                <p className="text-slate-400">to pin</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600">
                <span className="text-xs text-white font-bold">AI</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">AI Caddie</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Aim left-center off the tee to avoid the fairway bunker at 295. Leaves a clean approach with a 6-iron to a front-left pin.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-800 px-3 py-2 text-center">
                <p className="text-xs text-slate-400">Driver</p>
                <p className="font-semibold text-white">L-Center</p>
              </div>
              <div className="rounded-lg bg-slate-800 px-3 py-2 text-center">
                <p className="text-xs text-slate-400">Approach</p>
                <p className="font-semibold text-white">6-iron</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
