# CoPassage Demo Artifacts

This folder contains all demonstration artifacts, visual proofs of functionality, and access links for evaluators and judges.

---

## 🔗 Links & Deployed Application

- **Live Deployed Application**: [https://copsaage.netlify.app/](https://copsaage.netlify.app/) (see [`live-demo-url.txt`](live-demo-url.txt))
- **Demo Video Walkthrough (YouTube)**: [https://youtu.be/GKQZJfecRrc?si=OPAyjt3AG9iHZ5_y](https://youtu.be/GKQZJfecRrc?si=OPAyjt3AG9iHZ5_y) (see [`demo-video-link.txt`](demo-video-link.txt))

---

## 📱 Screenshots

The [`screenshots/`](screenshots/) directory contains three high-resolution snapshots illustrating key user journeys in CoPassage:

1. **[`01-home-dashboard.jpeg`](screenshots/01-home-dashboard.jpeg)**:
   - The primary rider dashboard displaying live corridor view, quick commute options ("Find an Auto", "I Have an Auto"), and active ride status.
2. **[`02-query-input.jpeg`](screenshots/02-query-input.jpeg)**:
   - The interactive route discovery interface showing origin proximity filtering, destination matching, and seat availability.
3. **[`03-result-output.jpeg`](screenshots/03-result-output.jpeg)**:
   - The matched ride and active ride overlay showing real-time GPS tracking of co-riders, in-ride chat, emergency SOS trigger, and fare-splitting summary.

---

## 🎥 What the Demo Video Demonstrates

The recorded video walkthrough demonstrates the complete end-to-end user experience without mock data:
1. **Local and Cloud Startup**: App launched cleanly via `npm run dev` and deployed on Netlify.
2. **Authentication**: Instant phone number verification via Firebase OTP.
3. **Offline Auto Hailing & Live Broadcast**: A commuter physically hails an auto-rickshaw and broadcasts route/seats as the "Ride Host" via Supabase Realtime.
4. **Proximity Matching**: A second nearby commuter sees the host's moving pin on the map and submits a "Request to Join".
5. **Mutual Match Confirmation**: The host accepts the request; mutual GPS coordinates become active.
6. **Mutual Ride Completion**: Both riders confirm arrival; atomic PostgreSQL triggers transition the ride to completed state.
7. **Emergency SOS**: Instant GPS capture written directly to the database before launching hotlines.
