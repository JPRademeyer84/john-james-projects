import assert from "node:assert/strict"
import { test } from "node:test"
import {
  confirmCommercePayment,
  createPendingCardOrder,
  createPendingFractionOrder,
} from "../src/lib/commerceOrders.mjs"

const chain = [
  { userId: "ssa", rank: "SSA" },
  { userId: "asm", rank: "ASM" },
  { userId: "bsm", rank: "BSM" },
  { userId: "ssm", rank: "SSM" },
  { userId: "vp", rank: "VP" },
]

test("pending card order does not run Gap Cover until payment confirm", () => {
  const pending = createPendingCardOrder({
    orderId: "CARD-1",
    userId: "9",
    productType: "CARD_PLASTIC",
  })
  assert.equal(pending.status, "PENDING_PAYMENT")
  assert.equal(pending.ubuntuAfriqueGross, "15.00")
  assert.equal(pending.gapCover, undefined)
})

test("confirm plastic card runs one Gap Cover pass totaling 25.00", () => {
  const pending = createPendingCardOrder({
    orderId: "CARD-2",
    userId: "9",
    productType: "CARD_PLASTIC",
  })
  const paid = confirmCommercePayment({ order: pending, paymentId: "PAY-1", members: chain })
  assert.equal(paid.status, "PAID")
  assert.equal(paid.gapCover.totalPaid, "25.00")
  assert.equal(paid.gapCover.unclaimedGap, "0.00")
  assert.equal(paid.gapCover.payments.length, 5)
})

test("confirm fraction at $200 locks 0.05 ownership and pays 2.50 gap", () => {
  const pending = createPendingFractionOrder({
    orderId: "FRAC-1",
    userId: "9",
    quantity: 1,
    aureusSharePrice: "200.00",
    aureusPhase: 11,
    remainingUnderlying: "100000",
  })
  assert.equal(pending.status, "PENDING_PAYMENT")
  const paid = confirmCommercePayment({ order: pending, paymentId: "PAY-2", members: chain })
  assert.equal(paid.status, "PAID")
  assert.equal(paid.ownership.underlyingShareEquivalent, "0.05")
  assert.equal(paid.ownership.aureusSharePrice, "200.00")
  assert.equal(paid.gapCover.totalPaid, "2.50")
})

test("duplicate confirm is idempotent and does not create a second gap pass", () => {
  const pending = createPendingCardOrder({
    orderId: "CARD-3",
    userId: "9",
    productType: "CARD_METAL",
  })
  const first = confirmCommercePayment({ order: pending, paymentId: "PAY-3", members: chain })
  const second = confirmCommercePayment({ order: first, paymentId: "PAY-3", members: chain })
  assert.equal(second.status, "PAID")
  assert.equal(second.gapCover.totalPaid, "37.50")
  assert.throws(
    () => confirmCommercePayment({ order: first, paymentId: "PAY-OTHER", members: chain }),
    /different payment/
  )
})