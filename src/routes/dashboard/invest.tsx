import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/invest")({
  component: InvestPage,
});

const SHARE_PRICE = 10;
const MAX_SHARES_PER_PURCHASE = 10000;
const OFFERING_END = new Date("2026-08-18T23:59:59Z");

function InvestPage() {
  const [shares, setShares] = useState(100);
  const [paymentMethod, setPaymentMethod] = useState("usdt");
  const [walletAddress, setWalletAddress] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const amount = shares * SHARE_PRICE;
  const isOfferingActive = Date.now() < OFFERING_END.getTime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!proofFile) {
        throw new Error("Payment proof is required");
      }

      const formData = new FormData();
      formData.append("shares", shares.toString());
      formData.append("amount", amount.toString());
      formData.append("payment_method", paymentMethod);
      formData.append("wallet_address", walletAddress);
      formData.append("payment_proof", proofFile);

      const response = await fetch("/api/invest/purchase", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Investment failed");

      setSuccess(true);
      setShares(100);
      setWalletAddress("");
      setProofFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOfferingActive) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <AlertCircle className="h-16 w-16 text-gold mx-auto" />
          <h1 className="mt-4 font-display text-2xl font-bold">Offering Closed</h1>
          <p className="mt-2 text-muted-foreground">
            The 30-day fractional share offering has ended.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-gold/50 px-6 py-3 font-semibold text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
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

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Purchase Shares</h1>
          <p className="mt-2 text-muted-foreground">
            Secure your fractional stake in John James Projects
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-400">Investment Submitted</p>
              <p className="text-sm text-emerald-400/80 mt-1">
                Your investment is pending approval. You will receive a confirmation email shortly.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="font-display text-xl font-semibold mb-6">Investment Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Shares</label>
                  <input
                    type="number"
                    min="1"
                    max={MAX_SHARES_PER_PURCHASE}
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Price per share: ${SHARE_PRICE} USD
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="usdt">USDT (TRC20)</option>
                    <option value="usdt-erc20">USDT (ERC20)</option>
                    <option value="btc">Bitcoin</option>
                    <option value="eth">Ethereum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Your Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground font-mono text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Payment Proof</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !proofFile}
              className="w-full rounded-lg bg-gold-gradient px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-gold)] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Processing..." : `Invest $${amount.toLocaleString()}`}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-semibold">{shares.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per share</span>
                  <span className="font-semibold">${SHARE_PRICE}</span>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-display text-xl font-bold text-gold">${amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
