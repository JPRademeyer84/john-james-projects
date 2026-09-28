import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const WRITE_METHODS = new Set(['insert', 'update', 'delete', 'upsert'])

function blockWrite(method: string): never {
  throw new Error(
    `Aureus live database is read-only from Ubuntu Afrique. Blocked ${method}. New data must be written to the Ubuntu Afrique database only.`
  )
}

function lockQuery(builder: any) {
  return new Proxy(builder, {
    get(target, prop, receiver) {
      const key = String(prop)
      if (WRITE_METHODS.has(key)) {
        return () => blockWrite(key)
      }
      const value = Reflect.get(target, prop, receiver)
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const result = value.apply(target, args)
          if (result && typeof result === 'object' && typeof result.then !== 'function') {
            return lockQuery(result)
          }
          return result
        }
      }
      return value
    },
  })
}

const AUREUS_AUTH_ALLOWED = new Set([
  "signInWithPassword",
  "signOut",
  "getUser",
  "getSession",
  "onAuthStateChange",
])

export function createAureusReadOnlyClient(url: string, anonKey: string): SupabaseClient {
  const raw = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return new Proxy(raw, {
    get(target, prop, receiver) {
      if (prop === "from") {
        return (table: string) => lockQuery(target.from(table))
      }
      if (prop === "rpc") {
        return () => blockWrite("rpc")
      }
      if (prop === "auth") {
        return new Proxy(target.auth, {
          get(authTarget, authProp, authReceiver) {
            const name = String(authProp)
            if (name === "signUp" || name === "updateUser" || name === "admin") {
              return () => blockWrite(`auth.${name}`)
            }
            if (AUREUS_AUTH_ALLOWED.has(name) || typeof authProp === "symbol") {
              return Reflect.get(authTarget, authProp, authReceiver)
            }
            const value = Reflect.get(authTarget, authProp, authReceiver)
            if (typeof value === "function" && !AUREUS_AUTH_ALLOWED.has(name)) {
              return () => blockWrite(`auth.${name}`)
            }
            return value
          },
        })
      }
      return Reflect.get(target, prop, receiver)
    },
  }) as SupabaseClient
}

export function getAureusReadEnv() {
  const url = import.meta.env.VITE_AUREUS_SUPABASE_URL || ''
  const key = import.meta.env.VITE_AUREUS_SUPABASE_ANON_KEY || ''
  return { url, key, configured: Boolean(url && key) }
}
