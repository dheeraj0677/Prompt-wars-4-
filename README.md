# ⚡ FanPulse — GenAI-Powered Stadium Operations & Fan Experience Platform

> **FIFA World Cup 2026** | Every fan question becomes an ops signal.

![FanPulse](https://img.shields.io/badge/FanPulse-FIFA%20World%20Cup%202026-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-orange?style=flat-square)

---

## 🏟️ Problem Statement

Large stadium events like the FIFA World Cup 2026 (spanning USA, Canada, and Mexico) create two parallel problems:

1. **Fans** need instant, localized help — navigation, translation, accessibility info, transport — in a chaotic, multilingual crowd with dozens of languages
2. **Organizers** need real-time situational awareness across dozens of touchpoints (gates, concourses, restrooms, transit) without waiting on manual reports

**FanPulse** solves both with one system using the **same underlying signal**: live fan interactions.

---

## 💡 Solution Overview

**One-liner:** *Every fan question becomes an ops signal.*

FanPulse combines a **multilingual AI concierge** for fans with a **real-time operational intelligence dashboard** for venue staff. Fan queries are silently tagged with intent category and zone, creating a live data pipeline that surfaces crowding, confusion, and facility issues before they become physical bottlenecks.

---

## 🖥️ Screenshots

### Fan View — Multilingual AI Concierge
- Chat assistant supporting English, Spanish, Portuguese, French, and Arabic
- Interactive SVG stadium map with live congestion colors
- Contextual quick-info cards (fastest exit, accessibility, transport)
- Proactive crowd-flow nudges when zones get busy

### Staff View — Operational Intelligence Dashboard
- 4 KPI cards: Active Fans, Query Volume, Response Latency, Anomalies
- 9-zone heatmap with real-time query density
- Trending issues table with velocity tracking
- AI Staff Analyst for natural-language ops queries
- Auto-detected anomaly alerts
- AI-generated shift briefing & forecast

---

## 🤖 How GenAI is Used

All AI calls use **Claude claude-sonnet-4-6** via `api.anthropic.com/v1/messages`:

| # | Claude Call | What It Does |
|---|------------|--------------|
| 1 | **Fan Concierge** | Auto-detects language, responds in kind with contextual stadium directions |
| 2 | **Intent Tagger** | Extracts `{intent, zone, language, urgency}` from each fan message as structured JSON |
| 3 | **Staff Analyst** | Synthesizes operational answers from aggregated query data for supervisors |
| 4 | **Shift Summary** | Generates plain-language ops briefing from time-bucketed query logs |
| 5 | **Crowd Nudge** | Proactively suggests less congested alternatives when fan's zone is "hot" |

> All calls include graceful mock fallbacks for demo scenarios when the API is unavailable.

---

## 🏗️ Architecture

```
Fan Chat Input ──→ Claude API ──→ Response + Intent/Zone Tag
                                        │
                                        ▼
                                  Query Store (React Context)
                                        │
           ┌────────────────────────────┤
           ▼                            ▼
  Fan Map/Sidebar updates      Staff Dashboard aggregates
  (congestion colors,           (heatmap, trends, anomalies)
   proactive nudges)                    │
                                        ▼
                                 Claude API (shift summary,
                                  staff Q&A, anomaly analysis)
```

A **synthetic query simulator** generates fan queries every 3–8 seconds in 5 languages across 10 intent categories, feeding the dashboard with live data even with a single demo user.

---

## 📊 Impact Framing

| Impact Area | How FanPulse Helps |
|---|---|
| **Faster Incident Detection** | Query spike patterns surface issues (facility failures, congestion, safety) minutes before physical reports |
| **Reduced Staff Overhead** | AI shift summaries replace manual walkie-talkie intel gathering |
| **Better Accessibility Compliance** | Every accessibility query is tracked, ensuring coverage gaps are identified |
| **Lower Carbon Impact** | Crowd-flow nudges reduce localized funneling inefficiency, distributing foot traffic more evenly |
| **Multilingual Inclusion** | 5-language support ensures no fan is left without help |

---

## 🚀 Scalability Notes

- **Multi-venue**: Zone data is config-driven — swap `stadium.js` for any venue
- **Multi-language**: Language weights and templates are extensible; add new languages without code changes
- **Real IoT/Sensor Fusion**: In production, replace synthetic simulator with real-time feeds from turnstiles, Wi-Fi density sensors, BLE beacons, and POS systems
- **Edge Deployment**: Intent tagging could run on-device for sub-100ms response times
- **Historical Analytics**: Query logs enable post-event analysis for future venue optimization

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 8
- **Styling**: Custom CSS design system (700+ lines, no Tailwind/Bootstrap)
- **AI**: Claude claude-sonnet-4-6 via Anthropic API
- **State**: React Context + useReducer
- **Design**: Dark stadium-ops aesthetic with glassmorphism, micro-animations, high-contrast typography

---

## 📁 Project Structure

```
src/
├── data/
│   ├── stadium.js           # 9 zones with adjacency, amenities, accessibility, transport
│   └── simulator.js         # Synthetic query generator (5 languages, 10 intents)
├── store/
│   └── queryStore.jsx       # Central state: queries, zone stats, anomaly detection, trending
├── services/
│   ├── prompts.js           # System prompts for all 5 Claude call types
│   └── ai.js                # Claude API service + mock fallbacks
├── components/
│   ├── Header.jsx           # Shared header with view toggle, branding, live badge
│   ├── Fan/
│   │   ├── FanView.jsx      # Two-column layout
│   │   ├── ChatPanel.jsx    # Multilingual chat with crowd nudge
│   │   ├── StadiumMap.jsx   # Interactive SVG map
│   │   └── Sidebar.jsx      # Context cards, map, schedule, transport
│   └── Staff/
│       ├── StaffView.jsx    # Dashboard layout
│       ├── KPIBar.jsx       # 4 live metric cards
│       ├── Heatmap.jsx      # Zone query density grid
│       ├── TrendingTable.jsx# Topic cluster table with velocity
│       ├── StaffChat.jsx    # AI analyst for supervisors
│       ├── AnomalyCards.jsx # Auto-detected spike alerts
│       └── ShiftPulse.jsx   # Hourly chart + AI shift briefing
├── App.jsx                  # Root with QueryProvider + view routing
├── main.jsx                 # Entry point
└── index.css                # Complete design system
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app runs at `http://localhost:5173/`.

---

## 📄 License

Built for the Prompt Wars 4 hackathon. © 2026.
