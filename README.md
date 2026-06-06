<!-- GENESIS LMS — README -->

<div align="center">

```
 ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗███████╗
██╔════╝ ██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝
██║  ███╗█████╗  ██╔██╗ ██║█████╗  ███████╗██║███████╗
██║   ██║██╔══╝  ██║╚██╗██║██╔══╝  ╚════██║██║╚════██║
╚██████╔╝███████╗██║ ╚████║███████╗███████║██║███████║
 ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝╚═╝╚══════╝
                                                  L M S
```

### *One platform. Every role. Total control.*

**Role-Based School Portal** · **Fee & Marks Management** · **Real-time Analytics**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-genesis--lms.vercel.app-4F8EF7?style=for-the-badge&logo=vercel&logoColor=white)](https://genesis-lms.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-99.2%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## ◈ What Is Genesis LMS?

> Most school portals are built for administrators.  
> Genesis LMS is built for **everyone** — and knows the difference.

Genesis LMS is a **full-featured school management platform** with intelligent role-based access for Admins, Teachers, and Accountants. Each role sees exactly what they need — nothing more, nothing less. From tracking attendance to generating fee records to calculating grades automatically, Genesis LMS handles the operational backbone of a school cleanly, reliably, and fast.

---

## ◈ Role-Based Access

```
┌─────────────────────────────────────────────────────────────────────┐
│                      THREE ROLES. ONE PLATFORM.                     │
│                                                                     │
│   👤 ADMIN          📚 TEACHER          💰 ACCOUNTANT               │
│   ───────────       ──────────          ─────────────               │
│   Full system       Attendance &        Fee management              │
│   control,          marks entry,        & payment                   │
│   user mgmt,        student view,       tracking,                   │
│   audit logs        class reports       financial reports           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ◈ Features

| Module | Description |
|---|---|
| 🔐 **Role-Based Dashboards** | Distinct UI and permissions for Admin, Teacher, and Accountant |
| 👨‍🎓 **Student Management** | Add, edit, search, and manage student records across classes |
| 💸 **Fee Management** | Issue fee structures, track payments, and flag outstanding dues |
| 📝 **Marks Management** | Enter marks per subject with automatic grade calculation |
| 📅 **Attendance Management** | Mark daily attendance by class and track absence trends |
| 📊 **Reports & Analytics** | Visual dashboards with charts powered by Recharts |
| 🔍 **Global Search** | Instantly search students, records, and transactions |
| 🗂️ **Audit Logs** | Full trail of all admin-level actions for accountability |

---

## ◈ Tech Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                           FRONTEND                               │
│         Next.js  ·  React  ·  Tailwind CSS  ·  Recharts          │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                           BACKEND                                │
│              Node.js  ·  Express.js  ·  REST API                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                          DATABASE                                │
│                  PostgreSQL  ·  schema.sql                       │
└──────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION                              │
│                    JWT  ·  bcrypt                                │
└──────────────────────────────────────────────────────────────────┘
```

**At a Glance:**

- **Frontend** — Next.js (App Router) + React + Tailwind CSS + Recharts
- **Backend** — Node.js + Express.js REST API
- **Database** — PostgreSQL (schema-first, versioned via `schema.sql`)
- **Auth** — JWT tokens + bcrypt password hashing
- **Deployment** — Vercel (frontend) + any Node.js host (backend)
- **Languages** — JavaScript `99.2%` · CSS `0.8%`

---

## ◈ Repository Structure

```
GenesisLMS/
├── frontend/               # Next.js application
│   ├── app/                # App Router pages & layouts
│   ├── components/         # Shared UI components
│   └── lib/                # API clients, hooks, utilities
├── backend/                # Express.js REST API
│   ├── routes/             # Role-scoped API routes
│   ├── middleware/         # Auth & role-guard middleware
│   ├── controllers/        # Business logic handlers
│   └── schema.sql          # Full PostgreSQL schema
├── vercel.json             # Vercel deployment config
└── .gitignore
```

---

## ◈ Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)

---

### 1 — Database

Create a PostgreSQL database, then initialize the schema:

```bash
psql -U postgres -d school_management -f backend/schema.sql
```

> This seeds the database with default roles and users (see credentials below).

---

### 2 — Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/school_management
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Start the server:

```bash
npm start
```

API is live at `http://localhost:5000`

---

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

App is live at `http://localhost:3000`

---

### 4 — Default Login Credentials

| Role | Email | Password |
|---|---|---|
| 👤 Admin | admin@school.com | admin123 |
| 📚 Teacher | teacher@school.com | admin123 |
| 💰 Accountant | accountant@school.com | admin123 |

> ⚠️ Change all default passwords immediately in any non-development environment.

---

## ◈ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens |
| `PORT` | Optional | Backend server port (default: `5000`) |

> Never commit `.env` to version control. The `.gitignore` handles this, but always double-check before pushing.

---

## ◈ Deployment

Genesis LMS is pre-configured for Vercel deployment via `vercel.json`.

```bash
# Deploy from root
npx vercel --prod
```

Or connect your GitHub repository directly in the [Vercel Dashboard](https://vercel.com/new) for automatic deploys on every push to `master`.

For the backend, deploy to any Node.js-compatible host (Railway, Render, Fly.io) and update your frontend environment with the live API URL.

---

## ◈ API Overview

All endpoints are protected by JWT middleware. Role guards restrict access per endpoint.

```
POST   /api/auth/login              → Authenticate & receive JWT

GET    /api/students                → List all students (Admin / Teacher)
POST   /api/students                → Create student (Admin)
PUT    /api/students/:id            → Update student (Admin)
DELETE /api/students/:id            → Delete student (Admin)

GET    /api/fees                    → List fee records (Admin / Accountant)
POST   /api/fees/payment            → Record a payment (Accountant)

GET    /api/marks/:studentId        → Get student marks (Teacher / Admin)
POST   /api/marks                   → Submit marks (Teacher)

GET    /api/attendance/:class/:date → Get attendance (Teacher / Admin)
POST   /api/attendance              → Mark attendance (Teacher)

GET    /api/audit-logs              → View audit trail (Admin only)
```

---

## ◈ The Design Principle

A school runs on many moving parts — finances, academics, attendance, people. Most platforms force every role to wade through everything.

Genesis LMS is built around a simple idea: **show each person exactly what they own, nothing else**. The Admin sees the full picture. The Teacher sees their classes. The Accountant sees the money. Every screen is scoped to its role, so no one is overwhelmed and nothing is accidentally exposed.

---

<div align="center">

**Built with intention** · **Live at [genesis-lms.vercel.app](https://genesis-lms.vercel.app)**

*© 2025 Genesis LMS. All rights reserved.*

</div>
