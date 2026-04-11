import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features-section";
import { DemoPreview } from "@/components/landing/demo-preview";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/layout/footer";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col">
      <Hero />
      <FeaturesSection />
      <DemoPreview />
      <CtaSection />
      <Footer />
    </main>
  );
}
