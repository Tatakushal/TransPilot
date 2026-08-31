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
    odometer: float = Field(..., ge=0.0, description="Odometer mileage reading")
    acquisition_cost: float = Field(..., ge=0.0, description="Purchase cost of the vehicle")
    status: VehicleStatus = Field(..., description="Operational status of the vehicle")

    class Config:
        from_attributes = True


class VehicleCreate(VehicleBase):
    registration_number: str = Field(..., description="Unique vehicle plate registration number")


class VehicleUpdate(VehicleBase):
    pass


class Vehicle(VehicleBase):
    registration_number: str


class DriverBase(BaseModel):
    name: str = Field(..., min_length=1, description="Driver's Full Name")
    license_category: str = Field(..., description="License Class category")
    license_expiry_date: date = Field(..., description="Driver's license expiry date (YYYY-MM-DD)")
    contact_number: str = Field(..., description="Contact telephone/mobile number")
    safety_score: float = Field(..., ge=0.0, le=100.0, description="Safety score out of 100")
    status: DriverStatus = Field(..., description="Driver availability status")

    class Config:
        from_attributes = True


class DriverCreate(DriverBase):
    license_number: str


class DriverUpdate(DriverBase):
    pass


class Driver(DriverBase):
    license_number: str


class TripBase(BaseModel):
    vehicle_registration: str = Field(..., min_length=1)
    driver_license: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    cargo_weight: float = Field(..., ge=0.0)
    trip_date: date
    status: TripStatus = TripStatus.PENDING

    class Config:
        from_attributes = True


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    vehicle_registration: str = Field(..., min_length=1)
    driver_license: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    cargo_weight: float = Field(..., ge=0.0)
    trip_date: date
    status: TripStatus


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


@app.get("/api/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(VehicleModel).all()


@app.get("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def get_vehicle(registration_number: str, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration_number.upper()).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vehicle with registration number '{registration_number}' not found.")
    return vehicle


@app.post("/api/vehicles", response_model=Vehicle, status_code=201, tags=["Vehicles"])
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    reg_num_upper = vehicle.registration_number.strip().upper()
    existing_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if existing_vehicle:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Vehicle with registration number '{vehicle.registration_number}' already exists.")
    db_vehicle = VehicleModel(registration_number=reg_num_upper, vehicle_name_model=vehicle.vehicle_name_model.strip(), type=vehicle.type.strip(), max_load_capacity=vehicle.max_load_capacity, odometer=vehicle.odometer, acquisition_cost=vehicle.acquisition_cost, status=vehicle.status.value)
    db.add(db_vehicle); db.commit(); db.refresh(db_vehicle)
    return db_vehicle


@app.put("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def update_vehicle(registration_number: str, vehicle_update: VehicleUpdate, db: Session = Depends(get_db)):
    reg_num_upper = registration_number.strip().upper()
    db_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vehicle with registration number '{registration_number}' not found.")
    db_vehicle.vehicle_name_model = vehicle_update.vehicle_name_model.strip(); db_vehicle.type = vehicle_update.type.strip(); db_vehicle.max_load_capacity = vehicle_update.max_load_capacity; db_vehicle.odometer = vehicle_update.odometer; db_vehicle.acquisition_cost = vehicle_update.acquisition_cost; db_vehicle.status = vehicle_update.status.value
    db.commit(); db.refresh(db_vehicle)
    return db_vehicle


@app.delete("/api/vehicles/{registration_number}", tags=["Vehicles"])
def delete_vehicle(registration_number: str, db: Session = Depends(get_db)):
    reg_num_upper = registration_number.strip().upper(); db_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if not db_vehicle: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Vehicle with registration number '{registration_number}' not found.")
    db.delete(db_vehicle); db.commit(); return {"message": f"Vehicle '{registration_number}' successfully removed from registry."}


@app.get("/api/drivers", response_model=List[Driver], tags=["Drivers"])
def get_drivers(db: Session = Depends(get_db)):
    return db.query(DriverModel).all()


@app.get("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def get_driver(license_number: str, db: Session = Depends(get_db)):
    driver = db.query(DriverModel).filter(DriverModel.license_number == license_number.upper()).first()
    if not driver: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Driver with license number '{license_number}' not found.")
    return driver


@app.post("/api/drivers", response_model=Driver, status_code=201, tags=["Drivers"])
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    license_upper = driver.license_number.strip().upper()
    if db.query(DriverModel).filter(DriverModel.license_number == license_upper).first(): raise HTTPException(status_code=400, detail=f"Driver with license number '{driver.license_number}' already exists.")
    db_driver = DriverModel(name=driver.name.strip(), license_number=license_upper, license_category=driver.license_category.strip(), license_expiry_date=driver.license_expiry_date.isoformat(), contact_number=driver.contact_number.strip(), safety_score=driver.safety_score, status=driver.status.value)
    db.add(db_driver); db.commit(); db.refresh(db_driver); return db_driver


@app.put("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def update_driver(license_number: str, driver_update: DriverUpdate, db: Session = Depends(get_db)):
    license_upper = license_number.strip().upper(); db_driver = db.query(DriverModel).filter(DriverModel.license_number == license_upper).first()
    if not db_driver: raise HTTPException(status_code=404, detail=f"Driver with license number '{license_number}' not found.")
    db_driver.name = driver_update.name.strip(); db_driver.license_category = driver_update.license_category.strip(); db_driver.license_expiry_date = driver_update.license_expiry_date.isoformat(); db_driver.contact_number = driver_update.contact_number.strip(); db_driver.safety_score = driver_update.safety_score; db_driver.status = driver_update.status.value
    db.commit(); db.refresh(db_driver); return db_driver


@app.delete("/api/drivers/{license_number}", tags=["Drivers"])
def delete_driver(license_number: str, db: Session = Depends(get_db)):
    license_upper = license_number.strip().upper(); db_driver = db.query(DriverModel).filter(DriverModel.license_number == license_upper).first()
    if not db_driver: raise HTTPException(status_code=404, detail=f"Driver with license number '{license_number}' not found.")
    db.delete(db_driver); db.commit(); return {"message": f"Driver '{license_number}' successfully removed."}


@app.get("/api/trips", response_model=List[Trip], tags=["Trips"])
def get_trips(db: Session = Depends(get_db)):
    return db.query(TripModel).order_by(TripModel.trip_date.desc(), TripModel.id.desc()).all()


@app.get("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not trip: raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")
    return trip


@app.post("/api/trips", response_model=Trip, status_code=201, tags=["Trips"])
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    vehicle_reg = trip.vehicle_registration.strip().upper(); driver_license = trip.driver_license.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == vehicle_reg).first(); driver = db.query(DriverModel).filter(DriverModel.license_number == driver_license).first()
    if not vehicle: raise HTTPException(status_code=400, detail=f"Vehicle '{vehicle_reg}' does not exist.")
    if not driver: raise HTTPException(status_code=400, detail=f"Driver '{driver_license}' does not exist.")
    if vehicle.status != "Available": raise HTTPException(status_code=400, detail=f"Vehicle '{vehicle_reg}' is not available.")
    if driver.status != "Available": raise HTTPException(status_code=400, detail=f"Driver '{driver_license}' is not available.")
    if trip.cargo_weight > vehicle.max_load_capacity: raise HTTPException(status_code=400, detail="Cargo weight exceeds the vehicle's maximum load capacity.")
    db_trip = TripModel(vehicle_registration=vehicle_reg, driver_license=driver_license, source=trip.source.strip(), destination=trip.destination.strip(), cargo_weight=trip.cargo_weight, trip_date=trip.trip_date, status=trip.status.value)
    db.add(db_trip)
    if trip.status in (TripStatus.PENDING, TripStatus.ACTIVE): vehicle.status = "On Trip"; driver.status = "On Trip"
    db.commit(); db.refresh(db_trip); return db_trip


@app.put("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def update_trip(trip_id: int, trip_update: TripUpdate, db: Session = Depends(get_db)):
    db_trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not db_trip: raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")
    vehicle_reg = trip_update.vehicle_registration.strip().upper(); driver_license = trip_update.driver_license.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == vehicle_reg).first(); driver = db.query(DriverModel).filter(DriverModel.license_number == driver_license).first()
    if not vehicle or not driver: raise HTTPException(status_code=400, detail="Selected vehicle or driver does not exist.")
    if trip_update.cargo_weight > vehicle.max_load_capacity: raise HTTPException(status_code=400, detail="Cargo weight exceeds the vehicle's maximum load capacity.")
    db_trip.vehicle_registration = vehicle_reg; db_trip.driver_license = driver_license; db_trip.source = trip_update.source.strip(); db_trip.destination = trip_update.destination.strip(); db_trip.cargo_weight = trip_update.cargo_weight; db_trip.trip_date = trip_update.trip_date; db_trip.status = trip_update.status.value
    if trip_update.status in (TripStatus.PENDING, TripStatus.ACTIVE): vehicle.status = "On Trip"; driver.status = "On Trip"
    else: vehicle.status = "Available"; driver.status = "Available"
    db.commit(); db.refresh(db_trip); return db_trip


@app.delete("/api/trips/{trip_id}", tags=["Trips"])
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    db_trip = db.query(TripModel).filter(TripModel.id == trip_id).first()
    if not db_trip: raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found.")
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == db_trip.vehicle_registration).first(); driver = db.query(DriverModel).filter(DriverModel.license_number == db_trip.driver_license).first()
    if vehicle and vehicle.status == "On Trip": vehicle.status = "Available"
    if driver and driver.status == "On Trip": driver.status = "Available"
    db.delete(db_trip); db.commit(); return {"message": f"Trip {trip_id} successfully removed."}


@app.get("/api/dashboard/kpis", response_model=DashboardKPIs, tags=["Dashboard"])
def dashboard_kpis(db: Session = Depends(get_db)):
    vehicles = db.query(VehicleModel).all(); drivers = db.query(DriverModel).all(); trips = db.query(TripModel).all()
    active_vehicles = sum(1 for v in vehicles if v.status != "Retired"); available_vehicles = sum(1 for v in vehicles if v.status == "Available"); vehicles_in_maintenance = sum(1 for v in vehicles if v.status == "In Shop"); drivers_on_duty = sum(1 for d in drivers if d.status in ("Available", "On Trip")); active_trips = sum(1 for t in trips if t.status == "Active"); pending_trips = sum(1 for t in trips if t.status == "Pending"); utilization = ((active_vehicles - available_vehicles) / active_vehicles * 100) if active_vehicles else 0
    return DashboardKPIs(active_vehicles=active_vehicles, available_vehicles=available_vehicles, vehicles_in_maintenance=vehicles_in_maintenance, active_trips=active_trips, pending_trips=pending_trips, drivers_on_duty=drivers_on_duty, fleet_utilization_percent=round(utilization, 1))
