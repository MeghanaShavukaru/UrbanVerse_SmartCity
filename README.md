# UrbanVerse SmartCity

UrbanVerse SmartCity is an AI-assisted urban-planning platform for testing city-development proposals before implementation. It combines interactive city zones, deterministic impact simulation, optional Gemini AI, scenario comparison, community perspectives, and presentation-ready decision tools.

## Problem

City decisions about hospitals, parks, transport, flood response, and EV infrastructure are often slow and difficult to explain. Planners need to understand trade-offs across mobility, access, emissions, resilience, public impact, cost, and delivery risk before public money is committed.

UrbanVerse turns a plain-language proposal into a structured planning scenario, measures its likely impact using transparent rules, and presents a clear recommendation.

## Highlights

- Interactive fictional city map with eight planning zones
- Text and browser speech-to-text planning requests
- Gemini-powered request parsing and insight writing
- Deterministic fallback when Gemini is unavailable
- Rule-based impact simulation for traffic, access, carbon, flood risk, and emergency response
- Charts, metrics, AI insights, and PDF report export
- Browser-local scenario history that works without a database
- Decision Studio with alternatives, cost, equity, risk, citizen feedback, and a no-action baseline
- Judge Mode, Demo Guide, City Intelligence, Urban Futures, and Civic Operations modules
- Optional Google Maps provider; Leaflet remains the reliable default

## Application flow

```text
Guest or login
  → Dashboard
  → City Map and zone selection
  → Type or speak a proposal
  → AI parser / deterministic fallback
  → Rule-based simulation
  → Results, charts, insights, and PDF
  → Decision Studio comparison and recommendation
```

## Main routes

| Route | Purpose |
| --- | --- |
| `/login` | Demo, guest, or email/password entry |
| `/dashboard` | City overview and recent scenarios |
| `/dashboard/map` | Map, proposal assistant, simulation, and PDF export |
| `/dashboard/scenarios` | Saved browser or database scenario history |
| `/dashboard/reports` | Reporting entry point |
| `/dashboard/decision-studio` | Option comparison, equity/risk, citizen pulse, and decision brief |
| `/dashboard/demo-guide` | Three-minute hackathon presentation flow |
| `/dashboard/city-intelligence` | Citywide priority and resilience scorecard |
| `/dashboard/futures` | Long-term planning strategy explorer |
| `/dashboard/civic-operations` | Emergency, budget, feedback, and integration-readiness hub |

## Supported simulations

| Action | Example request | Main impact |
| --- | --- | --- |
| Add Hospital | `Build a hospital near the station` | Improves emergency response and accessibility; can increase traffic |
| Add Green Park | `Create a green park here` | Reduces carbon and flood risk; improves access |
| Add EV Station | `Add EV charging stations` | Improves access and lowers carbon score |
| Road Closure | `Close the main road` | Increases traffic pressure and can reduce access |
| Flood Event | `Simulate a flood event` | Tests resilience, flood risk, and emergency response |

## Technology stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling and animation:** Tailwind CSS, Framer Motion, Lucide icons
- **Maps:** Leaflet, OpenStreetMap/CARTO tiles, optional Google Maps JavaScript API
- **AI:** Google Gemini (`@google/genai`)
- **Data:** Prisma 7, PostgreSQL, browser local storage fallback
- **Visualization:** Recharts
- **Reports:** jsPDF
- **Authentication configuration:** Firebase
- **Speech input:** Browser Web Speech Recognition API

## Run locally

### Prerequisites

- Node.js 20 or later
- npm
- Optional: PostgreSQL, Gemini API key, Google Maps API key

### Install and start

```bash
git clone https://github.com/MeghanaShavukaru/UrbanVerse_SmartCity.git
cd UrbanVerse_SmartCity
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run dev` uses webpack explicitly because this project has a custom webpack configuration and Next.js 16 otherwise defaults to Turbopack.

## Environment setup

Copy the template:

```bash
cp .env.example .env.local
```

Configure only the services you need:

```env
# Firebase client configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional Gemini AI integration
GEMINI_API_KEY=

# Optional PostgreSQL persistence
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public

# Optional Google Maps visual provider
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Never commit `.env.local`. It is ignored by Git.

### Gemini behavior

With `GEMINI_API_KEY`, the API uses Gemini to parse proposals and generate written planning insights. Without a usable key, UrbanVerse detects supported keywords and produces deterministic scenario insights so the demo remains functional.

### Google Maps behavior

Google Maps is optional. The built-in Leaflet City Map works without it. To use the Google toggle:

1. Enable **Maps JavaScript API** in Google Cloud.
2. Attach billing to the same project.
3. Create a browser API key.
4. Restrict it to `http://localhost:3000/*` for local development and to the deployed domain in production.
5. Add the key to `.env.local` and restart the server.

## Database setup

UrbanVerse works without PostgreSQL by saving scenarios in the browser. For shared server-side persistence, use PostgreSQL.

```bash
# Ensure DATABASE_URL points to a reachable PostgreSQL server.
npm run db:push
npm run db:seed
```

`db:push` creates the Prisma schema. `db:seed` inserts the predefined city zones. Prisma reads `.env.local` through `prisma.config.ts`.

## Speech-to-text

Microphone controls are available in:

- City Map → AI Planning Assistant after selecting a zone
- Decision Studio → Proposal Copilot

The browser requests microphone permission. Chrome and Edge generally provide the best support. Typed input is always available if speech recognition is not supported.

## Design and demo features

### Decision Studio

Compare a balanced mobility corridor, green-street alternative, capacity-first option, and a do-nothing baseline. Each option includes cost, timeline, impacts, equity considerations, risk, citizen perspectives, and an explainable decision score.

### City Intelligence

Ranks zones by a transparent composite priority score based on traffic, carbon, flood risk, and accessibility gaps.

### Urban Futures

Select a planning strategy and a 1–10 year horizon to illustrate how mobility, climate, access, and resilience could improve over time. This is an explainable presentation scenario, not a real-world forecast.

### Civic Operations

Provides a demo-ready emergency priority queue, budget selector, local public-feedback capture, and status for future traffic, weather, air-quality, translation, and collaboration integrations.

## Validation

```bash
npm run lint
npm run build
npx prisma validate
```

## Deploy

Vercel is recommended for the Next.js application. Use Neon PostgreSQL or Supabase PostgreSQL for a hosted database.

```text
GitHub → Vercel → UrbanVerse application
                 ↓
       Neon or Supabase PostgreSQL
```

In Vercel, add the same environment variables configured in `.env.local`. Replace any `localhost` database URL with a hosted PostgreSQL connection string before deploying.

## Demo script

1. Open the app and choose **Continue as Guest — Voice Ready**.
2. Open **City Map** and select **Railway Hub**.
3. Speak or type: `Build a hospital near the Railway Hub while protecting accessibility and emissions.`
4. Parse and run the simulation.
5. Show animated impacts, charts, and planning insights.
6. Export the PDF report.
7. Open **Decision Studio** to compare alternatives, citizen pulse, equity, risks, and recommendation.
8. Use **Judge Mode** for the final presentation.

## Production note

Guest login, browser-local scenarios, and deterministic fallback are intentional hackathon/demo features. Before production deployment, enforce real authentication, use a managed database, add authorization rules, protect all API keys, and connect verified live-data providers.
