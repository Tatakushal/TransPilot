"""Persistent fuel and maintenance records used by the operations API."""
from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from database import Base


class FuelRecordModel(Base):
    __tablename__ = "fuel_records"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_registration = Column(String, nullable=False, index=True)
    fuel_date = Column(Date, nullable=False)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False)
    station = Column(String, nullable=False)
    notes = Column(String, nullable=True)


class MaintenanceRecordModel(Base):
    __tablename__ = "maintenance_records"
    id = Column(Integer, primary_key=True, index=True)
    vehicle_registration = Column(String, nullable=False, index=True)
    service_date = Column(Date, nullable=False)
    service_type = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False)
    workshop = Column(String, nullable=False)
    status = Column(String, default="Completed", nullable=False)
    notes = Column(String, nullable=True)
