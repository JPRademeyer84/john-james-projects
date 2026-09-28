import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { auth } from "../../lib/supabase"
import { isAureusAdmin, loadAureusMemberByAuthId, type AureusMemberProfile } from "../../lib/aureusMember"

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
})

function AdminPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<AureusMemberProfile | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadAdmin()
  }, [])

  async function loadAdmin() {
    try {
      const current = await auth.getCurrentUser()
      if (!current.user || current.identitySource !== "aureus") {
        navigate({ to: "/auth/login" })
        return
      }
      const member = await loadAureusMemberByAuthId(current.user.id)
      if (!isAureusAdmin(member)) {
        setError("This Aureus account is not an administrator.")
        return
      }
      setProfile(member)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin profile")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading Ubuntu Afrique admin...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <span className="font-display text-lg font-semibold text-gold">Ubuntu Afrique Admin</span>
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            User dashboard
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-6 py-12">
        {error && <p className="text-red-400">{error}</p>}
        {profile && (
          <div className="space-y-6">
            <h1 className="font-display text-3xl font-bold">Aureus administration</h1>
            <p className="text-muted-foreground">
              Read-only view of your Aureus Africa admin identity. Ubuntu Afrique does not write Aureus tables.
            </p>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <Row label="Aureus user ID" value={String(profile.id)} />
              <Row label="Username" value={profile.username} />
              <Row label="Email" value={profile.email} />
              <Row label="Role" value={profile.role || "admin"} />
              <Row label="Full name" value={profile.full_name || "-"} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
