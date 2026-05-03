# Misadventures in Germany

React + Vite travel blog backed by Supabase.

## Stack

- React 19
- Vite
- TypeScript
- Supabase database, auth, and storage

## Local setup

Install dependencies:

```bash
pnpm install
```

Create your local env file from the example:

```bash
cp .env.example .env.local
```

Fill in:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_ADMIN_EMAIL=
```

Notes:

- `VITE_SUPABASE_ADMIN_EMAIL` is optional. It only pre-fills the admin login form.
- Do not put a Supabase service-role key in this frontend app.

Start the app:

```bash
pnpm dev
```

## What is in this repo

- `src/` contains the blog frontend and the built-in admin UI
- `src/lib/supabase.ts` creates the browser Supabase client
- `src/components/AdminPanel.tsx` contains the admin editor at `#admin`
- `supabase/migrations/` contains the database schema and policy history
- `supabase/config.toml` is the local Supabase CLI config

The database migrations create:

- `site_settings`
- `posts`
- `popular_posts`
- `recent_posts`
- `travel_tips`
- public storage bucket `post-images`

## Content management

This project supports two admin paths:

1. Supabase dashboard
2. Built-in admin UI at `#admin`

Public visitors can only read published content. Editing requires signing in as a Supabase user with the `admin` role in Auth `app_metadata`.

The admin UI lets you:

- create, edit, publish, and delete posts
- edit the full story body used on the single-post page
- upload post images into the `post-images` bucket
- edit hero/contact settings
- edit popular posts, recent posts, and travel tips

Open the admin UI locally or in production at:

```text
/#admin
```

## GitHub safety

Safe to commit:

- `src/`
- `public/`
- `supabase/`
- `.env.example`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`

Do not commit:

- `.env.local`
- `.env`
- `.env.*`
- `.vercel/`
- any Supabase personal access token
- any database password
- any service-role key

The ignore rules in `.gitignore` already cover these local-only files.

## Push to GitHub

If this folder is not already a Git repo:

```bash
git init
git add .
git commit -m "Initial blog site"
git branch -M main
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

If the repo already exists locally, just add, commit, and push your current changes.

## Deploy to Vercel

1. Import the GitHub repo into Vercel.
2. Let Vercel detect it as a Vite project.
3. Add these environment variables in the Vercel project settings:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_ADMIN_EMAIL=
```

Notes:

- `VITE_SUPABASE_ADMIN_EMAIL` is optional.
- Do not add a service-role key to Vercel for this frontend.
- This app uses hash routes like `/#admin` and `/#post/<slug>`, so no special Vercel rewrites are needed for those routes.

After deploy, the site will work at your Vercel URL and the admin remains available at:

```text
https://your-site.vercel.app/#admin
```

## Supabase settings for production

In Supabase dashboard:

1. Go to `Authentication > URL Configuration`.
2. Set `Site URL` to your production Vercel domain.
3. If you want preview deployments, add your Vercel preview URL pattern to the redirect allow list.

The current admin sign-in uses password auth from the browser, so the main requirement is that your Vercel env vars point at the correct Supabase project.

## Supabase CLI

Push migrations to the linked hosted project:

```bash
npx supabase db push --linked
```

Generate fresh TypeScript types from the linked project:

```bash
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
```

Start a full local Supabase stack with Docker:

```bash
npx supabase start
```
