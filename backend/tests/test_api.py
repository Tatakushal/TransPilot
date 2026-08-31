import os

os.environ["DATABASE_URL"] = "sqlite:///./test_transitops.db"

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_and_vehicle_list():
    response = client.get("/api/vehicles")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_trip_crud_validation_for_missing_vehicle():
    response = client.post("/api/trips", json={
        "vehicle_registration": "MISSING",
        "driver_license": "MISSING",
        "source": "Hyderabad",
        "destination": "Bangalore",
        "cargo_weight": 100,
        "trip_date": "2026-08-31",
        "status": "Pending",
    })
    assert response.status_code == 400


def test_unknown_trip_returns_404():
    response = client.get("/api/trips/999999999")
    assert response.status_code == 404
