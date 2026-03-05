from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from marshmallow import ValidationError
from flask import Flask, jsonify, request

db = SQLAlchemy()
jwt = JWTManager()


def init_extensions(app: Flask) -> None:
    db.init_app(app)
    jwt.init_app(app)

    @app.errorhandler(ValidationError)
    def handle_validation_error(err: ValidationError):
        response = {"errors": err.messages}
        app.logger.warning("Validation error: %s", err.messages)
        return jsonify(response), 400

    @app.errorhandler(404)
    def handle_not_found(err):
        app.logger.warning("Not found: %s %s", request.method, request.path)
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(400)
    def handle_bad_request(err):
        app.logger.warning("Bad request: %s", err)
        return jsonify({"error": "Bad request"}), 400

    @app.errorhandler(401)
    def handle_unauthorized(err):
        app.logger.warning("Unauthorized: %s", err)
        return jsonify({"error": "Unauthorized"}), 401

    @app.errorhandler(500)
    def handle_server_error(err):
        app.logger.exception("Internal server error")
        return jsonify({"error": "Internal server error"}), 500

