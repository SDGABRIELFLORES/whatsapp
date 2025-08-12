import { createClient } from '@supabase/supabase-js';

console.log('🔗 Conectando ao Supabase:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Para compatibilidade com o código existente
export const db = supabase;
export const pool = null; // Não usado com Supabase