import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, Users, Coins, ArrowRight } from "lucide-react";
import { supabase, PROJECT_ID } from "../../lib/supabase";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

interface DashboardData {
  user: {
    username: string;
    email: string;
    referral_code: string;
  };
  portfolio: {
    total_shares: number;
    total_invested: number;
    current_value: number;
  };
  commissions: {
    total_earned: number;
    pending: number;
    withdrawn: number;
  };
  referrals: {
    direct: number;
    total_team: number;
  };
}

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate({ to: "/auth/login" });
        return;
      }

      // Fetch user data
      const { data: userData } = await supabase
        .from('users')
        .select('username, email, referral_code')
        .eq('id', user.id)
        .single();

      // Get investments for project_id = 2 only
      const { data: investments } = await supabase
        .from('investments')
        .select('amount, shares, status')
        .eq('user_id', user.id)
        .eq('project_id', PROJECT_ID);

      const totalShares = investments?.reduce((sum, inv) => sum + (inv.status === 'approved' ? inv.shares : 0), 0) || 0;
      const totalInvested = investments?.reduce((sum, inv) => sum + (inv.status === 'approved' ? inv.amount : 0), 0) || 0;

      // Get commissions for project_id = 2 only
      const { data: commissions } = await supabase
        .from('commissions')
        .select('amount, status')
        .eq('user_id', user.id)
        .eq('project_id', PROJECT_ID);

      const totalEarned = commissions?.reduce((sum, comm) => sum + comm.amount, 0) || 0;
      const pending = commissions?.filter(c => c.status === 'pending').reduce((sum, comm) => sum + comm.amount, 0) || 0;

      // Get referral count
      const { count: directReferrals } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('sponsor_id', user.id);

      setData({
        user: {
          username: userData?.username || 'User',
          email: userData?.email || '',
          referral_code: userData?.referral_code || '',
        },
        portfolio: {
          total_shares: totalShares,
          total_invested: totalInvested,
          current_value: totalInvested * 1.125,
        },
        commissions: {
          total_earned: totalEarned,
          pending: pending,
          withdrawn: totalEarned - pending,
        },
        referrals: {
          direct: directReferrals || 0,
          total_team: directReferrals || 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-red-400">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-gold-gradient text-primary-foreground font-display font-bold shadow-[var(--shadow-gold)]">
              JJ
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-gold">
              John James Projects
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-gold">Dashboard</a>
            <a href="/dashboard/invest" className="text-sm text-muted-foreground hover:text-foreground">Invest</a>
            <a href="/affiliate" className="text-sm text-muted-foreground hover:text-foreground">Affiliate</a>
            <button className="text-sm text-muted-foreground hover:text-foreground">Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {data.user.username}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Coins}
            label="Total Shares"
            value={data.portfolio.total_shares.toLocaleString()}
            subtext={`R${data.portfolio.total_invested.toLocaleString()} invested`}
          />
          <StatCard
            icon={TrendingUp}
            label="Portfolio Value"
            value={`R${data.portfolio.current_value.toLocaleString()}`}
            subtext="Current valuation"
            trend="+12.5%"
          />
          <StatCard
            icon={Coins}
            label="Total Commissions"
            value={`R${data.commissions.total_earned.toLocaleString()}`}
            subtext={`R${data.commissions.pending.toLocaleString()} pending`}
          />
          <StatCard
            icon={Users}
            label="Referrals"
            value={data.referrals.direct.toString()}
            subtext={`${data.referrals.total_team} total team`}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-xl font-semibold">Investment Overview</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Shares Owned</span>
                <span className="font-display text-lg font-semibold">{data.portfolio.total_shares.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-sm text-muted-foreground">Total Invested</span>
                <span className="font-display text-lg font-semibold">R{data.portfolio.total_invested.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Value</span>
                <span className="font-display text-lg font-semibold text-gold">R{data.portfolio.current_value.toLocaleString()}</span>
              </div>
            </div>
            <a
              href="/dashboard/invest"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-gold-gradient px-6 py-3 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5"
            >
              Purchase More Shares <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-xl font-semibold">Referral Code</h2>
            <div className="mt-6 rounded-lg bg-background/60 p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Your Code</div>
              <div className="mt-2 font-display text-2xl font-bold text-gold">{data.user.referral_code}</div>
            </div>
            <a
              href="/affiliate"
              className="mt-6 block w-full rounded-md border border-gold/50 px-6 py-3 text-center font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              View Affiliate Dashboard
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, trend }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400">{trend}</span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-2xl font-bold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>
      </div>
    </div>
  );
}
