import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { getResolvedResearchPreset, type ResearchPresetKey } from '../src/content/researchContent';

dotenv.config();

const trimEnv = (value?: string) => (value || '').trim();

const supabaseUrl = trimEnv(process.env.SUPABASE_URL);
const serviceRoleKey = trimEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed research presets.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const presetKeys: ResearchPresetKey[] = ['embedded', 'studio'];

const nowIso = new Date().toISOString();
const rows = presetKeys.map((presetKey) => ({
  preset_key: presetKey,
  payload: getResolvedResearchPreset(presetKey),
  updated_at: nowIso,
}));

const { error } = await supabase
  .from('research_presets')
  .upsert(rows, { onConflict: 'preset_key' });

if (error) {
  throw new Error(`Failed to seed research presets: ${error.message}`);
}

console.log(`Seeded research presets: ${presetKeys.join(', ')}`);
