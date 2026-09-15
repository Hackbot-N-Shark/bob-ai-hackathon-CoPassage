# CoPassage

CoPassage is a **peer-to-peer auto-rickshaw fare-splitting platform**. It connects commuters heading in the same direction, allowing them to share rides and split fares without any driver involvement.

## Team: CoPassage
- **Track**: Open
- **Lead**: Shubham Arunbhai Mendpara
- **Members**: Hemangi Gamit, Nisarg Makwana, Prachi Modi

## Problem Statement
Urban commuters who rely on auto-rickshaws frequently travel alone and pay the full fare because there's no easy way to find nearby people heading in the same direction. The lack of commuter-to-commuter coordination leads to wasted money, increased traffic congestion, and higher carbon emissions.

## Solution
CoPassage solves this by facilitating offline rickshaw hailing and online peer-to-peer matching. A rider who boards an auto broadcasts their route and fare. Nearby commuters see this broadcast on a live map, request to join, match, chat, and split the metered fare equally. **The app strictly focuses on commuter coordination; there are no driver accounts or dispatch mechanisms.**

## Key Features
- **Offline Hailing & Online Matching**: Zero driver coordination required; the platform only connects riders.
- **Live GPS Broadcasting**: Supabase Realtime streams a host's location continuously to a Leaflet-powered map.
- **Privacy-First Requests**: Joining riders' exact locations are protected until a mutual match is confirmed.
- **Atomic Mutual Completion**: Complex PostgreSQL triggers ensure secure ride completion across RLS-isolated tables.
- **Integrated Safety (SOS)**: A one-tap SOS button writes exact GPS coordinates to the database and alerts authorities.

## Tech Stack
- **Frontend**: Vite, React 19, Tailwind CSS 4, react-leaflet
- **Authentication**: Firebase Auth (OTP-based)
- **Database & Backend**: Supabase (PostgreSQL with Row Level Security)
- **Realtime**: Supabase Realtime (Broadcast channels)
- **AI Integration**: Google GenAI API
- **AI Tooling**: IBM Bob (AI-assisted development environment)

## How to Run
Follow the exact steps in [docs/setup-guide.md](docs/setup-guide.md) to install dependencies and configure your environment.

```bash
cd src
npm install
npm run dev
```

## Demo
- **Video Walkthrough**: See `demo/demo-video-link.txt`
- **Live Demo**: See `demo/live-demo-url.txt`
- **Screenshots**: See `demo/screenshots/`

## Known Limitations
- Location tracking accuracy relies on device GPS and browser permissions (background tracking is limited on iOS Safari).
- Route matching uses straight-line bearing (Haversine distance) rather than actual road networks.
- No automated test suite exists.

## What We're Most Proud Of
We are proud of our strictly peer-to-peer architecture that removes the driver from the software loop, resulting in a highly scalable, zero-onboarding system. The robust Postgres trigger logic (`check_and_complete_ride`) that atomically handles mutual ride completion securely across two separate RLS-protected tables—without exposing write permissions—is our standout technical achievement.
