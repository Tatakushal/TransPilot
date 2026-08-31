from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import get_db
from models import VehicleModel
from fleet_records import MaintenanceRecordModel

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

class MaintenanceRecord(BaseModel):
    vehicle_registration: str = Field(..., min_length=1)
    service_date: date
    service_type: str = Field(..., min_length=1)
    cost: float = Field(..., ge=0)
    odometer: float = Field(..., ge=0)
    workshop: str = Field(..., min_length=1)
    status: str = Field(default="Completed", min_length=1)
    notes: Optional[str] = None

class MaintenanceRecordOut(MaintenanceRecord):
    id: int
    class Config:
        from_attributes = True

@router.get("", response_model=list[MaintenanceRecordOut])
def list_maintenance(db: Session = Depends(get_db)):
    return db.query(MaintenanceRecordModel).order_by(MaintenanceRecordModel.service_date.desc(), MaintenanceRecordModel.id.desc()).all()

@router.get("/{record_id}", response_model=MaintenanceRecordOut)
def get_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    return record

@router.post("", response_model=MaintenanceRecordOut, status_code=201)
def create_maintenance(payload: MaintenanceRecord, db: Session = Depends(get_db)):
    reg = payload.vehicle_registration.strip().upper()
    vehicle = db.query(VehicleModel).filter(VehicleModel.registration_number == reg).first()
    if not vehicle:
        raise HTTPException(400, "Vehicle does not exist")
    record = MaintenanceRecordModel(**payload.model_dump(), vehicle_registration=reg)
    db.add(record); db.commit(); db.refresh(record)
    return record

@router.put("/{record_id}", response_model=MaintenanceRecordOut)
def update_maintenance(record_id: int, payload: MaintenanceRecord, db: Session = Depends(get_db)):
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    reg = payload.vehicle_registration.strip().upper()
    if not db.query(VehicleModel).filter(VehicleModel.registration_number == reg).first():
        raise HTTPException(400, "Vehicle does not exist")
    for key, value in payload.model_dump().items():
        setattr(record, key, value)
    record.vehicle_registration = reg
    db.commit(); db.refresh(record)
    return record

@router.delete("/{record_id}")
def delete_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.get(MaintenanceRecordModel, record_id)
    if not record:
        raise HTTPException(404, "Maintenance record not found")
    db.delete(record); db.commit()
    return {"message": "Maintenance record deleted"}
