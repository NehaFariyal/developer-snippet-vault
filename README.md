# 🚀 Developer Snippet Vault & AI Publisher

> A modern full-stack web application for developers to store code snippets, technical notes, and Markdown documentation—supercharged with the **Google Gemini API (`@google/genai`)** for automatic tag extraction and plain-English summaries, and ready for one-click deployment on **Vercel**.

Designed in a modern **Developer Blue & Indigo** theme with glowing highlights, responsive glassmorphic cards, and syntax highlighting.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Strict Privacy
* **Secure Auth**: Sign up and login with email and password (powered by `bcryptjs` and stateless `jose` JWT cookies).
* **1-Click Demo Developer Account**: Instant evaluation access without having to register manually.
* **Strict Ownership Isolation**: Users can **only view, edit, and delete their own saved snippets**.
* **Public / Private Visibility**: Choose whether to keep snippets private in your personal vault or publish them to the community.

### 2. ⚡ Snippet CRUD Operations
* **Rich Snippet Form**: Store snippets with Title, Code Content, Language / Syntax (TypeScript, Python, Go, Rust, SQL, Bash, etc.), and Markdown documentation notes.
* **Syntax Highlighting**: Beautiful developer code block with line numbering, language badges, and one-click clipboard copy.
* **Filter & Search Engine**: Real-time search across titles, code, summaries, and tags. Filter by programming language or AI tags.
* **Export / Download**: Export snippets directly to `.ts`, `.py`, `.sql`, etc.

### 3. ✨ AI Auto-Tagging & Summarization (`@google/genai`)
* Integrated with Google's latest official **`@google/genai`** SDK.
* When a user creates or saves a snippet, it automatically generates:
  * **3–5 relevant tags** (e.g., `#react`, `#typescript`, `#async`, `#database`).
  * **1-sentence plain-English summary** explaining what the code does.
  * Technical architectural insights and design patterns.
* **Interactive AI Preview**: An on-demand **"Auto-Generate with Gemini AI"** button in the editor allows developers to preview and tweak tags and summaries before saving.
* **Resilient Fallback**: Includes an intelligent offline heuristic parser so the app functions seamlessly even before setting an API key.

### 4. 🌐 AI Publisher (Public Sharing)
* Publish public snippets with shareable URLs: `/snippet/[id]`.
* Open Graph metadata and clean, responsive presentation for technical documentation and sharing.

---

## 🛠 Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
* **AI API**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Google Gemini 2.5 Flash SDK)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom Developer Blue Palette & Glassmorphism
* **Syntax Highlighting**: [PrismJS](https://prismjs.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Database**:
  * **Local Dev**: Zero-setup durable JSON store in `.data/vault.json` (runs out of the box).
  * **Production (Vercel)**: Serverless PostgreSQL ([Neon DB](https://neon.tech/) / [Supabase](https://supabase.com/) / Vercel Postgres) via `@neondatabase/serverless`.

---

## 🚀 Getting Started Locally

### 1. Navigate to the project directory
```bash
cd "C:\Users\nehaf\OneDrive\Documents\developer-snippet-vault"
```

### 2. Install dependencies (already installed)
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` to add your free Google Gemini API key:
```env
# Get your free key at https://aistudio.google.com/
GEMINI_API_KEY=your_actual_gemini_api_key_here
AUTH_SECRET=a_random_32_character_string_for_jwt_session
```

> **Note**: Even without a `GEMINI_API_KEY`, the app works immediately using intelligent semantic fallback tags and summaries!

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Live Deployment on Vercel

### Step 1: Push Code to GitHub
1. Initialize Git in the project:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Developer Snippet Vault"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/developer-snippet-vault.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select your `developer-snippet-vault` repository and click **Import**.
3. Under **Environment Variables**, add the following:
   * `GEMINI_API_KEY`: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
   * `AUTH_SECRET`: Any random 32-character secret string (e.g. `vault_secret_84719283749102837491`).
   * `DATABASE_URL` (Optional / Recommended for persistent cloud PostgreSQL):
     * Create a free serverless database on [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
     * Paste the PostgreSQL connection string as `DATABASE_URL`.
     * The app **automatically initializes the PostgreSQL tables** on first run! (You can also run `schema.sql` directly in Supabase/Neon SQL editor).
4. Click **Deploy**.
5. Your Developer Snippet Vault will be live in ~1 minute!

---

## 📁 Project Structure

```text
developer-snippet-vault/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/analyze/route.ts        # Gemini AI Auto-Tagging & Summarization
│   │   │   ├── auth/                      # Login, Register, Logout, Me routes
│   │   │   └── snippets/                  # Snippet CRUD operations & security
│   │   ├── snippet/[id]/page.tsx          # Public AI Publisher share page
│   │   ├── globals.css                    # Developer Blue Theme & Prism styles
│   │   ├── layout.tsx                     # Root metadata & dark wrapper
│   │   └── page.tsx                       # Interactive Dashboard
│   ├── components/
│   │   ├── AuthModal.tsx                  # Sign In, Sign Up, & 1-click Demo Account
│   │   ├── CodeBlock.tsx                  # Prism highlighter & clipboard copy
│   │   ├── Navbar.tsx                     # Navigation & search
│   │   ├── SnippetCard.tsx                # Card with AI summary badge & tags
│   │   ├── SnippetDetailModal.tsx         # Full snippet inspector & exporter
│   │   └── SnippetEditorModal.tsx         # Form with live Gemini AI generator
│   ├── lib/
│   │   ├── auth.ts                        # JWT session cookies & bcrypt hashing
│   │   ├── db.ts                          # Dual storage (Local JSON + Postgres)
│   │   ├── gemini.ts                      # Official @google/genai SDK integration
│   │   └── prism.ts                       # Syntax highlighter utility
│   └── types/
│       └── index.ts                       # TypeScript interfaces
├── .env.example                           # Sample environment configuration
├── schema.sql                             # PostgreSQL database schema
├── tailwind.config.ts                     # Developer Blue theme setup
└── package.json
```

---

## 🔒 Security Best Practices
* Passwords hashed using standard `bcrypt` salting.
* Session tokens signed via `HS256` JWT with `httpOnly`, `SameSite=lax`, and `secure` cookies.
* Strict authorization checks: API routes verify `snippet.userId === session.userId` before modifying or deleting snippets.
* Unauthenticated users can only view public snippets.
