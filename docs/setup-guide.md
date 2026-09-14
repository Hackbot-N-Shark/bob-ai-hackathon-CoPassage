# Setup Guide

> Run these exact steps to get CoPassage running locally from scratch.

## Prerequisites

Ensure the following are installed before you begin:

- [ ] **Node.js 18+** — [nodejs.org](https://nodejs.org). Verify: `node -v`
- [ ] **npm 9+** — bundled with Node.js. Verify: `npm -v`
- [ ] **A Supabase account** — free tier is sufficient. Sign up at [supabase.com](https://supabase.com)
- [ ] **Git** — [git-scm.com](https://git-scm.com)

No Docker, Python, or paid services required.

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-org>/bob-ai-hackathon-copassage.git
cd bob-ai-hackathon-copassage
```

---

## Step 2 — Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and click **New Project**
2. Choose a name (e.g., `copassage`), set a database password, and pick a region close to you
3. Wait ~2 minutes for the project to provision

---

## Step 3 — Apply the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `src/supabase/schema.sql` from this repo and paste its entire contents into the editor
4. Click **Run** (or press `Ctrl+Enter`)

This creates all tables (`profiles`, `ride_offers`, `ride_requests`, `matches`, `ride_broadcasts`, `vehicles`, `payments`, `escalations`, `sos_alerts`), all triggers, all RLS policies, and seeds sample data for the admin panel.

---

## Step 4 — Configure Environment Variables

```bash
cd src
cp .env.example .env.local
```

Open `.env.local` and fill in the three values:

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → **Project URL** | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → **anon / public** key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → **service_role** key | Yes |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (leave as-is for local dev) | Yes |

> **Never commit `.env.local`** — it is already in `.gitignore`.

---

## Step 5 — Install Dependencies

```bash
# still inside src/
npm install
```

---

## Step 6 — Run the Development Server

```bash
npm run dev
```

The application is available at **[http://localhost:3000](http://localhost:3000)**.

---

## Step 7 — Create Test Users

CoPassage has three user roles. Create one account for each to test the full flow:

### Super Admin
1. Go to your Supabase dashboard → **Authentication** → **Users** → **Invite user**
2. Enter an email (e.g., `admin@test.com`) and send the invite
3. Open the email, set a password
4. In the SQL Editor, run:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'admin@test.com';
   ```
5. Log in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### City Staff
1. In the SQL Editor, run the following to create a city staff account:
   ```sql
   -- Use the Supabase dashboard Auth > Users to invite staff@test.com first, then:
   update public.profiles
   set role = 'city_staff', assigned_city = 'Mumbai', force_password_change = true
   where email = 'staff@test.com';
   ```
2. Log in at [http://localhost:3000/staff/login](http://localhost:3000/staff/login)
3. You will be prompted to set a new password on first login

### Regular User (Passenger / Driver)
1. Register at [http://localhost:3000/app/register](http://localhost:3000/app/register)
2. Log in at [http://localhost:3000/app/login](http://localhost:3000/app/login)
3. To become a driver: navigate to the dashboard and click **Register Vehicle**

---

## Step 8 — Test the Key User Journey

1. **User A** registers and registers a vehicle (becomes a verified driver)
2. **User A** posts a ride at `/app/offer-ride`
3. **User B** registers and searches for that ride at `/app/find-ride`, books a seat
4. **User A** sees the pending request on `/app/my-rides` → accepts it → **"Start Ride"** button appears
5. **User A** clicks Start Ride → `/app/drive/[matchId]` → allow browser location access
6. **User B** sees the **"Track Ride"** button on `/app/my-rides` → clicks it → watches User A's location on the map

---

## Build for Production

```bash
cd src
npm run build
npm start
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `Error: NEXT_PUBLIC_SUPABASE_URL is required` | Ensure `.env.local` exists in `src/` and contains the correct Supabase URL |
| `relation "profiles" does not exist` | The schema SQL has not been applied. Repeat Step 3. |
| Map does not load / shows grey tiles | Check your internet connection — map tiles are fetched from OpenStreetMap at runtime |
| Location sharing not working | The browser must grant location permission. Make sure you are on `localhost` (HTTP) or HTTPS — geolocation is blocked on non-secure origins |
| Login redirects to `/unauthorized` | Your user's role is not set correctly. Check the `profiles` table in Supabase dashboard |
| `npm install` fails | Ensure you are running the command inside the `src/` directory, not the repo root |
| TypeScript build errors | Run `cd src && npm run build` — all errors should be resolved. If new ones appear, check that `.env.local` is present (Next.js type generation requires it) |
