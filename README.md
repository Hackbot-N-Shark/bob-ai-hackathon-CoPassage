# 🛺 CoPassage

> A peer-to-peer auto-rickshaw fare-splitting platform connecting commuters heading in the same direction to share rides and split fares—without any driver involvement.

[![Track: Open](https://img.shields.io/badge/Track-Open-blue)](#) 
[![Tech: Supabase & React](https://img.shields.io/badge/Tech-React_19_|_Supabase-success)](#)

---

## 👥 Team

**Team Name:** CoPassage  
**Track:** Open  

| Role | Name |
| :--- | :--- |
| **Lead** | Shubham Arunbhai Mendpara |
| **Member** | Hemangi Gamit |
| **Member** | Nisarg Makwana |
| **Member** | Prachi Modi |

---

## 🚨 Problem Statement

Urban commuters who rely on auto-rickshaws frequently travel alone and pay the full fare because there is no easy way to find nearby people heading in the same direction. 

This lack of commuter-to-commuter coordination leads to:
- 💸 **Wasted money** for individual riders
- 🚦 **Increased traffic congestion** in urban areas
- 🌍 **Higher carbon emissions**

---

## 💡 Solution

**CoPassage** solves this by facilitating offline rickshaw hailing and online peer-to-peer matching. 

1. A rider who boards an auto broadcasts their route and fare. 
2. Nearby commuters see this broadcast on a live map, request to join, match, chat, and split the metered fare equally. 

> **Note:** The app strictly focuses on commuter coordination; **there are no driver accounts or dispatch mechanisms**.

---

## ✨ Key Features

- **📶 Offline Hailing & Online Matching**: Zero driver coordination required; the platform only connects riders.
- **📍 Live GPS Broadcasting**: Supabase Realtime streams a host's location continuously to a Leaflet-powered map.
- **🔒 Privacy-First Requests**: Joining riders' exact locations are protected until a mutual match is confirmed.
- **⚛️ Atomic Mutual Completion**: Complex PostgreSQL triggers ensure secure ride completion across RLS-isolated tables.
- **🆘 Integrated Safety (SOS)**: A one-tap SOS button writes exact GPS coordinates to the database and alerts authorities.

---

## 🛠 Tech Stack

- **Frontend**: Vite, React 19, Tailwind CSS 4, `react-leaflet`
- **Authentication**: Firebase Auth (OTP-based)
- **Database & Backend**: Supabase (PostgreSQL with Row Level Security)
- **Realtime**: Supabase Realtime (Broadcast channels)
- **AI Integration**: Google GenAI API
- **AI Tooling**: IBM Bob (AI-assisted development environment)

---

## 🚀 How to Run

Follow the exact steps in [`docs/setup-guide.md`](docs/setup-guide.md) to install dependencies and configure your environment.

```bash
cd src
npm install
npm run dev
