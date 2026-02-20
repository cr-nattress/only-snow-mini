"use client";

/**
 * Landing page shown to non-onboarded visitors at the root route.
 * Leads with competitive positioning against forecast apps (OpenSnow),
 * centers the comparison table, and drives to CTA buttons that route
 * to /onboarding/welcome. CSS-only visual effects.
 */

import { useRouter } from "next/navigation";
import { Mountain, Check, X, Users, Shield, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

function ComparisonRow({ label, them, us }: { label: string; them: string; us: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3 border-b border-snow-border/40 last:border-b-0">
      <span className="text-snow-text text-sm font-medium">{label}</span>
      <span className="flex items-center gap-1.5 text-xs text-snow-text-muted/70 w-24 justify-center">
        <X className="w-3.5 h-3.5 text-snow-alert/60 shrink-0" />
        <span>{them}</span>
      </span>
      <span className="flex items-center gap-1.5 text-xs text-snow-go font-medium w-24 justify-center">
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>{us}</span>
      </span>
    </div>
  );
}

function DiffCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="bg-snow-surface-raised/60 rounded-xl border border-snow-border/60 p-4 flex gap-3">
      <div className="w-9 h-9 rounded-lg bg-snow-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-snow-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-snow-text">{title}</p>
        <p className="text-xs text-snow-text-muted mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function MountainSilhouettes() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
      <div
        className="absolute bottom-0 w-full h-48 bg-snow-surface-raised/40"
        style={{
          clipPath: "polygon(0% 100%, 0% 60%, 15% 30%, 30% 50%, 45% 15%, 60% 45%, 75% 25%, 90% 55%, 100% 35%, 100% 100%)",
        }}
      />
      <div
        className="absolute bottom-0 w-full h-36 bg-snow-surface-raised/60"
        style={{
          clipPath: "polygon(0% 100%, 0% 70%, 10% 50%, 25% 65%, 40% 35%, 55% 55%, 70% 40%, 85% 60%, 100% 45%, 100% 100%)",
        }}
      />
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();

  const handleCta = () => {
    router.push("/onboarding/welcome");
  };

  return (
    <div className="landing-bg-gradient min-h-screen relative overflow-hidden flex flex-col items-center px-6 pb-52 pt-14">
      <div className="landing-snowfall absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        {/* Brand */}
        <div className="landing-glow w-18 h-18 rounded-full bg-snow-surface-raised border border-snow-border flex items-center justify-center mb-4">
          <Mountain className="w-9 h-9 text-snow-primary" />
        </div>
        <h1 className="text-4xl font-bold text-snow-text tracking-tight">OnlySnow</h1>

        {/* Hook — the competitive positioning IS the headline */}
        <p className="mt-4 text-xl font-semibold text-snow-text leading-snug">
          Decisions, not forecasts.
        </p>
        <p className="mt-2 text-sm text-snow-text-muted leading-relaxed max-w-xs">
          Other apps hand you charts and raw data. We tell you exactly where to ski and when to go.
        </p>

        {/* Comparison table — the centerpiece */}
        <div className="mt-8 w-full bg-snow-surface-raised/80 rounded-xl border border-snow-border p-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center pb-2 mb-1 border-b border-snow-border">
            <span className="text-[10px] text-snow-text-muted uppercase tracking-wider text-left"></span>
            <span className="text-[10px] text-snow-text-muted uppercase tracking-wider w-24 text-center">Forecast apps</span>
            <span className="text-[10px] text-snow-primary uppercase tracking-wider font-bold w-24 text-center">OnlySnow</span>
          </div>

          <ComparisonRow label="Output"            them="Raw data"   us="Go / Skip" />
          <ComparisonRow label="Your drive time"   them="Ignored"    us="Scored" />
          <ComparisonRow label="Your passes"       them="You search" us="Auto-ranked" />
          <ComparisonRow label="Crowd risk"        them="None"       us="Built in" />
          <ComparisonRow label="Dangerous wind"    them="Just mph"   us="Auto-skip" />
          <ComparisonRow label="Setup time"        them="Manual"     us="22 seconds" />
          <ComparisonRow label="Price"             them="$100/yr"    us="Free" />
        </div>

        {/* Differentiator cards */}
        <div className="mt-6 flex flex-col gap-3 w-full">
          <DiffCard
            icon={Users}
            title="Crowds kill powder days too"
            body="Holiday weekends and post-forecast surges are scored into every recommendation. When a storm forecast sends everyone to the same mountain, we steer you somewhere better."
          />
          <DiffCard
            icon={Shield}
            title="We won&apos;t send you into a windstorm"
            body="50 mph gusts auto-skip a resort no matter how much snow it got. Other apps show you the inches and let you figure it out."
          />
          <DiffCard
            icon={DollarSign}
            title="Free. No paywall. No &quot;premium tier.&quot;"
            body="Forecast apps keep raising prices and gating features. Verdicts, rankings, storm alerts — all of it, free."
          />
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 w-full">
          <Button size="lg" fullWidth onClick={handleCta}>
            Get Started — it&apos;s free
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={handleCta}>
            Log In
          </Button>
        </div>

        <p className="mt-4 text-[11px] text-snow-text-muted/60">
          Set up in 22 seconds. No credit card.
        </p>
      </div>

      <MountainSilhouettes />
    </div>
  );
}
