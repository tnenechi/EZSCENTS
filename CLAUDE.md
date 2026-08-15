# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

EzScents (branded "Secret Scents" in user-facing text/emails) is a luxury fragrance e-commerce site: React/TypeScript SPA client + Express/TypeScript/MongoDB server. There is no root `package.json` — `client/` and `server/` are independent npm projects with no shared tooling, run separately.

## Commands

All commands run from within `client/` or `server/` respectively — there is no root-level script runner.

### Client (`client/`)
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — type-check (`tsc -b`) then `vite build`
- `npm run lint` — ESLint over the whole project
- `npm run preview` — preview a production build

No test suite/framework is configured for the client.

### Server (`server/`)
- `npm run dev` — `ts-node-dev` with `--respawn --transpile-only` against `src/index.ts` (default port 5000)
- `npm run build` — `npm install --include=dev && tsc` (compiles `src/` → `dist/`)
- `npm start` — runs the compiled `dist/index.js` (production)

`npm test` is a stub (`no test specified`) — there is no test suite for the server either.

## Architecture

### Two independent apps, cookie-session auth
Client and server are separate deployables communicating over `VITE_API_URL` (client) / `CLIENT_URL` (server CORS origin), with `axios` configured `withCredentials: true` (`client/src/services/api.ts`). Auth is **session-based**, not JWT-based, despite `jsonwebtoken` being a dependency: `express-session` + `connect-mongo` stores sessions in the `sessions` Mongo collection, and `req.session.userId` is the source of truth (`server/src/middleware/authMiddleware.ts`). `protect` requires a valid session; `tryProtect` attaches a user if present but doesn't reject; `admin` gates on `req.user.role === "admin"` and must run after `protect`.

### Server structure
Standard layered Express app (`server/src/index.ts` wires it all up):
- `routes/*Routes.ts` — declare paths + apply `protect`/`admin` middleware, delegate to controllers
- `controllers/*Controller.ts` — request handling + Mongoose queries (no separate repository/service layer for CRUD; business logic lives directly in controllers)
- `models/*.ts` — Mongoose schemas (`Product`, `Order`, `User`, `Promotion`)
- `services/` — third-party integrations only: `cloudinaryService.ts` (image upload, fixed `ezscents_products` upload preset + eager transforms) and `emailService.ts` (Resend-backed transactional emails: order confirmation, status update, welcome, password reset — all inline HTML templates, all silently no-op with a console warning if `RESEND_API_KEY` is unset)
- `config/db.ts` — Mongoose connection

Mongo documents are typed loosely (`(req as any).user`, `order: any` in email functions) — the codebase does not thread Mongoose document types through controllers/services.

Two gaps to keep in mind when touching the server: there's no global Express error-handling middleware (`server/src/index.ts`) — controllers catch async errors individually (inconsistently: some have try/catch, some don't), so an uncaught rejection in a controller without one will hang/500 without a clean JSON error response. And although `zod` is a server dependency, it's not actually used anywhere for request validation — controllers trust `req.body` directly.

`ADMIN_EMAILS` (comma-separated, server env) auto-grants the `admin` role on registration if the signup email matches (`authController.ts`'s `registerUser`) — the only way to create an admin account short of editing the DB directly.

### Client structure
- `pages/` — route-level components (top-level pages + `pages/admin/*` for the admin console)
- `features/<domain>/components/` — domain-scoped components (e.g. `features/products`, `features/promotions`) as the app grows beyond generic `components/`
- `components/layout/` — `MainLayout` (storefront chrome: navbar, promotions sidebar, footer) and `AdminLayout` (admin shell). **Admin route protection is done client-side inside `AdminLayout`** (redirects to `/login` via `useEffect` if `userInfo.role !== 'admin'`), not via a router-level guard/wrapper — there's no protected-route abstraction, each admin page is just rendered wrapped in `AdminLayout`
- `services/*Service.ts` — thin wrappers around the shared `axios` instance (`services/api.ts`), one per resource, mirroring server routes
- `store/` — Zustand stores: `authStore` (persisted to localStorage as `userInfo`), `cartStore`, `themeStore`
- `types/index.ts` — shared domain types (`Product`, `Order`, `User`, `Promotion`, etc.), hand-kept in sync with the Mongoose schemas (no codegen)

### Cart persistence model
Cart state is **not** synced to the server — it's client-only, persisted to `localStorage` under a per-identity key (`cart_<userId>` or `cart_guest`), managed manually in `cartStore.ts`'s `persistCart` helper and re-synced in `authStore.ts` on login/logout (loading the new identity's saved cart, defaulting to empty). When touching cart or auth logic, keep in mind these two stores manually coordinate through `localStorage` reads rather than a single shared source of truth.

### Images
Product/promotion images can be stored as either a plain URL string or a `{ url, publicId }` object (`ImageRef = string | CloudinaryImageRef` in `client/src/types/index.ts`, mirrored as `Schema.Types.Mixed` in the Mongoose schemas). Use `isCloudinaryImageRef`/`getImageUrl`/`buildCloudinaryImage` (`client/src/utils/cloudinary.ts`) rather than assuming one shape — the Cloudinary SDK path applies `format("auto").quality("auto")` transforms, the plain-string path is used as-is (e.g. static/non-Cloudinary images).

### Styling
Tailwind + DaisyUI, dark/light mode via a `dark`/`light` class on `<html>` driven by `themeStore` (`darkMode: 'class'` in `client/tailwind.config.js`). Custom palette is exposed as CSS variables (`--premium-black`, `--premium-gold`, `--premium-gray`, etc.) mapped to Tailwind color tokens — use the `premium-*` / `background` / `foreground` tokens rather than hardcoding hex values to stay theme-consistent.

## Environment variables

Both `client/.env` and `server/.env` exist locally and are gitignored (no `.env.example` committed). Notable ones referenced in code: server — `MONGODB_URI`, `SESSION_SECRET`, `CLIENT_URL`, `ADMIN_EMAILS` (comma-separated allowlist, see above), `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `SUPPORT_EMAIL`, `PORT`, `NODE_ENV`; client — `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_BRAND_NAME`, `VITE_THONY_URL`.

**Never write real secret values into this file or any other committed file.** A previous root-level `gemini.md` in this repo did exactly that (copied live Cloudinary and MongoDB credentials from `server/.env` into a committed markdown table) and was removed for that reason — those credentials should be treated as compromised and rotated if that hasn't happened yet.
