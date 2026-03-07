# ⚖️ LegalHub

**LegalHub** is a comprehensive, full-stack platform designed to connect clients with verified Indian lawyers. It provides a seamless experience for searching, booking consultations, managing cases, and secure real-time messaging, complete with role-based access for Clients, Lawyers, and Administrators.

---

## ✨ Key Features

### 🧑‍💼 For Clients

- **Find Lawyers:** Search and filter lawyers by specialization, city, court of practice, and language.
- **Book Consultations:** Schedule video, chat, or in-person meetings with real-time Razorpay payment integration.
- **Manage Cases:** Track ongoing legal cases and view shared case documents.
- **Real-time Chat:** Secure WebSocket-based messaging with hired lawyers.
- **Reviews & Ratings:** Leave feedback for lawyers post-consultation.

### 👨‍⚖️ For Lawyers

- **Professional Profiles:** Build a detailed profile including Bar Council credentials, education, and specializations.
- **Availability Management:** Set weekly working hours and time slots for bookings.
- **Case Management:** Create and organize client cases and securely handle document uploads (R2/S3).
- **Earnings Dashboard:** Track revenue and upcoming consultations.

### 🛡️ For Administrators

- **Verification System:** Review and approve pending lawyer registrations by verifying uploaded Bar Council and Government ID documents.
- **Platform Oversight:** Monitor total users, bookings, and platform revenue.
- **Dispute Resolution:** Handle issues raised by users ensuring platform integrity.

---

## 🏗️ Technology Stack

This project is built as a monorepo containing a **Next.js Frontend** and an **Express/Node.js Backend**.

### Frontend (`apps/web`)

- **Framework:** Next.js 14, React 18 (App Router)
- **Styling:** Tailwind CSS, shadcn/ui framework, Lucide Icons
- **State Management:** Zustand (with session storage persistence)
- **Data Fetching:** Axios (with automated JWT refresh interceptors)
- **Real-time:** Socket.IO Client

### Backend (`apps/api`)

- **Framework:** Express.js, Node.js (TypeScript)
- **Database:** PostgreSQL (Neon / Supabase natively supported)
- **ORM:** Prisma
- **Authentication:** JWT (Access & Refresh Tokens), bcryptjs
- **Real-time:** Socket.IO Server
- **Payments:** Razorpay API
- **Storage:** S3/Cloudflare R2 Object Storage (prepared)

---

## 📂 Repository Structure

```text
legalhub/
├── apps/
│   ├── api/                 # ⚙️ Node.js/Express Backend
│   │   ├── prisma/          # Database schema and migrations
│   │   ├── src/
│   │   │   ├── lib/         # Prisma client, token utilities
│   │   │   ├── middleware/  # Auth guards, Rate limiters
│   │   │   ├── routes/      # Express API Routers
│   │   │   ├── services/    # Socket.IO, Email, Storage logic
│   │   │   └── index.ts     # Main Server Entry Point
│   │   └── package.json
│   │
│   └── web/                 # 🖥️ Next.js Frontend
│       ├── src/
│       │   ├── app/         # Next.js App Router (Public, Auth, Dashboard views)
│       │   ├── components/  # Reusable UI / shadcn components
│       │   ├── lib/         # Axios interceptors, utils
│       │   └── store/       # Zustand State Managers (auth.ts)
│       └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A running PostgreSQL Database instance.

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/legalhub.git
cd legalhub

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../../apps/web
npm install
```

### 2. Environment Setup

Create `.env` files in both applications based on their respective `.example` files.

**Backend (`apps/api/.env`):**

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://user:pass@localhost:5432/legalhub?schema=public"
DIRECT_URL="postgresql://user:pass@localhost:5432/legalhub" # If using Neon/Supabase pooling
JWT_SECRET="your_secret_key"
JWT_REFRESH_SECRET="your_refresh_secret"
RAZORPAY_KEY_ID="rzp_test_***"
RAZORPAY_KEY_SECRET="***"
```

**Frontend (`apps/web/.env.local`):**

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_RAZORPAY_KEY="rzp_test_***"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Initialization

From `apps/api/`:

```bash
npx prisma generate
npx prisma db push
# Or if using migrations: npx prisma migrate dev
```

### 4. Run the Application

You need to run both development servers concurrently.

**Start Backend:**

```bash
cd apps/api
npm run dev
```

**Start Frontend:**

```bash
cd apps/web
npm run dev
```

The application will now be available at `http://localhost:3000`.

---

## 📱 Mobile Responsiveness

The platform is designed with a **mobile-first** approach.

- Navigation automatically transitions to a side-drawer (`Sheet`) on mobile devices.
- Complex Data Tables (like Bookings and Verification Queues) natively collapse into stacked, readable Cards to prevent horizontal scrolling.
- Real-time Messaging utilizes a dynamic split-pane architecture to maximize keyboard space on smaller viewports.

---

## 🔒 Security Posture

- Route-level role guards (`requireAuth`, `requireClient`, `requireLawyer`, `requireAdmin`) on the Express Server.
- Component-level route protection (`<ProtectedRoute allowedRoles={[]}>`) in Next.js.
- Rate-limiting to prevent brute force attacks on the API.
- Tab-isolated `sessionStorage` for multiple account testing and hardened session management.
- Robust Socket.IO room validation to ensure conversation privacy.

---

## 📄 License

This project is proprietary and confidential.
