# Secret Scents - Premium Fragrance Ecommerce Platform

Secret Scents is a modern, full-stack ecommerce platform designed for luxury perfume retail, customized for the Nigerian market (₦ currency, Manual Bank Transfer checkout). It features a premium, responsive dark/light aesthetic, complete guest and registered checkout workflows, robust order fulfillment management, dynamic product filtering, banner carousels, and transactional email notification delivery via Resend.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 3 with custom brand variables (light/dark themes) + [DaisyUI](file:///C:/Users/enech/Desktop/code/ezscents/client/package.json#L32) (for skeleton loader animations)
- **State Management:** Zustand 5 (Auth, Cart, and Theme stores with localStorage persistence)
- **Data Fetching:** TanStack React Query 5
- **UI Components & Animations:** Lucide React (Icons), Framer Motion 12 (Micro-animations and transitions)
- **Form Handling & Validation:** React Hook Form + Zod (Resolvers)

### Backend
- **Runtime:** Node.js + TypeScript (`ts-node-dev` for development compile-on-save)
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose 9 ODM)
- **Authentication:** Cookie-based Session Auth (`express-session` + `connect-mongo` session persistence)
- **Integrations:**
  - **Storage:** Cloudinary v2 (Product & Promotion image hosting)
  - **Emails:** Resend (Transactional order status updates)

---

## 📁 Architecture & Module Mapping

The project resides in a monorepo-style structure split into `/client` and `/server`.

### 1. Backend (`/server`)

#### Directory Map
- [`src/index.ts`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/index.ts): Main API entry point (middleware configurations, CORS setup, Express session lifecycle, and route handlers initialization).
- [`src/config/db.ts`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/config/db.ts): MongoDB connection initialization.
- [`src/models/`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/models): Contains Mongoose models define database schemas.
- [`src/controllers/`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/controllers): Route controllers implementation (request processing, DB queries, output formatting).
- [`src/routes/`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/routes): Endpoints mapping containing middleware attachment.
- [`src/middleware/`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/middleware): Middlewares for custom authentication, optional token recovery, and role checking.
- [`src/services/`](file:///C:/Users/enech/Desktop/code/ezscents/server/src/services): Integrations with Cloudinary and Resend API.

#### Mongoose Schemas Definition

##### User (`User.ts`)
- **`name`**: String (Required)
- **`email`**: String (Required, Unique, Case-insensitive)
- **`password`**: String (Required, hashed via bcrypt pre-save hook)
- **`role`**: String (Enum: `['user', 'admin']`, defaults to `'user'`)
- **`addresses`**: Embedded array of address schemas:
  - `street` (String), `city` (String), `state` (String), `zipCode` (String)
  - `country` (String, Default: `"Nigeria"`)
  - `isDefault` (Boolean, Default: `false`)

##### Product (`Product.ts`)
- **`name`**: String (Required)
- **`brand`**: String (Required)
- **`description`**: String (Required)
- **`category`**: String (Required)
- **`images`**: Array of Strings (Cloudinary hosted image URLs)
- **`variants`**: Array of Embedded Variant sub-schemas:
  - `size` (String, e.g. `"50ml"`, `"100ml"`)
  - `price` (Number, Required)
  - `stock` (Number, Default: `0`)
- **`isFeatured`**: Boolean (Default: `false`)
- **`rating`**: Number (Default: `0`)
- **`numReviews`**: Number (Default: `0`)

##### Order (`Order.ts`)
- **`user`**: ObjectId referencing `User` (Optional - support for Guest Checkouts)
- **`guestInfo`**: Embedded object (Optional, fields: `name`, `email`)
- **`orderItems`**: Array of items:
  - `name` (String), `quantity` (Number), `image` (String), `price` (Number), `size` (String)
  - `product` (ObjectId referencing `Product`), `variantId` (String)
- **`shippingAddress`**:
  - `address` (String), `city` (String), `state` (String), `phone` (String)
  - `country` (String, Default: `"Nigeria"`)
- **`paymentMethod`**: String (Required, Enum: `["Bank Transfer"]`, Default: `"Bank Transfer"`)
- **`paymentResult`**: Verification receipt object (fields: `id`, `status`, `update_time`, `email_address`, `reference`)
- **`totalPrice`**: Number (Default: `0.0`)
- **`isPaid`**: Boolean (Default: `false`)
- **`paidAt`**: Date (Optional)
- **`isDispatched`**: Boolean (Default: `false`)
- **`dispatchedAt`**: Date (Optional)
- **`status`**: String (Enum: `["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]`, Default: `"Pending"`)

##### Promotion (`Promotion.ts`)
- **`title`**: String (Required)
- **`description`**: String (Optional)
- **`image`**: String (Required, Banner image url)
- **`products`**: Array of ObjectIds referencing `Product` (Associated sale products)
- **`isActive`**: Boolean (Default: `true`)
- **`startDate`**: Date (Optional)
- **`endDate`**: Date (Optional)

#### API Endpoints Reference (21 Endpoints)

##### Auth Routes (`/api/auth`)
- `POST /register` — Registration. Admin is granted automatically if email matches `ADMIN_EMAILS` env.
- `POST /login` — Authenticates user, assigns `req.session.userId`.
- `POST /logout` — Destroys session, deletes cookie. (Requires: `protect`)
- `GET /profile` — Fetches profile information (minus password). (Requires: `protect`)
- `PUT /profile/password` — Updates password with pre-verification check. (Requires: `protect`)

##### Product Routes (`/api/products`)
- `GET /` — Fetches products with keyword, category, brand, isFeatured, promotionId, pagination (12/page), and sorting.
- `POST /` — Creates a new product. (Requires: `protect`, `admin`)
- `GET /filters` — Returns lists of distinct brand names and categories for collection filtering.
- `GET /:id` — Retrieves specific product details.
- `PUT /:id` — Updates selected fields of product. (Requires: `protect`, `admin`)
- `DELETE /:id` — Deletes product. (Requires: `protect`, `admin`)

##### Order Routes (`/api/orders`)
- `POST /` — Places a new order. (Uses `tryProtect` middleware to attach User ID optionally for guest purchases).
- `GET /` — Fetches all orders with status/search filters. (Requires: `protect`, `admin`)
- `GET /myorders` — Fetches order history for current logged-in user. (Requires: `protect`)
- `GET /:id` — Returns full details of an order.
- `PUT /:id/pay` — Sets `isPaid: true` and logs manual admin verification details. (Requires: `protect`)
- `PUT /:id/deliver` — Sets `isDispatched: true` and status to `"Shipped"`. (Requires: `protect`, `admin`)

##### Promotion Routes (`/api/promotions`)
- `GET /` — Fetches all active banner promotions.
- `POST /` — Creates a new promotion banner. (Requires: `protect`, `admin`)
- `PUT /:id` — Updates promotion details. (Requires: `protect`, `admin`)
- `DELETE /:id` — Deletes promotion banner. (Requires: `protect`, `admin`)

##### File Upload Routes (`/api/upload`)
- `POST /` — Processes base64 file buffer inputs and uploads directly to Cloudinary folder `"ezscents_products"`. (Requires: `protect`, `admin`)

---

### 2. Frontend (`/client`)

#### Directory Map
- [`src/main.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/main.tsx) & [`src/App.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/App.tsx): Routing configuration, Scroll-to-Top initializer, and global layout rendering.
- [`src/pages/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/pages): Views for customer checkout flows, detail page, and collections.
- [`src/pages/admin/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/pages/admin): Dashboard widgets, listing grids, and forms for content editing.
- [`src/components/layout/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/components/layout): Wrappers for page layouts:
  - [`MainLayout.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/components/layout/MainLayout.tsx): Header navigation, brand footer, dynamic desktop-promotions sidebar.
  - [`AdminLayout.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/components/layout/AdminLayout.tsx): Left sidebar menu, responsive navbar overlay, auth-guard redirection.
- [`src/features/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/features): Modular layouts including:
  - [`ProductCard.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/features/products/components/ProductCard.tsx) (featured labels, dynamic prices range).
  - [`PromotionsSidebar.tsx`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/features/promotions/components/PromotionsSidebar.tsx) (auto-cycling promotions widget).
- [`src/services/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/services): Axios service definitions mapping to the REST backend.
- [`src/store/`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/store): Zustand stores with browser storage syncing:
  - `authStore`: User profile cache, auto-fetches user-specific cart during authentication state swaps.
  - `cartStore`: Standard inventory additions, quantities tracking, and custom isolator keys (`cart_{userId}` vs `cart_guest`).
  - `themeStore`: Theme toggle configurations (manipulates `<html>` class list).
- [`src/utils/imageUtils.ts`](file:///C:/Users/enech/Desktop/code/ezscents/client/src/utils/imageUtils.ts): Automatic insertion of format/quality parameters (`f_auto,q_auto`) for Cloudinary URLs.

#### Client Pages and Routing Map (16 Routes)

##### Client Customer-Facing Routes
1. `/` — **HomePage**: Visual hero slider, quick shop navigation CTA, and highlights `isFeatured` products.
2. `/shop` — **CollectionsPage**: Main catalog showcasing active page paginations, sorting rules (newest, price ascending/descending), search bar, and side-facet filters.
3. `/product/:id` — **ProductDetailPage**: Zoomable thumbnails, stock levels counter, custom size dropdowns, and descriptions.
4. `/cart` — **CartPage**: Summary panel, quantity modifiers, and visual countdown notices for free delivery (threshold: ₦50,000).
5. `/login` — **LoginPage**: Client credentials validator matching custom Zod schemas. Includes auto-redirect support.
6. `/register` — **RegisterPage**: Standard matching validators (password confirm checks).
7. `/checkout` — **CheckoutPage**: 4-Step checkout form:
   - *Step 1: Shipping* (Accepts registered profiles or collects guest information).
   - *Step 2: Payment* (Instructs Manual Bank Transfer copy-to-clipboard actions).
   - *Step 3: Review* (Invoice verification screen).
   - *Step 4: Success* (Unique short invoice code display).
8. `/order/:id` — **OrderDetailsPage**: Tracking timeline visualization (Placed → Verified → Dispatched) displaying custom bank instructions if order status is unpaid.
9. `/profile` — **ProfilePage**: Order history listing (hover item previews) and client-side password modifiers.

##### Client Admin Routes (Requires Admin permissions on the active session)
10. `/admin` — **AdminDashboardPage**: Core indicator metrics (Gross Sales, Total Orders, Product catalog size, active Promos count) and a status distribution bar chart.
11. `/admin/orders` — **AdminOrderListPage**: Admin data table representing orders details, status filters, search bars, and fast click-actions.
12. `/admin/products` — **AdminProductListPage**: Master grid representing the catalog, stock variations count, price ranges, and delete triggers.
13. `/admin/products/create` — **AdminProductEditPage**: Product creator with dynamic inputs fields array for sizes, prices, and variant stocks.
14. `/admin/products/:id/edit` — **AdminProductEditPage**: Updates variant metrics and description parameters of existing products.
15. `/admin/promotions` — **AdminPromotionListPage**: Banners dashboard.
16. `/admin/promotions/create` / `/:id/edit` — **AdminPromotionEditPage**: Interactive checkbox search panel to associate specific items with custom advertisement banners.
17. `/admin/security` — **AdminSecurityPage**: Standalone security dashboard to update admin password values.

---

## 🔑 Environment Variables Configuration

### Backend (`server/.env`)
| Environment Key | Context / Value | Security Status |
|---|---|---|
| `PORT` | `5000` (API Gateway) | Public |
| `MONGODB_URI` | `mongodb+srv://enechithony_db_user:***@ezscentscluster...` | **⚠️ COMMITTED credentials (Mongoose)** |
| `ADMIN_EMAILS` | `admin@ezscents.com` (Grants admin flag dynamically on registration) | Committed |
| `CLOUDINARY_CLOUD_NAME` | `dmm1knxbk` | Committed |
| `CLOUDINARY_API_KEY` | `849396746713962` | Committed |
| `CLOUDINARY_API_SECRET` | `X8IDvBe2BMsH5jQuSvImYzhsqEM` | **⚠️ COMMITTED API secret** |
| `RESEND_API_KEY` | `your_resend_api_key` | **❌ Placeholder** (Must configure to run emails) |
| `NODE_ENV` | `development` | Committed |

*Note:* `SESSION_SECRET` is missing in the environment config, causing the system to fall back on the default fallback string `"secretscents_secret_key"`. `JWT_SECRET` is defined in documentation, but authentication is entirely session-cookie based (no JWTs are active in backend auth pipelines).

### Frontend (`client/.env`)
| Environment Key | Context / Value |
|---|---|
| `VITE_BRAND_NAME` | `Secret Scents` (Injects main footer credits) |
| `VITE_API_URL` | (Defaults to `http://localhost:5000/api` if commented out) |
| `VITE_BANK_NAME` | `ZENITH BANK` (Target bank for manual transfers) |
| `VITE_BANK_ACCOUNT` | `123456789099` (Target bank account number) |
| `VITE_WHATSAPP_NUMBER`| `+234 900 000 0000` (Fulfillment helpline for receipt confirmation) |

---

## ⚙️ Core Developer Guide & Convening Rules

### Prerequisites
- Node.js (v18+)
- MongoDB connection (Local service or MongoDB Atlas database URI)

### Setup & Running

1. **Install all dependencies:**
   ```bash
   # From root folder
   cd client && npm install
   cd ../server && npm install
   ```

2. **Run Development Servers:**
   - **Backend:**
     ```bash
     cd server
     npm run dev
     ```
   - **Frontend:**
     ```bash
     cd client
     npm run dev
     ```

### Conventions & Code Rules
- **Naming:** CamelCase for variables/handlers, PascalCase for Component layouts, Pages, and Database Models.
- **Client Forms Validation:** Use Zod schemas together with React Hook Form resolvers.
- **Fulfillment Pipeline:** Manual payments verification. Admin goes to order page → selects `Mark as Paid` → updates status to `Processing`. Selects `Mark as Dispatched` → updates status to `Shipped`.
- **Layout Selection:** Wrap user viewports in `MainLayout`. Wrap administration viewports in `AdminLayout` for automatic route guarding.

---

## 🛠 Active Technical Observations

1. **API Key Setup Required:** The transactional emails service (via Resend) works perfectly but is blocked by `RESEND_API_KEY=your_resend_api_key` in `server/.env`.
2. **Missing Pages Links:** The client login viewport links to `/forgot-password`, but there is currently no page or routing target built for password recovery.
3. **Admin Page Guards:** Page security in the React client is handled solely by layout redirects inside `AdminLayout.tsx`. There is no global interceptor routing block for admin targets.
4. **Credential Relocation Recommended:** Cloudinary and MongoDB API credentials are hardcoded directly into the committed `server/.env` configuration. For staging and production, these secrets should be loaded from environment variables on the host environment and removed from source files.
5. **No Backend Request Validator:** Although `zod` is installed in `server/package.json`, request payloads in Express controllers are currently trusted directly. Integrating Zod schemas on endpoints input would improve request validation.
6. **No global error middleware:** Express controllers handle asynchronous errors inside internal try-catch blocks individually. Uncaught router exceptions may cause server hangs or display stack traces to clients in development mode.


## TODO
welcome email links to local host
email template shows hardcorderd email in the body
contact us form/page
