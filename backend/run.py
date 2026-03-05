import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend dir, then project root (so DB_* from root .env are used)
load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from app import create_app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

