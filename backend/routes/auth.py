from flask import request, jsonify

from models import User
from schemas import UserSchema, LoginSchema
from . import auth_bp

user_schema = UserSchema()
login_schema = LoginSchema()


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    validated = user_schema.load(data)

    user = User.register(
        username=validated["username"],
        email=validated["email"],
        password=validated["password"],
    )

    result = user_schema.dump(user)
    result.pop("password", None)
    return jsonify(result), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    validated = login_schema.load(data)
    user = User.authenticate(
        username=validated["username"], password=validated["password"]
    )
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    token = user.generate_token()
    return jsonify({"access_token": token, "user": {"id": user.id, "username": user.username}}), 200

