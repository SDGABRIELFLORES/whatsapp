/*
  # Criar tabela de sessões WhatsApp

  1. Nova Tabela
    - `whatsapp_sessions` - Sessões de conexão WhatsApp
      - `id` (serial, chave primária) - ID único da sessão
      - `user_id` (varchar) - ID do usuário
      - `session_id` (varchar, único) - ID da sessão WhatsApp
      - `is_connected` (boolean) - Se está conectado
      - `qr_code` (text) - Código QR para conexão
      - `last_connected` (timestamp) - Última conexão
      - `created_at` (timestamp) - Data de criação
      - `updated_at` (timestamp) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela whatsapp_sessions
    - Política para usuários autenticados gerenciarem suas próprias sessões
*/

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id varchar NOT NULL UNIQUE,
  is_connected boolean DEFAULT false,
  qr_code text,
  last_connected timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own whatsapp sessions"
  ON whatsapp_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);