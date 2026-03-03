import { supabase, isSupabaseConfigured } from '../backend/supabase';

export const isPresetAdmin = async (userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('[Discord Bot] Failed to check admin role:', error.message);
      }
      return false;
    }
    return data?.role === 'admin';
  } catch (err) {
    console.error('[Discord Bot] Exception in isPresetAdmin:', err);
    return false;
  }
};
