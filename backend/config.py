import os
from pathlib import Path


def _get_database_uri():
    """
    Prefer DATABASE_URL (Render PostgreSQL). Else USE_SQLITE=1 for local SQLite, else build Postgres from DB_*.
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Render uses postgres:// or postgresql://; SQLAlchemy needs postgresql+psycopg:// (psycopg3)
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
        elif database_url.startswith("postgresql://"):
            database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        return database_url

    # Local dev: use SQLite so you can run without PostgreSQL
    use_sqlite = os.getenv("USE_SQLITE", "").strip().lower() in ("1", "true", "yes")
    if use_sqlite:
        db_path = Path(__file__).resolve().parent / "instance" / "app.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        return f"sqlite:///{db_path.as_posix()}"

    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")
    db_name = os.getenv("DB_NAME", "task_tracker_db")
    return f"postgresql+psycopg://{db_user}:{db_password}@{db_host}:5432/{db_name}"


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    SQLALCHEMY_DATABASE_URI = _get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    JWT_SECRET_KEY = os.getenv("JWT_SECRET", "dev-jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = 60 * 60 * 8  # 8 hours
