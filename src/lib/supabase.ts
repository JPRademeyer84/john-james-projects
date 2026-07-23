import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PROJECT_ID = 2; // John James Projects

export interface User {
  id: string;
  email: string;
  username: string;
  referral_code: string;
  sponsor_id: string | null;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  project_id: number;
  amount: number;
  shares: number;
  payment_method: string;
  payment_proof: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Commission {
  id: string;
  user_id: string;
  project_id: number;
  amount: number;
  shares_bonus: number;
  type: string;
  status: 'pending' | 'paid' | 'rejected';
  created_at: string;
}

export interface UserProject {
  user_id: string;
  project_id: number;
  status: 'active' | 'inactive' | 'pending';
  enrolled_at: string;
}

export const auth = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    await ensureUserEnrolled(data.user.id);

    return data;
  },

  async signUp(email: string, password: string, username: string, sponsorCode?: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    let sponsorId = null;
    if (sponsorCode) {
      const { data: sponsor } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', sponsorCode)
        .single();
      sponsorId = sponsor?.id;
    }

    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email,
      username,
      sponsor_id: sponsorId,
      referral_code: await generateReferralCode(),
    });

    if (userError) throw userError;

    await enrollUserInProjects(authData.user.id);

    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};

async function ensureUserEnrolled(userId: string) {
  const { data: enrollment } = await supabase
    .from('user_projects')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', PROJECT_ID)
    .maybeSingle();

  if (!enrollment) {
    await supabase.from('user_projects').insert({
      user_id: userId,
      project_id: PROJECT_ID,
      status: 'active',
      enrollment_source: 'auto',
    });
  }

  await supabase
    .from('user_projects')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('project_id', PROJECT_ID);
}

async function enrollUserInProjects(userId: string) {
  await supabase.from('user_projects').insert([
    {
      user_id: userId,
      project_id: 1,
      status: 'active',
      enrollment_source: 'auto',
    },
    {
      user_id: userId,
      project_id: PROJECT_ID,
      status: 'active',
      enrollment_source: 'auto',
    },
  ]);
}

async function generateReferralCode(): Promise<string> {
  const prefix = 'JJ';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `${prefix}${randomPart}`;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle();

  if (existing) {
    return generateReferralCode();
  }

  return code;
}
