# CoPassage — src/

This directory contains all source code for the CoPassage application — a full-stack carpooling platform built with Next.js 16 (App Router) and Supabase.

## Layout

```
src/
├── app/
│   ├── app/                        ← End-User app (passengers + drivers)
│   │   ├── (main)/
│   │   │   ├── dashboard/          ← User dashboard (SOS, issue reporting, quick links)
│   │   │   ├── find-ride/          ← Search available rides + request a seat
│   │   │   ├── offer-ride/         ← Post a new ride offer (geocoded on save)
│   │   │   ├── my-rides/           ← Manage offers (driver) and requests (passenger)
│   │   │   ├── broadcast-ride/     ← Passenger: broadcast a ride need
│   │   │   ├── find-passengers/    ← Driver: feed of nearby passengers needing rides
│   │   │   ├── driver-setup/       ← Register a vehicle (instant verification)
│   │   │   ├── drive/[matchId]/    ← Driver: live GPS stream view
│   │   │   └── ride/[matchId]/     ← Passenger: live driver tracking map
│   │   ├── login/                  ← User login
│   │   └── register/               ← User registration
│   ├── admin/                      ← Super Admin portal
│   │   ├── page.tsx                ← Analytics overview
│   │   ├── users/                  ← User & role management
│   │   ├── matches/                ← All matches (cross-city)
│   │   ├── payments/               ← Payment records
│   │   ├── escalations/            ← All escalations
│   │   └── profile/                ← Admin profile settings
│   ├── staff/                      ← City Staff portal
│   │   ├── page.tsx                ← Staff home
│   │   ├── sos-alerts/             ← Live SOS alert triage
│   │   ├── ticket-queue/           ← Open escalation tickets
│   │   ├── case-history/           ← Resolved cases
│   │   ├── staff-roster/           ← City staff directory
│   │   └── report-issues/          ← Staff issue reporting
│   ├── auth/signout/               ← Sign-out route handler
│   ├── forgot-password/            ← Password reset request
│   ├── reset-password/             ← Password reset confirmation
│   └── unauthorized/               ← 403 page
├── components/
│   ├── LiveMap.tsx                 ← Leaflet/OpenStreetMap map with auto-panning car marker
│   └── SupabaseAuthListener.tsx    ← Client-side auth state listener
├── lib/
│   ├── supabase/
│   │   └── server.ts               ← Supabase SSR client factory (Server Components + Actions)
│   ├── location.ts                 ← geocodeAddress() via Nominatim, calculateDistance() Haversine
│   └── utils.ts                    ← cn() utility (clsx + tailwind-merge)
├── types/
│   └── supabase.ts                 ← Full typed Database interface (all 9 tables)
├── supabase/
│   └── schema.sql                  ← DB migration: all tables, triggers, RLS policies, seed data
├── proxy.ts                        ← Next.js middleware: session refresh + route guards
└── .env.example                    ← Environment variable template
```

## Tech Stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **React 19**
- **Supabase** (PostgreSQL, Auth, Row Level Security, Realtime Broadcast)
- **Tailwind CSS 4** (utility-first, no extra CSS files)
- **Leaflet + react-leaflet** (interactive maps, SSR-disabled via `next/dynamic`)
- **Lucide React** (icon set)
- **Sonner** (toast notifications)
- **TypeScript** (strict, end-to-end typed across all 32 routes)

## Getting Started

See [`../docs/setup-guide.md`](../docs/setup-guide.md) for full instructions.

Quick start:

```bash
cd src
cp .env.example .env.local    # fill in Supabase credentials
npm install
npm run dev
```

- End-User app: [http://localhost:3000/app/login](http://localhost:3000/app/login)
- City Staff portal: [http://localhost:3000/staff/login](http://localhost:3000/staff/login)
- Super Admin panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
