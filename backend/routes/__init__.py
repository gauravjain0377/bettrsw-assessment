from flask import Blueprint

auth_bp = Blueprint("auth", __name__)
tasks_bp = Blueprint("tasks", __name__)

from . import auth, tasks  # noqa: E402,F401


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(tasks_bp, url_prefix="/api")

