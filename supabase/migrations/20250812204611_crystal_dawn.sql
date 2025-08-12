/*
  # Criar tabela de usuários

  1. Nova Tabela
    - `users` - Informações dos usuários
      - `id` (varchar, chave primária) - ID único do usuário
      - `email` (varchar, único) - Email do usuário
      - `password` (varchar) - Senha criptografada
      - `first_name` (varchar) - Primeiro nome
      - `last_name` (varchar) - Sobrenome
      - `profile_image_url` (varchar) - URL da imagem de perfil
      - `is_admin` (boolean) - Se é administrador
      - `subscription_status` (varchar) - Status da assinatura
      - `trial_ends_at` (timestamp) - Data de fim do período de teste
      - `campaign_count` (integer) - Contador de campanhas
      - `contact_count` (integer) - Contador de contatos
      - `mercadopago_subscription_id` (varchar) - ID da assinatura no MercadoPago
      - `created_at` (timestamp) - Data de criação
      - `updated_at` (timestamp) - Data de atualização

  2. Segurança
    - Habilitar RLS na tabela users
    - Política para usuários autenticados lerem seus próprios dados
    - Política para usuários autenticados atualizarem seus próprios dados
*/

CREATE TABLE IF NOT EXISTS users (
  id varchar PRIMARY KEY,
  email varchar UNIQUE NOT NULL,
  password varchar,
  first_name varchar,
  last_name varchar,
  profile_image_url varchar,
  is_admin boolean DEFAULT false,
  subscription_status varchar DEFAULT 'trial',
  trial_ends_at timestamp DEFAULT now() + interval '7 days',
  campaign_count integer DEFAULT 0,
  contact_count integer DEFAULT 0,
  mercadopago_subscription_id varchar,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);