-- ============================================================
-- Developer Snippet Vault & AI Publisher - PostgreSQL Schema
-- Compatible with Supabase, Neon DB, and Vercel Postgres
-- ============================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Snippets Table
CREATE TABLE IF NOT EXISTS snippets (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(64) NOT NULL,
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  explanation TEXT,
  is_public BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_snippets_user_id ON snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_snippets_language ON snippets(language);
CREATE INDEX IF NOT EXISTS idx_snippets_is_public ON snippets(is_public);
CREATE INDEX IF NOT EXISTS idx_snippets_created_at ON snippets(created_at DESC);
