from datetime import date
from enum import Enum
from typing import Dict, List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Initialize FastAPI App
app = FastAPI(
    title="TransitOps Smart Transport Operations Platform API",
    description="Mock Backend API for TransitOps Vehicle Registry, Driver Management, and Dashboard KPIs",
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

    class Config:
        json_schema_extra = {
            "example": {
                "active_vehicles": 3,
                "available_vehicles": 1,
                "vehicles_in_maintenance": 1,
                "active_trips": 1,
                "pending_trips": 2,
                "drivers_on_duty": 2,
                "fleet_utilization_percent": 33.33
            }
        }


# ==========================================
# 2. Hardcoded Mock Data (In-Memory Database)
# ==========================================

vehicles_db: Dict[str, dict] = {
    "TX-123-AB": {
        "registration_number": "TX-123-AB",
        "vehicle_name_model": "Freightliner Cascadia",
        "type": "Heavy Duty Truck",
        "max_load_capacity": 15000.0,
        "odometer": 142050.5,
        "acquisition_cost": 120000.0,
        "status": "Available"
    },
    "CA-456-XY": {
        "registration_number": "CA-456-XY",
        "vehicle_name_model": "Ford Transit 350",
        "type": "Cargo Van",
        "max_load_capacity": 3500.0,
        "odometer": 85300.2,
        "acquisition_cost": 45000.0,
        "status": "On Trip"
    },
    "FL-789-QW": {
        "registration_number": "FL-789-QW",
        "vehicle_name_model": "Peterbilt 579",
        "type": "Semi-Truck",
        "max_load_capacity": 18000.0,
        "odometer": 210400.8,
        "acquisition_cost": 145000.0,
        "status": "In Shop"
    }
}

drivers_db: Dict[str, dict] = {
    "DL-552091": {
        "name": "Jane Smith",
        "license_number": "DL-552091",
        "license_category": "Class A CDL",
        "license_expiry_date": date(2028, 11, 15),
        "contact_number": "+1-555-0101",
        "safety_score": 98.5,
        "status": "Available"
    },
    "DL-119045": {
        "name": "John Doe",
        "license_number": "DL-119045",
        "license_category": "Class B CDL",
        "license_expiry_date": date(2027, 4, 20),
        "contact_number": "+1-555-0102",
        "safety_score": 92.0,
        "status": "On Trip"
    },
    "DL-883421": {
        "name": "Robert Johnson",
        "license_number": "DL-883421",
        "license_category": "Class A CDL",
        "license_expiry_date": date(2025, 9, 12),
        "contact_number": "+1-555-0103",
        "safety_score": 76.4,
        "status": "Suspended"
    },
    "DL-443902": {
        "name": "Emily Davis",
        "license_number": "DL-443902",
        "license_category": "Class A CDL",
        "license_expiry_date": date(2029, 1, 10),
        "contact_number": "+1-555-0104",
        "safety_score": 95.0,
        "status": "Off Duty"
    }
}


# ==========================================
# 3. Vehicle Registry Endpoints
# ==========================================

@app.get("/api/vehicles", response_model=List[Vehicle], tags=["Vehicles"])
def get_vehicles():
    """Retrieve all vehicles currently registered in the system."""
    return list(vehicles_db.values())


@app.get("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def get_vehicle(registration_number: str):
    """Retrieve specific vehicle details by its unique registration number."""
    vehicle = vehicles_db.get(registration_number.upper())
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    return vehicle


@app.post("/api/vehicles", response_model=Vehicle, status_code=201, tags=["Vehicles"])
def create_vehicle(vehicle: VehicleCreate):
    """Register a new vehicle in the system. Registration number must be unique."""
    reg_num_upper = vehicle.registration_number.upper()
    if reg_num_upper in vehicles_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Vehicle with registration number '{vehicle.registration_number}' already exists."
        )
    
    new_vehicle = vehicle.model_dump()
    new_vehicle["registration_number"] = reg_num_upper
    vehicles_db[reg_num_upper] = new_vehicle
    return new_vehicle


@app.put("/api/vehicles/{registration_number}", response_model=Vehicle, tags=["Vehicles"])
def update_vehicle(registration_number: str, vehicle_update: VehicleUpdate):
    """Update details of an existing vehicle in the registry."""
    reg_num_upper = registration_number.upper()
    if reg_num_upper not in vehicles_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    
    updated_data = vehicle_update.model_dump()
    updated_data["registration_number"] = reg_num_upper
    vehicles_db[reg_num_upper] = updated_data
    return updated_data


@app.delete("/api/vehicles/{registration_number}", tags=["Vehicles"])
def delete_vehicle(registration_number: str):
    """Deregister/remove a vehicle from the system."""
    reg_num_upper = registration_number.upper()
    if reg_num_upper not in vehicles_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with registration number '{registration_number}' not found."
        )
    del vehicles_db[reg_num_upper]
    return {"message": f"Vehicle '{registration_number}' successfully removed from registry."}


# ==========================================
# 4. Driver Management Endpoints
# ==========================================

@app.get("/api/drivers", response_model=List[Driver], tags=["Drivers"])
def get_drivers():
    """Retrieve all drivers currently in the system."""
    return list(drivers_db.values())


@app.get("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def get_driver(license_number: str):
    """Retrieve specific driver details by their license number."""
    driver = drivers_db.get(license_number.upper())
    if not driver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    return driver


@app.post("/api/drivers", response_model=Driver, status_code=201, tags=["Drivers"])
def create_driver(driver: DriverCreate):
    """Create a new driver entry in the platform. License number must be unique."""
    lic_num_upper = driver.license_number.upper()
    if lic_num_upper in drivers_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Driver with license number '{driver.license_number}' already exists."
        )
    
    new_driver = driver.model_dump()
    new_driver["license_number"] = lic_num_upper
    drivers_db[lic_num_upper] = new_driver
    return new_driver


@app.put("/api/drivers/{license_number}", response_model=Driver, tags=["Drivers"])
def update_driver(license_number: str, driver_update: DriverUpdate):
    """Update details of an existing driver's registry info."""
    lic_num_upper = license_number.upper()
    if lic_num_upper not in drivers_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    
    updated_data = driver_update.model_dump()
    updated_data["license_number"] = lic_num_upper
    drivers_db[lic_num_upper] = updated_data
    return updated_data


@app.delete("/api/drivers/{license_number}", tags=["Drivers"])
def delete_driver(license_number: str):
    """Deregister/remove a driver from the system."""
    lic_num_upper = license_number.upper()
    if lic_num_upper not in drivers_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Driver with license number '{license_number}' not found."
        )
    del drivers_db[lic_num_upper]
    return {"message": f"Driver with license number '{license_number}' successfully removed from database."}


# ==========================================
# 5. Dashboard Endpoints
# ==========================================

@app.get("/api/dashboard/kpis", response_model=DashboardKPIs, tags=["Dashboard"])
def get_dashboard_kpis():
    """Retrieve key performance indicators (KPIs) calculated dynamically from mock data."""
    vehicles = list(vehicles_db.values())
    
    # Active vehicles = vehicles that are not Retired
    active_vehicles_list = [v for v in vehicles if v["status"] != VehicleStatus.RETIRED]
    active_vehicles_count = len(active_vehicles_list)
    
    available_vehicles_count = sum(1 for v in vehicles if v["status"] == VehicleStatus.AVAILABLE)
    maintenance_vehicles_count = sum(1 for v in vehicles if v["status"] == VehicleStatus.IN_SHOP)
    active_trips_count = sum(1 for v in vehicles if v["status"] == VehicleStatus.ON_TRIP)
    
    # Drivers On Duty = Drivers with status Available or On Trip
    drivers = list(drivers_db.values())
    drivers_on_duty_count = sum(
        1 for d in drivers if d["status"] in (DriverStatus.AVAILABLE, DriverStatus.ON_TRIP)
    )
    
    # Fleet utilization = (Vehicles On Trip / Active Vehicles) * 100
    if active_vehicles_count > 0:
        utilization = (active_trips_count / active_vehicles_count) * 100.0
    else:
        utilization = 0.0
        
    # Pending trips represents backlogged trip requests (mocked)
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
        "description": "Welcome to the TransitOps Mock Backend API. Navigate to /docs for interactive Swagger API documentation.",
        "endpoints": {
            "dashboard_kpis": "/api/dashboard/kpis",
            "vehicles": "/api/vehicles",
            "drivers": "/api/drivers",
            "docs": "/docs"
        }
    }
