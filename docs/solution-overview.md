# Solution Overview

## Core Mechanism
CoPassage is a peer-to-peer auto-rickshaw fare-splitting platform that operates strictly commuter-to-commuter. The app does not dispatch vehicles. Instead, the flow is:
1. **Find an Auto Offline**: A commuter hails an auto-rickshaw on the street just as they normally would.
2. **Broadcast**: This commuter (now the "Host") taps "I Have an Auto" in the app, entering their destination and available seats. The app starts broadcasting their live GPS coordinates to the database.
3. **Discover**: Other commuters nearby (within a 2km radius) looking for a ride see the Host's moving pin on a live map.
4. **Join & Match**: A nearby commuter sends a "Request to Join". The Host reviews and accepts.
5. **Ride & Split**: The co-rider's live location becomes visible to the Host so they can pick them up. Both riders complete the ride in the app, rate each other, and split the metered fare offline.

## What Makes It Different
Unlike traditional ride-hailing apps (Uber, Ola, Rapido), **there are no drivers on this platform**. We completely bypass the complexity of driver onboarding, vehicle verification, and dispatch algorithms. The platform's sole responsibility is finding overlapping routes for commuters and facilitating their connection. 

## Key Design Decisions
- **Privacy-First Location Sharing**: A joining rider's exact location is hidden until a mutual match is confirmed. We enforce this at the database level using Row-Level Security (RLS).
- **Mutual Ride Completion**: We avoid giving a single party total control over the ride's state. Both the Host and the Co-rider must independently confirm the ride is complete. A Postgres trigger atomicly transitions the ride to "completed" only when both flags are true.
- **2km Route Overlap Heuristic**: Instead of using expensive routing APIs like Google Maps Directions, we use a 2km Haversine radius and a spherical trigonometry bearing calculation (≤ 25° angular difference) to determine route overlap directly on the client and database.

## User Experience
The app features a bottom-navigation shell with a heavy focus on the map interface. 
- A **Leaflet-powered map** displays custom pulsing markers. 
- **Contextual permissions**: Location access is requested at the exact moment a user attempts to broadcast or search, not buried in onboarding. 
- A **One-Tap SOS Modal** instantly captures GPS coordinates directly to a dedicated emergency table before displaying hotlines.
