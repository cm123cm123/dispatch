# Dispatch — Setup Guide

## 1. Create a Supabase project

1. Go to https://supabase.com and create a new project
2. Once created, go to **Settings → API** and copy:
   - Project URL
   - `anon` / public key

## 2. Run the database migration

In the Supabase dashboard, go to **SQL Editor** and paste + run the contents of:
```
supabase/migrations/001_initial.sql
```

## 3. Enable magic link auth

In Supabase: **Authentication → Providers → Email**  
Make sure "Enable Email provider" is on and "Confirm email" is enabled.

Add your site URL to **Authentication → URL Configuration**:
- Site URL: `https://your-vercel-domain.vercel.app`
- Redirect URL: `https://your-vercel-domain.vercel.app/auth/callback`

## 4. Create .env.local

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 5. Run locally

```bash
npm run dev
```

Visit http://localhost:3000, enter `tim.bowman@covermore.com`, click the magic link.

## 6. Deploy to Vercel

```bash
npx vercel
```

Add the same env vars in the Vercel dashboard under **Settings → Environment Variables**.

Update the Supabase redirect URL to your Vercel domain once deployed.

## Cron job (Outlook scan stub)

`vercel.json` schedules a daily POST to `/api/scan-inbox` at 8am AEST.  
This is a stub — see `app/api/scan-inbox/route.ts` for Phase 2 setup steps.
