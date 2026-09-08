from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import VehicleModel
from fleet_records import MaintenanceRecordModel
from authorization import require_permission

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])
MAINTENANCE_STATUSES = {"Scheduled", "In Progress", "Completed", "Cancelled"}


class MaintenanceRecord(BaseModel):
    vehicle_registration: str = Field(..., min_length=1, max_length=30)
    service_date: date
    service_type: str = Field(..., min_length=1, max_length=120)
    cost: float = Field(..., ge=0)
    odometer: float = Field(..., ge=0)
    workshop: str = Field(..., min_length=1, max_length=120)
    status: str = Field(default="Completed", min_length=1, max_length=30)
    notes: Optional[str] = Field(default=None, max_length=500)


class MaintenanceRecordOut(MaintenanceRecord):
    id: int

    class Config:
        from_attributes = True


def _set_vehicle_maintenance_status(db: Session, registration: str, status: str) -> None:
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    if not vehicle:
        return
    if status in {"Scheduled", "In Progress"} and vehicle.status == "Available":
        vehicle.status = "In Shop"
    elif status in {"Completed", "Cancelled"} and vehicle.status == "In Shop":
        vehicle.status = "Available"


@router.get("", response_model=list[MaintenanceRecordOut])
def list_maintenance(_: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    return db.query(MaintenanceRecordModel).order_by(MaintenanceRecordModel.service_date.desc(), MaintenanceRecordModel.id.desc()).all()


@router.get("/{record_id}", response_model=MaintenanceRecordOut)
def get_maintenance(record_id: int, _: object = Depends(require_permission("read")), db: Session = Depends(get_db)):
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    return record


@router.post("", response_model=MaintenanceRecordOut, status_code=201)
def create_maintenance(payload: MaintenanceRecord, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    if payload.status not in MAINTENANCE_STATUSES:
        raise HTTPException(400, "Invalid maintenance status")
    registration = payload.vehicle_registration.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    if payload.odometer < vehicle.odometer:
        raise HTTPException(400, "Service odometer cannot be lower than the vehicle odometer")

    record = MaintenanceRecordModel(**payload.model_dump(), vehicle_registration=registration)
    vehicle.odometer = max(vehicle.odometer, payload.odometer)
    _set_vehicle_maintenance_status(db, registration, payload.status)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{record_id}", response_model=MaintenanceRecordOut)
def update_maintenance(record_id: int, payload: MaintenanceRecord, _: object = Depends(require_permission("write")), db: Session = Depends(get_db)):
    if payload.status not in MAINTENANCE_STATUSES:
        raise HTTPException(400, "Invalid maintenance status")
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    registration = payload.vehicle_registration.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == registration).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")

    old_registration = record.vehicle_registration
    for key, value in payload.model_dump().items():
        setattr(record, key, value)
    record.vehicle_registration = registration
    vehicle.odometer = max(vehicle.odometer, payload.odometer)
    if old_registration != registration:
        _set_vehicle_maintenance_status(db, old_registration, "Completed")
    _set_vehicle_maintenance_status(db, registration, payload.status)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}")
def delete_maintenance(record_id: int, _: object = Depends(require_permission("delete")), db: Session = Depends(get_db)):
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    registration = record.vehicle_registration
    db.delete(record)
    db.flush()
    remaining = db.query(MaintenanceRecordModel.id).filter(
        MaintenanceRecordModel.vehicle_registration == registration,
        MaintenanceRecordModel.status.in_(["Scheduled", "In Progress"]),
    ).first()
    if not remaining:
        _set_vehicle_maintenance_status(db, registration, "Completed")
    db.commit()
    return {"message": "Maintenance record deleted"}
