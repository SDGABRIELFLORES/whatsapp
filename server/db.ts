import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configurados. Configure no arquivo .env para usar o banco de dados.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Para compatibilidade com o código existente
export const db = supabase;
export const pool = null; // Não usado com Supabase