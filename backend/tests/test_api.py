import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test_transitops.db"

from main import app  # noqa: E402


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers(client):
    email = f"test-{uuid4().hex}@example.com"
    password = "TestPassword123!"
    registration = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": password,
        "role": "fleet-manager",
    })
    assert registration.status_code == 201
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
    response = client.post("/api/trips", headers=auth_headers, json={
        "vehicle_registration": "MISSING",
        "driver_license": "MISSING",
        "source": "Hyderabad",
        "destination": "Bangalore",
        "cargo_weight": 100,
        "trip_date": "2026-08-31",
        "status": "Pending",
    })
    assert response.status_code == 400


def test_unknown_trip_returns_404(client, auth_headers):
    response = client.get("/api/trips/999999999", headers=auth_headers)
    assert response.status_code == 404
