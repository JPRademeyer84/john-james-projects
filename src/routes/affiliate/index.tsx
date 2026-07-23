import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Users, TrendingUp, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/affiliate/")({
  component: AffiliatePage,
});

interface AffiliateData {
  referral_code: string;
  referral_link: string;
  stats: {
    direct_referrals: number;
    total_team: number;
    total_earned: number;
    pending_commissions: number;
  };
  recent_referrals: Array<{
    username: string;
    joined_at: string;
    total_invested: number;
  }>;
  commissions: Array<{
    amount: number;
    shares_bonus: number;
    type: string;
    status: string;
    created_at: string;
  }>;
}

function AffiliatePage() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch("/api/affiliate/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (data) {
      navigator.clipboard.writeText(data.referral_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading affiliate dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400">Failed to load affiliate data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Earn 10% USDT + 5% shares on every referral
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Your Referral Link</h2>
          <div className="flex gap-3">
            <input
              type="text"
              readOnly
              value={data.referral_link}
              className="flex-1 rounded-lg border border-gold/20 bg-background/60 px-4 py-3 text-sm font-mono text-foreground"
            />
            <button
              onClick={copyReferralLink}
              className="flex items-center gap-2 rounded-lg bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Share this link to earn commissions on every investment made through it
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={Users}
            label="Direct Referrals"
            value={data.stats.direct_referrals.toString()}
            subtext="Active members"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Team"
            value={data.stats.total_team.toString()}
            subtext="Including downline"
          />
          <StatCard
            icon={DollarSign}
            label="Total Earned"
            value={`$${data.stats.total_earned.toLocaleString()}`}
            subtext="All-time commissions"
          />
          <StatCard
            icon={DollarSign}
            label="Pending"
            value={`$${data.stats.pending_commissions.toLocaleString()}`}
            subtext="Awaiting approval"
            highlight
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-xl font-semibold mb-6">Recent Referrals</h2>
            {data.recent_referrals.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No referrals yet</p>
            ) : (
              <div className="space-y-4">
                {data.recent_referrals.map((referral, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div>
                      <p className="font-semibold">{referral.username}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(referral.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gold">${referral.total_invested.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total invested</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-xl font-semibold mb-6">Commission History</h2>
            {data.commissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No commissions yet</p>
            ) : (
              <div className="space-y-4">
                {data.commissions.slice(0, 5).map((commission, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0">
                    <div>
                      <p className="font-semibold capitalize">{commission.type.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gold">${commission.amount.toLocaleString()}</p>
                      {commission.shares_bonus > 0 && (
                        <p className="text-xs text-muted-foreground">
                          + {commission.shares_bonus} shares
                        </p>
                      )}
                      <p className={`text-xs ${commission.status === "paid" ? "text-emerald-400" : "text-yellow-400"}`}>
                        {commission.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-gold/5 p-8">
          <h2 className="font-display text-xl font-semibold mb-4">Commission Structure</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm text-muted-foreground">Direct Referral</p>
              <p className="mt-1 font-display text-2xl font-bold text-gold">10% USDT</p>
              <p className="text-xs text-muted-foreground">+ 5% in shares</p>
            </div>
            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm text-muted-foreground">Top Monthly</p>
              <p className="mt-1 font-display text-2xl font-bold text-gold">15%</p>
              <p className="text-xs text-muted-foreground">Best performer</p>
            </div>
            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm text-muted-foreground">Daily Pool</p>
              <p className="mt-1 font-display text-2xl font-bold text-gold">5%</p>
              <p className="text-xs text-muted-foreground">Performance based</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, highlight }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-gold/30 bg-gold/5" : "border-border bg-card"}`}>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>
    </div>
  );
}
