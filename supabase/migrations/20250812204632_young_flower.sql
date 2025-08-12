/*
  # Criar tabela de contatos

  1. Nova Tabela
    - `contacts` - Contatos dos usuários
      - `id` (serial, chave primária) - ID único do contato
      - `user_id` (varchar) - ID do usuário proprietário
      - `campaign_id` (integer) - ID da campanha associada
      - `contact_list_id` (integer) - ID da lista de contatos
      - `name` (varchar) - Nome do contato
      - `phone` (varchar) - Telefone do contato
      - `email` (varchar) - Email do contato
      - `last_campaign_sent` (timestamp) - Data do último envio
      - `total_campaigns_sent` (integer) - Total de campanhas enviadas
      - `custom_data` (jsonb) - Dados customizados do contato
      - `created_at` (timestamp) - Data de criação
      - `updated_at` (timestamp) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela contacts
    - Política para usuários autenticados gerenciarem seus próprios contatos
*/

CREATE TABLE IF NOT EXISTS contacts (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id integer REFERENCES campaigns(id) ON DELETE SET NULL,
  contact_list_id integer REFERENCES contact_lists(id) ON DELETE SET NULL,
  name varchar NOT NULL,
  phone varchar NOT NULL,
  email varchar,
  last_campaign_sent timestamp,
  total_campaigns_sent integer DEFAULT 0,
  custom_data jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);