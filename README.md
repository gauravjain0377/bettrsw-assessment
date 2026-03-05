## Task Tracker MVP

### Project overview

**Task Tracker MVP** is a small fullstack application for software teams to register, log in, and manage tasks. Users can create tasks, assign them to team members, update their status, and filter tasks by status or tasks assigned to them.

### Architecture

- **Backend**: Python + Flask REST API (`backend`) exposing `/api` endpoints.
- **Database**: MySQL (`task_tracker_db`) accessed via SQLAlchemy ORM.
- **Frontend**: React + Vite + Tailwind CSS (`frontend`) consuming the Flask API.
- **Auth**: JWT (via `flask-jwt-extended`), tokens stored in `localStorage`.
- **Validation**: Marshmallow schemas on the backend.

### Tech stack

- **Backend**: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Marshmallow, bcrypt, mysql-connector-python, pytest.
- **Frontend**: React, Vite, Axios, Tailwind CSS, react-hot-toast.
- **Database**: MySQL 8+ (or compatible).

### Database schema

**Database name**: `task_tracker_db`

- **users**
  - `id` INT PK AUTO_INCREMENT
  - `username` VARCHAR(100) UNIQUE NOT NULL
  - `email` VARCHAR(150) UNIQUE NOT NULL
  - `password_hash` VARCHAR(255) NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

- **tasks**
  - `id` INT PK AUTO_INCREMENT
  - `title` VARCHAR(255) NOT NULL
  - `description` TEXT
  - `status` ENUM('todo','in_progress','done') DEFAULT 'todo'
  - `assigned_to` INT NULL REFERENCES `users(id)`
  - `created_by` INT NOT NULL REFERENCES `users(id)`
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### API endpoints

Base URL: `http://localhost:5000/api`

- **Auth**
  - **POST** `/register` – register a new user.
  - **POST** `/login` – log in, returns `{ access_token, user }`.

- **Tasks** (JWT required)
  - **GET** `/tasks` – list all tasks.
  - **GET** `/tasks?status=todo` – filter by status.
  - **GET** `/tasks?assigned_to=me` – tasks assigned to the current user.
  - **POST** `/tasks` – create a task.
  - **PUT** `/tasks/<task_id>` – update a task.
  - **DELETE** `/tasks/<task_id>` – delete a task.

All error responses are JSON with an `error` or `errors` field and appropriate status codes (`400`, `401`, `404`, `500`).

### Backend setup and usage

1. **Create `.env`**

   In the project root, copy `.env.example` to `.env` and edit values:

   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME` (should be `task_tracker_db`)
   - `JWT_SECRET`

   Make sure the MySQL database `task_tracker_db` exists.

2. **Install dependencies**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the backend**

   ```bash
   cd backend
   python run.py
   ```

   The API will be available at `http://localhost:5000/api`.

### Frontend setup and usage

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Run the dev server**

   ```bash
   cd frontend
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

### Running tests

Backend tests use `pytest` and an in-memory SQLite database (no need for MySQL during tests).

From the `backend` directory:

```bash
cd backend
pytest tests -v
```

### Frontend behavior

- **Login / Register**: Users can register with `username`, `email`, `password`, then log in with `username` and `password`. On success, the JWT token and basic user info are stored in `localStorage`.
- **Dashboard**: After login, the dashboard shows:
  - Task table with columns `title`, `description`, `status`, `assigned_to`.
  - Filters for `status` and "assigned to me".
  - Buttons to create, edit, and delete tasks.
- **Task assignment**: Tasks are assigned by numeric user ID (`assigned_to`).
- **Error handling**: Axios interceptors display `react-hot-toast` messages on API errors.

### AI usage explanation

This project was generated using an AI coding assistant with the following constraints:

- The assistant followed a predefined architecture and tech stack (Flask, React, MySQL, JWT, Marshmallow, Tailwind, Axios).
- It created all backend and frontend files, including configuration, routing, models, schemas, and tests.
- Business logic is kept out of route handlers where practical (delegated to models and schemas).
- The resulting code is intended to be readable, minimal, and ready to run locally without additional modifications.

# bettrsw assessment

