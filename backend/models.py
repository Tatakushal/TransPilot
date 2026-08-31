from sqlalchemy import Column, Integer, String, Float, Date
from database import Base


class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String, unique=True, index=True, nullable=False)
    vehicle_name_model = Column(String, nullable=False)
    type = Column(String, nullable=False)
    max_load_capacity = Column(Integer, nullable=False)
    odometer = Column(Integer, nullable=False)
    acquisition_cost = Column(Float, nullable=False)
    status = Column(String, default="Available")


class DriverModel(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    license_number = Column(String, unique=True, index=True, nullable=False)
    license_category = Column(String, nullable=False)
    license_expiry_date = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    safety_score = Column(Float, nullable=False)
    status = Column(String, default="Available")


class TripModel(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_registration = Column(String, nullable=False, index=True)
    driver_license = Column(String, nullable=False, index=True)
    source = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    cargo_weight = Column(Float, nullable=False)
    trip_date = Column(Date, nullable=False)
    status = Column(String, default="Pending", nullable=False)
