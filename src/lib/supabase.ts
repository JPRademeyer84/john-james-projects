import { ubuntu, getUbuntuEnv } from './ubuntuDb'
import { createAureusReadOnlyClient, getAureusReadEnv } from './aureusReadOnly'

function requireUbuntu() {
  const env = getUbuntuEnv()
  if (!env.configured) {
    throw new Error(
      'Missing Ubuntu Afrique database env. Set VITE_UBUNTU_SUPABASE_URL and VITE_UBUNTU_SUPABASE_ANON_KEY. Do not point these at Aureus production.'
    )
  }
}

export const ubuntuDb = ubuntu
export const supabase = ubuntu

const aureusEnv = getAureusReadEnv()
export const aureusRead = aureusEnv.configured
  ? createAureusReadOnlyClient(aureusEnv.url, aureusEnv.key)
  : null

export const PLATFORM_NAME = 'Ubuntu Afrique'

export interface User {
  id: number
  auth_user_id: string
  email: string
  username: string
  created_at: string
}

export interface Investment {
  id: string
  user_id: string
  amount: number
  shares: number
  payment_method: string
  payment_proof: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Commission {
  id: string
  user_id: string
  amount: number
  shares_bonus: number
  type: string
  status: 'pending' | 'paid' | 'rejected'
  created_at: string
}

export const auth = {
  async signIn(email: string, password: string) {
    requireUbuntu()
    const { data, error } = await ubuntu.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signUp(email: string, password: string, username: string, sponsorCode?: string) {
    requireUbuntu()
    const { data: authData, error: authError } = await ubuntu.auth.signUp({ email, password })
    if (authError) throw authError
    if (!authData.user) throw new Error('User creation failed')

    const { error: userError } = await ubuntu.from('ua_users').insert({
      auth_user_id: authData.user.id,
      email,
      username,
      sponsor_code: sponsorCode || null,
      is_active: true,
    })
    if (userError) throw userError
    return authData
  },

  async signOut() {
    const { error } = await ubuntu.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user } } = await ubuntu.auth.getUser()
    return user
  },
}

export async function readAureusShareholderByEmail(email: string) {
  if (!aureusRead) return null
  const { data, error } = await aureusRead
    .from('users')
    .select('id, username, email, is_active, created_at')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()
  if (error) throw error
  return data
}
