# Momentum

**A personal habit tracker with streaks, AI coaching, and subscription billing.**

Momentum helps you build consistency one day at a time. Mark habits as done, watch your chain grow, get AI-powered suggestions, and manage Pro plans with Stripe or SSLCommerz — all in a clean, mobile-friendly app with separate Customer and Admin experiences.

---

## Description

Momentum is a full-stack habit tracking product designed for real daily use. Users create build/break habits, log check-ins on a Today view, review heatmaps and stats, and chat with an AI coach that can draft new habits. Admins manage users, plans, payments, and AI prompts from a dedicated console.

The frontend is a Next.js App Router app with a BFF auth layer (secure httpOnly refresh cookies). The backend is an Express API with Prisma, PostgreSQL, Redis, and background workers — deployed separately for production.

> Built as a portfolio project to demonstrate end-to-end product engineering: auth, roles, billing, AI integration, and polished UX.

---

## Tech Stack

### Frontend
| Layer | Technology |
|--------|------------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, Tailwind CSS 4, Framer Motion |
| Data | **TanStack Query** |
| Auth (BFF) | Next.js Route Handlers + httpOnly cookies |
| Payments UI | Stripe + SSLCommerz checkout flows |
| Language | **TypeScript** |

### Backend
| Layer | Technology |
|--------|------------|
| API | **Express 5**, Zod validation |
| Database | **PostgreSQL** + **Prisma** |
| Cache / Jobs | **Redis**, BullMQ worker |
| Auth | JWT access tokens, refresh rotation, Google OAuth |
| AI | Google Generative AI (Gemini) |
| Payments | Stripe, SSLCommerz |
| Realtime | Socket.IO |

### Deployment
- **Frontend:** [Vercel](https://vercel.com)
- **Backend:** [Render](https://render.com) — `https://momentum-backend-czgu.onrender.com`

---

## Key Features

### For customers
- **Today view** — daily habit checklist with streaks and progress
- **Habit management** — create, schedule, archive; build or break habits
- **Stats & heatmaps** — completion rates and year-style chain visuals
- **AI coach** — floating chat, habit suggestions, create-habit from conversation
- **Reminders & notifications** — stay on track across devices
- **Subscriptions** — Free / Pro (year & lifetime) with Stripe or SSLCommerz
- **Google Sign-In** — one-tap login alongside email/password
- **Dark / light theme** — system-aware, persistent preference

### For admins
- **User & subscription management**
- **Payment & revenue overview**
- **Plan catalog** — publish and manage pricing
- **AI prompt management** — tune chat, suggestions, and create-habit prompts

### Engineering highlights
- Role-based navigation (Customer vs Admin)
- Secure auth BFF (refresh token never exposed to JS)
- Entitlements for Pro features (AI, unlimited habits, richer stats)
- Demo seed accounts for quick walkthroughs

---

## Demo Accounts

After seeding the backend:

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@momentum.app` | `password123` |
| Admin | `admin@momentum.app` | `password123` |

On the login page (non-production), use **Quick demo access** to sign in with one click.

---

## Getting Started

### Prerequisites
- **Node.js 20+**
- A running Momentum API (local or hosted)
- Optional: Google OAuth client ID for Sign-In

### 1. Clone & install

```bash
git clone <your-frontend-repo-url>
cd momentum-frontend
npm install
```

### 2. Configure environment

Copy the example file and set your API origin:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=https://momentum-backend-czgu.onrender.com
BACKEND_URL=https://momentum-backend-czgu.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

For a local backend, use `http://localhost:4000` instead.

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. (Optional) Seed demo data on the backend

From the `momentum-backend` repo:

```bash
npm run db:seed
```

Then sign in with the demo customer or admin accounts above.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Deploy on Vercel

1. Import this repo in [Vercel](https://vercel.com/new).
2. Set environment variables:

```env
NEXT_PUBLIC_API_URL=https://momentum-backend-czgu.onrender.com
BACKEND_URL=https://momentum-backend-czgu.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

3. Deploy.

### Backend CORS / app URL

On Render (or your API host), set:

```env
APP_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
API_URL=https://momentum-backend-czgu.onrender.com
```

Add your Vercel URL to **Google Cloud Console → Authorized JavaScript origins** if you use Google Sign-In.

---

## Project Structure

```text
momentum-frontend/
├── app/                    # Next.js App Router pages & API BFF
│   ├── (app)/              # Authenticated app (dashboard, habits, admin…)
│   ├── (auth)/             # Login, register, password flows
│   ├── (checkout)/         # Billing checkout
│   └── api/auth/           # Auth BFF (session cookies)
├── components/             # UI: habits, AI chat, billing, admin, marketing
├── lib/                    # API clients, hooks, auth, billing helpers
├── providers.tsx           # Query + auth providers
└── proxy.ts                # Protected route session gate
```

---

## Screenshots

<!-- Add portfolio screenshots here -->
<!-- Suggested: Today view · Habit detail · AI chat · Pricing · Admin dashboard -->

| Today | AI coach | Admin |
|-------|----------|-------|
| _Add screenshot_ | _Add screenshot_ | _Add screenshot_ |

---

## Resume / Portfolio Blurb

**Momentum** — Full-stack habit tracker (Next.js, Express, Prisma, Redis). Built daily check-ins with streaks, role-based Customer/Admin apps, Gemini AI coaching, and Stripe/SSLCommerz subscriptions. Deployed frontend on Vercel and API on Render.

---

## License

Private / portfolio project. All rights reserved unless otherwise noted.
