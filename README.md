# School Management System

A full-featured school management portal with role-based access for Admin, Teachers, and Accountants.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js, PostgreSQL
- **Auth:** JWT + bcrypt

## Features

- Role-based dashboard (Admin/Teacher/Accountant)
- Student management with search
- Fee management with payment tracking
- Marks management with auto grade calculation
- Attendance management
- Reports & analytics
- Audit logs
- Search system

## Setup

### 1. Database

Create a PostgreSQL database and run:

```bash
psql -U postgres -d school_management -f backend/schema.sql
```

Default credentials in schema: admin@school.com / teacher@school.com / accountant@school.com (password: admin123 for all).

### 2. Backend

```bash
cd backend
npm install
# Edit .env with your database URL
npm start
```

API runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on http://localhost:3000

### 4. Login

- **Admin:** admin@school.com / admin123
- **Teacher:** teacher@school.com / admin123
- **Accountant:** accountant@school.com / admin123
