# KISANFLOW Phase 2 Setup

## What this phase does
- Keeps the existing UI.
- Moves the business mock data into `src/data/mockData.js`.
- Adds the Supabase client foundation.
- Adds database service modules.
- Adds the initial Supabase SQL schema.
- Keeps mock data usable until the live database is connected.

## 1. Create Supabase
1. Open https://supabase.com/
2. Create an account.
3. Create a new project called `kisanflow`.
4. Choose a strong database password and keep it private.
5. Wait for the project to finish provisioning.

## 2. Run the database schema
1. Open your Supabase project.
2. Go to SQL Editor.
3. Create a new query.
4. Copy the full contents of `supabase/schema.sql` into it.
5. Run it.
6. In Table Editor, confirm the tables were created.

## 3. Get the API values
In Supabase:
- Project Settings -> API
- copy the Project URL
- copy the publishable/anon public key

Create `.env.local` in the project root:

VITE_SUPABASE_URL=YOUR_PROJECT_URL
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_ANON_KEY

Never put a service-role key in the frontend.

## 4. Install dependencies
The project now expects `@supabase/supabase-js`.
Run:

npm install
npm run build

## 5. Important
The current `App.jsx` is still reading mock data. That is intentional for this phase.
The next implementation step is to wire the Farmer, Buyer, Demand and Virtual Lot screens to the Supabase services while retaining mock-data fallback.
