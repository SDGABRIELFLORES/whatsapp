/*
  # Criar tabela de logs de campanhas

  1. Nova Tabela
    - `campaign_logs` - Logs de envio das campanhas
      - `id` (serial, chave primária) - ID único do log
      - `campaign_id` (integer) - ID da campanha
      - `contact_id` (integer) - ID do contato
      - `status` (varchar) - Status do envio
      - `error_message` (text) - Mensagem de erro
      - `sent_at` (timestamp) - Data de envio
      - `created_at` (timestamp) - Data de criação

  2. Segurança
    - Habilitar RLS na tabela campaign_logs
    - Política para usuários autenticados lerem logs de suas campanhas
*/

CREATE TABLE IF NOT EXISTS campaign_logs (
  id serial PRIMARY KEY,
  campaign_id integer NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status varchar NOT NULL,
  error_message text,
  sent_at timestamp,
  created_at timestamp DEFAULT now()
);

ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own campaign logs"
  ON campaign_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_logs.campaign_id 
      AND campaigns.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert campaign logs"
  ON campaign_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_logs.campaign_id 
      AND campaigns.user_id = auth.uid()::text
    )
  );