# Stack catalog

Read this file when you reach TP (tech preferences) and again in B6 (stack).

Contents: [Default Stack Profile](#default-stack-profile) · [Layer Catalog](#layer-catalog-options-for-tp) · [Compatibility Check](#compatibility-check)

## Default Stack Profile

Use as the `➡️ Recommendation` in B6. Always state when to deviate. Adjust this table to your team's stack. (The Default Architecture Profile is in [architecture-catalog.md](./architecture-catalog.md).)

| Layer | Default | Choose the alternative when |
|---|---|---|
| Runtime | Bun + TypeScript | Team or host requires Node.js → Node.js LTS |
| Package manager (JS/TS only) | Same tool as the runtime when it has one (Bun) | Team standard or CI images are pnpm/npm/Yarn → keep that; runtime and package manager are separate choices |
| API | Hono (Bun / Cloudflare Workers) | Bun-only & need end-to-end types → ElysiaJS; very high throughput → Go Fiber; PHP team / heavy admin CRUD → Laravel |
| Public web | Next.js App Router (SSR/SSG for SEO) | No SEO needed → React + Vite / Vue |
| Admin dashboard | React + Vite or Vue | Very simple admin → protected routes in the same app |
| UI | shadcn/ui + Tailwind CSS | — |
| Validation & contracts | Zod, shared `contracts` package for FE & BE | — |
| Database | PostgreSQL + Drizzle or Prisma | All-in on Workers → Cloudflare D1 |
| Auth | better-auth | Institutional SSO → OAuth/OIDC |
| Files | Cloudflare R2 / S3-compatible storage | — |
| Notifications | WhatsApp / Telegram Bot / email | — |
| Deploy | Docker + VPS, or Cloudflare | — |

## Layer Catalog (options for TP)

Not exhaustive — the user may type any other technology. Verify that a lesser-known option still exists and is maintained before recommending it.

| Layer | Purpose | Options |
|---|---|---|
| Frontend | UI & user-facing screens | Next.js · React (Vite) · TanStack Start · React Router 7 / Remix · Astro · Vue.js · Nuxt · Svelte · SvelteKit · Solid / SolidStart · Qwik · Angular · HTMX + Server-rendered · Flutter · React Native · Expo (React Native) · SwiftUI (iOS native) · Jetpack Compose (Android native) · Tauri (desktop) · Electron (desktop) |
| Backend | Logic & API server | Node.js (Express/Fastify) · NestJS · Hono · Elysia (Bun) · Bun runtime · Deno · Python (FastAPI/Django) · Go (Fiber/Echo) · Rust (Axum/Actix) · Laravel (PHP) · Ruby on Rails · Java (Spring Boot) · .NET (ASP.NET Core) · Cloudflare Workers · Edge Functions (Vercel/Netlify) · Convex (BaaS) · Supabase (BaaS) · Firebase (BaaS) · Appwrite (BaaS) · Pocketbase (BaaS) |
| Database | Data storage | PostgreSQL · Neon (serverless Postgres) · Supabase (Postgres) · Prisma Postgres · MySQL · PlanetScale (MySQL) · SQLite · Turso (libSQL) · Cloudflare D1 · MongoDB · Firebase / Firestore · Convex · Redis / Upstash · DynamoDB · CockroachDB · ClickHouse (analytics) · Xata |
| Deployment | Hosting & infrastructure | Vercel · Netlify · Cloudflare Pages / Workers · Railway · Render · Fly.io · Koyeb · Northflank · Deno Deploy · AWS (Amplify/ECS/Lambda) · Google Cloud (Cloud Run) · Azure (App Service) · Hetzner Cloud · DigitalOcean (App Platform) · VPS (manual) · Coolify (self-host PaaS) · Docker / Kubernetes (self-host) |

Implicit answers to accept besides the list:
- **Backend = "same as frontend"** when the frontend is full-stack (Next.js Route Handlers / Server Actions, Nuxt server routes, SvelteKit endpoints, TanStack Start server functions, Astro endpoints). Record it as `"<framework> (full-stack)"`.
- **Frontend = "none"** for API-only or bot/integration products.
- **"Bun runtime"** is a runtime, not a framework → follow up: Hono, Elysia, or plain `Bun.serve`?
- **A BaaS backend usually fixes the database** (Supabase → Supabase Postgres, Firebase → Firestore, Convex → Convex, Pocketbase → embedded SQLite, Appwrite → Appwrite's own). Pre-fill the Database layer and confirm instead of asking from scratch.
- **Several frontends are allowed** (e.g. Next.js for the public web + Expo for mobile + React (Vite) for the admin). Record each with its target (`web`, `admin`, `mobile`, `desktop`).
- **The package manager is not a TP layer.** For JS/TS stacks it is asked in B6 as a supporting choice (Bun, pnpm, npm, Yarn). It is independent of the runtime: Bun runtime + pnpm, or Node.js + Bun as installer, are both valid.

## Compatibility Check

Run after TP and again in B6. Each hit becomes a grilling question with a recommended fix.

| If the stack has… | Then check / ask |
|---|---|
| Serverless host (Vercel, Netlify, Cloudflare) + long-running backend (Laravel, Django, Go, Rust, NestJS) | Backend needs a separate host (Railway, Fly.io, Render, VPS/Coolify) or a serverless-compatible runtime. Two deploy targets → confirm. |
| Cloudflare Workers + PostgreSQL / MySQL | Needs a connection pooler/driver that works on Workers (e.g. Hyperdrive or a serverless HTTP driver). Otherwise suggest D1. |
| Serverless host + realtime (chat, live updates) | No persistent WebSockets on most serverless functions → use a managed realtime service or a long-running server. |
| Serverless host + SQLite file | Local files don't persist → use Turso or D1. |
| Frontend and backend are the same framework (e.g. Next.js + Next.js) | Single full-stack app. Ask: will other clients (mobile app, third parties) need a public API? If yes, consider a separate API. |
| Frontend is a SPA (React/Vite, Vue) + public pages need SEO | SPA SEO is weak → suggest Next.js / Nuxt / Astro for public pages, or prerendering. |
| BaaS chosen (Supabase / Firebase) + a separate auth library | Avoid two auth systems — confirm which one owns users and sessions. |
| Supabase / Neon / Prisma Postgres chosen as DB | Confirm which extras (auth, storage, realtime) are used, and plan for vendor lock-in. |
| MongoDB / Firestore + strongly relational data (orders, invoices, stock) or multi-document transactions | Flag the mismatch; recommend a relational DB unless there is a reason. |
| ORM language ≠ backend language (e.g. Prisma with Go) | ORM must match: TS → Drizzle/Prisma; Go → GORM/sqlc; Rust → SeaORM/sqlx; PHP → Eloquent; Python → SQLAlchemy/Django ORM. |
| Self-hosted deploy (VPS, Coolify, Docker/K8s) | Ask who handles backups, TLS, monitoring, updates. Kubernetes for a small app → flag as over-engineering. |
| Users mostly in one region (e.g. Indonesia) | Pick a host/DB region close to users (e.g. Singapore/Jakarta) and keep app and DB in the same region. |
| Budget is free/minimal | Check free-tier limits of the chosen host and DB (sleeping instances, connection limits, storage caps). |
| Mobile frontend (Flutter, React Native, Expo, SwiftUI, Jetpack Compose) | Needs a real API (not Server Actions only); auth must work for mobile (tokens, not cookie-only). The Deployment layer covers the backend only → also ask about app distribution (App Store / Play Store, OTA updates, review lead time). |
| Desktop frontend (Tauri, Electron) | Ask about installers, auto-update, code signing, and offline behaviour. Tauri means Rust in the toolchain. |
| HTMX + Server-rendered | The backend renders HTML (Laravel, Rails, Django, Go, Spring, ASP.NET). A JS full-stack framework on top is redundant → confirm. |
| Backend = Cloudflare Workers or Edge Functions | Deployment is fixed to that platform; check CPU-time limits, no native Node modules, DB reached over HTTP or a pooler. Long jobs → queue or a separate worker. |
| Backend = Deno and Deployment ≠ Deno Deploy (or the reverse) | Confirm the runtime is supported on the chosen host. |
| BaaS backend (Convex, Supabase, Firebase, Appwrite, Pocketbase) + a different Database choice | Usually a contradiction — the BaaS owns the data. Confirm whether a second database is really needed. |
| Pocketbase or SQLite + horizontal scaling / serverless host | Single-node, file-based → needs one persistent server with a volume and backups. |
| DynamoDB / Firestore / MongoDB + reporting or ad-hoc queries | Access patterns must be designed up front; ask about reporting needs. |
| ClickHouse or Redis / Upstash as the only database | These are analytics / cache stores, not a primary OLTP database → add a primary DB. |
| Ruby on Rails, Spring Boot, ASP.NET Core, Django, Laravel on Vercel / Netlify / Deno Deploy | Not a fit for those hosts → container host (Railway, Render, Fly.io, Koyeb, Northflank, Cloud Run, VPS/Coolify). |
