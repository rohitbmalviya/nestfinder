# 🏡 NestFinder — Real Estate Listing Marketplace

A full-stack property portal: buyers and renters search listings with rich filters, view galleries and location maps, save favourites and send enquiries, while agents post and manage listings from a dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8)

---

## ✨ Features

- 🔎 **Property search** — filters for buy/rent, type, city, price range, bedrooms, plus sorting
- 🖼️ **Image galleries** — lightbox viewer on every listing
- 🗺️ **Location maps** — OpenStreetMap embeds, no API keys required
- ❤️ **Favourites & enquiries** — save properties and message agents
- 🧑‍💼 **Agent dashboard** — manage listings, track enquiries, view analytics
- 🔐 **Role-based auth** — JWT sessions with Buyer / Agent roles, enforced in middleware

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript 5 |
| UI | Tailwind CSS v4 · shadcn/ui · Recharts |
| Maps | OpenStreetMap embed (keyless) |
| Database | Prisma 7 ORM · SQLite via libSQL (swappable to PostgreSQL) |
| Auth | Custom JWT (`jose`) + `bcryptjs` — route protection in `src/proxy.ts` |

## 📋 Prerequisites

| Tool | Version | Why |
|---|---|---|
| **Node.js** | **20.19+, 22.12+, or 24+** | Prisma 7 refuses to install on older versions (e.g. 20.18 fails) |
| **pnpm** | 9+ | Package manager used by this repo |

> 💡 Using **nvm**? The repo has a `.nvmrc`, so just run `nvm use` inside the project folder (run `nvm install 24` first if needed).

## 🚀 Setup (step by step)

**1. Clone and enter the project**

```bash
git clone <repo-url>
cd nestfinder
```

**2. Use the right Node version**

```bash
nvm use          # reads .nvmrc → Node 24
node -v          # verify: should print v24.x (or 20.19+/22.12+)
```

**3. Install dependencies**

```bash
pnpm install
```

**4. Create your environment file**

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Keep the default `file:./prisma/dev.db` for local SQLite |
| `AUTH_SECRET` | ✅ | JWT signing secret — generate one with `openssl rand -base64 32` |

**5. Create the database and load demo data**

```bash
pnpm db:migrate   # applies Prisma migrations (creates prisma/dev.db)
pnpm db:seed      # loads 4 users, 15 properties with 57 images, favourites & enquiries
```

**6. Start the dev server**

```bash
pnpm dev
```

Open **http://localhost:3000** 🎉

## 🔑 Demo accounts

| Role | Email | Password |
|---|---|---|
| Agent | `rahul.verma@nestfinder.dev` | `Agent@1234` |
| Agent | `sneha.joshi@nestfinder.dev` | `Agent@5678` |
| Buyer | `priya.sharma@example.com` | `User@1234` |
| Buyer | `arjun.mehta@example.com` | `User@5678` |

## 📜 Available scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:generate` | Regenerate the Prisma client (into `src/generated/prisma`) |
| `pnpm db:reset` | ⚠️ Drop, recreate, and re-migrate the database |

## 🗂 Project structure

```
nestfinder/
├── prisma/
│   ├── schema.prisma      # User, Property, PropertyImage, Favorite, Enquiry
│   └── seed.ts            # Demo data
├── src/
│   ├── app/
│   │   ├── properties/    # Public: search + listing detail pages ([slug])
│   │   ├── favorites/     # Buyer: saved properties (login required)
│   │   ├── agent/         # Agent portal: listings & enquiries
│   │   ├── login/ · register/
│   │   ├── layout.tsx     # Root layout: fonts, SEO metadata
│   │   ├── manifest.ts    # PWA manifest · robots.ts / sitemap.ts for SEO
│   │   └── icon.svg       # Favicon (+ favicon.ico, apple-icon.png)
│   ├── components/        # UI (shadcn) + layout components
│   ├── lib/
│   │   ├── actions/       # Server actions: properties, favorites, enquiries, agent
│   │   ├── auth.ts        # Password hashing, JWT
│   │   ├── session.ts     # Session helpers
│   │   └── db.ts          # Prisma client
│   └── proxy.ts           # Route protection (Next 16 middleware)
└── .env.example           # Environment variable reference
```

**Access rules** (enforced in `src/proxy.ts`): home and `/properties` are public · `/favorites` requires login · `/agent` requires the Agent role.

## 🌐 SEO

- Open Graph + Twitter card metadata in `layout.tsx` (link previews on WhatsApp/LinkedIn/X)
- `robots.ts` — private areas (`/favorites`, `/agent`) excluded from indexing
- `sitemap.ts` — **dynamic**: every ACTIVE property listing is included automatically, so new listings get indexed without code changes
- Full favicon set: SVG + multi-size `.ico` + apple-touch + Android/PWA icons via `manifest.ts`

## 🔧 Troubleshooting

**`Prisma only supports Node.js versions 20.19+, 22.12+, 24.0+` during `pnpm install`**
Your Node is too old. Run `nvm use` (or `nvm install 24 && nvm use 24`) and reinstall.

**Login/session issues after changing `AUTH_SECRET`**
Old session cookies become invalid — just log in again.

**`Error: @prisma/client did not initialize yet`**
Run `pnpm db:generate`, then restart the dev server.

## ☁️ Deployment

Deploys cleanly to **Vercel**:

1. Switch the Prisma datasource to PostgreSQL (Neon/Supabase) — SQLite files don't persist on serverless
2. Set env vars: `DATABASE_URL` and `AUTH_SECRET`
3. Update the placeholder domain (`nestfinder.example.com`) in `src/app/layout.tsx`, `robots.ts`, and `sitemap.ts`, then submit the sitemap in [Google Search Console](https://search.google.com/search-console)

---

Built by **Rohit Malviya** — full-stack developer.
