import pytest

from app import create_app
from config import TestingConfig
from extensions import db
from models import User, Task


@pytest.fixture
def app():
    app = create_app(TestingConfig)
    with app.app_context():
        db.create_all()
        user = User.register("alice", "alice@example.com", "password123")
        User.register("bob", "bob@example.com", "password123")
        db.session.commit()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_header(client):
    response = client.post(
        "/api/login",
        json={"username": "alice", "password": "password123"},
    )
    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_task(client, auth_header, **overrides):
    payload = {
        "title": "Test Task",
        "description": "Task description",
        "status": "todo",
        "assigned_to": 2,
    }
    payload.update(overrides)
    return client.post("/api/tasks", json=payload, headers=auth_header)


def test_create_task_success(client, auth_header, app):
    response = create_task(client, auth_header)
    assert response.status_code == 201
    data = response.get_json()
    assert data["title"] == "Test Task"
    with app.app_context():
        assert Task.query.count() == 1


def test_update_task_status(client, auth_header):
    create_resp = create_task(client, auth_header)
    task_id = create_resp.get_json()["id"]

    response = client.put(
        f"/api/tasks/{task_id}",
        json={"status": "in_progress"},
        headers=auth_header,
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "in_progress"


def test_delete_task(client, auth_header, app):
    create_resp = create_task(client, auth_header)
    task_id = create_resp.get_json()["id"]

    response = client.delete(f"/api/tasks/{task_id}", headers=auth_header)
    assert response.status_code == 200
    with app.app_context():
        assert Task.query.count() == 0


def test_filter_tasks_by_status(client, auth_header):
    create_task(client, auth_header, status="todo")
    create_task(client, auth_header, status="done", title="Done Task")

    response = client.get("/api/tasks?status=done", headers=auth_header)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["status"] == "done"


def test_filter_tasks_assigned_to_me(client, auth_header):
    create_task(client, auth_header, assigned_to=2, title="Assigned To Bob")

    # Login as bob (id=2)
    login_resp = client.post(
        "/api/login",
        json={"username": "bob", "password": "password123"},
    )
    token_bob = login_resp.get_json()["access_token"]
    header_bob = {"Authorization": f"Bearer {token_bob}"}

    response = client.get("/api/tasks?assigned_to=me", headers=header_bob)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    assert data[0]["assigned_to"] == 2

