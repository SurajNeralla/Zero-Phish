# Zero Phish - Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: Zero Phish
   - **Database Password**: (choose a strong password)
   - **Region**: (closest to you)
4. Wait for project to be created (~2 minutes)

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key, NOT the `service_role` key)

## Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `server/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. Verify tables were created in **Database** → **Tables**

## Step 4: Configure Server

1. In the `server/` directory, create a file named `.env` (no .example)
2. Add your credentials:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

## Step 5: Configure Dashboard

1. In the `admin-dashboard/` directory, create a file named `.env`
2. Add your credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 6: Restart Server

1. Stop the current server (Ctrl+C in the terminal)
2. Run: `node server.js`
3. You should see "Supabase URL: https://your-project..." in the output

## Step 7: Rebuild Dashboard

1. In `admin-dashboard/` directory, run: `npm run build`
2. Reload the Chrome Extension

## Step 8: Create Admin Account

1. Open the Admin Dashboard
2. Click "Need an account? Sign Up"
3. Enter your email and password (min 6 characters)
4. Check your email for confirmation link
5. Click the link to verify
6. Return to dashboard and sign in

## Troubleshooting

**"Invalid API key"**: Double-check you copied the `anon` key, not `service_role`

**"Email not confirmed"**: Check spam folder for Supabase confirmation email

**Server errors**: Make sure `.env` file is in the `server/` directory (not `server/.env.example`)

**Dashboard not loading**: Rebuild with `npm run build` and reload extension
