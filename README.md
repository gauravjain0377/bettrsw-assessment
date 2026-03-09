# Task Tracker MVP

A lightweight fullstack task-management application built for small teams and individual developers. Register, log in, create tasks, assign them to yourself or teammates, and move them through clear statuses — **todo → in_progress → done** — without heavy tooling.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Key Technical Decisions](#key-technical-decisions)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Permissions Matrix](#permissions-matrix)
8. [Running Tests](#running-tests)
9. [Deployment](#deployment)
10. [AI Usage & Guidance](#ai-usage--guidance)
11. [Known Risks & Tradeoffs](#known-risks--tradeoffs)
12. [Extension Approach](#extension-approach)

---

## Architecture Overview

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   Frontend (React + Vite)│         │  Backend (Flask REST API) │
│   Tailwind CSS styling   │── HTTP ─▶ /api/register, /login    │
│   Axios HTTP client      │◀────────│ /api/tasks (CRUD)         │
│   react-hot-toast        │         │ Marshmallow validation    │
│   JWT in localStorage    │         │ JWT Authentication        │
│   Port 3000              │         │ Port 5000                 │
└──────────────────────────┘         └───────────┬──────────────┘
                                                 │ SQLAlchemy ORM
                                     ┌───────────▼──────────────┐
                                     │  PostgreSQL / SQLite      │
                                     │  (task_tracker_db)        │
                                     └──────────────────────────┘
```

**Data flow:** Frontend → Axios (attaches JWT) → Flask API → Marshmallow validates → SQLAlchemy queries DB → JSON response → Frontend renders.

---

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| **Backend framework** | Flask | Lightweight, minimal boilerplate for a small REST API; fast to prototype and deploy. Chosen over Django because we don't need an admin panel, ORM migrations CLI, or template rendering. |
| **Database** | PostgreSQL (production) / SQLite (local dev) | PostgreSQL for relational integrity and production-readiness. SQLite option (`USE_SQLITE=1`) removes the need for a running database during local development — zero-config onboarding. |
| **ORM** | SQLAlchemy (Flask-SQLAlchemy) | Type-safe schema definitions, relationships, and query building. Auto-creates tables on first run (`db.create_all()`), avoiding a separate migration tool for an MVP. |
| **Authentication** | JWT via `flask-jwt-extended` | Stateless tokens suit an SPA architecture — no server-side sessions, no sticky connections. 8-hour expiry balances usability and security. |
| **Password hashing** | bcrypt | Industry-standard adaptive hash. Salted automatically, resistant to rainbow tables and brute-force attacks. |
| **Validation** | Marshmallow schemas | Separates validation logic from route handlers. Validates input shape, type, and business rules (e.g., unique username, valid assigned user) before any DB operation. |
| **Frontend framework** | React + Vite | Vite provides sub-second HMR and fast builds. React's component model keeps UI logic modular (Login, Register, TaskForm, TaskTable, Dashboard). |
| **Styling** | Tailwind CSS | Utility-first CSS eliminates naming overhead and keeps styles co-located with markup. No custom CSS files needed — the design stays consistent and scannable. |
| **HTTP client** | Axios with interceptors | Request interceptor auto-attaches JWT token. Response interceptor catches errors globally and displays toast notifications — error handling is defined once, not in every component. |
| **Error handling** | Centralized (backend + frontend) | Backend: `extensions.py` registers Flask error handlers for 400/401/404/500 + Marshmallow `ValidationError`. Frontend: Axios response interceptor shows `react-hot-toast` for every API error. |
| **Business logic placement** | In models, not route handlers | `User.register()`, `User.authenticate()`, `Task.list_tasks()`, `Task.create_task()`, etc. keep route handlers thin and make logic testable independently. |
| **Logging** | Structured, file + console | `RotatingFileHandler` (max 1 MB, 3 backups) + console. Every request/response logged with method, path, remote address, and status. |
| **Testing** | pytest with in-memory SQLite | Tests run against `TestingConfig` (SQLite in-memory) — no external database needed. Tests cover auth flows (register, login, duplicates, invalid credentials) and task CRUD (create, update, delete, filter by status, filter by assignee). |
| **Deployment** | Vercel (frontend) + Render (backend) | Static SPA on Vercel (free tier, edge CDN). Flask API on Render with Gunicorn. API URL configured via `VITE_API_URL` env var. |

---

## Project Structure

```
├── backend/
│   ├── app.py              # Flask application factory, CORS, logging, health check
│   ├── config.py           # Database URI resolution (Postgres / SQLite / DATABASE_URL)
│   ├── extensions.py       # SQLAlchemy + JWT init, centralized error handlers
│   ├── models.py           # User and Task domain models with business logic
│   ├── schemas.py          # Marshmallow validation schemas (input + output)
│   ├── run.py              # Local dev entry point (loads .env, starts Flask)
│   ├── requirements.txt    # Python dependencies
│   ├── routes/
│   │   ├── __init__.py     # Blueprint registration
│   │   ├── auth.py         # POST /register, POST /login
│   │   └── tasks.py        # GET/POST/PUT/DELETE /tasks
│   ├── tests/
│   │   ├── test_auth.py    # Auth endpoint tests (register, login, duplicate checks)
│   │   └── test_tasks.py   # Task CRUD tests (create, update, delete, filter)
│   └── logs/               # Rotating log files (auto-created)
│
├── frontend/
│   ├── index.html          # Vite entry HTML
│   ├── package.json        # npm dependencies and scripts
│   ├── vite.config.js      # Vite config
│   ├── tailwind.config.js  # Tailwind config
│   ├── postcss.config.js   # PostCSS config
│   └── src/
│       ├── main.jsx        # React DOM render
│       ├── App.jsx         # Root: landing page vs dashboard, auth modals
│       ├── index.css        # Tailwind directives
│       ├── components/
│       │   ├── Login.jsx   # Login form component
│       │   ├── Register.jsx # Registration form component
│       │   ├── TaskForm.jsx # Create/Edit task form
│       │   └── TaskTable.jsx # Task list table with inline status change
│       ├── hooks/
│       │   └── useAuth.js  # Auth state hook (token + user in localStorage)
│       ├── pages/
│       │   └── Dashboard.jsx # Task dashboard (filters, CRUD operations)
│       └── services/
│           └── api.js      # Axios instance with JWT interceptor + error toasts
│
├── .env.example            # Environment variable template
├── vercel.json             # Vercel deployment config (frontend)
└── PRD.md                  # Product Requirements Document
```

---

## Getting Started

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.10+ | Required for backend |
| Node.js | 18+ | Required for frontend |
| npm | 9+ | Comes with Node.js |
| PostgreSQL | 13+ | **Optional** — set `USE_SQLITE=1` to use SQLite for local dev |

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/bettrsw-assessment.git
   cd bettrsw-assessment
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your values:

   ```env
   # Option A: Use SQLite for zero-config local dev
   USE_SQLITE=1

   # Option B: Use PostgreSQL
   # DB_HOST=localhost
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   # DB_NAME=task_tracker_db

   JWT_SECRET=your-long-random-secret-string
   ```

   > **Tip:** For the fastest local setup, just set `USE_SQLITE=1` and `JWT_SECRET`. No database installation needed.

3. **Install Python dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Start the backend**

   ```bash
   python run.py
   ```

   The API starts at **http://localhost:5000/api**. Health check: `GET /api/health`.

### Frontend Setup

1. **Install npm dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app runs at **http://localhost:3000**.

3. **(Optional) Set API URL for deployment**

   Create `frontend/.env`:

   ```env
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## Database Schema

### `users` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL (bcrypt) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### `tasks` table

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | NULLABLE |
| `status` | ENUM('todo','in_progress','done') | DEFAULT 'todo' |
| `assigned_to` | INT | NULLABLE, FOREIGN KEY → `users.id` |
| `created_by` | INT | NOT NULL, FOREIGN KEY → `users.id` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP, ON UPDATE |

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Authentication

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/register` | `{ username, email, password }` | `201` — user object | No |
| POST | `/login` | `{ username, password }` | `200` — `{ access_token, user }` | No |

### Tasks (JWT Required)

| Method | Endpoint | Body / Params | Response | Who |
|--------|----------|---------------|----------|-----|
| GET | `/tasks` | `?status=todo\|in_progress\|done` `?assigned_to=me` | `200` — array of tasks | Any authenticated user (filtered to own/assigned) |
| POST | `/tasks` | `{ title, description?, status?, assigned_to? }` | `201` — created task | Any authenticated user |
| PUT | `/tasks/:id` | `{ title?, description?, status?, assigned_to? }` | `200` — updated task | Creator: all fields. Assignee: `status` only. |
| DELETE | `/tasks/:id` | — | `200` — `{ message }` | Creator only |

### Error Responses

All errors return JSON: `{ "error": "..." }` or `{ "errors": { field: [...] } }` with appropriate HTTP status codes (400, 401, 404, 500).

---

## Permissions Matrix

| Action | Task Creator | Assignee (not creator) | Other Users |
|--------|:----------:|:--------------------:|:-----------:|
| See task | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ | ✅ (own tasks) |
| Edit title, description, assignee | ✅ | ❌ | ❌ |
| Change status | ✅ | ✅ | ❌ |
| Delete task | ✅ | ❌ | ❌ |

**Key rule:** A user's task list is scoped — they only see tasks they created OR tasks assigned to them. There is no global view.

---

## Running Tests

Tests use **pytest** with an in-memory SQLite database — no external dependencies needed.

```bash
cd backend
pip install pytest       # if not already installed
pytest tests -v
```

### What's Tested

| File | Coverage |
|------|----------|
| `test_auth.py` | Register success, duplicate username, duplicate email, login success, invalid credentials |
| `test_tasks.py` | Create task, update status, delete task, filter by status, filter by "assigned to me" (multi-user) |

---

## Deployment

### Frontend → Vercel

1. Connect the GitHub repo to Vercel.
2. Set **Root Directory** to `frontend`.
3. Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
4. Vercel auto-detects Vite via `vercel.json` — builds and deploys.

### Backend → Render

1. Create a **Web Service** on Render, connected to the repo.
2. Set **Root Directory** to `backend`.
3. **Build command:** `pip install -r requirements.txt`
4. **Start command:** `gunicorn app:application`
5. Add environment variables: `DATABASE_URL` (from Render PostgreSQL add-on), `JWT_SECRET`.

---

## AI Usage & Guidance

### How AI Was Used

This project was built with AI coding assistance under strict constraints:

- **Architecture-first:** AI followed a predefined PRD (`PRD.md`) with fixed tech stack, schema, and permission rules. No freestyle feature additions.
- **Thin handlers, rich models:** AI was instructed to keep route handlers as pass-through orchestrators. All business logic (password hashing, token generation, task filtering, permission checks) lives in `models.py`.
- **Validation boundary:** AI was guided to use Marshmallow schemas as the single validation layer — route handlers trust schema output, no duplicate checks.
- **Every generated file was reviewed** for: correct permission enforcement, proper error propagation, no hardcoded secrets, and adherence to the PRD scope.

### AI Guidance Constraints

| Rule | How It's Enforced |
|------|-------------------|
| No feature creep | PRD defines exact scope; "Out of Scope" section lists excluded features explicitly |
| Security by default | Passwords always bcrypt-hashed; JWT on every task endpoint; permissions checked server-side |
| Predictable structure | Factory pattern (`create_app`), blueprint registration, single extension init file |
| Validation at boundaries | Marshmallow schemas validate every API input before it touches the database |
| Test coverage | Tests written for every critical path; use in-memory DB for isolation |

---

## Known Risks & Tradeoffs

| Risk / Tradeoff | Explanation | Mitigation |
|-----------------|-------------|------------|
| **No migration tool** | `db.create_all()` creates tables but doesn't handle schema changes on existing data. | Acceptable for MVP. Add Flask-Migrate (Alembic) before any schema changes in production. |
| **JWT in localStorage** | Vulnerable to XSS attacks (scripts can read tokens). | No sensitive actions beyond task CRUD. For production, consider HttpOnly cookies. |
| **CORS set to `*`** | Open CORS in dev mode accepts any origin. | Restrict to specific frontend domain(s) in production deployment. |
| **User ID–based assignment** | Users must know each other's numeric IDs to assign tasks. | Acceptable for MVP scope. Extend with a user search/autocomplete endpoint. |
| **No rate limiting** | API endpoints aren't rate-limited against abuse. | Add `flask-limiter` before production exposure. |
| **No email verification** | Accounts can be created with unverified emails. | Explicitly out of scope per PRD. |

---

## Extension Approach

The codebase is designed for incremental extension without widespread changes:

| Extension | How to Add | Files Affected |
|-----------|-----------|---------------|
| **New task field** (e.g., due date) | Add column to `Task` model, field to `TaskSchema` / `TaskCreateSchema` / `TaskUpdateSchema`, and render in `TaskForm.jsx` + `TaskTable.jsx`. | `models.py`, `schemas.py`, 2 frontend components |
| **User search endpoint** | Add `GET /api/users?q=...` route in a new `routes/users.py`, register blueprint. | New file + `routes/__init__.py` |
| **Role-based access (admin)** | Add `role` column to `User`, check in route decorators or middleware. | `models.py`, `schemas.py`, task routes |
| **Real-time updates** | Add Flask-SocketIO, emit events on task create/update/delete. | `extensions.py`, task routes, frontend WebSocket hook |
| **Database migrations** | Install `flask-migrate`, generate initial migration from current schema. | `requirements.txt`, new `migrations/` directory |
