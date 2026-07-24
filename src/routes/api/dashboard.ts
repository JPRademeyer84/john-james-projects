import { json } from '@tanstack/start';
import { createAPIFileRoute } from '@tanstack/start/api';
import { supabase, PROJECT_ID } from '../../lib/supabase';

export const Route = createAPIFileRoute('/api/dashboard')({
  GET: async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch user data - ONLY for John James project (project_id = 2)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username, email, referral_code')
      .eq('id', user.id)
      .single();

    if (userError) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Get investments - ONLY for project_id = 2
    const { data: investments } = await supabase
      .from('investments')
      .select('amount, shares, status')
      .eq('user_id', user.id)
      .eq('project_id', PROJECT_ID);

    const totalShares = investments?.reduce((sum, inv) => sum + (inv.status === 'approved' ? inv.shares : 0), 0) || 0;
    const totalInvested = investments?.reduce((sum, inv) => sum + (inv.status === 'approved' ? inv.amount : 0), 0) || 0;

    // Get commissions - ONLY for project_id = 2
    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount, status')
      .eq('user_id', user.id)
      .eq('project_id', PROJECT_ID);

    const totalEarned = commissions?.reduce((sum, comm) => sum + comm.amount, 0) || 0;
    const pending = commissions?.filter(c => c.status === 'pending').reduce((sum, comm) => sum + comm.amount, 0) || 0;

    // Get referral count - children sponsored by this user in project 2
    const { count: directReferrals } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('sponsor_id', user.id);

    return json({
      user: {
        username: userData.username,
        email: userData.email,
        referral_code: userData.referral_code,
      },
      portfolio: {
        total_shares: totalShares,
        total_invested: totalInvested,
        current_value: totalInvested * 1.125, // 12.5% increase estimate
      },
      commissions: {
        total_earned: totalEarned,
        pending: pending,
        withdrawn: totalEarned - pending,
      },
      referrals: {
        direct: directReferrals || 0,
        total_team: directReferrals || 0, // Simplified - would need recursive query for full team
      },
    });
  },
});
