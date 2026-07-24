import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const PROJECT_ID = 2; // John James Projects

export interface User {
  id: number;
  auth_user_id: string;
  email: string;
  username: string;
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

    // Insert into users table with auth_user_id (not id)
    const { error: userError } = await supabase.from('users').insert({
      auth_user_id: authData.user.id,
      email,
      username,
      is_active: true,
      is_verified: false,
      account_status: 'active',
    });

    if (userError) throw userError;

    // Get the created user's integer ID
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userData) {
      await enrollUserInProjects(userData.id);
    }

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

async function ensureUserEnrolled(authUserId: string) {
  // Get user's integer ID from auth_user_id
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!userData) return;

  const { data: enrollment } = await supabase
    .from('user_projects')
    .select('*')
    .eq('user_id', userData.id)
    .eq('project_id', PROJECT_ID)
    .maybeSingle();

  if (!enrollment) {
    await supabase.from('user_projects').insert({
      user_id: userData.id,
      project_id: PROJECT_ID,
      status: 'active',
      enrollment_source: 'auto',
    });
  }

  await supabase
    .from('user_projects')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('user_id', userData.id)
    .eq('project_id', PROJECT_ID);
}

async function enrollUserInProjects(userId: number) {
  // Only enroll in John James project (project_id = 2)
  // Don't auto-enroll in Aureus (project_id = 1)
  await supabase.from('user_projects').insert({
    user_id: userId,
    project_id: PROJECT_ID,
    status: 'active',
    enrollment_source: 'auto',
  });
}


