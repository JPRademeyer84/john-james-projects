import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/invest")({
  component: InvestPage,
});

function InvestPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [fractionQty, setFractionQty] = useState(1);
  const [fractionQuote, setFractionQuote] = useState<any>(null);
  const [fractionError, setFractionError] = useState("");

  useEffect(() => {
    fetch("/api/cards/products")
      .then((res) => res.json())
      .then((json) => setCards(json.products || []))
      .catch(() => setCards([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFractionError("");
    fetch("/api/fractions/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: fractionQty }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (!json.ok) {
          setFractionQuote(null);
          setFractionError(json.error || "Quote failed");
          return;
        }
        setFractionQuote({ ...json.quote, inventory: json.inventory, phase: json.phase });
      })
      .catch(() => {
        if (!cancelled) setFractionError("Quote unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [fractionQty]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold">Cards and Fractions</h1>
        <p className="mt-2 text-muted-foreground">
          Server quotes only. Payment checkout is not open. No wallet, inventory, or Gap Cover settlement in this screen.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">Aureus Cards</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {cards.map((card) => (
              <div key={card.productType} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs uppercase tracking-widest text-gold">{card.productType}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{card.name}</h3>
                <p className="mt-4 text-sm text-muted-foreground">Retail {card.unit.retailPrice}</p>
                <p className="text-sm text-muted-foreground">Cost {card.unit.cost}</p>
                <p className="text-sm text-muted-foreground">Max Gap {card.unit.gap}</p>
                <p className="text-sm text-muted-foreground">BLP {card.unit.blp}</p>
                <p className="mt-3 font-semibold text-gold">Ubuntu Afrique gross {card.unit.ubuntuAfriqueGross}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-gold/30 bg-gold/5 p-6">
          <h2 className="font-display text-xl font-semibold">$10 Fractions</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Live Ubuntu phase and remaining inventory. Historical ownership will lock to the phase used at purchase. Checkout is not open.
          </p>
          <label className="mt-4 block text-sm font-medium">Quantity</label>
          <input
            type="number"
            min={1}
            value={fractionQty}
            onChange={(e) => setFractionQty(Number(e.target.value))}
            className="mt-2 w-40 rounded-lg border border-border bg-background px-4 py-3"
          />
          {fractionError && <p className="mt-3 text-sm text-red-400">{fractionError}</p>}
          {fractionQuote && (
            <div className="mt-4 grid gap-2 text-sm">
              <p>Phase {fractionQuote.phase?.phase ?? fractionQuote.aureusPhase} at {fractionQuote.phase?.aureusSharePrice ?? fractionQuote.aureusSharePrice}</p>
              <p>Remaining underlying {fractionQuote.inventory?.remainingUnderlying ?? fractionQuote.remainingUnderlying}</p>
              <p>Total {fractionQuote.total}</p>
              <p>Underlying equivalent {fractionQuote.underlyingShareEquivalent}</p>
              <p>Allocation component {fractionQuote.allocationComponent}</p>
              <p>Max Gap {fractionQuote.gap}</p>
              <p>BLP {fractionQuote.blp}</p>
              <p className="font-semibold text-gold">Ubuntu Afrique gross {fractionQuote.ubuntuAfriqueGross}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}