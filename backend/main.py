from datetime import date
from enum import Enum
from typing import List
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import VehicleModel, DriverModel, TripModel
from fuel_api import router as fuel_router
from maintenance_api import router as maintenance_router
from auth_api import router as auth_router
import auth_models

Base.metadata.create_all(bind=engine)


def seed_demo_vehicles():
    """Create a small demo fleet for a fresh local database only."""
    db = next(get_db())
    try:
        if db.query(VehicleModel).count() > 0:
            return
        demo_vehicles = [
            VehicleModel(registration_number="TS09AB1234", vehicle_name_model="Tata Prima 5530", type="Heavy Truck", max_load_capacity=15000, odometer=48250, acquisition_cost=2850000, status="Available"),
            VehicleModel(registration_number="TS10CD5678", vehicle_name_model="Ashok Leyland 4825", type="Heavy Truck", max_load_capacity=12000, odometer=71320, acquisition_cost=2450000, status="On Trip"),
            VehicleModel(registration_number="TS11EF9012", vehicle_name_model="Tata Ultra T.16", type="Medium Truck", max_load_capacity=8000, odometer=32100, acquisition_cost=1850000, status="Available"),
            VehicleModel(registration_number="TS12GH3456", vehicle_name_model="Mahindra Blazo X", type="Heavy Truck", max_load_capacity=14000, odometer=95600, acquisition_cost=2650000, status="In Shop"),
            VehicleModel(registration_number="TS13JK7890", vehicle_name_model="Eicher Pro 3015", type="Medium Truck", max_load_capacity=10000, odometer=55800, acquisition_cost=2100000, status="Available"),
        ]
        db.add_all(demo_vehicles)
        db.commit()
    finally:
        db.close()


seed_demo_vehicles()

app = FastAPI(
    title="TransitOps Smart Transport Operations Platform API",
    description="Production-Ready Backend API for TransitOps Vehicle Registry, Driver Management, Trips, Fuel, Maintenance, and Dashboard KPIs",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    vehicle_name_model: str = Field(..., description="Vehicle Name/Model description")
    type: str = Field(..., description="Vehicle classification type")
    max_load_capacity: float = Field(..., ge=0.0, description="Maximum load capacity in kg/lbs")
    odometer: float = Field(..., ge=0.0)
    acquisition_cost: float = Field(..., ge=0.0)


class VehicleCreate(VehicleBase):
    registration_number: str = Field(..., min_length=1)
    status: VehicleStatus = VehicleStatus.AVAILABLE


class VehicleUpdate(VehicleBase):
    status: VehicleStatus


class VehicleOut(VehicleCreate):
    id: int
    class Config:
        from_attributes = True


class DriverBase(BaseModel):
    name: str = Field(..., min_length=1)
    license_category: str = Field(..., min_length=1)
    license_expiry_date: str = Field(..., min_length=1)
    contact_number: str = Field(..., min_length=1)
    safety_score: float = Field(..., ge=0.0, le=100.0)
    status: DriverStatus = DriverStatus.AVAILABLE


class DriverCreate(DriverBase):
    license_number: str = Field(..., min_length=1)


class DriverOut(DriverCreate):
    id: int
    class Config:
        from_attributes = True


class TripCreate(BaseModel):
    vehicle_registration: str = Field(..., min_length=1)
    driver_license: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    cargo_weight: float = Field(..., ge=0.0)
    trip_date: date
    status: TripStatus = TripStatus.PENDING


class TripOut(TripCreate):
    id: int
    class Config:
        from_attributes = True


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/vehicles", response_model=List[VehicleOut])
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(VehicleModel).order_by(VehicleModel.id.desc()).all()


@app.post("/api/vehicles", response_model=VehicleOut, status_code=201)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    if db.query(VehicleModel).filter(VehicleModel.registration_number == payload.registration_number).first():
        raise HTTPException(409, "Vehicle registration already exists")
    vehicle = VehicleModel(**payload.model_dump())
    db.add(vehicle); db.commit(); db.refresh(vehicle)
    return vehicle


@app.put("/api/vehicles/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: Session = Depends(get_db)):
    vehicle = db.get(VehicleModel, vehicle_id)
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    for key, value in payload.model_dump().items():
        setattr(vehicle, key, value)
    db.commit(); db.refresh(vehicle)
    return vehicle


@app.delete("/api/vehicles/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.get(VehicleModel, vehicle_id)
    if not vehicle:
        raise HTTPException(404, "Vehicle not found")
    db.delete(vehicle); db.commit()
    return {"message": "Vehicle deleted"}


@app.get("/api/drivers", response_model=List[DriverOut])
def list_drivers(db: Session = Depends(get_db)):
    return db.query(DriverModel).order_by(DriverModel.id.desc()).all()


@app.post("/api/drivers", response_model=DriverOut, status_code=201)
def create_driver(payload: DriverCreate, db: Session = Depends(get_db)):
    if db.query(DriverModel).filter(DriverModel.license_number == payload.license_number).first():
        raise HTTPException(409, "License number already exists")
    driver = DriverModel(**payload.model_dump())
    db.add(driver); db.commit(); db.refresh(driver)
    return driver


@app.delete("/api/drivers/{driver_id}")
def delete_driver(driver_id: int, db: Session = Depends(get_db)):
    driver = db.get(DriverModel, driver_id)
    if not driver:
        raise HTTPException(404, "Driver not found")
    db.delete(driver); db.commit()
    return {"message": "Driver deleted"}


@app.get("/api/trips", response_model=List[TripOut])
def list_trips(db: Session = Depends(get_db)):
    return db.query(TripModel).order_by(TripModel.trip_date.desc(), TripModel.id.desc()).all()


@app.post("/api/trips", response_model=TripOut, status_code=201)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == payload.vehicle_registration).first()
    driver = db.query(DriverModel).filter(DriverModel.license_number == payload.driver_license).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    if not driver:
        raise HTTPException(400, "Driver does not exist")
    if payload.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(400, "Cargo exceeds vehicle capacity")
    trip = TripModel(**payload.model_dump())
    db.add(trip); db.commit(); db.refresh(trip)
    return trip


@app.put("/api/trips/{trip_id}", response_model=TripOut)
def update_trip(trip_id: int, payload: TripCreate, db: Session = Depends(get_db)):
    trip = db.get(TripModel, trip_id)
    if not trip:
        raise HTTPException(404, "Trip not found")
    for key, value in payload.model_dump().items():
        setattr(trip, key, value)
    db.commit(); db.refresh(trip)
    return trip


@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.get(TripModel, trip_id)
    if not trip:
        raise HTTPException(404, "Trip not found")
    db.delete(trip); db.commit()
    return {"message": "Trip deleted"}
