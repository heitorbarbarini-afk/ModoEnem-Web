import { createClient } from "@supabase/supabase-js";

// Pegando as variáveis de ambiente do Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cria o cliente Supabase padrão para o navegador (client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
