import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test_transitops.db"

from main import app  # noqa: E402
from database import SessionLocal  # noqa: E402
from auth_models import UserAccountModel  # noqa: E402
from auth_security import hash_password  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client):
    email = f"test-{uuid4().hex}@example.com"
    password = "TestPassword123!"
    registration = client.post("/api/auth/register", json={"name": "Test User", "email": email, "password": password, "role": "fleet-manager"})
    assert registration.status_code == 201
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


@pytest.fixture
def admin_headers(client):
    email = f"admin-{uuid4().hex}@example.com"
    password = "AdminPassword123!"
    db = SessionLocal()
    try:
        db.add(UserAccountModel(name="Test Admin", email=email, password_hash=hash_password(password), role="admin", email_verified=True, is_active=True))
        db.commit()
    finally:
        db.close()
    login = client.post("/api/auth/login", json={"email": email, "password": password})
    assert login.status_code == 200
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_vehicle_list_requires_auth(client, auth_headers):
    assert client.get("/api/vehicles").status_code == 401
    response = client.get("/api/vehicles", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_trip_crud_validation_for_missing_vehicle(client, auth_headers):
    response = client.post("/api/trips", headers=auth_headers, json={"vehicle_registration": "MISSING", "driver_license": "MISSING", "source": "Hyderabad", "destination": "Bangalore", "cargo_weight": 100, "trip_date": "2026-08-31", "status": "Pending"})
    assert response.status_code == 400


def test_unknown_trip_returns_404(client, auth_headers):
    response = client.get("/api/trips/999999999", headers=auth_headers)
    assert response.status_code == 404


def test_non_admin_cannot_access_admin_control(client, auth_headers):
    response = client.get("/api/auth/control/overview", headers=auth_headers)
    assert response.status_code == 403


def test_admin_control_center_can_manage_users_and_sessions(client, admin_headers):
    overview = client.get("/api/auth/control/overview", headers=admin_headers)
    assert overview.status_code == 200
    assert "active_sessions" in overview.json()

    roles = client.get("/api/auth/control/roles", headers=admin_headers)
    assert roles.status_code == 200
    assert any(role["id"] == "admin" for role in roles.json())

    email = f"managed-{uuid4().hex}@example.com"
    created = client.post("/api/auth/control/users", headers=admin_headers, json={"name": "Managed User", "email": email, "password": "ManagedPassword123!", "role": "dispatcher"})
    assert created.status_code == 201
    user_id = created.json()["id"]

    updated = client.post(f"/api/auth/control/users/{user_id}/update", headers=admin_headers, json={"role": "fleet-manager"})
    assert updated.status_code == 200
    assert updated.json()["role"] == "fleet-manager"

    sessions = client.get("/api/auth/control/sessions", headers=admin_headers)
    assert sessions.status_code == 200
    assert any(session["user_id"] == created.json()["id"] for session in sessions.json()) is False

    audit = client.get("/api/auth/control/audit-logs", headers=admin_headers)
    assert audit.status_code == 200
    assert any(log["action"] == "user_created" for log in audit.json())
