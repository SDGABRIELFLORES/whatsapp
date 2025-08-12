import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Para compatibilidade com o código existente
export const db = supabase;
export const pool = null; // Não usado com Supabase