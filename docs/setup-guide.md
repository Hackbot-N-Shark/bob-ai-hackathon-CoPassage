# Setup Guide

This guide walks through setting up CoPassage locally on your machine. The app is built with Vite, React, Firebase Auth, and Supabase.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A Supabase Project (for PostgreSQL database and Realtime)
- A Firebase Project (for Phone Authentication)

## Step 1: Clone and Install
First, navigate into the source directory and install the required dependencies:

```bash
cd src
npm install
```

## Step 2: Environment Variables
Create a `.env` file in the `src/` directory by copying the provided example:

```bash
cp .env.example .env
```

Your `.env` file must contain the following variables:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Firebase Configuration (for Auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
```

## Step 3: Run the Development Server
Start the Vite development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Step 4: Verification
To verify the app is working correctly:
1. Open the app in your browser at `http://localhost:3000`.
2. Ensure you are prompted for Location permissions (required for routing and matching).
3. Attempt to log in using a test phone number if configured in your Firebase console.

## Troubleshooting Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Firebase: Error (auth/invalid-api-key)` | Missing or incorrect Firebase API key | Double-check `VITE_FIREBASE_API_KEY` in your `.env` file. |
| `Failed to load module script` | Vite cache issues | Run `npm run clean` and restart the dev server. |
| Supabase Auth / Missing Token Errors | RLS failing due to invalid token | Ensure Firebase is properly linked to Supabase as a Third-Party Auth provider. |
| Map tiles not loading | Network/OpenStreetMap issue | Check your internet connection; Nominatim/OSM servers may occasionally rate-limit. |
