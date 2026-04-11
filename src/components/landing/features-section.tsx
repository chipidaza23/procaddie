import { Brain, Map, WifiOff, NotebookPen } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const features = [
  { icon: Brain, title: "AI Strategy", description: "Get personalized hole-by-hole strategy tailored to your skill level, club distances, and playing style.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Map, title: "Aerial Views", description: "Satellite imagery for every hole. See hazards, elevation changes, and optimal landing zones before you tee off.", color: "text-sky-400", bg: "bg-sky-500/10" },
  { icon: WifiOff, title: "Offline Mode", description: "Download your yardage book before the round. Full access to all course data — no cell signal required.", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: NotebookPen, title: "Personal Notes", description: "Add custom annotations to any hole. Remember that tricky pin position or the exact club that worked last time.", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-slate-900 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything a great caddie knows</h2>
          <p className="mx-auto max-w-2xl text-slate-400">ProCaddie combines AI intelligence with detailed course data to give you the competitive edge on every round.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-slate-800 bg-slate-800/50 transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-800">
                <CardHeader className="pb-3">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
