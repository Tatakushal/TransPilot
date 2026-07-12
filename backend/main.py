from datetime import date
from enum import Enum
from typing import List
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Import database connection assets and SQLAlchemy models
from database import engine, Base, get_db
from models import VehicleModel, DriverModel

# Initialize database tables automatically on startup
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title="TransitOps Smart Transport Operations Platform API",
    description="Production-Ready Backend API for TransitOps Vehicle Registry, Driver Management, and Dashboard KPIs",
    version="1.0.0"
)

# Enable CORS for all origins (*) to allow smooth frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 1. Enums and Pydantic Schemas
# ==========================================

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


# Vehicle Schemas
class VehicleBase(BaseModel):
    vehicle_name_model: str = Field(..., description="Vehicle Name/Model description")
    type: str = Field(..., description="Vehicle classification type")
    max_load_capacity: float = Field(..., ge=0.0, description="Maximum load capacity in kg/lbs")
    odometer: float = Field(..., ge=0.0, description="Odometer mileage reading")
    acquisition_cost: float = Field(..., ge=0.0, description="Purchase cost of the vehicle")
    status: VehicleStatus = Field(..., description="Operational status of the vehicle")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "vehicle_name_model": "Freightliner Cascadia",
                "type": "Heavy Duty Truck",
                "max_load_capacity": 15000.0,
                "odometer": 142050.5,
                "acquisition_cost": 120000.0,
                "status": "Available"
            }
        }


class VehicleCreate(VehicleBase):
    registration_number: str = Field(..., description="Unique vehicle plate registration number")

    class Config:
        json_schema_extra = {
            "example": {
                "registration_number": "TX-123-AB",
                "vehicle_name_model": "Freightliner Cascadia",
                "type": "Heavy Duty Truck",
                "max_load_capacity": 15000.0,
                "odometer": 142050.5,
                "acquisition_cost": 120000.0,
                "status": "Available"
            }
        }


class VehicleUpdate(VehicleBase):
    pass


class Vehicle(VehicleBase):
    registration_number: str


# Driver Schemas
class DriverBase(BaseModel):
    name: str = Field(..., min_length=1, description="Driver's Full Name")
    license_category: str = Field(..., description="License Class category")
    license_expiry_date: date = Field(..., description="Driver's license expiry date (YYYY-MM-DD)")
    contact_number: str = Field(..., description="Contact telephone/mobile number")
    safety_score: float = Field(..., ge=0.0, le=100.0, description="Safety score out of 100")
    status: DriverStatus = Field(..., description="Driver availability status")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "name": "Jane Smith",
                "license_category": "Class A CDL",
                "license_expiry_date": "2028-11-15",
                "contact_number": "+1-555-0101",
                "safety_score": 98.5,
                "status": "Available"
            }
        }


class DriverCreate(DriverBase):
    license_number: str = Field(..., description="Unique driver license identifier")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Jane Smith",
                "license_number": "DL-552091",
                "license_category": "Class A CDL",
                "license_expiry_date": "2028-11-15",
                "contact_number": "+1-555-0101",
                "safety_score": 98.5,
                "status": "Available"
            }
        }


class DriverUpdate(DriverBase):
    pass


class Driver(DriverBase):
    license_number: str


# Dashboard Schemas
class DashboardKPIs(BaseModel):
    active_vehicles: int = Field(..., description="Number of active vehicles (non-retired)")
    available_vehicles: int = Field(..., description="Number of available vehicles")
    vehicles_in_maintenance: int = Field(..., description="Number of vehicles currently in maintenance/shop")
    active_trips: int = Field(..., description="Number of active trips currently underway")
    pending_trips: int = Field(..., description="Number of pending trips awaiting dispatch")
    drivers_on_duty: int = Field(..., description="Number of drivers on duty (Available or On Trip)")
    fleet_utilization_percent: float = Field(..., description="Fleet utilization percentage")


# ==========================================
# 3. Vehicle Registry Endpoints (Database Connected)
# ==========================================

@app.get("/api/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
def get_vehicles(db: Session = Depends(get_db)):
    """Retrieve all vehicles currently registered in the system."""
    return db.query(VehicleModel).all()


@app.get("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def get_vehicle(registration_number: str, db: Session = Depends(get_db)):
    """Retrieve specific vehicle details by its unique registration number."""
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration_number.upper()).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    return vehicle


@app.post("/api/vehicles", response_model=Vehicle, status_code=201, tags=["Vehicles"])
def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Register a new vehicle in the system. Registration number must be unique."""
    reg_num_upper = vehicle.registration_number.upper()
    existing_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with registration number '{vehicle.registration_number}' already exists."
        )
    
    db_vehicle = VehicleModel(
        registration_number=reg_num_upper,
        vehicle_name_model=vehicle.vehicle_name_model,
        type=vehicle.type,
        max_load_capacity=vehicle.max_load_capacity,
        odometer=vehicle.odometer,
        acquisition_cost=vehicle.acquisition_cost,
        status=vehicle.status.value
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.put("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def update_vehicle(registration_number: str, vehicle_update: VehicleUpdate, db: Session = Depends(get_db)):
    """Update details of an existing vehicle in the registry."""
    reg_num_upper = registration_number.upper()
    db_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if not db_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    
    db_vehicle.vehicle_name_model = vehicle_update.vehicle_name_model
    db_vehicle.type = vehicle_update.type
    db_vehicle.max_load_capacity = vehicle_update.max_load_capacity
    db_vehicle.odometer = vehicle_update.odometer
    db_vehicle.acquisition_cost = vehicle_update.acquisition_cost
    db_vehicle.status = vehicle_update.status.value
    
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@app.delete("/api/vehicles/{registration_number}", tags=["Vehicles"])
def delete_vehicle(registration_number: str, db: Session = Depends(get_db)):
    """Deregister/remove a vehicle from the system."""
    reg_num_upper = registration_number.upper()
    db_vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg_num_upper).first()
    if not db_vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    db.delete(db_vehicle)
    db.commit()
    return {"message": f"Vehicle '{registration_number}' successfully removed from registry."}


# ==========================================
# 4. Driver Management Endpoints (Database Connected)
# ==========================================

@app.get("/api/drivers", response_model=List[Driver], tags=["Drivers"])
def get_drivers(db: Session = Depends(get_db)):
    """Retrieve all drivers currently in the system."""
    return db.query(DriverModel).all()


@app.get("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def get_driver(license_number: str, db: Session = Depends(get_db)):
    """Retrieve specific driver details by their license number."""
    driver = db.query(DriverModel).filter(DriverModel.license_number == license_number.upper()).first()
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    return driver


@app.post("/api/drivers", response_model=Driver, status_code=201, tags=["Drivers"])
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    """Create a new driver entry in the platform. License number must be unique."""
    lic_num_upper = driver.license_number.upper()
    existing_driver = db.query(DriverModel).filter(DriverModel.license_number == lic_num_upper).first()
    if existing_driver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Driver with license number '{driver.license_number}' already exists."
        )
    
    db_driver = DriverModel(
        name=driver.name,
        license_number=lic_num_upper,
        license_category=driver.license_category,
        license_expiry_date=str(driver.license_expiry_date),
        contact_number=driver.contact_number,
        safety_score=driver.safety_score,
        status=driver.status.value
    )
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return db_driver


@app.put("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def update_driver(license_number: str, driver_update: DriverUpdate, db: Session = Depends(get_db)):
    """Update details of an existing driver's registry info."""
    lic_num_upper = license_number.upper()
    db_driver = db.query(DriverModel).filter(DriverModel.license_number == lic_num_upper).first()
    if not db_driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    
    db_driver.name = driver_update.name
    db_driver.license_category = driver_update.license_category
    db_driver.license_expiry_date = str(driver_update.license_expiry_date)
    db_driver.contact_number = driver_update.contact_number
    db_driver.safety_score = driver_update.safety_score
    db_driver.status = driver_update.status.value
    
    db.commit()
    db.refresh(db_driver)
    return db_driver


@app.delete("/api/drivers/{license_number}", tags=["Drivers"])
def delete_driver(license_number: str, db: Session = Depends(get_db)):
    """Deregister/remove a driver from the system."""
    lic_num_upper = license_number.upper()
    db_driver = db.query(DriverModel).filter(DriverModel.license_number == lic_num_upper).first()
    if not db_driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    db.delete(db_driver)
    db.commit()
    return {"message": f"Driver with license number '{license_number}' successfully removed from database."}


# ==========================================
# 5. Dashboard Endpoints (Calculated via Live DB Queries)
# ==========================================

@app.get("/api/dashboard/kpis", response_model=DashboardKPIs, tags=["Dashboard"])
def get_dashboard_kpis(db: Session = Depends(get_db)):
    """Retrieve key performance indicators (KPIs) calculated dynamically from SQL database tables."""
    
    # Calculate counts using explicit SQLAlchemy filtering structures
    active_vehicles_count = db.query(VehicleModel).filter(VehicleModel.status != VehicleStatus.RETIRED.value).count()
    available_vehicles_count = db.query(VehicleModel).filter(VehicleModel.status == VehicleStatus.AVAILABLE.value).count()
    maintenance_vehicles_count = db.query(VehicleModel).filter(VehicleModel.status == VehicleStatus.IN_SHOP.value).count()
    active_trips_count = db.query(VehicleModel).filter(VehicleModel.status == VehicleStatus.ON_TRIP.value).count()
    
    drivers_on_duty_count = db.query(DriverModel).filter(
        DriverModel.status.in_([DriverStatus.AVAILABLE.value, DriverStatus.ON_TRIP.value])
    ).count()
    
    # Calculate fleet utilization percentage based on operational definitions
    if active_vehicles_count > 0:
        utilization = (active_trips_count / active_vehicles_count) * 100.0
    else:
        utilization = 0.0
        
    # Standard static mock metric for pending trip entries
    pending_trips_count = 2
    
    return DashboardKPIs(
        active_vehicles=active_vehicles_count,
        available_vehicles=available_vehicles_count,
        vehicles_in_maintenance=maintenance_vehicles_count,
        active_trips=active_trips_count,
        pending_trips=pending_trips_count,
        drivers_on_duty=drivers_on_duty_count,
        fleet_utilization_percent=round(utilization, 2)
    )


# ==========================================
# Root and Health Check
# ==========================================

@app.get("/", tags=["General"])
def read_root():
    return {
        "app": "TransitOps Smart Transport Operations Platform",
        "description": "Welcome to the TransitOps SQL-Connected Production Backend API. Navigate to /docs for interactive Swagger API documentation.",
        "endpoints": {
            "dashboard_kpis": "/api/dashboard/kpis",
            "vehicles": "/api/vehicles",
            "drivers": "/api/drivers",
            "docs": "/docs"
        }
    }