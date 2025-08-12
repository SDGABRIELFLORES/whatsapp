/*
  # Criar tabela de sessões

  1. Nova Tabela
    - `sessions` - Armazenamento de sessões do Express
      - `sid` (varchar, chave primária) - ID da sessão
      - `sess` (jsonb) - Dados da sessão
      - `expire` (timestamp) - Data de expiração

  2. Índices
    - Índice na coluna expire para performance
*/

CREATE TABLE IF NOT EXISTS sessions (
  sid varchar PRIMARY KEY,
  sess jsonb NOT NULL,
  expire timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);