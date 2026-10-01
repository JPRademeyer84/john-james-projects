import assert from "node:assert/strict"
import { test } from "node:test"
import {
  confirmCommercePayment,
  createPendingCardOrder,
  createPendingFractionOrder,
  orderFromCardRow,
  orderFromFractionRow,
  pendingCardInsert,
  pendingFractionInsert,
  requireUbuntuUserId,
} from "../src/lib/commerceOrders.mjs"
import { currentBlpPeriod, sumBlpAccruals } from "../src/lib/volumeEngine.mjs"

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
  assert.equal(pending.volume, undefined)
  assert.equal(pending.blpAccrual, undefined)
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
  assert.equal(paid.inventory, undefined)
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
  assert.equal(paid.inventory.remainingUnderlying, "99999.95")
  assert.equal(paid.inventory.soldUnderlying, "0.05")
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
  assert.equal(second.volume.qv, first.volume.qv)
  assert.equal(second.blpAccrual.blpAdded, first.blpAccrual.blpAdded)
})

test("confirm plastic card credits 100 QV and accrues 5.00 BLP into the open month", () => {
  const paid = confirmCommercePayment({
    order: createPendingCardOrder({
      orderId: "CARD-4",
      userId: "9",
      productType: "CARD_PLASTIC",
    }),
    paymentId: "PAY-4",
    members: chain,
    now: new Date("2026-10-01T12:00:00Z"),
  })
  const period = currentBlpPeriod(new Date("2026-10-01T12:00:00Z"))
  assert.equal(paid.volume.qv, "100.00")
  assert.equal(paid.volume.buyerId, "9")
  assert.deepEqual(paid.volume.teamUserIds, ["9", "ssa", "asm", "bsm", "ssm", "vp"])
  assert.equal(paid.blpAccrual.periodId, period.periodId)
  assert.equal(paid.blpAccrual.commissionableAdded, "100.00")
  assert.equal(paid.blpAccrual.blpAdded, "5.00")
})

test("confirm fraction credits 10 QV and accrues 0.50 BLP; two sales sum on the open period", () => {
  const first = confirmCommercePayment({
    order: createPendingFractionOrder({
      orderId: "FRAC-2",
      userId: "9",
      quantity: 1,
      aureusSharePrice: "100.00",
      aureusPhase: 10,
    }),
    paymentId: "PAY-5",
    members: chain,
    now: new Date("2026-10-15T00:00:00Z"),
  })
  const second = confirmCommercePayment({
    order: createPendingCardOrder({
      orderId: "CARD-5",
      userId: "9",
      productType: "CARD_PLASTIC",
    }),
    paymentId: "PAY-6",
    members: chain,
    now: new Date("2026-10-15T00:00:00Z"),
  })
  assert.equal(first.volume.qv, "10.00")
  assert.equal(first.blpAccrual.blpAdded, "0.50")
  assert.equal(second.volume.qv, "100.00")
  const summed = sumBlpAccruals([first.blpAccrual, second.blpAccrual])
  assert.equal(summed.commissionableSales, "110.00")
  assert.equal(summed.blpTotal, "5.50")
})

test("admin create requires a positive integer Ubuntu ua_users.id", () => {
  assert.equal(requireUbuntuUserId("9"), 9)
  assert.throws(() => requireUbuntuUserId(""), /ua_users\.id/)
  assert.throws(() => requireUbuntuUserId("buyer"), /ua_users\.id/)
  assert.throws(() => requireUbuntuUserId("0"), /ua_users\.id/)
  assert.equal(pendingCardInsert(createPendingCardOrder({
    orderId: "55555555-5555-5555-5555-555555555555",
    userId: "9",
    productType: "CARD_PLASTIC",
  })).user_id, 9)
  assert.equal(pendingCardInsert(createPendingCardOrder({
    orderId: "66666666-6666-6666-6666-666666666666",
    userId: "buyer",
    productType: "CARD_PLASTIC",
  })).user_id, null)
})

test("admin pending insert is PENDING_PAYMENT and confirm rebuilds from that row", () => {
  const pending = createPendingCardOrder({
    orderId: "11111111-1111-1111-1111-111111111111",
    userId: "9",
    productType: "CARD_PLASTIC",
  })
  const row = pendingCardInsert(pending)
  assert.equal(row.order_status, "PENDING_PAYMENT")
  assert.equal(row.product_id, "CARD_PLASTIC")
  assert.equal(row.total, "100.00")
  const rebuilt = orderFromCardRow(row)
  const paid = confirmCommercePayment({ order: rebuilt, paymentId: "PAY-7", members: chain })
  assert.equal(paid.status, "PAID")
  assert.equal(paid.gapCover.totalPaid, "25.00")
  assert.equal(paid.id, row.id)
})

test("fraction confirm refuses when remaining inventory is sold through", () => {
  assert.throws(
    () =>
      confirmCommercePayment({
        order: createPendingFractionOrder({
          orderId: "FRAC-SOLD",
          userId: "9",
          quantity: 1,
          aureusSharePrice: "200.00",
          aureusPhase: 11,
          remainingUnderlying: "0.04",
        }),
        paymentId: "PAY-SOLD",
        members: chain,
      }),
    /exceeds remaining underlying/
  )
})

test("admin fraction create from live phase 10 / remaining 100000 locks 0.10 and refuses sold-through", () => {
  const pending = createPendingFractionOrder({
    orderId: "33333333-3333-3333-3333-333333333333",
    userId: "9",
    quantity: 1,
    aureusSharePrice: "100.00",
    aureusPhase: 10,
    remainingUnderlying: "100000",
  })
  assert.equal(pending.status, "PENDING_PAYMENT")
  assert.equal(pending.aureusSharePrice, "100.00")
  assert.equal(pending.aureusPhase, 10)
  assert.equal(pending.underlyingShareEquivalent, "0.10")
  assert.equal(pendingFractionInsert(pending).transaction_status, "PENDING_PAYMENT")
  assert.throws(
    () =>
      createPendingFractionOrder({
        orderId: "44444444-4444-4444-4444-444444444444",
        userId: "9",
        quantity: 1,
        aureusSharePrice: "100.00",
        aureusPhase: 10,
        remainingUnderlying: "0",
      }),
    /exceeds remaining underlying/
  )
})

test("admin pending fraction insert rebuilds from the stored Ubuntu row", () => {
  const pending = createPendingFractionOrder({
    orderId: "22222222-2222-2222-2222-222222222222",
    userId: "9",
    quantity: 1,
    aureusSharePrice: "200.00",
    aureusPhase: 11,
    remainingUnderlying: "100000",
  })
  const row = pendingFractionInsert(pending)
  assert.equal(row.transaction_status, "PENDING_PAYMENT")
  assert.equal(row.total_amount, "10.00")
  const rebuilt = orderFromFractionRow(row, "100000")
  const paid = confirmCommercePayment({ order: rebuilt, paymentId: "PAY-8", members: chain })
  assert.equal(paid.ownership.underlyingShareEquivalent, "0.05")
  assert.equal(paid.gapCover.totalPaid, "2.50")
})