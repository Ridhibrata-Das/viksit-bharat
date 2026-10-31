# Viksit Bengal Dashboard & $1 Trillion Economy Platform

An open-governance, real-time econometric and policy accountability platform tracking **141 state policy commitments** across **15 developmental sectors** and **23 districts of West Bengal**, measuring live trajectory toward a **$1 Trillion USD GSDP** by 2033 (and a secondary milestone of **$5 Trillion USD / ₹425 Lakh Cr by 2047**).

> 📖 **Master Documentation:** For complete architecture diagrams, API schemas, developer extension guides, deployment tutorials, and the 2026–2033 roadmap, see [**`DOCUMENTATION.md`**](./DOCUMENTATION.md).  
> 🌐 **Hostinger Deployment:** For deploying onto Hostinger Shared / Cloud hosting with Node.js and MySQL, see [**`HOSTINGER_DEPLOYMENT_GUIDE.md`**](./HOSTINGER_DEPLOYMENT_GUIDE.md).

---

## Key Highlights & Features

- **Autonomous Daily Delta & Zero-Cost Live Verification:** Automatically computes daily changes (`Asia/Kolkata` timezone) across verified public feeds (**PIB Kolkata**, **West Bengal Extraordinary Gazette**, **CAG Audits**, **WBIDC**, **Tea Board**) + **Gemini (`@google/genai`) Search Grounding**—without requiring paid third-party scraping APIs.
- **Dual Authentication & Enterprise RBAC:** Combines client-side Firebase Google Sign-In with server-side HMAC-SHA256 signed JSON Web Tokens (`AuthGuard`) protecting all mutation routes across `ADMIN`, `RESEARCHER`, and `PUBLIC` roles.
- **Hostinger Unlimited Native & MySQL Ready:** Pre-configured with Prisma MySQL schema, resilient database health proxy, standalone entry point (`start.js`), and PM2 cluster support (`ecosystem.config.js`).
- **Real-Time Econometric & Visual Analytics Hub (`Recharts`):**
  - **8-Card Live Executive Telemetry Strip** with 15-second live stream polling.
  - **2024–2033 $1T GSDP Multi-Scenario `AreaChart`** (Conservative `$750B`, Base Case `$1,000B`, Ambitious `$1,250B`, and Live Policy Impulse).
  - **Annual Infrastructure Capex vs. Nominal INR GSDP `ComposedChart`**.
  - **15-Sector Sanctioned vs. Disbursed Outlay & Stacked Lifecycle `BarChart`** + complete 15-sector financial matrix table.
  - **14-Day Rolling Verification Velocity & Source Tier `PieChart`**.
  - **6-Zone & 23-District Spatial Econometric `RadarChart` + `ComposedChart`**.
- **Admin & Researcher CMS Governance Portal (`/admin`):**
  - Pre-authenticated instant access with one-click role switching (`ADMIN`, `RESEARCHER`, `JWT Login`).
  - **Live Promise Lifecycle Manager:** Filter by keyword, sector, or status; transition any commitment (`Announced → In Progress → Delivered`) with one click and watch all charts recalculate immediately.
  - **Promise vs. Results CSV Exporter:** Export the filtered promise dataset (`code`, `title`, `titleBn`, `status`, `sector`, `resultCompletionPct`, `verifiedEvidenceCount`, `sanctionedOutlayCr`, `latestResultMilestone`, `districtsCovered`, `responsibleDepartment`, `lastVerifiedDate`) as a UTF-8 BOM CSV report.
  - **Evidence Audit Moderation Queue & Live Source Scraper Telemetry**.
- **Bilingual (`English` & `বাংলা`) + WCAG 2.2 Level AA Compliant:** 100% translation parity, automatic Bengali numeral conversion (`০–৯`), interactive 23-district Choropleth GIS map with accessible table fallback, and the **Sonar Bondhu** bilingual AI policy assistant.
- **Progressive Web App (PWA) & Mobile Installable:** Full offline capabilities, Web App Manifest (`manifest.json`), multi-resolution maskable icons, Service Worker (`sw.js`) with Cache-First / Network-First / Stale-While-Revalidate caching, custom bilingual install banner (`PwaInstallPrompt`), and offline fallback (`offline.html`).

---

## Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`. The platform runs out-of-the-box with zero paid API keys required; optionally add `GEMINI_API_KEY` to enable live Gemini web grounding or configure `DATABASE_URL` for MySQL:
```bash
cp .env.example .env.local
```

### 3. Run Development Server (Port 3000)
```bash
npm run dev
```
- **Landing Page & Daily Delta:** `http://localhost:3000/en` (or `/bn`)
- **Executive Analytics Dashboard:** `http://localhost:3000/en/dashboard`
- **CMS Governance Portal & CSV Export:** `http://localhost:3000/en/admin`
- **141 Commitments Explorer:** `http://localhost:3000/en/promises`
- **23-District GIS Map & Leaderboard:** `http://localhost:3000/en/districts`
- **$1T Economic Indicators:** `http://localhost:3000/en/indicators`
- **System Health Diagnostics:** `http://localhost:3000/api/health`

---

## Core API Endpoints (Port 3000)

- `GET /api/health` — System diagnostic probe (server uptime, environment, MySQL connection state, live counts).
- `GET /api/auth/me` — Authenticated session user profile and RBAC role.
- `POST /api/auth/login` — JWT authentication (`admin@viksitbengal.gov.in` / `Admin@123`).
- `GET /api/analytics` — Live econometric KPIs, 2024–2033 GSDP series, 15-sector outlays, 14-day velocity, and 6-zone matrices.
- `GET /api/districts` — All 23 West Bengal district profiles and macroeconomic indicators.
- `GET /api/districts/[code]` — District-level detail with localized commitments and evidence.
- `GET /api/scraper/daily-tally` — Daily Delta ledger (`+Δ` new evidence, `+Δ` promises moved, `+₹ Cr` outlay delta) and recent verified citations.
- `POST /api/scraper/run` — Triggers live multi-source RSS + Gemini verification sync.
- `GET / POST / PATCH /api/promises` — Query, register, or transition lifecycle stages of the 141 policy commitments.
- `GET / POST / PATCH /api/evidence` — Query, submit, or moderate Tier 1–3 audit evidence items.
- `POST /api/scraper/citizen-evidence` — Public citizen ground evidence submission.
- `POST /api/chat/query` — Bilingual *Sonar Bondhu* AI policy assistant.
- `GET / POST /api/membership` — Sabai Foundation membership ledger and UPI donation verification.

---

## Verification & Automated Tests

```bash
# TypeScript Type Check
npm run lint

# WCAG 2.2 AA Accessibility & Bilingual Parity Suite (188 checks)
node apps/web/__tests__/wcag-accessibility.test.mjs

# Master 4-Tier E2E Test Suite (151 checks passing in 31ms)
npm run test:e2e
```
