import pytest

from app import create_app
from config import TestingConfig
from extensions import db
from models import User


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def register_user(client, username="alice", email="alice@example.com", password="password123"):
    return client.post(
        "/api/register",
        json={"username": username, "email": email, "password": password},
    )


def login_user(client, username="alice", password="password123"):
    return client.post(
        "/api/login",
        json={"username": username, "password": password},
    )


def test_register_success(client, app):
    response = register_user(client)
    assert response.status_code == 201
    data = response.get_json()
    assert data["username"] == "alice"
    with app.app_context():
        assert User.query.filter_by(username="alice").first() is not None


def test_register_duplicate_username(client, app):
    register_user(client)
    response = register_user(client, email="alice2@example.com")
    assert response.status_code == 400
    data = response.get_json()
    assert "username" in data["errors"]


def test_register_duplicate_email(client, app):
    register_user(client)
    response = register_user(client, username="alice2")
    assert response.status_code == 400
    data = response.get_json()
    assert "email" in data["errors"]


def test_login_success(client, app):
    register_user(client)
    response = login_user(client)
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert data["user"]["username"] == "alice"


def test_login_invalid_credentials(client, app):
    register_user(client)
    response = client.post(
        "/api/login",
        json={"username": "alice", "password": "wrong"},
    )
    assert response.status_code == 401
    data = response.get_json()
    assert data["error"] == "Invalid credentials"

