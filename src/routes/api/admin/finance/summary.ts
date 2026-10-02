import { createFileRoute } from "@tanstack/react-router"
import { getUbuntuServerClient } from "../../../../lib/ubuntuServer.server"
import { loadFinanceSummary } from "../../../../lib/persistFinanceRead.server"

function authorize(request: Request, url: URL) {
  const expected = String(process.env.UA_COMMERCE_CONFIRM_SECRET || "")
  if (!expected) return { ok: false, status: 503, error: "UA_COMMERCE_CONFIRM_SECRET is not configured" }
  const header = request.headers.get("x-ua-commerce-confirm") || ""
  const fromQuery = String(url.searchParams.get("confirmSecret") || "")
  if (header !== expected && fromQuery !== expected) {
    return { ok: false, status: 401, error: "Confirm secret required" }
  }
  return { ok: true }
}

function rejectClientCommerceFields(url: URL) {
  if (url.searchParams.has("remainingUnderlying")) {
    return { ok: false, error: "remainingUnderlying is taken from Ubuntu inventory, not the client" }
  }
  if (url.searchParams.has("aureusSharePrice")) {
    return { ok: false, error: "aureusSharePrice and aureusPhase are taken from Ubuntu ua_aureus_phases, not the client" }
  }
  if (url.searchParams.has("members")) {
    return { ok: false, error: "Client-supplied rank chains are rejected" }
  }
  return { ok: true }
}

export const Route = createFileRoute("/api/admin/finance/summary")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const auth = authorize(request, url)
        if (!auth.ok) {
          return Response.json({ ok: false, error: auth.error, checkoutEnabled: false }, { status: auth.status })
        }

        const rejected = rejectClientCommerceFields(url)
        if (!rejected.ok) {
          return Response.json({ ok: false, error: rejected.error, checkoutEnabled: false }, { status: 400 })
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json(
            {
              ok: false,
              error: err instanceof Error ? err.message : "Ubuntu read refused",
              checkoutEnabled: false,
            },
            { status: 500 },
          )
        }
        if (!ubuntu) {
          return Response.json(
            { ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false },
            { status: 503 },
          )
        }

        const summary = await loadFinanceSummary(ubuntu)
        return Response.json({ ok: true, checkoutEnabled: false, summary })
      },
    },
  },
})
