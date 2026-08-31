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
    db = next(get_db())
    try:
        if db.query(VehicleModel).count() > 0: return
        db.add_all([
            VehicleModel(registration_number="TS09AB1234", vehicle_name_model="Tata Prima 5530", type="Heavy Truck", max_load_capacity=15000, odometer=48250, acquisition_cost=2850000, status="Available"),
            VehicleModel(registration_number="TS10CD5678", vehicle_name_model="Ashok Leyland 4825", type="Heavy Truck", max_load_capacity=12000, odometer=71320, acquisition_cost=2450000, status="On Trip"),
            VehicleModel(registration_number="TS11EF9012", vehicle_name_model="Tata Ultra T.16", type="Medium Truck", max_load_capacity=8000, odometer=32100, acquisition_cost=1850000, status="Available"),
            VehicleModel(registration_number="TS12GH3456", vehicle_name_model="Mahindra Blazo X", type="Heavy Truck", max_load_capacity=14000, odometer=95600, acquisition_cost=2650000, status="In Shop"),
            VehicleModel(registration_number="TS13JK7890", vehicle_name_model="Eicher Pro 3015", type="Medium Truck", max_load_capacity=10000, odometer=55800, acquisition_cost=2100000, status="Available"),
        ])
        db.commit()
    finally: db.close()

seed_demo_vehicles()
app = FastAPI(title="TransitOps Smart Transport Operations Platform API", description="Production-Ready Backend API for TransitOps Vehicle Registry, Driver Management, Trips, Fuel, Maintenance, and Dashboard KPIs", version="1.3.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)
app.include_router(fuel_router)
app.include_router(maintenance_router)

class VehicleStatus(str, Enum):
    AVAILABLE="Available"; ON_TRIP="On Trip"; IN_SHOP="In Shop"; RETIRED="Retired"
class DriverStatus(str, Enum):
    AVAILABLE="Available"; ON_TRIP="On Trip"; OFF_DUTY="Off Duty"; SUSPENDED="Suspended"
class TripStatus(str, Enum):
    PENDING="Pending"; ACTIVE="Active"; COMPLETED="Completed"; CANCELLED="Cancelled"

class VehicleBase(BaseModel):
    vehicle_name_model: str = Field(..., min_length=1)
    type: str = Field(..., min_length=1)
    max_load_capacity: float = Field(..., ge=0)
    odometer: float = Field(..., ge=0)
    acquisition_cost: float = Field(..., ge=0)
    status: VehicleStatus
    class Config: from_attributes=True
class VehicleCreate(VehicleBase): registration_number: str = Field(..., min_length=1)
class VehicleUpdate(VehicleBase): pass
class Vehicle(VehicleBase): registration_number: str

class DriverBase(BaseModel):
    name: str = Field(..., min_length=1)
    license_category: str = Field(..., min_length=1)
    license_expiry_date: date
    contact_number: str = Field(..., min_length=1)
    safety_score: float = Field(..., ge=0, le=100)
    status: DriverStatus
    class Config: from_attributes=True
class DriverCreate(DriverBase): license_number: str = Field(..., min_length=1)
class DriverUpdate(DriverBase): pass
class Driver(DriverBase): license_number: str

class TripBase(BaseModel):
    vehicle_registration: str = Field(..., min_length=1)
    driver_license: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    cargo_weight: float = Field(..., ge=0)
    trip_date: date
    status: TripStatus = TripStatus.PENDING
    class Config: from_attributes=True
class TripCreate(TripBase): pass
class TripUpdate(TripBase): pass
class Trip(TripBase): id: int
class DashboardKPIs(BaseModel):
    active_vehicles:int; available_vehicles:int; vehicles_in_maintenance:int; active_trips:int; pending_trips:int; drivers_on_duty:int; fleet_utilization_percent:float

@app.get("/api/health")
def health(): return {"status":"ok"}

@app.get("/api/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
def get_vehicles(db:Session=Depends(get_db)): return db.query(VehicleModel).all()
@app.get("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def get_vehicle(registration_number:str, db:Session=Depends(get_db)):
    v=db.query(VehicleModel).filter(VehicleModel.registration_number==registration_number.upper()).first()
    if not v: raise HTTPException(404, f"Vehicle with registration number '{registration_number}' not found.")
    return v
@app.post("/api/vehicles", response_model=Vehicle, status_code=201, tags=["Vehicles"])
def create_vehicle(vehicle:VehicleCreate, db:Session=Depends(get_db)):
    reg=vehicle.registration_number.strip().upper()
    if db.query(VehicleModel).filter(VehicleModel.registration_number==reg).first(): raise HTTPException(400,"Vehicle registration already exists")
    row=VehicleModel(registration_number=reg,vehicle_name_model=vehicle.vehicle_name_model.strip(),type=vehicle.type.strip(),max_load_capacity=vehicle.max_load_capacity,odometer=vehicle.odometer,acquisition_cost=vehicle.acquisition_cost,status=vehicle.status.value)
    db.add(row); db.commit(); db.refresh(row); return row
@app.put("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def update_vehicle(registration_number:str, vehicle_update:VehicleUpdate, db:Session=Depends(get_db)):
    row=db.query(VehicleModel).filter(VehicleModel.registration_number==registration_number.strip().upper()).first()
    if not row: raise HTTPException(404,"Vehicle not found")
    row.vehicle_name_model=vehicle_update.vehicle_name_model.strip(); row.type=vehicle_update.type.strip(); row.max_load_capacity=vehicle_update.max_load_capacity; row.odometer=vehicle_update.odometer; row.acquisition_cost=vehicle_update.acquisition_cost; row.status=vehicle_update.status.value
    db.commit(); db.refresh(row); return row
@app.delete("/api/vehicles/{registration_number}", tags=["Vehicles"])
def delete_vehicle(registration_number:str, db:Session=Depends(get_db)):
    row=db.query(VehicleModel).filter(VehicleModel.registration_number==registration_number.strip().upper()).first()
    if not row: raise HTTPException(404,"Vehicle not found")
    db.delete(row); db.commit(); return {"message":"Vehicle deleted"}

@app.get("/api/drivers", response_model=List[Driver], tags=["Drivers"])
def get_drivers(db:Session=Depends(get_db)): return db.query(DriverModel).all()
@app.get("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def get_driver(license_number:str, db:Session=Depends(get_db)):
    row=db.query(DriverModel).filter(DriverModel.license_number==license_number.strip().upper()).first()
    if not row: raise HTTPException(404,"Driver not found")
    return row
@app.post("/api/drivers", response_model=Driver, status_code=201, tags=["Drivers"])
def create_driver(driver:DriverCreate, db:Session=Depends(get_db)):
    lic=driver.license_number.strip().upper()
    if db.query(DriverModel).filter(DriverModel.license_number==lic).first(): raise HTTPException(400,"License number already exists")
    row=DriverModel(name=driver.name.strip(),license_number=lic,license_category=driver.license_category.strip(),license_expiry_date=driver.license_expiry_date.isoformat(),contact_number=driver.contact_number.strip(),safety_score=driver.safety_score,status=driver.status.value)
    db.add(row); db.commit(); db.refresh(row); return row
@app.put("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def update_driver(license_number:str, driver_update:DriverUpdate, db:Session=Depends(get_db)):
    row=db.query(DriverModel).filter(DriverModel.license_number==license_number.strip().upper()).first()
    if not row: raise HTTPException(404,"Driver not found")
    row.name=driver_update.name.strip(); row.license_category=driver_update.license_category.strip(); row.license_expiry_date=driver_update.license_expiry_date.isoformat(); row.contact_number=driver_update.contact_number.strip(); row.safety_score=driver_update.safety_score; row.status=driver_update.status.value
    db.commit(); db.refresh(row); return row
@app.delete("/api/drivers/{license_number}", tags=["Drivers"])
def delete_driver(license_number:str, db:Session=Depends(get_db)):
    row=db.query(DriverModel).filter(DriverModel.license_number==license_number.strip().upper()).first()
    if not row: raise HTTPException(404,"Driver not found")
    db.delete(row); db.commit(); return {"message":"Driver deleted"}

@app.get("/api/trips", response_model=List[Trip], tags=["Trips"])
def get_trips(db:Session=Depends(get_db)): return db.query(TripModel).order_by(TripModel.trip_date.desc(),TripModel.id.desc()).all()
@app.get("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def get_trip(trip_id:int, db:Session=Depends(get_db)):
    row=db.get(TripModel,trip_id)
    if not row: raise HTTPException(404,"Trip not found")
    return row
@app.post("/api/trips", response_model=Trip, status_code=201, tags=["Trips"])
def create_trip(trip:TripCreate, db:Session=Depends(get_db)):
    reg=trip.vehicle_registration.strip().upper(); lic=trip.driver_license.strip().upper(); vehicle=db.query(VehicleModel).filter(VehicleModel.registration_number==reg).first(); driver=db.query(DriverModel).filter(DriverModel.license_number==lic).first()
    if not vehicle: raise HTTPException(400,"Vehicle does not exist")
    if not driver: raise HTTPException(400,"Driver does not exist")
    if vehicle.status!="Available": raise HTTPException(400,"Vehicle is not available")
    if driver.status!="Available": raise HTTPException(400,"Driver is not available")
    if trip.cargo_weight>vehicle.max_load_capacity: raise HTTPException(400,"Cargo weight exceeds vehicle capacity")
    row=TripModel(vehicle_registration=reg,driver_license=lic,source=trip.source.strip(),destination=trip.destination.strip(),cargo_weight=trip.cargo_weight,trip_date=trip.trip_date,status=trip.status.value)
    db.add(row)
    if trip.status in (TripStatus.PENDING,TripStatus.ACTIVE): vehicle.status="On Trip"; driver.status="On Trip"
    db.commit(); db.refresh(row); return row
@app.put("/api/trips/{trip_id}", response_model=Trip, tags=["Trips"])
def update_trip(trip_id:int, trip_update:TripUpdate, db:Session=Depends(get_db)):
    row=db.get(TripModel,trip_id)
    if not row: raise HTTPException(404,"Trip not found")
    reg=trip_update.vehicle_registration.strip().upper(); lic=trip_update.driver_license.strip().upper(); vehicle=db.query(VehicleModel).filter(VehicleModel.registration_number==reg).first(); driver=db.query(DriverModel).filter(DriverModel.license_number==lic).first()
    if not vehicle or not driver: raise HTTPException(400,"Selected vehicle or driver does not exist")
    if trip_update.cargo_weight>vehicle.max_load_capacity: raise HTTPException(400,"Cargo weight exceeds vehicle capacity")
    row.vehicle_registration=reg; row.driver_license=lic; row.source=trip_update.source.strip(); row.destination=trip_update.destination.strip(); row.cargo_weight=trip_update.cargo_weight; row.trip_date=trip_update.trip_date; row.status=trip_update.status.value
    if trip_update.status in (TripStatus.PENDING,TripStatus.ACTIVE): vehicle.status="On Trip"; driver.status="On Trip"
    else: vehicle.status="Available"; driver.status="Available"
    db.commit(); db.refresh(row); return row
@app.delete("/api/trips/{trip_id}", tags=["Trips"])
def delete_trip(trip_id:int, db:Session=Depends(get_db)):
    row=db.get(TripModel,trip_id)
    if not row: raise HTTPException(404,"Trip not found")
    db.delete(row); db.commit(); return {"message":"Trip deleted"}

@app.get("/api/dashboard/kpis", response_model=DashboardKPIs, tags=["Dashboard"])
def dashboard_kpis(db:Session=Depends(get_db)):
    vehicles=db.query(VehicleModel).all(); drivers=db.query(DriverModel).all(); trips=db.query(TripModel).all()
    active=sum(1 for v in vehicles if v.status!="Retired"); available=sum(1 for v in vehicles if v.status=="Available")
    return DashboardKPIs(active_vehicles=active,available_vehicles=available,vehicles_in_maintenance=sum(1 for v in vehicles if v.status=="In Shop"),active_trips=sum(1 for t in trips if t.status=="Active"),pending_trips=sum(1 for t in trips if t.status=="Pending"),drivers_on_duty=sum(1 for d in drivers if d.status in ("Available","On Trip")),fleet_utilization_percent=round(((active-available)/active*100) if active else 0,1))
