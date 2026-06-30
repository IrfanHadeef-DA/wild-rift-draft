# Wild Rift Draft

> Your Challenger-level champion select coach.

A coaching tool for Wild Rift players that analyzes your draft in real time and recommends the best pick from your personal hero pool — with deep explanations of *why*.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI + shadcn/ui pattern |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Anthropic Claude API |
| State | Zustand |
| Deploy | Vercel |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/wild-rift-draft.git
cd wild-rift-draft
npm install
```

### 2. Set up Supabase

**Option A — Supabase Cloud (recommended):**
1. Create a project at https://supabase.com
2. Open the SQL Editor and run `supabase/migrations/001_initial_schema.sql`
3. Then run `supabase/seed/001_champions.sql`
4. Copy your project URL and anon key from Project Settings → API

**Option B — Local Supabase (requires Docker):**
```bash
npm install -g supabase
supabase start
supabase db push
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL, anon key, and Anthropic API key
```

### 4. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup — no sidebar
│   ├── (app)/           # Protected routes with AppShell sidebar
│   │   ├── draft/       # Main champion select workflow (M3)
│   │   ├── profile/     # Hero pool management (M2)
│   │   └── history/     # Past draft sessions (M6)
│   ├── auth/callback/   # Supabase OAuth callback handler
│   └── api/
│       ├── champions/   # Champion roster (GET)
│       ├── hero-pool/   # Pool CRUD (GET/POST/DELETE)
│       └── analysis/    # AI coaching engine (M4)
├── components/
│   ├── layout/          # AppShell, sidebar nav
│   ├── auth/            # LoginForm, SignupForm
│   └── shared/          # RoleBadge, ChampionAvatar, Skeleton
├── lib/
│   ├── supabase/        # client.ts + server.ts instances
│   └── utils.ts         # cn(), draft hash, formatters
├── store/               # Zustand draft state
├── hooks/               # useChampions, useHeroPool
└── types/               # Shared TypeScript interfaces
```

---

## Milestones

| # | Name | Status |
|---|---|---|
| 1 | Foundation — scaffold, auth, schema | ✅ Complete |
| 2 | Data layer — champion DB, hero pool UI | 🔜 Next |
| 3 | Draft input — champion select interface | 🔜 Planned |
| 4 | AI engine — recommendation + explanation | 🔜 Planned |
| 5 | Full coaching panel — items, runes, matchups | 🔜 Planned |
| 6 | Polish — history, light mode, onboarding | 🔜 Planned |

---

## Design Language

Dark gaming theme — near-black base, cold indigo accent, gold recommendations:
- **Surface**: `#080B10` → `#0D1117` → `#141B24`
- **Accent**: `#4F8EF7` (cold indigo-blue)
- **Gold**: `#F0B429` (recommended picks)
- **Type**: Inter UI + JetBrains Mono for stat readouts

Light mode planned for Milestone 6.
