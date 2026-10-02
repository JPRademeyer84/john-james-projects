import { createFileRoute } from "@tanstack/react-router"
import { assertCompanyActive } from "../../../lib/marketplaceCompany.mjs"
import { getUbuntuServerClient } from "../../../lib/ubuntuServer.server"
import { loadMarketplaceCompanies } from "../../../lib/persistMarketplaceCompany.server"

export const Route = createFileRoute("/api/marketplace/companies")({
  server: {
    handlers: {
      GET: async () => {
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
            { status: 500 }
          )
        }
        if (!ubuntu) {
          return Response.json(
            { ok: false, error: "Ubuntu Afrique database is not configured", checkoutEnabled: false },
            { status: 503 }
          )
        }

        try {
          const companies = (await loadMarketplaceCompanies(ubuntu)).filter((company) => {
            try {
              assertCompanyActive(company)
              return true
            } catch {
              return false
            }
          })
          return Response.json({ ok: true, companies, checkoutEnabled: false })
        } catch (err) {
          return Response.json(
            {
              ok: false,
              error: err instanceof Error ? err.message : "Marketplace catalog failed",
              checkoutEnabled: false,
            },
            { status: 500 }
          )
        }
      },
    },
  },
})
