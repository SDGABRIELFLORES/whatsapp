/*
  # Criar tabela de membros de listas de contatos

  1. Nova Tabela
    - `contact_list_members` - Relacionamento entre contatos e listas
      - `id` (serial, chave primária) - ID único
      - `contact_list_id` (integer) - ID da lista de contatos
      - `contact_id` (integer) - ID do contato
      - `created_at` (timestamp) - Data de criação

  2. Segurança
    - Habilitar RLS na tabela contact_list_members
    - Política para usuários autenticados gerenciarem membros de suas listas

  3. Índices
    - Índice único para evitar duplicatas
    - Índices para performance
*/

CREATE TABLE IF NOT EXISTS contact_list_members (
  id serial PRIMARY KEY,
  contact_list_id integer NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
  contact_id integer NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now(),
  UNIQUE(contact_list_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_list_members_list_id ON contact_list_members(contact_list_id);
CREATE INDEX IF NOT EXISTS idx_contact_list_members_contact_id ON contact_list_members(contact_id);

ALTER TABLE contact_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contact list members"
  ON contact_list_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contact_lists 
      WHERE contact_lists.id = contact_list_members.contact_list_id 
      AND contact_lists.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contact_lists 
      WHERE contact_lists.id = contact_list_members.contact_list_id 
      AND contact_lists.user_id = auth.uid()::text
    )
  );