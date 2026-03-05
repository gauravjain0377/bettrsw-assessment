import logging
from logging.handlers import RotatingFileHandler
import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from config import Config
from extensions import init_extensions, db
from routes import register_blueprints


def create_app(config_object: type[Config] = Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_object)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    configure_logging(app)
    init_extensions(app)

    # Ensure database tables exist
    from models import User, Task  # noqa: F401
    with app.app_context():
        db.create_all()

    register_blueprints(app)

    @app.route("/")
    def index():
        return jsonify({"service": "Task Tracker API", "docs": "Use /api/health, /api/register, /api/login, /api/tasks"}), 200

    @app.before_request
    def log_request():
        app.logger.info(
            "Request: %s %s from %s", request.method, request.path, request.remote_addr
        )

    @app.after_request
    def log_response(response):
        app.logger.info("Response: %s %s", response.status_code, response.status)
        return response

    @app.route("/api/health", methods=["GET"])
    def health():
        try:
            db.session.execute(db.text("SELECT 1"))
            return jsonify({"status": "ok"}), 200
        except Exception as exc:  # noqa: BLE001
            app.logger.exception("Database health check failed")
            return jsonify({"status": "error", "detail": str(exc)}), 500

    return app


def configure_logging(app: Flask) -> None:
    log_level = logging.INFO
    app.logger.setLevel(log_level)

    formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )

    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    app.logger.addHandler(console_handler)

    log_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(log_dir, exist_ok=True)
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"), maxBytes=1_000_000, backupCount=3
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)


# WSGI entry point for Gunicorn (use "app:application" in start command)
application = create_app()

