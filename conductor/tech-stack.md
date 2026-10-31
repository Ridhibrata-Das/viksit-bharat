# Tech Stack — Viksit Bengal Dashboard

## 1. Application Architecture
- **Framework**: Next.js 14.2.3 (App Router with bilingual i18n routing via `next-intl`)
- **Runtime**: Node.js v20.18.0+
- **Monorepo**: npm workspaces (`apps/web`, `packages/database`, `packages/shared`)
- **Styling**: Tailwind CSS v3.4 + Radix UI Primitives + Lucide Icons
- **Interactive Geospatial**: Leaflet & React-Leaflet (23 West Bengal district geo-boundaries)
- **Data Visualizations**: Recharts (Macroeconomic trajectories, time-series outlays, sector velocity)

## 2. Backend & Data Layer (Hostinger Unlimited)
- **Database**: MySQL / MariaDB (native on Hostinger Unlimited hPanel) via Prisma 5.22.0
- **Resilient Fallback**: Automatic offline mock proxy with seed data fallback for resilient zero-latency testing
- **Authentication**:
  - Google Sign-In via Firebase Auth (Client SDK)
  - Institutional Credentials via database-backed signed JWT (`HMAC-SHA256`)
  - Server-side RBAC Guard (`apps/web/lib/auth-guard.ts`)
- **AI Engine**: Google Gemini 3.8 Flash (`@google/genai`) + OpenRouter fallback + Local RAG Synthesizer
- **Web Scraper & Ingestion**: Automated Gazette & Government Order intake with Firecrawl API support

## 3. Deployment Specification
- **Hosting Target**: Hostinger Unlimited Web / Cloud Hosting (Node.js Application Manager)
- **Output Mode**: `output: 'standalone'` Next.js bundle
- **Production Port**: 3000 (proxied via Hostinger Nginx / Apache passenger)
