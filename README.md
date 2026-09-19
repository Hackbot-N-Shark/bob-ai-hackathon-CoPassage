# 🛺 CoPassage

> A peer-to-peer auto-rickshaw fare-splitting platform connecting commuters heading in the same direction to share rides and split fares—without any driver involvement.

[![Track: Open](https://img.shields.io/badge/Track-Open-blue)](#) 
[![Tech: Supabase & React](https://img.shields.io/badge/Tech-React_19_|_Supabase-success)](#)

---

## 👥 Team

**Team Name:** CoPassage  
**Track:** Open  

| Role | Name | Email |
| :--- | :--- | :--- |
| **Lead** | Shubham Arunbhai Mendpara | 25cs044@charusat.edu.in |
| **Member** | Hemangi Gamit | 25cs015@charusat.edu.in |
| **Member** | Nisarg Makwana | 25cs041@charusat.edu.in |
| **Member** | Prachi Modi | 25cs045@charusat.edu.in |

---

## 🚨 Problem Statement

Urban commuters who rely on auto-rickshaws frequently travel alone and pay the full metered fare because there is no easy way to find nearby people heading in the same direction. Meanwhile, other commuters struggle to hail empty autos during peak hours. This lack of commuter-to-commuter coordination leads to wasted money, increased traffic congestion, and higher carbon emissions across urban corridors.

---

## 💡 Solution

**CoPassage** solves this by connecting commuters peer-to-peer entirely offline from drivers:
1. A commuter physically hails an auto-rickshaw on the street and broadcasts their route as the "Ride Host" in the app.
2. Nearby commuters heading in the same corridor discover the host's moving pin on a live map, request to join, match, and chat.
3. Both riders travel together and split the metered fare directly, requiring zero driver onboarding or vehicle dispatch.

---

## ✨ Key Features

- **📶 Offline Hailing & Online Matching**: Zero driver coordination required; the platform connects commuters directly.
- **📍 Live GPS Corridor Broadcasting**: Supabase Realtime streams the host's location continuously with a 10-second heartbeat.
- **🔒 Privacy-First Matching**: A joining rider's exact coordinates remain hidden until a mutual match is confirmed by the host.
- **⚛️ Atomic Mutual Completion**: PostgreSQL database triggers securely complete rides only when both parties independently confirm arrival.
- **🆘 Integrated One-Tap SOS**: Direct database coordinate logging to an emergency audit table before triggering hotlines.
- **💳 Fair Fare & Detour Surcharge Engine**: Automated fare splitting with customizable detour compensation and subscription tiers.

---

## 🛠 Tech Stack

- **Languages**: TypeScript, SQL
- **Frontend**: React 19, Vite, Tailwind CSS 4, React Router, `@vis.gl/react-google-maps`, Leaflet
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security), Supabase Realtime (CDC Broadcast channels)
- **Authentication**: Firebase Phone Authentication (SMS OTP)
- **Payment Gateway**: Razorpay Checkout SDK & Node.js Express verification middleware
- **AI Tooling & Integration**: IBM Bob (AI development environment), Google GenAI API

---

## 🚀 How to Run

Follow the exact steps in [`docs/setup-guide.md`](docs/setup-guide.md) to install dependencies and run the project locally:

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A Supabase Project (PostgreSQL & Realtime)
- A Firebase Project (Phone Auth OTP)

### 2. Installation & Setup
```bash
# Navigate to the source code directory
cd src

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 4. Build & Type Checking
```bash
# Run TypeScript compilation checks
npm run lint

# Build production bundle
npm run build
```

---

## 🎥 Demo

- **Live Deployed App**: [https://copsaage.netlify.app/](https://copsaage.netlify.app/) (documented in [`demo/live-demo-url.txt`](demo/live-demo-url.txt))
- **Demo Video (YouTube)**: [https://youtu.be/GKQZJfecRrc?si=OPAyjt3AG9iHZ5_y](https://youtu.be/GKQZJfecRrc?si=OPAyjt3AG9iHZ5_y) (documented in [`demo/demo-video-link.txt`](demo/demo-video-link.txt))
- **Screenshots**: High-resolution walk-through screenshots in [`demo/screenshots/`](demo/screenshots/):
  - [`01-home-dashboard.jpeg`](demo/screenshots/01-home-dashboard.jpeg) — Primary commuter dashboard and live map view.
  - [`02-query-input.jpeg`](demo/screenshots/02-query-input.jpeg) — Corridor route search, radius scoping, and ride request interface.
  - [`03-result-output.jpeg`](demo/screenshots/03-result-output.jpeg) — Active matched ride view with live co-rider GPS, in-ride chat, and fare splitting.

---

## ⚠️ Known Limitations

- **Browser Background Tracking**: Location updates rely on the browser Geolocation API (`watchPosition`). On certain mobile browsers (notably iOS Safari), background tab throttling can pause GPS streaming when the screen is locked or the app is minimized.
- **Spherical Bearing Heuristic**: Route overlap calculation uses a 2.0 km Haversine radius and spherical azimuth forward bearing (≤ 25° difference) rather than commercial turn-by-turn road network APIs to operate at zero marginal infrastructure cost.
- **Offline Fare Settlement**: Fares are split directly between commuters via cash, UPI, or in-app commuter vault credits; direct driver payment remains offline.

---

## 🌟 What We're Most Proud Of

The strict separation of concerns in our commuter-to-commuter model. By intentionally excluding drivers from the software platform, we eliminated driver onboarding friction, licensing hurdles, and expensive dispatch algorithms. 

Technically, we are most proud of our **Atomic Mutual Ride Completion Architecture**: using PostgreSQL `SECURITY DEFINER` triggers to coordinate state across two separately secured, RLS-isolated tables (`rider_open_posts` and `join_requests`), guaranteeing that neither party can unilaterally complete a ride prematurely or alter unauthorized records.
