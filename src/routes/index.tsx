import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Clock, Coins, TrendingUp, Users, Trophy, Flame, Mountain, Zap, Droplet, ShieldCheck, Factory, Calculator, Lock, Info } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

// Fixed offering end date — 30 day window
const OFFERING_END = new Date("2026-08-18T23:59:59Z").getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function CountdownTimer({ compact = false }: { compact?: boolean }) {
  const { days, hours, minutes, seconds } = useCountdown(OFFERING_END);
  const units = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];
  return (
    <div
      className={`grid grid-cols-4 gap-2 ${
        compact ? "max-w-md" : "max-w-xl"
      }`}
    >
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-4 text-center backdrop-blur"
        >
          <div
            className={`font-display font-bold text-gold tabular-nums ${
              compact ? "text-2xl" : "text-4xl md:text-5xl"
            }`}
          >
            {String(u.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {u.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Header />
      <Hero />
      <MineSection />
      <OfferingSection />
      <DividendSection />
      <AffiliateSection />
      <DisclaimerSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gold text-primary-foreground font-display font-bold">
            JJ
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-gold">
            John James Projects
          </span>
        </a>
        <nav className="hidden gap-8 md:flex">
          {["Mine", "Offering", "Dividends", "Affiliate", "Contact"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              {l}
            </a>
          ))}
        </nav>
        <a
          href="#offering"
          className="rounded-md border border-gold px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
        >
          Invest Now
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold ring-1 ring-gold/30">
            <Flame className="h-3.5 w-3.5" /> 30 Days Only
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Own a Piece of
            <span className="block text-gold">John James Projects.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            A limited fractional share offering — 500,000 shares at just{" "}
            <span className="text-foreground font-semibold">$10 each</span>. Backed by a
            rewarding USDT affiliate program.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#offering"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
            >
              Reserve Your Shares <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#affiliate"
              className="inline-flex items-center gap-2 rounded-md border border-gold/50 px-6 py-3 font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Affiliate Plan
            </a>
          </div>

          <div className="mt-10">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
              Offering Closes In
            </div>
            <CountdownTimer />
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
            <Stat value="$10" label="Per Share" />
            <Stat value="500k" label="Shares Available" />
            <Stat value="30" label="Days Only" />
          </div>

        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gold/10 blur-3xl" />
          <div className="rounded-3xl border border-border bg-surface/60 p-8 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Offering Snapshot
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gold">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse" /> Live
              </span>
            </div>

            <div className="mt-8 space-y-6">
              <SnapshotRow label="Total Raise" value="$5,000,000" />
              <SnapshotRow label="Cost Price" value="$50 / share" muted />
              <SnapshotRow label="Selling Price" value="$10 / share" highlight />
              <SnapshotRow label="Fractional Shares" value="500,000" />
              <SnapshotRow label="Window" value="30 Days" />
            </div>

            <div className="mt-8 rounded-xl bg-gold/10 p-5 ring-1 ring-gold/20">
              <p className="text-sm text-gold">
                5× fractional split — a $50 share made accessible at $10 through
                fractional ownership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-gold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SnapshotRow({
  label,
  value,
  highlight,
  muted,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/50 pb-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`font-display text-xl font-semibold ${
          highlight ? "text-gold" : muted ? "text-muted-foreground line-through" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function OfferingSection() {
  return (
    <section id="offering" className="border-y border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            The Offering
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            The Math Is Simple.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A transparent, fixed-window offering built for accessibility and clarity.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <OfferingCard
            step="01"
            title="Cost Price"
            equation="100,000 × $50"
            result="$5,000,000"
            note="Original share valuation forming the underlying pool."
          />
          <OfferingCard
            step="02"
            title="Fractional Split"
            equation="$5,000,000 ÷ $10"
            result="500,000 Shares"
            note="Every share fractionalised so anyone can participate."
            highlight
          />
          <OfferingCard
            step="03"
            title="Selling Window"
            equation="Limited Access"
            result="30 Days Only"
            note="One offering. One window. No extensions."
          />
        </div>
      </div>
    </section>
  );
}

function OfferingCard({
  step,
  title,
  equation,
  result,
  note,
  highlight,
}: {
  step: string;
  title: string;
  equation: string;
  result: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-8 transition-all hover:-translate-y-1 ${
        highlight
          ? "border-gold/60 bg-gold/5 shadow-[var(--shadow-gold)]"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-sm font-bold text-gold">{step}</span>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
      <div className="mt-4 text-sm text-muted-foreground">{equation}</div>
      <div className="mt-2 font-display text-3xl font-bold text-gold">{result}</div>
      <p className="mt-6 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

function AffiliateSection() {
  return (
    <section id="affiliate" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-[1fr,1.2fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              Affiliate Compensation
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Get Rewarded for
              <span className="block text-gold">Growing the Network.</span>
            </h2>
            <p className="mt-6 text-muted-foreground">
              A three-tier compensation model paid in USDT and shares. Built to reward
              referral, consistency and top performance.
            </p>
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
              <Coins className="h-5 w-5 text-gold" />
              <p className="text-sm text-foreground">
                All commissions paid in <span className="font-semibold text-gold">USDT</span>{" "}
                with additional bonus in fractional shares.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <AffiliateCard
              icon={Users}
              tag="First Level"
              title="Direct Referral"
              percent="10%"
              subPercent="+ 5%"
              description="10% in USDT plus 5% in share purchases on every first-level referral."
            />
            <AffiliateCard
              icon={Trophy}
              tag="Monthly"
              title="Top Affiliate Bonus"
              percent="15%"
              description="Awarded monthly to the top-performing affiliate across the network."
            />
            <AffiliateCard
              icon={TrendingUp}
              tag="Daily"
              title="Performance Pool"
              percent="5%"
              description="A daily performance pool distributed to qualifying affiliates."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AffiliateCard({
  icon: Icon,
  tag,
  title,
  percent,
  subPercent,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  percent: string;
  subPercent?: string;
  description: string;
}) {
  return (
    <div className="group flex items-center gap-6 rounded-2xl border border-border bg-card p-6 transition-all hover:border-gold/50 hover:bg-gold/5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/30">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {tag}
        </span>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-right">
        <div className="font-display text-4xl font-bold text-gold">{percent}</div>
        {subPercent && (
          <div className="text-xs font-semibold text-gold-soft">{subPercent} Shares</div>
        )}
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <section id="contact" className="border-t border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold">
          Limited Window
        </span>
        <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">
          30 Days. 500,000 Shares.
          <span className="block text-gold">One Opportunity.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
          Secure your fractional stake in John James Projects before the window closes.
        </p>
        <div className="mt-10 flex justify-center">
          <CountdownTimer />
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="mailto:invest@johnjamesprojects.com"
            className="inline-flex items-center gap-2 rounded-md bg-gold px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
          >
            Reserve Shares <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="mailto:affiliate@johnjamesprojects.com"
            className="inline-flex items-center gap-2 rounded-md border border-gold/50 px-8 py-4 font-semibold text-gold transition-colors hover:bg-gold/10"
          >
            Join Affiliate Program
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gold text-primary-foreground font-display text-sm font-bold">
            JJ
          </span>
          <span className="font-display font-semibold text-gold">John James Projects</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} John James Projects. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
