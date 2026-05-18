# EzScents - Premium Fragrance Ecommerce Platform

EzScents is a modern, full-stack ecommerce platform designed for luxury perfume retail. It features a premium aesthetic, robust order management, and multi-channel payment support.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Luxury-inspired palette)
- **State Management:** Zustand (Auth, Cart)
- **Data Fetching:** React Query (TanStack Query)
- **UI Components:** Lucide React (Icons), Framer Motion (Animations)
- **Form Handling:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT + Bcryptjs
- **Integrations:** 
    - **Storage:** Cloudinary (Product images)
    - **Emails:** Resend (Transactional notifications)

## 📁 Architecture

The project is divided into two main directories:

- `/client`: React frontend application.
- `/server`: Node.js Express API.

### Key Backend Modules
- `controllers/`: Request handling logic.
- `models/`: Mongoose schemas.
- `routes/`: API endpoint definitions.
- `middleware/`: Auth verification and role-based access control.
- `services/`: External integrations (Cloudinary, Resend).

### Key Frontend Modules
- `features/`: Business logic grouped by feature (auth, products, cart, checkout, promotions).
- `components/layout/`: Global layout wrappers (MainLayout, AdminLayout).
- `services/`: API client and resource-specific services.
- `store/`: Zustand stores for global state.

## 🛠 Building and Running

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### Setup

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    # From the root directory
    cd client && npm install
    cd ../server && npm install
    ```

3.  **Run Development Servers:**

    **Backend:**
    ```bash
    cd server
    npm run dev
    ```

    **Frontend:**
    ```bash
    cd client
    npm run dev
    ```

## 🔑 Environment Variables

### Backend (`server/.env`)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret for token signing
- `ADMIN_EMAILS`: Comma-separated list of admin emails for role assignment
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `RESEND_API_KEY`: Resend API key

### Frontend (`client/.env`)
- `VITE_API_URL`: Backend API base URL (default: http://localhost:5000/api)

## 🛡️ Admin Access
Admin status is determined during registration. If a user registers with an email listed in the `ADMIN_EMAILS` environment variable, they are automatically granted the `admin` role, enabling access to the `/admin` dashboard and management endpoints.

## 📝 Development Conventions
- **Naming:** CamelCase for functions/variables, PascalCase for Components/Models.
- **Validation:** Use Zod schemas for both frontend forms and backend request bodies.
- **Auth:** Sessions are used for persistent authentication. `tryProtect` middleware handles optional user identification for guest-friendly routes.
- **Layouts:** Wrap pages in `MainLayout` for customer views and `AdminLayout` for management views.

## ✨ Recent Enhancements
- **Transactional Emails:** Integrated Resend for automated order confirmations and status updates.
- **Unified Profile:** Consolidated order history and live tracking into a single "Orders" tab for customers.
- **Admin Security:** Dedicated security management within the admin dashboard for password changes.
- **UI/UX:** Improved visual contrast across all admin management interfaces for better accessibility.

##  TODO
-- Admin order search and filter fix.
-- Implement advanced analytics for admin dashboard (Top selling products, monthly revenue trends)
-- Add "Add to Wishlist" functionality for registered users
-- Implement user reviews and ratings for products


## PLAN

I've analyzed the 404 issue on Render. The primary suspect is that the server isn't configured to trust Render's proxy. 

  When NODE_ENV is "production", your session cookies are set to secure: true. Behind a proxy like Render's load balancer, Express sees the request as "insecure" HTTP and
  refuses to send the cookie unless told to trust the proxy. This can lead to auth failures and, in some routing configurations, unexpected 404s.

  I've also noticed that orderRoutes.ts uses the router.route("/") pattern, which can sometimes be ambiguous in Express 5 if there's any path normalization difference
  between local and production.

  Proposed Plan:
   1. Trust Proxy: Add app.set('trust proxy', 1); to server/src/index.ts. This is mandatory for production session persistence on platforms like Render.
   2. Explicit Routing: Refactor orderRoutes.ts to use explicit .get() and .post() methods for better clarity and compatibility.

  I have created a detailed plan in fix-order-404.md. Does this strategy sound good to you? If so, I'll proceed with the implementation.

  Plan: Fix Deployed Route 404s

  The /orders endpoint is returning 404 on Render. This is likely caused by the session middleware failing to persist cookies behind Render's proxy due to missing trust
  proxy configuration, combined with potential routing ambiguities in Express 5.

  Proposed Changes

  Server

  1. server/src/index.ts
   - Add app.set('trust proxy', 1); immediately after creating the app instance. This tells Express it is behind a front-facing proxy (Render's load balancer) and should
     trust the X-Forwarded-* headers, which is essential for secure: true cookies to work.

  2. server/src/routes/orderRoutes.ts
   - Refactor the routes to use explicit .get() and .post() calls instead of .route("/") to improve clarity and avoid any potential matching issues in Express 5.
   - Ensure all paths are strictly defined.

  Verification Steps

  Automated Tests
   - Since this is a deployment-specific issue related to proxies, local unit tests may not reproduce the 404, but we can verify that the routes still work as expected
     locally.
   - Run npm run dev in the server directory and verify GET /api/orders (as admin) and GET /api/orders/myorders (as user) return valid responses (even if empty).

  Manual Verification
   - Deploy the changes to Render.
   - Verify that the customer order history and admin order list now load correctly without 404 errors.
   - Check the browser's "Network" tab to ensure cookies are being sent and received with the secure and samesite=none attributes correctly handled by the proxy.


##  TODO
      - diffrence between protect and tryProtect in authMiddeleware?
