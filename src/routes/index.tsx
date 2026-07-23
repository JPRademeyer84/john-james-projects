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
          className="rounded-xl border border-gold/30 bg-gold/5 px-3 py-4 text-center backdrop-blur hover-lift sheen"
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
      <ScenarioSection />
      <ScenarioCharts />
      <DividendCalculator />
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
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gold-gradient text-primary-foreground font-display font-bold shadow-[var(--shadow-gold)]">
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
          className="rounded-md border border-gold px-4 py-2 text-sm font-semibold text-gold transition-all hover:bg-gold-gradient hover:text-primary-foreground hover:border-transparent sheen"
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
      className="relative overflow-hidden ore-grain"
      style={{ backgroundImage: "var(--gradient-hero)" }}
    >
      {/* Ambient drifting ore glow */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-gold/20 blur-[120px] ore-drift" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full bg-[color:var(--gold-deep)]/25 blur-[120px] ore-drift" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
        <div className="reveal-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold ring-1 ring-gold/30">
            <Flame className="h-3.5 w-3.5 animate-pulse" /> 30 Days Only
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Own a Piece of
            <span className="block text-shimmer">John James Projects.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            A limited fractional share offering — 500,000 shares at just{" "}
            <span className="text-foreground font-semibold">$10 each</span>. Backed by a
            rewarding USDT affiliate program.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#offering"
              className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 glow-gold sheen"
            >
              Reserve Your Shares <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#affiliate"
              className="inline-flex items-center gap-2 rounded-md border border-gold/50 px-6 py-3 font-semibold text-gold transition-colors hover:bg-gold/10 sheen"
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

        <div className="relative reveal-up" style={{ animationDelay: "120ms" }}>
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gold/15 blur-3xl ore-drift" />
          <div className="rounded-3xl border border-gold/20 bg-surface/70 p-8 backdrop-blur hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Offering Snapshot
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gold">
                <span className="relative h-2 w-2 rounded-full bg-gold pulse-dot" /> Live
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
      className={`group relative overflow-hidden rounded-2xl border p-8 hover-lift sheen ${
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
    <div className="group relative flex items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift sheen hover:border-gold/50 hover:bg-gold/5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)] transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {tag}
        </span>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-right">
        <div className="font-display text-4xl font-bold text-shimmer">{percent}</div>
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
            className="inline-flex items-center gap-2 rounded-md bg-gold-gradient px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 glow-gold sheen"
          >
            Reserve Shares <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="mailto:affiliate@johnjamesprojects.com"
            className="inline-flex items-center gap-2 rounded-md border border-gold/50 px-8 py-4 font-semibold text-gold transition-colors hover:bg-gold/10 sheen"
          >
            Join Affiliate Program
          </a>
        </div>
      </div>
    </section>
  );
}

function MineSection() {
  const assets = [
    { icon: Mountain, title: "Secured Land", desc: "Fully permitted mining ground in Kadoma, Zimbabwe." },
    { icon: ShieldCheck, title: "On-Site Security", desc: "24/7 protection for staff, plant and gold recovery." },
    { icon: Factory, title: "100 t/h Wash Plant", desc: "Operational plant capable of yielding 1kg of gold per day." },
    { icon: Droplet, title: "5 Boreholes", desc: "Independent water supply already installed and tested." },
    { icon: Users, title: "Trained Workforce", desc: "Full operations team on the ground and ready to run." },
    { icon: Zap, title: "Power Needed", desc: "Capital raised funds generators & diesel for 10 hrs/day." },
  ];
  return (
    <section id="mine" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 md:grid-cols-[1fr,1.4fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">
              The Purpose
            </span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
              Funding the Aureus Alliance
              <span className="block text-gold">Holdings Mine — Kadoma.</span>
            </h2>
            <p className="mt-6 text-muted-foreground">
              Capital raised through this offering funds the running expenses of the
              Aureus Alliance Holdings gold mine in Kadoma, Zimbabwe. The site is fully
              secured, staffed and equipped — the capital unlocks daily production.
            </p>
            <p className="mt-4 text-muted-foreground">
              The goal: five additional plants operational by <span className="text-gold font-semibold">December 2026</span>,
              expanding output to 10 plants running in parallel.
            </p>
            <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-6">
              <p className="text-sm text-muted-foreground">Established Backing</p>
              <p className="mt-2 font-display text-xl text-foreground">
                <span className="text-gold">John James Property Development</span> — founded 1971,
                funding Zimbabwean mining projects since 2016.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {assets.map((a) => (
              <div
                key={a.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover-lift sheen hover:border-gold/50 hover:bg-gold/5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-gradient text-primary-foreground shadow-[var(--shadow-gold)] transition-transform group-hover:rotate-6 group-hover:scale-110">
                  <a.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DividendSection() {
  const rows = [
    { label: "Gold per day (per plant, projected)", value: "~1 kg" },
    { label: "Operating days per month", value: "22.4" },
    { label: "Plants at full scale", value: "10" },
    { label: "Projected monthly output", value: "~224 kg" },
    { label: "Projected annual output (× 12)", value: "~2,688 kg" },
    { label: "Gold price (per kg, indicative)", value: "$130,000" },
    { label: "Projected gross annual revenue", value: "~$349,440,000" },
    { label: "Less 50% (opex, tax, refinery)", value: "−$174,720,000", muted: true },
    { label: "Projected distributable profit", value: "~$174,720,000", highlight: true },
    { label: "Total shares issued", value: "1,400,000" },
    { label: "Projected dividend per full share / yr", value: "~$124.80", highlight: true },
  ];
  return (
    <section id="dividends" className="border-y border-border bg-surface/40 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Dividend Illustration
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            How the Numbers Flow.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A <span className="text-foreground">projection</span> based on 10 plants at full production. Actual
            output and returns may be higher or lower depending on gold recovery
            grades, gold spot price, plant uptime, diesel and energy costs,
            regulatory factors and the pace of expansion.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1.3fr,1fr]">
          <div className="rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-3">
              <Calculator className="h-5 w-5 text-gold" />
              <h3 className="font-display text-xl font-semibold">Annual Production Model</h3>
            </div>
            <div className="mt-6 divide-y divide-border/60">
              {rows.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between py-3">
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span
                    className={`font-display text-lg font-semibold tabular-nums ${
                      r.highlight ? "text-gold" : r.muted ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-gold/40 bg-gold/5 p-8 shadow-[var(--shadow-gold)]">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                John James Allocation
              </span>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>
                  100,000 shares × <span className="text-foreground font-semibold">~$124.80</span> ≈{" "}
                  <span className="text-foreground font-semibold">~$12,480,000</span> in projected annual dividends.
                </p>
                <p>
                  Fractionalised across 500,000 shares at $10 each:
                </p>
              </div>
              <div className="mt-6 rounded-xl bg-background/40 p-6 text-center">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Projected Per Fractional Share / Year
                </div>
                <div className="mt-2 font-display text-5xl font-bold text-gold tabular-nums">
                  ~$24.96
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Projection only — may be more or lower; grows as new mines are acquired.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-semibold">12-Month Lock-Up</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Each share purchased is locked for 12 months. First dividend distribution
                begins <span className="text-gold font-semibold">July 2027</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Scenario = {
  key: string;
  name: string;
  tagline: string;
  kgPerDay: number;
  pricePerKg: number;
  plants: number;
  tone: "conservative" | "base" | "optimistic";
};

const SCENARIOS: Scenario[] = [
  {
    key: "conservative",
    name: "Conservative",
    tagline: "Lower recovery, softer gold price, slower rollout",
    kgPerDay: 0.7,
    pricePerKg: 110_000,
    plants: 8,
    tone: "conservative",
  },
  {
    key: "base",
    name: "Base Case",
    tagline: "Target model — 10 plants at design capacity",
    kgPerDay: 1.0,
    pricePerKg: 130_000,
    plants: 10,
    tone: "base",
  },
  {
    key: "optimistic",
    name: "Optimistic",
    tagline: "Higher grade, stronger spot price, full 10-plant fleet",
    kgPerDay: 1.2,
    pricePerKg: 150_000,
    plants: 10,
    tone: "optimistic",
  },
];

const DAYS_PER_MONTH = 22.4;
const MONTHS = 12;
const OPEX_RATIO = 0.5; // 50% opex / tax / refinery
const JJ_SHARES = 100_000;
const TOTAL_SHARES = 1_400_000;
const FRACTIONAL_SHARES = 500_000;

function computeScenario(s: Scenario) {
  const annualKg = s.kgPerDay * DAYS_PER_MONTH * MONTHS * s.plants;
  const grossRevenue = annualKg * s.pricePerKg;
  const distributable = grossRevenue * (1 - OPEX_RATIO);
  const jjDividend = distributable * (JJ_SHARES / TOTAL_SHARES);
  const perFractional = jjDividend / FRACTIONAL_SHARES;
  const yieldPct = (perFractional / 10) * 100; // $10 cost basis
  return { annualKg, grossRevenue, distributable, jjDividend, perFractional, yieldPct };
}

function fmtUsd(n: number, digits = 0) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
}

function ScenarioSection() {
  return (
    <section id="scenarios" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Scenario Projections
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Higher, Lower — What the Range Looks Like.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dividends move with gold recovered per day, the spot price of gold and how
            many plants are online. These three scenarios show what a fractional share
            could earn per year across a conservative, base and optimistic outlook.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {SCENARIOS.map((s) => {
            const r = computeScenario(s);
            const isBase = s.tone === "base";
            return (
              <div
                key={s.key}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  isBase
                    ? "border-gold/50 bg-gold/5 shadow-[var(--shadow-gold)]"
                    : "border-border bg-card"
                }`}
              >
                {isBase && (
                  <span className="absolute -top-3 left-8 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
                    Target
                  </span>
                )}
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-widest ${
                      s.tone === "optimistic"
                        ? "text-emerald-400"
                        : s.tone === "conservative"
                          ? "text-muted-foreground"
                          : "text-gold"
                    }`}
                  >
                    {s.tone}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.tagline}</p>

                <dl className="mt-6 space-y-2 border-t border-border/60 pt-4 text-sm">
                  <Row label="Gold / day / plant" value={`${s.kgPerDay} kg`} />
                  <Row label="Plants online" value={`${s.plants}`} />
                  <Row label="Gold price / kg" value={fmtUsd(s.pricePerKg)} />
                  <Row label="Annual output" value={`~${Math.round(r.annualKg).toLocaleString()} kg`} />
                  <Row label="Gross revenue" value={`~${fmtUsd(r.grossRevenue)}`} />
                  <Row
                    label="Distributable (50%)"
                    value={`~${fmtUsd(r.distributable)}`}
                  />
                </dl>

                <div
                  className={`mt-6 rounded-xl p-5 text-center ${
                    isBase ? "bg-background/40" : "bg-surface/60"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Projected / Fractional Share / Yr
                  </div>
                  <div className="mt-1 font-display text-4xl font-bold text-gold tabular-nums">
                    ~${r.perFractional.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ≈ {r.yieldPct.toFixed(1)}% annual yield on $10 cost
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground">
          All figures are projections, not guarantees. Actual results depend on gold
          grade and recovery, spot price, plant uptime, diesel and energy costs,
          regulatory conditions and the pace at which additional plants and mines
          come online. Returns may be higher or lower than shown.
        </p>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-display font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

function DisclaimerSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-border bg-card/60 p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/10 ring-1 ring-gold/30">
              <Info className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Important — Nature of the Shares
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Aureus Alliance Holdings shares are <span className="text-foreground">not a security</span> and{" "}
                <span className="text-foreground">not an investment product</span>. You are purchasing a share in
                the holdings company and are therefore entitled to dividends drawn from the
                profits of the operation. Ownership is generational — passing to you, your
                children, and potentially theirs. As the company expands and acquires
                additional mines, dividends are expected to grow beyond the illustrative
                <span className="text-gold font-semibold"> $24.96</span> per fractional share figure shown above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// ============ Scenario Charts ============
function ScenarioCharts() {
  const rows = SCENARIOS.map((s) => ({ s, r: computeScenario(s) }));
  const metrics = [
    {
      key: "annualKg",
      label: "Annual Gold Output",
      unit: "kg",
      fmt: (v: number) => `${Math.round(v).toLocaleString()} kg`,
    },
    {
      key: "grossRevenue",
      label: "Gross Revenue",
      unit: "USD",
      fmt: (v: number) => fmtUsd(v),
    },
    {
      key: "perFractional",
      label: "Dividend / Fractional Share / Yr",
      unit: "USD",
      fmt: (v: number) => `$${v.toFixed(2)}`,
    },
  ] as const;

  const toneColor = (t: Scenario["tone"]) =>
    t === "optimistic"
      ? "bg-emerald-400/80"
      : t === "conservative"
        ? "bg-muted-foreground/60"
        : "bg-gold";

  return (
    <section id="charts" className="py-24 bg-surface/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Visual Comparison
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Scenarios Side by Side.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The same three outlooks — conservative, base and optimistic — plotted
            across the metrics that matter most to a fractional shareholder.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {metrics.map((m) => {
            const values = rows.map((r) => r.r[m.key as keyof ReturnType<typeof computeScenario>] as number);
            const max = Math.max(...values);
            return (
              <div key={m.key} className="rounded-2xl border border-border bg-card p-6">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </div>
                <div className="mt-1 font-display text-sm text-foreground/80">per year</div>

                <div className="mt-6 space-y-5">
                  {rows.map(({ s, r }) => {
                    const v = r[m.key as keyof typeof r] as number;
                    const pct = max > 0 ? (v / max) * 100 : 0;
                    return (
                      <div key={s.key}>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="font-semibold uppercase tracking-widest text-muted-foreground">
                            {s.name}
                          </span>
                          <span className="font-display text-sm font-semibold tabular-nums text-foreground">
                            {m.fmt(v)}
                          </span>
                        </div>
                        <div className="mt-2 h-3 overflow-hidden rounded-full bg-background/70 ring-1 ring-border">
                          <div
                            className={`h-full ${toneColor(s.tone)} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground">
          Bars are scaled to the largest value in each chart. Projections only —
          actual outcomes depend on gold grade, recovery, spot price, uptime and
          rollout pace.
        </p>
      </div>
    </section>
  );
}

// ============ Interactive Dividend Calculator ============
function DividendCalculator() {
  const [kgPerDay, setKgPerDay] = useState(1.0);
  const [pricePerKg, setPricePerKg] = useState(130_000);
  const [daysPerMonth, setDaysPerMonth] = useState(22);
  const [plants, setPlants] = useState(10);

  const compute = (kgFactor: number, priceFactor: number) => {
    const annualKg = kgPerDay * kgFactor * daysPerMonth * MONTHS * plants;
    const grossRevenue = annualKg * pricePerKg * priceFactor;
    const distributable = grossRevenue * (1 - OPEX_RATIO);
    const jjDividend = distributable * (JJ_SHARES / TOTAL_SHARES);
    const perFractional = jjDividend / FRACTIONAL_SHARES;
    const yieldPct = (perFractional / 10) * 100;
    return { annualKg, grossRevenue, distributable, perFractional, yieldPct };
  };

  const conservative = compute(0.8, 0.9);
  const base = compute(1, 1);
  const optimistic = compute(1.15, 1.1);

  const cards = [
    { name: "Conservative", tone: "conservative" as const, r: conservative, note: "kg × 0.80  ·  price × 0.90" },
    { name: "Base Case", tone: "base" as const, r: base, note: "your inputs, as entered" },
    { name: "Optimistic", tone: "optimistic" as const, r: optimistic, note: "kg × 1.15  ·  price × 1.10" },
  ];

  const toneRing = (t: "conservative" | "base" | "optimistic") =>
    t === "optimistic"
      ? "border-emerald-400/40 bg-emerald-400/5"
      : t === "conservative"
        ? "border-border bg-card"
        : "border-gold/50 bg-gold/5 shadow-[var(--shadow-gold)]";

  const toneText = (t: "conservative" | "base" | "optimistic") =>
    t === "optimistic" ? "text-emerald-400" : t === "conservative" ? "text-muted-foreground" : "text-gold";

  return (
    <section id="calculator" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">
            Interactive Model
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Build Your Own Projection.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Adjust gold per day, gold price, plant uptime and number of plants.
            The conservative, base and optimistic dividend estimates update live.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-5">
          {/* Controls */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-gold" />
              <h3 className="font-display text-lg font-semibold">Inputs</h3>
            </div>

            <div className="mt-6 space-y-6">
              <Slider
                label="Gold / day / plant"
                value={kgPerDay}
                min={0.3}
                max={1.5}
                step={0.05}
                onChange={setKgPerDay}
                display={`${kgPerDay.toFixed(2)} kg`}
              />
              <Slider
                label="Gold price"
                value={pricePerKg}
                min={80_000}
                max={180_000}
                step={1_000}
                onChange={setPricePerKg}
                display={`${fmtUsd(pricePerKg)} / kg`}
              />
              <Slider
                label="Operating days / month"
                value={daysPerMonth}
                min={10}
                max={30}
                step={1}
                onChange={setDaysPerMonth}
                display={`${daysPerMonth} days`}
              />
              <Slider
                label="Plants online"
                value={plants}
                min={1}
                max={15}
                step={1}
                onChange={setPlants}
                display={`${plants} plant${plants === 1 ? "" : "s"}`}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setKgPerDay(1.0);
                setPricePerKg(130_000);
                setDaysPerMonth(22);
                setPlants(10);
              }}
              className="mt-8 w-full rounded-lg border border-border bg-background/60 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-gold hover:border-gold/40 transition"
            >
              Reset to Base Case
            </button>
          </div>

          {/* Live results */}
          <div className="lg:col-span-3 space-y-4">
            {cards.map((c) => {
              const maxPer = Math.max(conservative.perFractional, base.perFractional, optimistic.perFractional);
              const pct = maxPer > 0 ? (c.r.perFractional / maxPer) * 100 : 0;
              return (
                <div key={c.name} className={`rounded-2xl border p-6 ${toneRing(c.tone)}`}>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className={`text-[10px] font-semibold uppercase tracking-widest ${toneText(c.tone)}`}>
                        {c.name}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{c.note}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl font-bold text-gold tabular-nums">
                        ${c.r.perFractional.toFixed(2)}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        per share / yr · {c.r.yieldPct.toFixed(1)}% yield
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/70 ring-1 ring-border">
                    <div
                      className={`h-full transition-all duration-500 ${
                        c.tone === "optimistic"
                          ? "bg-emerald-400/80"
                          : c.tone === "conservative"
                            ? "bg-muted-foreground/60"
                            : "bg-gold"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                    <MiniStat label="Annual kg" value={`${Math.round(c.r.annualKg).toLocaleString()}`} />
                    <MiniStat label="Gross rev." value={fmtUsd(c.r.grossRevenue)} />
                    <MiniStat label="Distributable" value={fmtUsd(c.r.distributable)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs text-muted-foreground">
          Illustrative model. 50% of gross revenue is reserved for operating costs,
          tax and refinery. John James Projects holds {JJ_SHARES.toLocaleString()} of{" "}
          {TOTAL_SHARES.toLocaleString()} total Aureus Alliance Holdings shares,
          distributed across {FRACTIONAL_SHARES.toLocaleString()} fractional shares.
        </p>
      </div>
    </section>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
        <span className="font-display text-sm font-semibold tabular-nums text-gold">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[var(--gold)]"
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/50 p-3 ring-1 ring-border">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-sm font-semibold tabular-nums text-foreground truncate">
        {value}
      </div>
    </div>
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
