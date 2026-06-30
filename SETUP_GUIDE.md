# Wild Rift Draft — Complete Setup Guide

**Written for someone who has never deployed a web app before.**
No technical knowledge needed. Just follow each step in order.
If something doesn't look right, take a screenshot and ask for help.

---

## What you'll end up with

A personal web app at your own link (like `wild-rift-draft.vercel.app`) that you and anyone you share it with can open on any phone or computer. It's free to run. The AI coaching feature costs a small amount per use (roughly $0.01–0.02 per draft analysis).

---

## Accounts you need to create (all free)

You need four accounts. Create them in this order:

1. **GitHub** — stores your app's code (free) → github.com
2. **Supabase** — stores your data: hero pool, history, users (free) → supabase.com
3. **Anthropic** — powers the AI coaching (free to start, small cost per use) → console.anthropic.com
4. **Vercel** — hosts your app on the internet (free) → vercel.com

---

## Part 1 — Extract the project files

The file you downloaded is called `wild-rift-draft-milestone-5.tar.gz`. You need to extract it.

**On Mac:**
Double-click the file. A folder called `wild-rift-draft` will appear next to it.

**On Windows:**
Right-click the file → click "Extract All" → click Extract. A folder called `wild-rift-draft` will appear.

You now have a folder with all the app's code inside it. Don't rename it or move files around inside it.

---

## Part 2 — Put the code on GitHub

GitHub is like Google Drive, but specifically for code. This is where Vercel (the hosting service) will read your app from.

### Step 2.1 — Create a GitHub account
Go to **github.com** → click "Sign up" → follow the steps. Use any email and username you want.

### Step 2.2 — Create a new repository
A repository is just a folder on GitHub that holds your code.

1. After logging in, click the **+** button in the top-right corner
2. Click **"New repository"**
3. Name it: `wild-rift-draft`
4. Leave everything else as default
5. Click **"Create repository"**

### Step 2.3 — Upload your files
1. On the repository page you just created, look for the link that says **"uploading an existing file"** and click it
2. Drag the entire contents of your `wild-rift-draft` folder into the upload area
   - **Important:** Drag the files and folders *inside* `wild-rift-draft`, not the folder itself
   - You should see files like `package.json`, `tailwind.config.ts`, and folders like `src`, `supabase`
3. Scroll down, click **"Commit changes"**

Your code is now on GitHub. ✓

---

## Part 3 — Set up Supabase (your database)

Supabase stores everything: user accounts, hero pools, draft history.

### Step 3.1 — Create a Supabase account
Go to **supabase.com** → click "Start your project" → sign up with GitHub (easiest) or email.

### Step 3.2 — Create a new project
1. Click **"New project"**
2. Name it: `wild-rift-draft`
3. Set a database password — **write this down somewhere safe**, you'll need it
4. Choose a region closest to you (any is fine)
5. Click **"Create new project"**
6. Wait about 60 seconds for it to set up

### Step 3.3 — Run the database setup
This creates all the tables your app needs.

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from your extracted folder — open it with Notepad (Windows) or TextEdit (Mac)
4. Select all the text (Ctrl+A or Cmd+A), copy it
5. Paste it into the SQL Editor on Supabase
6. Click **"Run"** (the green button)
7. You should see "Success. No rows returned" at the bottom — that means it worked ✓

### Step 3.4 — Add the champion data
1. Click **"New query"** again to start fresh
2. Open `supabase/seed/001_champions.sql` from your folder the same way
3. Copy all the text, paste it into the SQL Editor
4. Click **"Run"**
5. You should see something like "76 rows affected" ✓

### Step 3.5 — Get your Supabase keys
These are like passwords that let your app connect to the database.

1. In the left sidebar, click **"Project Settings"** (the gear icon at the bottom)
2. Click **"API"**
3. You'll see two things you need — copy them somewhere (like a notes app):
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public key** — a very long string of letters and numbers
4. Stay on this page, scroll down to find **"service_role"** key — copy that too

You now have three Supabase values. Keep them handy. ✓

---

## Part 4 — Get your Anthropic API key

This is what powers the AI coaching. You get $5 of free credit when you sign up, which is enough for hundreds of draft analyses.

1. Go to **console.anthropic.com** → sign up
2. After logging in, click **"API Keys"** in the left sidebar
3. Click **"Create Key"**
4. Name it anything (e.g. "wild-rift-draft")
5. Copy the key — it starts with `sk-ant-`

**Important:** This key is shown only once. Copy it now and save it somewhere. If you lose it, you'll need to create a new one.

---

## Part 5 — Deploy on Vercel

Vercel takes your code from GitHub and puts it on the internet.

### Step 5.1 — Create a Vercel account
Go to **vercel.com** → click "Sign Up" → sign up with GitHub (easiest — it connects automatically).

### Step 5.2 — Import your project
1. After logging in, click **"Add New"** → **"Project"**
2. You'll see your GitHub repositories listed — click **"Import"** next to `wild-rift-draft`
3. Don't change any settings on the next screen
4. **Before clicking Deploy**, look for the section called **"Environment Variables"** — you need to add your keys here

### Step 5.3 — Add your environment variables
Environment variables are like a secret settings file that only your app can read.

Click **"Add"** for each one below and fill in the Name and Value:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL (from Step 3.5) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key (from Step 3.5) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key (from Step 3.5) |
| `ANTHROPIC_API_KEY` | Your Anthropic key starting with `sk-ant-` (from Part 4) |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now — fill in after deploy |

### Step 5.4 — Deploy
Click **"Deploy"**. Vercel will build your app — this takes about 2 minutes.

When it finishes, you'll see a screen with a link like `wild-rift-draft-yourname.vercel.app`. Click it — your app is live. ✓

### Step 5.5 — Add your app URL (final step)
Now that you have your live URL:

1. Go back to Vercel → your project → **"Settings"** → **"Environment Variables"**
2. Find `NEXT_PUBLIC_APP_URL` and click **"Edit"**
3. Set the value to your full URL, like `https://wild-rift-draft-yourname.vercel.app`
4. Click **"Save"**
5. Go to **"Deployments"** → click the three dots next to your latest deployment → **"Redeploy"**

---

## Part 6 — Set up Supabase auth redirect

One last thing — you need to tell Supabase where to send users after they log in.

1. Go back to Supabase → **"Authentication"** → **"URL Configuration"**
2. Under **"Site URL"**, paste your Vercel URL (like `https://wild-rift-draft-yourname.vercel.app`)
3. Under **"Redirect URLs"**, add: `https://wild-rift-draft-yourname.vercel.app/auth/callback`
4. Click **"Save"**

---

## You're done. Here's how to use the app.

**Open your app link on your phone or computer.**

1. **Sign up** — tap "Create account", enter your summoner name, email, and a password. You'll be logged in immediately.

2. **Build your hero pool** — tap "Hero pool" in the sidebar. Pick your role tab (Support, Jungle, etc.), tap "Add champion", and search for the champions you actually play. The more you add, the better the recommendations. Start with 3–5.

3. **Use it during champion select** — when a game starts:
   - Open the app and tap "Draft"
   - Select your role for that game
   - As picks come in, tap empty slots and search for each champion
   - Add your team's picks to "Your team" and enemy picks to "Enemy team"
   - When you've entered what you know, tap "Get recommendation"
   - The coach will tell you who to pick and why

4. **After the game** — go to "History" and mark the game as a Win or Loss to track your improvement.

---

## If something goes wrong

**"Internal server error" when deploying** — usually means one of your environment variables has a typo. Go to Vercel → Settings → Environment Variables and double-check all four values were pasted correctly (no extra spaces).

**Can't log in / "Invalid credentials"** — make sure you've run both SQL files in Supabase (Steps 3.3 and 3.4). If you're not sure, just run them again — they're safe to run twice.

**"AI service not configured"** — your Anthropic API key is missing or incorrect. Check it in Vercel → Environment Variables.

**The app loads but shows a blank white screen** — open the browser console (F12 on Windows, Cmd+Option+I on Mac), look for red error messages, and share them for help.

---

## Keeping it updated

When future patch updates are released (new champion data, item changes, balance changes), the SQL seed file will be updated. To apply updates:

1. Download the new seed file
2. Paste it into Supabase SQL Editor → Run
3. That's it — no redeployment needed

---

*App built with Next.js, Supabase, and Claude (Anthropic). Hosted free on Vercel.*
