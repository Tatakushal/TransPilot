from sqlalchemy import Column, Integer, String, Float
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