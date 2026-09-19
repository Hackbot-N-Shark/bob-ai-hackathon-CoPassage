# CoPassage Source Code Layout

This directory contains the complete source code for the **CoPassage** application, built using **React 19**, **TypeScript**, **Vite**, **Tailwind CSS 4**, **Firebase Auth**, and **Supabase (PostgreSQL & Realtime)**.

---

## 📁 Directory Structure

```
src/
├── .env.example             # Documented template for all environment variables
├── index.html               # Main HTML entry point with mobile viewport configuration
├── logic.md                 # Technical specification of the 2.0 km corridor matching engine
├── package.json             # NPM dependencies, build scripts, and dev tools
├── POST_AUTH_RIDER_EXPERIENCE.md # Product specifications and rider coordination model
├── tsconfig.json            # Strict TypeScript configuration
├── vercel.json              # Deployment configuration and client-side routing rewrites
├── vite.config.ts           # Vite bundler configuration
│
├── public/                  # Static assets (illustrations, icons, logos, intro video)
│   ├── auto-illustration.png
│   ├── CoPassageLOGO2.png
│   ├── favicon.png
│   ├── intro.mp4
│   └── rider-bg.png
│
├── server/                  # Backend middleware & verification services
│   └── razorpayMiddleware.ts # Razorpay webhook signature verification & subscription sync
│
├── supabase/                # Database schema and RLS policies
│   └── schema.sql           # PostgreSQL table definitions, RLS policies, and atomic triggers
│
├── scratch/                 # Mathematical validation and test scripts
│   └── test_detour_surcharge.mjs
│
└── src/                     # Core application source code
    ├── App.tsx              # Application shell with React Router routes & auth state sync
    ├── constants.ts         # App constants, pricing tiers, and corridor matching thresholds
    ├── firebase.ts          # Firebase Phone Auth initialization
    ├── index.css            # Tailwind CSS styling and custom animations
    ├── main.tsx             # React DOM root mounting with ErrorBoundary
    ├── supabase.ts          # Supabase client with third-party JWT pass-through
    ├── types.ts             # TypeScript interfaces for riders, broadcasts, and requests
    ├── vite-env.d.ts        # Vite environment variable type declarations
    │
    ├── components/          # Reusable UI components
    │   ├── AuthModal.tsx    # Phone OTP sign-in / registration modal
    │   ├── CoPassageLogo.tsx # SVG Brand logo
    │   ├── DemoScenariosModal.tsx # Interactive test scenario selector
    │   ├── IntroVideoOverlay.tsx  # Product showcase video overlay
    │   ├── layout/          # Navbar, Footer, ScrollToTop, InfoPageLayout
    │   ├── pricing/         # PlansSection (Free, Plus, Pro, Unlimited tiers)
    │   ├── rider/           # Post-auth rider views (MapView, RiderHome, RiderChat, etc.)
    │   └── scenes/          # Explanatory storyboard scenes
    │
    ├── hooks/               # Custom React hooks
    │   ├── useBroadcast.ts  # Real-time GPS broadcasting with 10s heartbeat
    │   └── useGeolocation.ts # Browser Geolocation API wrapper
    │
    ├── pages/               # Informational and policy pages
    │   ├── AboutPage.tsx
    │   ├── CareersPage.tsx
    │   ├── ContactPage.tsx
    │   ├── FairFareCodePage.tsx
    │   ├── FareGuidelinesPage.tsx
    │   ├── GrievanceOfficerPage.tsx
    │   ├── PressPage.tsx
    │   ├── PrivacyPage.tsx
    │   ├── SafetyCharterPage.tsx
    │   └── TermsPage.tsx
    │
    └── services/            # Business logic and external API integrations
        ├── authRegistration.ts   # Profile persistence & test account seeding
        ├── geoUtils.ts           # Haversine distance, forward azimuth, corridor filtering
        ├── pricing.ts            # Fare splitting & dynamic detour surcharge calculation
        ├── razorpay.ts           # Razorpay checkout handler
        ├── subscriptionUsage.ts  # Monthly ride allowance tracking per tier
        └── vaultService.ts       # In-app commuter ride credit vault
```

---

## 🚀 Running Locally

1. Copy `.env.example` to `.env` and fill in your Supabase and Firebase credentials:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Run static type checking:
   ```bash
   npm run lint
   ```
5. Create a production build:
   ```bash
   npm run build
   ```
