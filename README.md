# ⚡ FanPulse — GenAI-Powered Stadium Operations & Fan Experience Platform

> **FIFA World Cup 2026** | Every fan question becomes an ops signal.

![FanPulse](https://img.shields.io/badge/FanPulse-FIFA%20World%20Cup%202026-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-orange?style=flat-square)

---

## 🎯 Chosen Vertical

**Smart Event & Stadium Operations Assistant**

FanPulse is a GenAI-powered stadium assistant that serves two audiences simultaneously:
1. **Fans** — a multilingual AI concierge that provides real-time, location-aware help (navigation, accessibility, transport, food, safety) in 5 languages
2. **Venue Staff** — a real-time operational intelligence dashboard that converts fan interaction data into actionable situational awareness

The core insight: **every fan question is also an operational signal**. A spike in restroom queries near Section 108 means a possible facility failure. A cluster of wayfinding queries at Gate A means signage is confusing. FanPulse captures both sides of this signal simultaneously.

---

## 💡 Approach and Logic

### Design Philosophy

FanPulse uses a **dual-loop architecture** where a single data stream (fan queries) powers two parallel systems:

1. **Fan Loop (Outward)**: Fan asks a question → AI responds in their language with contextual, location-aware help → fan gets instant assistance
2. **Ops Loop (Inward)**: Same query is silently tagged with `{intent, zone, language, urgency}` → fed into a real-time analytics pipeline → surfaces patterns, anomalies, and crowd-flow intelligence for staff

### Decision-Making Logic

| Decision Point | Logic |
|---|---|
| **Language Detection** | Auto-detect from input using character analysis (Arabic script, diacritical marks for Spanish/Portuguese/French) + keyword patterns |
| **Intent Classification** | 10-category taxonomy (wayfinding, accessibility, transport, food_drink, restroom, safety, emergency, lost_found, schedule, general) using regex pattern matching + Claude AI structured tagging |
| **Zone Awareness** | Fan's current location + mentioned zones are cross-referenced against a 9-zone stadium graph with adjacency data |
| **Congestion Response** | When a fan's zone hits "high" or "critical" query density, the system proactively nudges them to less crowded adjacent zones |
| **Anomaly Detection** | Rolling 5-minute window compares per-zone query counts against the stadium average. Zones exceeding 2.5x the mean trigger typed alerts (VOLUME SPIKE, FACILITY ISSUE, SAFETY ALERT, FLOW BREACH) |
| **Predictive Crowd Flow** | Uses current query velocity (rate of change) to project zone loads 15 and 30 minutes ahead |

### GenAI Integration (5 Claude API Calls)

| # | Claude Call | Purpose |
|---|---|---|
| 1 | **Fan Concierge** | Multilingual response with stadium context, directions, and accessibility info |
| 2 | **Intent Tagger** | Extracts structured JSON `{intent, zone, language, urgency}` from each fan message |
| 3 | **Staff Analyst** | Synthesizes natural-language operational answers from aggregated query data |
| 4 | **Shift Summary** | Generates time-stamped ops briefing from query logs |
| 5 | **Crowd Nudge** | Proactively suggests less congested alternatives when fan's zone is "hot" |

> All AI calls include graceful mock fallbacks — the app is fully functional even without an API key.

---

## 🖥️ How the Solution Works

### Step-by-Step Flow

```
1. Fan opens FanPulse → Multilingual AI concierge greets them
2. Fan sends a message (in any of 5 languages)
      ↓
3. Message is sent to Claude API with:
   - System prompt containing full stadium map, zone adjacency, amenities
   - Fan's current GPS/selected location
   - Current congestion data for crowd-flow context
      ↓
4. Claude responds with:
   - Line 1: Structured JSON {intent, zone, language, urgency}
   - Line 2+: Natural language response in detected language
      ↓
5. Response is displayed to the fan (concierge chat)
   AND the intent/zone tag is injected into the Query Store
      ↓
6. Query Store aggregates all queries (fan + simulated) in real-time:
   - Per-zone query counts (rolling 5-min window)
   - Intent distribution across the stadium
   - Language demographics
   - Velocity tracking (rate of change per zone)
      ↓
7. Staff Dashboard consumes this aggregated data:
   - Live heatmap shows zone congestion
   - Trending table surfaces rising issues
   - Anomaly detector flags unusual spikes
   - AI shift briefing summarizes operations
   - Predictive crowd flow forecasts 15/30 min ahead
```

### Architecture Diagram

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

### Key Features

**Fan View:**
- 💬 Multilingual AI chat concierge (EN/ES/PT/FR/AR)
- 🗺️ Interactive SVG stadium map with live congestion colors
- 🧭 Quick-info cards (fastest exit, accessibility, transport)
- 📢 Proactive crowd-flow nudges when zones get busy
- ⚽ Live match center with scores and timeline
- 🍔 Food pre-ordering with dietary filter support
- 🎮 Fan engagement features (polls, predictions, AR)

**Staff View:**
- 📊 4 KPI cards (Active Fans, Query Volume, Response Latency, Anomalies)
- 🔥 9-zone heatmap with real-time query density
- 📈 Trending issues table with velocity tracking
- 🤖 AI Staff Analyst for natural-language ops queries
- 🚨 Auto-detected anomaly alerts with severity typing
- 📋 AI-generated shift briefing & forecast
- 🔮 Predictive crowd flow with 15/30 min forecasts
- 🎟️ Ticket analytics & seating visualization
- 📱 Social media sentiment tracking
- 💰 Revenue dashboard
- 👥 Resource allocation management

**Analytics View:**
- 📈 Historical comparison across matches
- 🌍 Language distribution analytics
- ⚡ Performance metrics
- ♿ Accessibility compliance dashboard

---

## 🧩 Assumptions Made

1. **Demo Mode**: The app runs with a synthetic query simulator that generates fan queries every 3–8 seconds in 5 languages across 10 intent categories. This simulates a live stadium environment for evaluation purposes.

2. **API Fallback**: The Claude API key is loaded from environment variables (`VITE_ANTHROPIC_API_KEY`). When unavailable, the app falls back to high-quality mock responses that demonstrate the full interaction flow. Evaluators do not need an API key to test.

3. **Stadium Configuration**: Zone data (9 zones with adjacency, amenities, accessibility, transport) is config-driven. In production, this would be swapped per venue — the same codebase works for any stadium.

4. **Client-Side Architecture**: All processing happens in the browser (React Context + useReducer). In production, the Query Store would be backed by a real-time database (Firebase/Supabase) with server-side aggregation.

5. **Language Detection**: Uses heuristic character-pattern analysis rather than a dedicated NLP model. This is sufficient for the 5 supported languages but would need improvement for closely related language pairs.

6. **Security**: API calls go through `api.anthropic.com` directly from the browser using the `anthropic-dangerous-direct-browser-access` header. In production, this would be routed through a backend proxy to avoid exposing API keys. Input sanitization and rate limiting are implemented client-side.

7. **Accessibility**: The app follows WCAG 2.1 guidelines with ARIA attributes, keyboard navigation, semantic HTML, and skip-to-content navigation. Screen reader support is implemented for all interactive elements.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Custom CSS design system (700+ lines, no Tailwind/Bootstrap) |
| **AI** | Claude Sonnet 4 via Anthropic API |
| **State** | React Context + useReducer |
| **Testing** | Vitest |
| **Design** | Dark stadium-ops aesthetic with glassmorphism, micro-animations, high-contrast typography |

---

## 📁 Project Structure

```
src/
├── data/
│   ├── stadium.js           # 9 zones with adjacency, amenities, accessibility, transport
│   ├── simulator.js         # Synthetic query generator (5 languages, 10 intents)
│   ├── matchData.js         # Live match data (scores, timeline, stats)
│   ├── socialData.js        # Social media feed simulation
│   └── sections.js          # Extended section data
├── store/
│   └── queryStore.jsx       # Central state: queries, zone stats, anomaly detection, trending
├── services/
│   ├── prompts.js           # System prompts for all 5 Claude call types
│   └── ai.js                # Claude API service + mock fallbacks + input sanitization
├── components/
│   ├── ErrorBoundary.jsx    # Graceful error handling
│   ├── Header.jsx           # Shared header with view toggle, branding, live badge
│   ├── Fan/
│   │   ├── FanView.jsx      # Tab layout (Concierge, Match, Engage, Order)
│   │   ├── ChatPanel.jsx    # Multilingual chat with crowd nudge + ARIA
│   │   ├── StadiumMap.jsx   # Interactive SVG map with keyboard navigation
│   │   ├── Sidebar.jsx      # Context cards, map, schedule, transport
│   │   ├── MatchCenter.jsx  # Live scores, timeline, player stats
│   │   ├── FanEngagement.jsx # Polls, predictions, AR experiences
│   │   └── FoodPreOrder.jsx # Pre-order food with dietary filters
│   ├── Staff/
│   │   ├── StaffView.jsx    # Dashboard layout with 6 sub-tabs
│   │   ├── KPIBar.jsx       # 4 live metric cards
│   │   ├── Heatmap.jsx      # Zone query density grid
│   │   ├── TrendingTable.jsx# Topic cluster table with velocity
│   │   ├── StaffChat.jsx    # AI analyst for supervisors
│   │   ├── AnomalyCards.jsx # Auto-detected spike alerts
│   │   ├── ShiftPulse.jsx   # Hourly chart + AI shift briefing
│   │   ├── PredictiveFlow.jsx # AI crowd flow forecasting
│   │   ├── TicketAnalytics.jsx # Seat occupancy analytics
│   │   ├── WeatherPanel.jsx # Weather impact on operations
│   │   ├── RevenueDashboard.jsx # Revenue tracking
│   │   ├── IncidentBoard.jsx # Incident management
│   │   ├── SocialSentiment.jsx # Social media monitoring
│   │   └── ResourceAllocation.jsx # Staff resource management
│   ├── Analytics/
│   │   ├── AnalyticsView.jsx # Analytics sub-navigation
│   │   ├── HistoricalComparison.jsx
│   │   ├── LanguageAnalytics.jsx
│   │   ├── PerformanceMetrics.jsx
│   │   └── AccessibilityDashboard.jsx
│   └── Shared/
│       └── StadiumBowlHeatmap.jsx # Reusable 3D bowl visualization
├── App.jsx                  # Root with QueryProvider + ErrorBoundary + view routing
├── main.jsx                 # Entry point
└── index.css                # Complete design system
```

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/dheeraj0677/Prompt-wars-4-.git
cd Prompt-wars-4-

# Install dependencies
npm install

# (Optional) Configure Claude API key
cp .env.example .env
# Edit .env and add your VITE_ANTHROPIC_API_KEY

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The app runs at `http://localhost:5173/`. No API key is required — the app uses intelligent mock fallbacks.

---

## ☁️ Deploy to Render

FanPulse comes pre-configured for a zero-downtime deployment on Render. 

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the **Deploy to Render** button above.
2. Render will automatically detect the `render.yaml` blueprint.
3. Provide an optional `VITE_ANTHROPIC_API_KEY` when prompted in the Render dashboard (the app works with mock fallbacks without it).
4. Render will build and deploy the application as a Static Site.

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

## 📄 License

Built for the Prompt Wars 4 hackathon. © 2026.
