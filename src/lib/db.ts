import fs from 'fs';
import path from 'path';
import { User, Snippet } from '@/types';
import bcrypt from 'bcryptjs';

// Define DB shape for local JSON store
interface StoredUser extends User {
  passwordHash: string;
}

interface VaultData {
  users: StoredUser[];
  snippets: Snippet[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'vault.json');

// Ensure local storage directory exists
function ensureLocalDb(): VaultData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Generate initial demo user and rich developer sample snippets
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('developer123', salt);

    const initialData: VaultData = {
      users: [
        {
          id: 'user_demo_01',
          name: 'Alex Developer',
          email: 'demo@snippetvault.dev',
          passwordHash: demoPasswordHash,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          createdAt: new Date().toISOString(),
        },
      ],
      snippets: [
        {
          id: 'snip_nextjs_server_action',
          userId: 'user_demo_01',
          userName: 'Alex Developer',
          userEmail: 'demo@snippetvault.dev',
          title: 'Next.js 14 Server Action with Form State & Revalidation',
          language: 'typescript',
          code: `'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const Schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export async function createPostAction(prevState: any, formData: FormData) {
  const parsed = Schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Persist to database
  await db.post.create({ data: parsed.data });

  revalidatePath('/posts');
  return { success: true, message: 'Post successfully published!' };
}`,
          notes: 'Standard resilient pattern for Next.js 14 App Router server-side mutations.',
          tags: ['#nextjs', '#typescript', '#serveractions', '#async'],
          summary: 'Defines a safe Next.js Server Action that validates form input via Zod and triggers cache revalidation.',
          explanation: 'Uses schema parsing for runtime type validation and revalidatePath for on-demand ISR updates.',
          isPublic: true,
          isStarred: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'snip_gemini_api_call',
          userId: 'user_demo_01',
          userName: 'Alex Developer',
          userEmail: 'demo@snippetvault.dev',
          title: 'Google Gemini 2.5 Flash SDK Structured JSON Extraction',
          language: 'typescript',
          code: `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCode(code: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: \`Analyze this code and return JSON with tags and 1-sentence summary:\\n\${code}\`,
  });

  return JSON.parse(response.text || '{}');
}`,
          notes: 'Extracts structured metadata from code using Google Gemini official @google/genai SDK.',
          tags: ['#gemini', '#ai', '#typescript', '#googleapi'],
          summary: 'Instantiates the Google Gemini SDK to parse arbitrary code blocks into structured JSON summaries.',
          explanation: 'Demonstrates modern GoogleGenAI client library integration with typed async invocation.',
          isPublic: true,
          isStarred: true,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'snip_react_debounce_hook',
          userId: 'user_demo_01',
          userName: 'Alex Developer',
          userEmail: 'demo@snippetvault.dev',
          title: 'Custom useDebounce Hook with Generic Type Support',
          language: 'typescript',
          code: `import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}`,
          notes: 'Essential React hook for type-ahead search inputs to avoid saturating backend APIs.',
          tags: ['#react', '#hooks', '#typescript', '#performance'],
          summary: 'Provides a generic React hook that delays updating a state value until a specified timeout elapsed.',
          explanation: 'Leverages useEffect cleanup functions to cancel pending timers on rapid value updates.',
          isPublic: false,
          isStarred: false,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'snip_python_async_fetch',
          userId: 'user_demo_01',
          userName: 'Alex Developer',
          userEmail: 'demo@snippetvault.dev',
          title: 'High-Throughput Concurrent HTTP Scraper with asyncio & aiohttp',
          language: 'python',
          code: `import asyncio
import aiohttp

async def fetch_endpoint(session: aiohttp.ClientSession, url: str):
    async with session.get(url, timeout=10) as response:
        return await response.json()

async def fetch_all(urls: list[str]):
    connector = aiohttp.TCPConnector(limit=50)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_endpoint(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

if __name__ == '__main__':
    results = asyncio.run(fetch_all(['https://httpbin.org/get'] * 10))
    print(f"Processed {len(results)} requests concurrently.")`,
          notes: 'Batch request utility with connection pooling to prevent socket exhaustion.',
          tags: ['#python', '#async', '#networking', '#performance'],
          summary: 'Executes concurrent asynchronous HTTP requests in Python using aiohttp and asyncio.gather.',
          explanation: 'Uses a TCPConnector limit to manage connection pools while gathering concurrent coroutines.',
          isPublic: true,
          isStarred: true,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: [], snippets: [] };
  }
}

function saveLocalDb(data: VaultData): void {
  ensureLocalDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// PostgreSQL Serverless Connection Support (When DATABASE_URL or POSTGRES_URL is provided on Vercel/Neon)
const hasPostgres = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);

let neonSql: any = null;
if (hasPostgres) {
  try {
    const { neon } = require('@neondatabase/serverless');
    neonSql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  } catch (err) {
    console.warn('Neon database module not loaded, falling back to local DB:', err);
  }
}

let pgInitialized = false;
async function initPgTables() {
  if (!neonSql || pgInitialized) return;
  try {
    await neonSql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await neonSql`
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
    `;
    pgInitialized = true;
  } catch (err) {
    console.error('Failed to auto-init Postgres tables:', err);
  }
}

/* ================= USER REPOSITORY ================= */

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const cleanEmail = email.toLowerCase().trim();

  if (neonSql) {
    await initPgTables();
    try {
      const rows = await neonSql`SELECT * FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1`;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        passwordHash: r.password_hash,
        avatarUrl: r.avatar_url,
        createdAt: r.created_at,
      };
    } catch (e) {
      console.error('findUserByEmail PG error:', e);
    }
  }

  const db = ensureLocalDb();
  return db.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (neonSql) {
    await initPgTables();
    try {
      const rows = await neonSql`SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        avatarUrl: r.avatar_url,
        createdAt: r.created_at,
      };
    } catch (e) {
      console.error('findUserById PG error:', e);
    }
  }

  const db = ensureLocalDb();
  const found = db.users.find((u) => u.id === id);
  if (!found) return null;
  const { passwordHash, ...safeUser } = found;
  return safeUser;
}

export async function createUser(data: {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}): Promise<User> {
  const id = data.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cleanEmail = data.email.toLowerCase().trim();
  const now = new Date().toISOString();

  if (neonSql) {
    await initPgTables();
    try {
      await neonSql`
        INSERT INTO users (id, name, email, password_hash, avatar_url, created_at)
        VALUES (${id}, ${data.name}, ${cleanEmail}, ${data.passwordHash}, ${data.avatarUrl || null}, ${now})
      `;
      return {
        id,
        name: data.name,
        email: cleanEmail,
        avatarUrl: data.avatarUrl,
        createdAt: now,
      };
    } catch (e) {
      console.error('createUser PG error:', e);
    }
  }

  const db = ensureLocalDb();
  const newUser: StoredUser = {
    id,
    name: data.name,
    email: cleanEmail,
    passwordHash: data.passwordHash,
    avatarUrl: data.avatarUrl,
    createdAt: now,
  };
  db.users.push(newUser);
  saveLocalDb(db);

  const { passwordHash, ...safeUser } = newUser;
  return safeUser;
}

/* ================= SNIPPETS REPOSITORY ================= */

export async function getSnippetsForUser(
  userId: string,
  options?: {
    search?: string;
    language?: string;
    tag?: string;
    starredOnly?: boolean;
    includePublic?: boolean;
  }
): Promise<Snippet[]> {
  const { search, language, tag, starredOnly, includePublic } = options || {};

  if (neonSql) {
    await initPgTables();
    try {
      let query = `SELECT * FROM snippets WHERE (user_id = '${userId}'`;
      if (includePublic) {
        query += ` OR is_public = true`;
      }
      query += `)`;

      if (starredOnly) {
        query += ` AND is_starred = true`;
      }
      if (language && language !== 'all') {
        query += ` AND LOWER(language) = LOWER('${language}')`;
      }

      query += ` ORDER BY created_at DESC`;
      const rows = await neonSql(query);

      let results: Snippet[] = rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        title: r.title,
        code: r.code,
        language: r.language,
        notes: r.notes || '',
        tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || '[]'),
        summary: r.summary || '',
        explanation: r.explanation || '',
        isPublic: !!r.is_public,
        isStarred: !!r.is_starred,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      // Search filter in JS for flexible substring search
      if (search && search.trim()) {
        const q = search.toLowerCase();
        results = results.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (tag && tag.trim()) {
        const cleanTag = tag.toLowerCase().startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
        results = results.filter((s) => s.tags.map((t) => t.toLowerCase()).includes(cleanTag));
      }

      return results;
    } catch (e) {
      console.error('getSnippetsForUser PG error:', e);
    }
  }

  const db = ensureLocalDb();
  let results = db.snippets.filter((s) => {
    if (includePublic) {
      return s.userId === userId || s.isPublic;
    }
    return s.userId === userId;
  });

  if (starredOnly) {
    results = results.filter((s) => s.isStarred);
  }

  if (language && language !== 'all') {
    results = results.filter((s) => s.language.toLowerCase() === language.toLowerCase());
  }

  if (tag && tag.trim()) {
    const cleanTag = tag.toLowerCase().startsWith('#') ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
    results = results.filter((s) => s.tags.map((t) => t.toLowerCase()).includes(cleanTag));
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort descending by created/updated
  return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSnippetById(id: string): Promise<Snippet | null> {
  if (neonSql) {
    await initPgTables();
    try {
      const rows = await neonSql`SELECT * FROM snippets WHERE id = ${id} LIMIT 1`;
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        title: r.title,
        code: r.code,
        language: r.language,
        notes: r.notes || '',
        tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || '[]'),
        summary: r.summary || '',
        explanation: r.explanation || '',
        isPublic: !!r.is_public,
        isStarred: !!r.is_starred,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    } catch (e) {
      console.error('getSnippetById PG error:', e);
    }
  }

  const db = ensureLocalDb();
  return db.snippets.find((s) => s.id === id) || null;
}

export async function createSnippet(data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
  const id = `snip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSnippet: Snippet = {
    ...data,
    id,
    isStarred: data.isStarred || false,
    createdAt: now,
    updatedAt: now,
  };

  if (neonSql) {
    await initPgTables();
    try {
      await neonSql`
        INSERT INTO snippets (
          id, user_id, user_name, user_email, title, code, language, notes, tags, summary, explanation, is_public, is_starred, created_at, updated_at
        ) VALUES (
          ${id},
          ${data.userId},
          ${data.userName || null},
          ${data.userEmail || null},
          ${data.title},
          ${data.code},
          ${data.language},
          ${data.notes || ''},
          ${JSON.stringify(data.tags || [])}::jsonb,
          ${data.summary || ''},
          ${data.explanation || ''},
          ${!!data.isPublic},
          ${!!data.isStarred},
          ${now},
          ${now}
        )
      `;
      return newSnippet;
    } catch (e) {
      console.error('createSnippet PG error:', e);
    }
  }

  const db = ensureLocalDb();
  db.snippets.unshift(newSnippet);
  saveLocalDb(db);
  return newSnippet;
}

export async function updateSnippet(
  id: string,
  userId: string,
  updates: Partial<Omit<Snippet, 'id' | 'userId' | 'createdAt'>>
): Promise<Snippet | null> {
  const now = new Date().toISOString();

  if (neonSql) {
    await initPgTables();
    try {
      const existing = await getSnippetById(id);
      if (!existing || existing.userId !== userId) {
        return null; // Not found or forbidden
      }

      await neonSql`
        UPDATE snippets SET
          title = COALESCE(${updates.title}, title),
          code = COALESCE(${updates.code}, code),
          language = COALESCE(${updates.language}, language),
          notes = COALESCE(${updates.notes}, notes),
          tags = COALESCE(${updates.tags ? JSON.stringify(updates.tags) : null}::jsonb, tags),
          summary = COALESCE(${updates.summary}, summary),
          explanation = COALESCE(${updates.explanation}, explanation),
          is_public = COALESCE(${updates.isPublic !== undefined ? updates.isPublic : null}, is_public),
          is_starred = COALESCE(${updates.isStarred !== undefined ? updates.isStarred : null}, is_starred),
          updated_at = ${now}
        WHERE id = ${id} AND user_id = ${userId}
      `;

      return await getSnippetById(id);
    } catch (e) {
      console.error('updateSnippet PG error:', e);
    }
  }

  const db = ensureLocalDb();
  const index = db.snippets.findIndex((s) => s.id === id);
  if (index === -1) return null;

  // Enforce security: users can only edit their own saved snippets
  if (db.snippets[index].userId !== userId) {
    return null;
  }

  const updated: Snippet = {
    ...db.snippets[index],
    ...updates,
    updatedAt: now,
  };

  db.snippets[index] = updated;
  saveLocalDb(db);
  return updated;
}

export async function deleteSnippet(id: string, userId: string): Promise<boolean> {
  if (neonSql) {
    await initPgTables();
    try {
      const res = await neonSql`
        DELETE FROM snippets WHERE id = ${id} AND user_id = ${userId}
      `;
      return true;
    } catch (e) {
      console.error('deleteSnippet PG error:', e);
      return false;
    }
  }

  const db = ensureLocalDb();
  const index = db.snippets.findIndex((s) => s.id === id);
  if (index === -1) return false;

  // Enforce security: users can only delete their own saved snippets
  if (db.snippets[index].userId !== userId) {
    return false;
  }

  db.snippets.splice(index, 1);
  saveLocalDb(db);
  return true;
}

export async function getPublicSnippets(): Promise<Snippet[]> {
  if (neonSql) {
    await initPgTables();
    try {
      const rows = await neonSql`SELECT * FROM snippets WHERE is_public = true ORDER BY created_at DESC LIMIT 50`;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        userEmail: r.user_email,
        title: r.title,
        code: r.code,
        language: r.language,
        notes: r.notes || '',
        tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || '[]'),
        summary: r.summary || '',
        explanation: r.explanation || '',
        isPublic: !!r.is_public,
        isStarred: !!r.is_starred,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (e) {
      console.error('getPublicSnippets PG error:', e);
    }
  }

  const db = ensureLocalDb();
  return db.snippets.filter((s) => s.isPublic).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
