# Solution Overview

## What We Built

CoPassage is a full-stack, multi-portal carpooling platform for Indian cities. It has three distinct portals — an End-User app, a City Staff portal, and a Super Admin panel — each serving a different role in the ecosystem, all built on a shared Supabase (PostgreSQL) backend with Row Level Security enforcing data isolation between roles.

The core user-facing product lets verified drivers post available seats on their existing daily routes, and lets passengers either search for matching rides or broadcast a ride need that nearby drivers can respond to. Once a ride is matched, both parties get real-time GPS tracking directly in the browser — no native app, no paid map API, no server-side location storage.

## How It Works

### Passenger Flow
1. Passenger registers at `/app/register` and logs in.
2. They search for rides at `/app/find-ride` — results are filtered by city and route text, sorted by departure time.
3. They request a seat. The driver sees the pending request on `/app/my-rides`.
4. If no rides match, the passenger broadcasts a ride need at `/app/broadcast-ride` — they enter origin, destination, city, time, and seats needed. The server geocodes the addresses via Nominatim and stores coordinates.
5. Once a driver accepts their request, the passenger's My Rides card shows a **"Track Ride"** button linking to `/app/ride/[matchId]` — a live Leaflet map that listens to the driver's Supabase Realtime channel.

### Driver Flow
1. Driver registers a vehicle at `/app/driver-setup` — this instantly sets `is_driver_verified = true` on their profile (MVP shortcut).
2. Driver posts a ride at `/app/offer-ride` — origin/destination are geocoded on save.
3. Driver browses the **Find Passengers** feed at `/app/find-passengers` — a live feed of active broadcasts in their city, sorted by Haversine distance from their current GPS position.
4. Driver reviews pending seat requests on `/app/my-rides` and accepts or rejects each one. On accept, a `matches` row is created and a **"Start Ride"** button appears.
5. Driver taps Start Ride → `/app/drive/[matchId]` — the browser's `navigator.geolocation.watchPosition` streams coordinates into a Supabase Realtime Broadcast channel every few seconds. The passenger's tracking view receives these updates instantly.

### City Staff Flow
Staff log in at `/staff/login` with a provisioned account (force-password-change on first login). They can view SOS alerts, manage escalations raised by users, browse the staff roster, and see case history — all scoped to their assigned city via RLS.

### Super Admin Flow
Super Admins access `/admin` to manage all users and their roles, view all matches and payments across all cities, and manage escalations globally.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the full diagram and component table.

```
Browser (Passenger/Driver)
        │
        ▼
Next.js App Router (src/app/)
   ├── Server Components (data fetching via Supabase SSR client)
   ├── Server Actions (mutations — offer ride, accept request, etc.)
   └── Client Components (LiveMap, real-time subscriptions)
        │
        ▼
Supabase
   ├── PostgreSQL + RLS (profiles, ride_offers, ride_requests, matches, ...)
   └── Realtime Broadcast (live location channel per match)
        │
        ▼
External (free, no API key)
   └── Nominatim / OpenStreetMap (geocoding + map tiles)
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **Supabase Realtime Broadcast for live location** | Broadcasting location updates directly to connected clients (never written to disk) avoids creating a high-churn `live_locations` table. Zero server-side infra cost. |
| **Nominatim for geocoding** | Completely free, no API key, no rate-limit quota in development. Appropriate for an MVP serving Indian cities with well-indexed OSM data. |
| **Client-side Haversine distance sorting** | City filter in the DB query keeps result sets small (hundreds, not millions). Sorting in the browser avoids a PostGIS dependency and keeps the DB schema simple. |
| **Next.js App Router + Server Actions** | Allows data mutations without a separate API layer. Server Components fetch data at the edge without client-side waterfalls. Single deployment target. |
| **Three separate portal layouts** | `/app`, `/staff`, `/admin` have independent auth flows and nav shells. This reflects real organisational boundaries (commuter ≠ city employee ≠ super admin) and makes RLS policy reasoning straightforward. |
| **`is_driver_verified` instant approval** | A deliberate MVP shortcut. Documented as a known limitation. In production this would be a city-staff approval queue. |

## IBM Technology Integration

**IBM Bob** was used as the primary AI-assisted development environment for the entire project. Bob was used to:
- Analyse the existing codebase before every implementation phase and identify gaps versus the implementation plan (avoiding re-building already-implemented features)
- Write and iteratively refine Server Actions, React components, Supabase schema SQL, and TypeScript type definitions
- Diagnose TypeScript compilation errors across the full 32-route Next.js build and apply targeted fixes
- Author all documentation files in this repository

Bob's ability to read and reason about the entire codebase in context — rather than generating isolated code snippets — was the key productivity multiplier for a 4-person student team building a production-grade multi-portal application.
