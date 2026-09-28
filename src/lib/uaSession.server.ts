import { createHmac, timingSafeEqual } from "node:crypto"

export type UaSessionPayload = {
  aureusUserId: number
  email: string
  exp: number
}

function secret() {
  const value = process.env.UA_SESSION_SECRET || ""
  if (!value) {
    throw new Error("Missing UA_SESSION_SECRET")
  }
  return value
}

export function signUaSession(input: { aureusUserId: number; email: string }) {
  const payload: UaSessionPayload = {
    aureusUserId: input.aureusUserId,
    email: input.email,
    exp: Date.now() + 12 * 60 * 60 * 1000,
  }
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const sig = createHmac("sha256", secret()).update(body).digest("base64url")
  return `${body}.${sig}`
}

export function verifyUaSession(token: string): UaSessionPayload {
  const [body, sig] = String(token || "").split(".")
  if (!body || !sig) throw new Error("Invalid session")
  const expected = createHmac("sha256", secret()).update(body).digest("base64url")
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid session")
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as UaSessionPayload
  if (!payload.aureusUserId || !payload.email || payload.exp < Date.now()) {
    throw new Error("Session expired")
  }
  return payload
}
