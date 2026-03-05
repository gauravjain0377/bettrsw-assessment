# Product Requirements Document (PRD)  
## Task Tracker MVP

**Version:** 1.0  
**Status:** Aligned with implemented product

---

## 1. Overview

### 1.1 Problem statement

Small teams and developers need a simple way to track work: create tasks, assign them to themselves or others, and move them through clear states (todo → in progress → done) without heavy tooling or complex workflows.

### 1.2 Product vision

A **lightweight task tracker** for individuals and small teams: minimal UI, fast auth, and clear rules for who can see and change which tasks. Built for developers who want to “assign to me” or “assign to a teammate” and update status without extra features.

### 1.3 Goals

- Let users **register and log in** quickly and manage tasks in one place.
- Support **task creation, assignment, status updates**, and filtering.
- Enforce **visibility and permissions**: only relevant users see and act on tasks.
- Keep the product **simple and deployable** (e.g. frontend on Vercel, backend on Render).

---

## 2. Users

| User type | Description | Primary needs |
|-----------|-------------|----------------|
| **Registered user** | Anyone who has signed up and logged in | Create tasks, assign to self or others, change status, filter list, edit/delete own-created tasks. |
| **Assignee (non-creator)** | User who is assigned a task by someone else | See assigned tasks, change status only (todo / in progress / done). No edit or delete. |

No admin or guest roles in scope.

---

## 3. Functional requirements

### 3.1 Authentication

| ID | Requirement | Acceptance |
|----|-------------|------------|
| A1 | User can register with username, email, password. | Username 3–100 chars, unique; email valid and unique; password min 6 chars. |
| A2 | User can log in with username and password. | Returns JWT and user info; invalid credentials return 401. |
| A3 | Session is maintained via JWT in frontend. | Authenticated requests send `Authorization: Bearer <token>`. |
| A4 | User can log out. | Client clears token and user state; subsequent API calls are unauthorized. |

### 3.2 Tasks – visibility

| ID | Requirement | Acceptance |
|----|-------------|------------|
| T1 | A user sees only tasks they **created** or tasks **assigned to them**. | No one else sees “my personal” or “assigned to me” tasks. |
| T2 | Tasks assigned to another user are visible to **creator and assignee only**. | Both can see the task; others cannot. |
| T3 | List can be filtered by status (todo / in progress / done) and by “assigned to me”. | GET `/tasks?status=...` and `assigned_to=me` work and respect visibility. |

### 3.3 Tasks – creation and assignment

| ID | Requirement | Acceptance |
|----|-------------|------------|
| T4 | Authenticated user can create a task with title, optional description, status, optional assignee. | Title required (1–255 chars); status one of todo, in_progress, done; assignee is existing user ID or empty. |
| T5 | Assignee is identified by **user ID**. | UI shows current user’s ID; creator can assign to self (own ID) or another user’s ID. |
| T6 | Task has exactly one creator (`created_by`) and at most one assignee (`assigned_to`). | Stored and returned in API; assignee optional. |

### 3.4 Tasks – updates and permissions

| ID | Requirement | Acceptance |
|----|-------------|------------|
| T7 | **Creator** can edit (title, description, status, assignee) and delete the task. | PUT and DELETE allowed for `created_by` user. |
| T8 | **Assignee (not creator)** can only update **status** (todo / in progress / done). | PUT with only `status` allowed; no title, description, assignee, or delete. |
| T9 | Status can be changed from the list (e.g. dropdown) without opening full edit. | Creator and assignee can change status from table/dropdown; backend accepts PATCH/PUT with `status`. |

### 3.5 User experience (frontend)

| ID | Requirement | Acceptance |
|----|-------------|------------|
| U1 | Unauthenticated users see a **landing page** with value proposition and a **Login** entry point. | No task list; Login opens modal. |
| U2 | Login modal offers **Login** and a link to **Register**; Register modal offers **Register** and link to Login. | Single flow: modal for auth, switch between login/register. |
| U3 | Authenticated users see a **dashboard**: task list, filters (status, assigned to me), create/edit form, and table with status dropdown and actions. | Create/edit in sidebar or form; table shows Edit/Delete for creator-only; status dropdown for creator and assignee. |
| U4 | Clear feedback on success and error (e.g. toasts). | API errors and key actions (e.g. “Task created”) surfaced to user. |
| U5 | UI is **light theme** (white background, black text) and minimal. | Readable, professional, no dark mode required. |

---

## 4. Non-functional requirements

| ID | Requirement |
|----|-------------|
| N1 | API is RESTful; JSON request/response; appropriate HTTP status codes. |
| N2 | Passwords stored hashed (e.g. bcrypt); never returned in API. |
| N3 | JWT used for auth; token has reasonable expiry (e.g. 8 hours). |
| N4 | Validation and permission checks on backend; frontend can optimize UX but not enforce security. |
| N5 | Frontend can be deployed to Vercel; backend to a service like Render; API URL configurable via env (e.g. `VITE_API_URL`). |
| N6 | CORS allows frontend origin to call API (e.g. configured for deployment domains). |

---

## 5. Permissions matrix

| Action | Creator | Assignee (not creator) | Other users |
|--------|--------|------------------------|------------|
| See task | Yes | Yes | No |
| Create task | Yes | Yes | Yes (own tasks) |
| Update title, description, assignee | Yes | No | No |
| Update status only | Yes | Yes | No |
| Delete task | Yes | No | No |

---

## 6. Tech stack (decisions)

| Layer | Choice | Rationale |
|-------|--------|------------|
| Backend | Python, Flask | Simple API, quick to deploy. |
| Database | MySQL | Relational data (users, tasks, FKs). |
| ORM | SQLAlchemy (Flask-SQLAlchemy) | Schema, migrations, queries. |
| Auth | JWT (flask-jwt-extended) | Stateless, works with SPA. |
| Validation | Marshmallow | Request/response validation and serialization. |
| Frontend | React, Vite | Fast dev and build, good DX. |
| Styling | Tailwind CSS | Utility-first, minimal custom CSS. |
| HTTP client | Axios | Interceptors for auth and error toasts. |
| Hosting | Frontend: Vercel; Backend: e.g. Render | Fits static + API deployment. |

---

## 7. Out of scope (MVP)

- Admin panel or admin-only actions.
- Password reset or email verification.
- Multiple assignees per task.
- Comments, attachments, or due dates.
- Real-time updates (e.g. WebSockets).
- Mobile app or native clients (web only).
- Public or shareable task views (no unauthenticated access to tasks).

---

## 8. Success criteria

- [ ] Users can register, log in, and log out.
- [ ] Users see only tasks they created or are assigned to.
- [ ] Creator can create, full-edit, and delete tasks; assignee can only change status (e.g. via dropdown).
- [ ] Filters (status, “assigned to me”) work correctly.
- [ ] Frontend runs on Vercel and backend on Render (or equivalent) with env-based API URL.
- [ ] No critical security issues (passwords hashed, JWT, permissions enforced on backend).

---

## 9. Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | — | Initial PRD aligned with current Task Tracker MVP implementation. |
