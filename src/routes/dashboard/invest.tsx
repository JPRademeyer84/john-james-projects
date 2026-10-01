import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/invest")({
  component: InvestPage,
});

function InvestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <AlertCircle className="h-16 w-16 text-gold mx-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold">Fractional Shares Coming Soon</h1>
        <p className="mt-3 text-muted-foreground">
          $10 Fractions against a 100,000 underlying Aureus share allocation are not open for purchase yet.
          Historical ownership will lock to the Aureus phase at the time of each purchase. No checkout in this build.
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
