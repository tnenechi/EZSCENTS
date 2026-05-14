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
- **Auth:** JWT is stored in local storage and sent via the `Authorization: Bearer <token>` header (handled by `api.ts` interceptor).
- **Layouts:** Wrap pages in `MainLayout` for customer views and `AdminLayout` for management views.


##  TODO
-- Create a profile page for the customer. Currently, when the customer profile icon is clicked, it just goes to the homepage. 
-- For the user profile (both the customer and admin), add these features/tabs:
    - change passoword
    - order tracking
    - past orders