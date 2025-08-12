/*
  # Criar tabela de listas de contatos

  1. Nova Tabela
    - `contact_lists` - Listas de contatos organizadas
      - `id` (serial, chave primária) - ID único da lista
      - `user_id` (varchar) - ID do usuário proprietário
      - `name` (varchar) - Nome da lista
      - `description` (varchar) - Descrição da lista
      - `color` (varchar) - Cor da lista
      - `contact_count` (integer) - Contador de contatos na lista
      - `created_at` (timestamp) - Data de criação
      - `updated_at` (timestamp) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela contact_lists
    - Política para usuários autenticados gerenciarem suas próprias listas
*/

CREATE TABLE IF NOT EXISTS contact_lists (
  id serial PRIMARY KEY,
  user_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  description varchar,
  color varchar DEFAULT '#3b82f6',
  contact_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contact lists"
  ON contact_lists
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);