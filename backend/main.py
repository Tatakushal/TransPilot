import os
from contextlib import asynccontextmanager
from datetime import date
from enum import Enum
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from models import DriverModel, TripModel, VehicleModel
from fuel_api import router as fuel_router
from maintenance_api import router as maintenance_router
from auth_api import router as auth_router
from authorization import current_user, require_permission
import auth_models  # noqa: F401 - registers auth tables with SQLAlchemy metadata


def seed_demo_vehicles() -> None:
    """Optionally seed demo vehicles for local/demo environments only."""
    if os.getenv("SEED_DEMO_DATA", "false").lower() not in {"1", "true", "yes"}:
        return

    db = SessionLocal()
    try:
        if db.query(VehicleModel).count() > 0:
            return
        db.add_all([
            VehicleModel(registration_number="TS09AB1234", vehicle_name_model="Tata Prima 5530", type="Heavy Truck", max_load_capacity=15000, odometer=48250, acquisition_cost=2850000, status="Available"),
            VehicleModel(registration_number="TS10CD5678", vehicle_name_model="Ashok Leyland 4825", type="Heavy Truck", max_load_capacity=12000, odometer=71320, acquisition_cost=2450000, status="On Trip"),
            VehicleModel(registration_number="TS11EF9012", vehicle_name_model="Tata Ultra T.16", type="Medium Truck", max_load_capacity=8000, odometer=32100, acquisition_cost=1850000, status="Available"),
            VehicleModel(registration_number="TS12GH3456", vehicle_name_model="Mahindra Blazo X", type="Heavy Truck", max_load_capacity=14000, odometer=95600, acquisition_cost=2650000, status="In Shop"),
            VehicleModel(registration_number="TS13JK7890", vehicle_name_model="Eicher Pro 3015", type="Medium Truck", max_load_capacity=10000, odometer=55800, acquisition_cost=2100000, status="Available"),
        ])
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Keep database initialization out of module import so the server can load
    # cleanly even when a database connection is temporarily unavailable.
    try:
        Base.metadata.create_all(bind=engine)
        seed_demo_vehicles()
    except Exception as exc:
        print(f"Database initialization warning: {exc}")
    yield


app = FastAPI(
    title="TransitOps Smart Transport Operations Platform API",
    description="Production-Ready Backend API for TransitOps Vehicle Registry, Driver Management, Trips, Fuel, Maintenance, and Dashboard KPIs",
    version="1.4.0",
    lifespan=lifespan,
)

cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth_router)
app.include_router(fuel_router)
app.include_router(maintenance_router)


class VehicleStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"


class DriverStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"


class TripStatus(str, Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class VehicleBase(BaseModel):
    vehicle_name_model: str = Field(..., min_length=1, max_length=120)
    type: str = Field(..., min_length=1, max_length=80)
    max_load_capacity: float = Field(..., ge=0)
    odometer: float = Field(..., ge=0)
    acquisition_cost: float = Field(..., ge=0)
    status: VehicleStatus

    class Config:
        from_attributes = True


class VehicleCreate(VehicleBase):
    registration_number: str = Field(..., min_length=1, max_length=30)


class VehicleUpdate(VehicleBase):
    pass


class Vehicle(VehicleBase):
    registration_number: str


class DriverBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    license_category: str = Field(..., min_length=1, max_length=40)
    license_expiry_date: date
    contact_number: str = Field(..., min_length=5, max_length=30)
    safety_score: float = Field(..., ge=0, le=100)
    status: DriverStatus

    class Config:
        from_attributes = True


class DriverCreate(DriverBase):
    license_number: str = Field(..., min_length=1, max_length=40)


class DriverUpdate(DriverBase):
    pass


class Driver(DriverBase):
    license_number: str


class TripBase(BaseModel):
    vehicle_registration: str = Field(..., min_length=1, max_length=30)
    driver_license: str = Field(..., min_length=1, max_length=40)
    source: str = Field(..., min_length=1, max_length=160)
    destination: str = Field(..., min_length=1, max_length=160)
    cargo_weight: float = Field(..., ge=0)
    trip_date: date
    status: TripStatus = TripStatus.PENDING

    class Config:
        from_attributes = True


class TripCreate(TripBase):
    pass


class TripUpdate(TripBase):
    pass


class Trip(TripBase):
    id: int


class DashboardKPIs(BaseModel):
    active_vehicles: int
    available_vehicles: int
    vehicles_in_maintenance: int
    active_trips: int
    pending_trips: int
    drivers_on_duty: int
    fleet_utilization_percent: float


ACTIVE_TRIP_STATUSES = (TripStatus.PENDING.value, TripStatus.ACTIVE.value)


def _release_assignment(db: Session, vehicle_registration: str, driver_license: str, exclude_trip_id: int | None = None) -> None:
    """Release a vehicle/driver only when no other pending/active trip uses them."""
    filters_vehicle = [
        TripModel.vehicle_registration == vehicle_registration,
        TripModel.status.in_(ACTIVE_TRIP_STATUSES),
    ]
    filters_driver = [
        TripModel.driver_license == driver_license,
        TripModel.status.in_(ACTIVE_TRIP_STATUSES),
    ]
    if exclude_trip_id is not None:
        filters_vehicle.append(TripModel.id != exclude_trip_id)
        filters_driver.append(TripModel.id != exclude_trip_id)

    vehicle_busy = db.query(TripModel.id).filter(*filters_vehicle).first() is not None
    driver_busy = db.query(TripModel.id).filter(*filters_driver).first() is not None

    if not vehicle_busy:
        vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == vehicle_registration).first()
        if vehicle and vehicle.status == VehicleStatus.ON_TRIP.value:
            vehicle.status = VehicleStatus.AVAILABLE.value
    if not driver_busy:
        driver = db.query(DriverModel).filter(DriverModel.license_number == driver_license).first()
        if driver and driver.status == DriverStatus.ON_TRIP.value:
            driver.status = DriverStatus.AVAILABLE.value


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
def get_vehicles(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    return db.query(VehicleModel).all()


@app.get("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def get_vehicle(registration_number: str, _: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration_number.strip().upper()).first()
    if not vehicle:
        raise HTTPException(404, f"Vehicle with registration number '{registration_number}' not found.")
    return vehicle


@app.post("/api/vehicles", response_model=Vehicle, status_code=201, tags=["Vehicles"])
def create_vehicle(vehicle: VehicleCreate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    registration = vehicle.registration_number.strip().upper()
    if db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first():
        raise HTTPException(400, "Vehicle registration already exists")
    row = VehicleModel(
        registration_number=registration,
        vehicle_name_model=vehicle.vehicle_name_model.strip(),
        type=vehicle.type.strip(),
        max_load_capacity=vehicle.max_load_capacity,
        odometer=vehicle.odometer,
        acquisition_cost=vehicle.acquisition_cost,
        status=vehicle.status.value,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.put("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def update_vehicle(registration_number: str, vehicle_update: VehicleUpdate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    row = db.query(VehicleModel).filter(VehicleModel.registration_number == registration_number.strip().upper()).first()
    if not row:
        raise HTTPException(404, "Vehicle not found")
    row.vehicle_name_model = vehicle_update.vehicle_name_model.strip()
    row.type = vehicle_update.type.strip()
    row.max_load_capacity = vehicle_update.max_load_capacity
    row.odometer = vehicle_update.odometer
    row.acquisition_cost = vehicle_update.acquisition_cost
    row.status = vehicle_update.status.value
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/vehicles/{registration_number}", tags=["Vehicles"])
def delete_vehicle(registration_number: str, _: object = Depends(require_permission("delete")), db: Session = Depends(get_db)):
    row = db.query(VehicleModel).filter(VehicleModel.registration_number == registration_number.strip().upper()).first()
    if not row:
        raise HTTPException(404, "Vehicle not found")
    if db.query(TripModel.id).filter(TripModel.vehicle_registration == row.registration_number, TripModel.status.in_(ACTIVE_TRIP_STATUSES)).first():
        raise HTTPException(409, "Vehicle has an active or pending trip and cannot be deleted")
    db.delete(row)
    db.commit()
    return {"message": "Vehicle deleted"}


@app.get("/api/drivers", response_model=List[Driver], tags=["Drivers"])
def get_drivers(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    return db.query(DriverModel).all()


@app.get("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def get_driver(license_number: str, _: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    row = db.query(DriverModel).filter(DriverModel.license_number == license_number.strip().upper()).first()
    if not row:
        raise HTTPException(404, "Driver not found")
    return row


@app.post("/api/drivers", response_model=Driver, status_code=201, tags=["Drivers"])
def create_driver(driver: DriverCreate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    license_number = driver.license_number.strip().upper()
    if db.query(DriverModel).filter(DriverModel.license_number == license_number).first():
        raise HTTPException(400, "License number already exists")
    row = DriverModel(
        name=driver.name.strip(),
        license_number=license_number,
        license_category=driver.license_category.strip(),
        license_expiry_date=driver.license_expiry_date.isoformat(),
        contact_number=driver.contact_number.strip(),
        safety_score=driver.safety_score,
        status=driver.status.value,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.put("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def update_driver(license_number: str, driver_update: DriverUpdate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    row = db.query(DriverModel).filter(DriverModel.license_number == license_number.strip().upper()).first()
    if not row:
        raise HTTPException(404, "Driver not found")
    row.name = driver_update.name.strip()
    row.license_category = driver_update.license_category.strip()
    row.license_expiry_date = driver_update.license_expiry_date.isoformat()
    row.contact_number = driver_update.contact_number.strip()
    row.safety_score = driver_update.safety_score
    row.status = driver_update.status.value
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/drivers/{license_number}", tags=["Drivers"])
def delete_driver(license_number: str, _: object = Depends(require_permission("delete")), db: Session = Depends(get_db)):
    row = db.query(DriverModel).filter(DriverModel.license_number == license_number.strip().upper()).first()
    if not row:
        raise HTTPException(404, "Driver not found")
    if db.query(TripModel.id).filter(TripModel.driver_license == row.license_number, TripModel.status.in_(ACTIVE_TRIP_STATUSES)).first():
        raise HTTPException(409, "Driver has an active or pending trip and cannot be deleted")
    db.delete(row)
    db.commit()
    return {"message": "Driver deleted"}


@app.get("/api/trips", response_model=List[Trip], tags=["Trips"])
def get_trips(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    return db.query(TripModel).order_by(TripModel.trip_date.desc(), TripModel.id.desc()).all()


@app.get("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def get_trip(trip_id: int, _: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    row = db.get(TripModel, trip_id)
    if not row:
        raise HTTPException(404, "Trip not found")
    return row


@app.post("/api/trips", response_model=Trip, status_code=201, tags=["Trips"])
def create_trip(trip: TripCreate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    registration = trip.vehicle_registration.strip().upper()
    license_number = trip.driver_license.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    driver = db.query(DriverModel).filter(DriverModel.license_number == license_number).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    if not driver:
        raise HTTPException(400, "Driver does not exist")
    if vehicle.status != VehicleStatus.AVAILABLE.value:
        raise HTTPException(400, "Vehicle is not available")
    if driver.status != DriverStatus.AVAILABLE.value:
        raise HTTPException(400, "Driver is not available")
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(400, "Cargo weight exceeds vehicle capacity")

    row = TripModel(
        vehicle_registration=registration,
        driver_license=license_number,
        source=trip.source.strip(),
        destination=trip.destination.strip(),
        cargo_weight=trip.cargo_weight,
        trip_date=trip.trip_date,
        status=trip.status.value,
    )
    db.add(row)
    if trip.status in (TripStatus.PENDING, TripStatus.ACTIVE):
        vehicle.status = VehicleStatus.ON_TRIP.value
        driver.status = DriverStatus.ON_TRIP.value
    db.commit()
    db.refresh(row)
    return row


@app.put("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def update_trip(trip_id: int, trip_update: TripUpdate, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    row = db.get(TripModel, trip_id)
    if not row:
        raise HTTPException(404, "Trip not found")

    old_registration = row.vehicle_registration
    old_license = row.driver_license
    old_status = row.status
    registration = trip_update.vehicle_registration.strip().upper()
    license_number = trip_update.driver_license.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    driver = db.query(DriverModel).filter(DriverModel.license_number == license_number).first()
    if not vehicle or not driver:
        raise HTTPException(400, "Selected vehicle or driver does not exist")
    if trip_update.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(400, "Cargo weight exceeds vehicle capacity")

    assignment_changes = registration != old_registration or license_number != old_license
    if trip_update.status in (TripStatus.PENDING, TripStatus.ACTIVE):
        if assignment_changes or old_status not in ACTIVE_TRIP_STATUSES:
            if vehicle.status != VehicleStatus.AVAILABLE.value:
                raise HTTPException(400, "Selected vehicle is not available")
            if driver.status != DriverStatus.AVAILABLE.value:
                raise HTTPException(400, "Selected driver is not available")

    row.vehicle_registration = registration
    row.driver_license = license_number
    row.source = trip_update.source.strip()
    row.destination = trip_update.destination.strip()
    row.cargo_weight = trip_update.cargo_weight
    row.trip_date = trip_update.trip_date
    row.status = trip_update.status.value

    if trip_update.status in (TripStatus.PENDING, TripStatus.ACTIVE):
        vehicle.status = VehicleStatus.ON_TRIP.value
        driver.status = DriverStatus.ON_TRIP.value
        if assignment_changes or old_status not in ACTIVE_TRIP_STATUSES:
            _release_assignment(db, old_registration, old_license, exclude_trip_id=trip_id)
    else:
        _release_assignment(db, old_registration, old_license, exclude_trip_id=trip_id)
        if registration != old_registration:
            _release_assignment(db, registration, license_number, exclude_trip_id=trip_id)

    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/trips/{trip_id}", tags=["Trips"])
def delete_trip(trip_id: int, _: object = Depends(require_permission("delete")), db: Session = Depends(get_db)):
    row = db.get(TripModel, trip_id)
    if not row:
        raise HTTPException(404, "Trip not found")
    old_registration = row.vehicle_registration
    old_license = row.driver_license
    db.delete(row)
    db.flush()
    _release_assignment(db, old_registration, old_license, exclude_trip_id=trip_id)
    db.commit()
    return {"message": "Trip deleted"}


@app.get("/api/dashboard/kpis", response_model=DashboardKPIs, tags=["Dashboard"])
def dashboard_kpis(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    vehicles = db.query(VehicleModel).all()
    drivers = db.query(DriverModel).all()
    trips = db.query(TripModel).all()
    active = sum(1 for vehicle in vehicles if vehicle.status != VehicleStatus.RETIRED.value)
    available = sum(1 for vehicle in vehicles if vehicle.status == VehicleStatus.AVAILABLE.value)
    return DashboardKPIs(
        active_vehicles=active,
        available_vehicles=available,
        vehicles_in_maintenance=sum(1 for vehicle in vehicles if vehicle.status == VehicleStatus.IN_SHOP.value),
        active_trips=sum(1 for trip in trips if trip.status == TripStatus.ACTIVE.value),
        pending_trips=sum(1 for trip in trips if trip.status == TripStatus.PENDING.value),
        drivers_on_duty=sum(1 for driver in drivers if driver.status in (DriverStatus.AVAILABLE.value, DriverStatus.ON_TRIP.value)),
        fleet_utilization_percent=round(((active - available) / active * 100) if active else 0, 1),
    )
