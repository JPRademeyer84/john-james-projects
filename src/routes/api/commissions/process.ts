import { createFileRoute } from "@tanstack/react-router"
import { processGapCover } from "../../../lib/gapCover.mjs"
import { persistAdminAlert } from "../../../lib/persistAlert.server"
import { getUbuntuServerClient, loadGapCoverMembers, loadUbuntuUser } from "../../../lib/ubuntuServer.server"

export const Route = createFileRoute("/api/commissions/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({}))
        const transactionId = String(body.transactionId || "").trim()
        const sellerId = String(body.sellerId || "").trim()
        const productId = String(body.productId || "").trim()
        const commissionableValue = String(body.commissionableValue || "").trim()
        const commissionScheduleId = String(body.commissionScheduleId || "STANDARD_25").trim()
        const idempotencyKey = String(body.idempotencyKey || transactionId).trim()

        if (!transactionId || !sellerId || !commissionableValue) {
          return Response.json(
            { ok: false, error: "transactionId, sellerId, and commissionableValue are required" },
            { status: 400 }
          )
        }

        let ubuntu
        try {
          ubuntu = getUbuntuServerClient()
        } catch (err) {
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : "Ubuntu write target refused" },
            { status: 500 }
          )
        }

        if (!ubuntu) {
          return Response.json({ ok: false, error: "Ubuntu Afrique database is not configured" }, { status: 503 })
        }

        if (idempotencyKey) {
          const { data: prior } = await ubuntu
            .from("ua_idempotency_keys")
            .select("response")
            .eq("key", idempotencyKey)
            .maybeSingle()
          if (prior?.response) {
            return Response.json(prior.response)
          }
        }

        try {
          await loadUbuntuUser(ubuntu, sellerId)
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ubuntu user not found"
          const inactive = message.includes("not active")
          const missing = message.includes("not found") || message.includes("ua_users.id")
          return Response.json({
            ok: false,
            error: message,
            checkoutEnabled: false,
          }, { status: inactive ? 403 : missing ? 404 : 400 })
        }

        const members = await loadGapCoverMembers(ubuntu, sellerId)
        if (members.length === 0) {
          return Response.json(
            { ok: false, error: "Seller has no corporate rank on the Ubuntu sponsor tree" },
            { status: 400 }
          )
        }

        let result
        try {
          result = processGapCover({
            commissionableValue,
            members,
            scheduleId: commissionScheduleId,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : "Gap Cover failed"
          await persistAdminAlert(ubuntu, {
            type: "COMMISSION",
            source: "/api/commissions/process",
            reference: transactionId,
            message,
          }).catch(() => undefined)
          return Response.json(
            { ok: false, error: message },
            { status: 400 }
          )
        }

        for (const payment of result.payments) {
          const { error: commissionError } = await ubuntu.from("ua_commission_transactions").insert({
            source_transaction_id: transactionId,
            product_id: productId || null,
            seller_id: sellerId,
            recipient_user_id: payment.recipientId,
            recipient_rank: payment.recipientRank,
            commission_type: payment.commissionType,
            commissionable_value: result.commissionableValue,
            previous_entitlement: payment.previousEntitlement,
            new_entitlement: payment.newEntitlement,
            gap_percentage: payment.gapPercentage,
            amount: payment.amount,
            status: "posted",
            comp_plan_version: result.compPlanVersion,
          })
          if (commissionError && !String(commissionError.message || "").includes("duplicate")) {
            await persistAdminAlert(ubuntu, {
              type: "COMMISSION",
              source: "/api/commissions/process",
              reference: transactionId,
              message: commissionError.message,
            }).catch(() => undefined)
            return Response.json({ ok: false, error: commissionError.message }, { status: 500 })
          }

          const { error: walletError } = await ubuntu.from("ua_wallet_ledger").insert({
            user_id: payment.recipientId,
            entry_type: "GAP_COMMISSION",
            amount: payment.amount,
            source_transaction_id: transactionId,
            status: "posted",
          })
          if (walletError && !String(walletError.message || "").includes("duplicate")) {
            return Response.json({ ok: false, error: walletError.message }, { status: 500 })
          }
        }

        const payload = {
          ok: true,
          transactionId,
          productId: productId || null,
          totalPaid: result.totalPaid,
          unclaimedGap: result.unclaimedGap,
          unclaimedGapPercent: result.unclaimedGapPercent,
          payments: result.payments,
          compPlanVersion: result.compPlanVersion,
        }

        if (idempotencyKey) {
          await ubuntu.from("ua_idempotency_keys").insert({
            key: idempotencyKey,
            response: payload,
          })
        }

        return Response.json(payload)
      },
    },
  },
})