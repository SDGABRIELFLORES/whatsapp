/*
  # Criar tabela de campanhas

  1. Nova Tabela
    - `campaigns` - Campanhas de WhatsApp
      - `id` (serial, chave primária) - ID único da campanha
      - `user_id` (varchar) - ID do usuário proprietário
      - `name` (varchar) - Nome da campanha
      - `message` (text) - Mensagem da campanha
      - `image_url` (varchar) - URL da imagem anexa
      - `status` (varchar) - Status da campanha
      - `total_contacts` (integer) - Total de contatos
      - `sent_count` (integer) - Contador de mensagens enviadas
      - `failed_count` (integer) - Contador de mensagens falhadas
      - `delay_min` (integer) - Delay mínimo entre envios
      - `delay_max` (integer) - Delay máximo entre envios
      - `batch_size` (integer) - Tamanho do lote
      - `batch_delay` (integer) - Delay entre lotes
      - `scheduled_at` (timestamp) - Data de agendamento
      - `contact_list_id` (integer) - ID da lista de contatos
      - `scheduled_contacts_data` (text) - Dados dos contatos agendados em JSON
      - `error_message` (text) - Mensagem de erro
      - `created_at` (timestamp) - Data de criação
      - `updated_at` (timestamp) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela campaigns
    - Política para usuários autenticados gerenciarem suas próprias campanhas
*/

CREATE TABLE IF NOT EXISTS campaigns (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  message text NOT NULL,
  image_url varchar,
  status varchar DEFAULT 'draft',
  total_contacts integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  failed_count integer DEFAULT 0,
  delay_min integer DEFAULT 6,
  delay_max integer DEFAULT 12,
  batch_size integer DEFAULT 10,
  batch_delay integer DEFAULT 60,
  scheduled_at timestamp,
  contact_list_id integer REFERENCES contact_lists(id) ON DELETE SET NULL,
  scheduled_contacts_data text,
  error_message text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns"
  ON campaigns
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);