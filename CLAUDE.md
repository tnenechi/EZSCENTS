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
- `npm test` — Vitest (jsdom environment, config in `vite.config.ts`'s `test` block), runs colocated `*.test.ts(x)` files

### Server (`server/`)
- `npm run dev` — `ts-node-dev` with `--respawn --transpile-only` against `src/index.ts` (default port 5000)
- `npm run build` — `npm install --include=dev && tsc` (compiles `src/` → `dist/`)
- `npm start` — runs the compiled `dist/index.js` (production)
- `npm test` — Vitest + Supertest, `server/tests/`. Each test file boots the real app (`server/src/app.ts`) against its own throwaway `mongodb-memory-server` instance — never touches the live Atlas cluster

## Architecture

### Two independent apps, cookie-session auth
Client and server are separate deployables communicating over `VITE_API_URL` (client) / `CLIENT_URL` (server CORS origin), with `axios` configured `withCredentials: true` (`client/src/services/api.ts`). Auth is **session-based**, not JWT-based, despite `jsonwebtoken` being a dependency: `express-session` + `connect-mongo` stores sessions in the `sessions` Mongo collection, and `req.session.userId` is the source of truth (`server/src/middleware/authMiddleware.ts`). `protect` requires a valid session; `tryProtect` attaches a user if present but doesn't reject; `admin` gates on `req.user.role === "admin"` and must run after `protect`.

### Server structure
Standard layered Express app. `server/src/app.ts` holds the fully configured Express app (middleware + routes) and is what tests import directly; `server/src/index.ts` is a thin entrypoint that just calls `connectDB()` and `app.listen()` — the split exists so tests can boot the real app without a live DB connection or an actual listening server.
- `routes/*Routes.ts` — declare paths + apply `protect`/`admin`/`validateBody`/`authLimiter` middleware, delegate to controllers
- `controllers/*Controller.ts` — request handling + Mongoose queries (no separate repository/service layer for CRUD; business logic lives directly in controllers)
- `models/*.ts` — Mongoose schemas (`Product`, `Order`, `User`, `Promotion`)
- `middleware/` — `authMiddleware.ts` (`protect`/`tryProtect`/`admin`, session-based); `validate.ts` (generic `validateBody(schema)`, paired with zod schemas in `validation/schemas.ts`); `rateLimit.ts` (`authLimiter`: 10 req/15min, applied to `/auth/login`, `/auth/register`, `/auth/forgot-password`); `enforceJson.ts` (rejects non-`application/json` POST bodies — CSRF mitigation, since the cross-origin session cookie needs `sameSite: "none"` and can't rely on SameSite alone); `errorHandler.ts` (`notFound` + `errorHandler`, wired last in `app.ts` — Express 5 auto-forwards rejected promises from async route handlers to it, so controllers don't each need their own try/catch)
- `validation/schemas.ts` — zod request-body schemas per domain (auth, orders, products, promotions, upload), applied via `validate.ts` on write routes
- `services/` — third-party integrations only: `cloudinaryService.ts` (`uploadImage`/`deleteImage`) and `emailService.ts` (Resend-backed transactional emails: order confirmation, status update, welcome, password reset — all inline HTML templates, all silently no-op with a console warning if `RESEND_API_KEY` is unset)
- `config/db.ts` — Mongoose connection

Mongo documents are typed loosely (`(req as any).user`, `order: any` in email functions) — the codebase does not thread Mongoose document types through controllers/services.

Two security-relevant behaviors worth knowing before touching order code: `addOrderItems` (`orderController.ts`) never trusts client-supplied prices — it re-derives `price`/`name`/`image`/`size` per order item from the referenced `Product`/variant in MongoDB and recomputes `totalPrice` itself. And `getOrderById` enforces ownership — the session owner, an admin, or (for guest orders) a request carrying a matching `?email=` query param; anyone else gets 403.

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
Product/promotion images can be stored as either a plain URL string or a `{ url, publicId }` object (`ImageRef = string | CloudinaryImageRef` in `client/src/types/index.ts`, mirrored as `Schema.Types.Mixed` in the Mongoose schemas). Use `isCloudinaryImageRef`/`getImageUrl`/`buildCloudinaryImage` (`client/src/utils/cloudinary.ts`) rather than assuming one shape — the Cloudinary SDK path applies `format("auto").quality("auto")`, plus a `.resize(fill(width, height))` transform whenever explicit dimensions are passed (every current display call site passes them, so images are actually served at display size, not full original resolution), the plain-string path is used as-is (e.g. static/non-Cloudinary images). `CloudinaryImage` (`client/src/components/common/CloudinaryImage.tsx`) is the component wrapper that threads its `width`/`height` props into `buildCloudinaryImage`.

### Styling
Tailwind + DaisyUI, dark/light mode via a `dark`/`light` class on `<html>` driven by `themeStore` (`darkMode: 'class'` in `client/tailwind.config.js`). Custom palette is exposed as CSS variables (`--premium-black`, `--premium-gold`, `--premium-gray`, etc.) mapped to Tailwind color tokens — use the `premium-*` / `background` / `foreground` tokens rather than hardcoding hex values to stay theme-consistent.

## Testing

Both projects have Vitest suites, deliberately scoped to security/business-logic-critical paths (order pricing integrity, order ownership/IDOR, admin-gated routes, auth validation, rate limiting, Cloudinary cleanup on the server; store localStorage-sync logic, the Cloudinary resize URL builder, checkout validation on the client) rather than exhaustive coverage. See the "Commands" sections above for how to run each. `.github/workflows/ci.yml` runs typecheck + lint + build + test for both projects on every push/PR to `main`.

## Environment variables

Both `client/.env` and `server/.env` exist locally and are gitignored (no `.env.example` committed). Notable ones referenced in code: server — `MONGODB_URI`, `SESSION_SECRET` (**required** — the server throws on startup if unset, no fallback), `CLIENT_URL`, `ADMIN_EMAILS` (comma-separated allowlist, see above), `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `SUPPORT_EMAIL`, `PORT`, `NODE_ENV`; client — `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_BRAND_NAME`, `VITE_THONY_URL`.

**Never write real secret values into this file or any other committed file.** A previous root-level `gemini.md` in this repo did exactly that (copied live Cloudinary and MongoDB credentials from `server/.env` into a committed markdown table) and was removed for that reason. Those credentials were treated as compromised (they remain in git history regardless of the file's removal) and have since been rotated.
